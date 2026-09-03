import { and, eq, inArray } from 'drizzle-orm'

import { buscarCurso } from '@/content'
import { getDb } from '@/db/client'
import { enrollments, lessonProgress } from '@/db/schema'
import type { Enrollment } from '@/db/schema'

/**
 * Matrícula e progresso.
 *
 * O catálogo é conteúdo versionado, então estas tabelas apontam para ele por
 * slug. A consequência prática aparece aqui: nada garante no banco que um
 * `courseSlug` ou `lessonSlug` exista de verdade, e por isso quem chama estas
 * funções valida os slugs contra `@/content` antes — o que a camada de ação
 * faz. Aqui a validação que sobra é a de totais, para decidir quando um curso
 * terminou.
 */

/**
 * Devolve a matrícula da pessoa no curso, criando se ainda não houver.
 *
 * Idempotente de propósito: a matrícula nasce da primeira aula concluída, não
 * de um botão separado. O `onConflictDoNothing` cobre dois cliques simultâneos
 * na primeira aula — o segundo relê em vez de estourar no índice único.
 */
export async function matricular(
  userId: string,
  courseSlug: string,
): Promise<Enrollment> {
  const db = getDb()

  await db
    .insert(enrollments)
    .values({ userId, courseSlug })
    .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseSlug] })

  const matricula = await buscarMatricula(userId, courseSlug)
  if (!matricula) {
    throw new Error('Não foi possível criar nem localizar a matrícula.')
  }
  return matricula
}

export async function buscarMatricula(
  userId: string,
  courseSlug: string,
): Promise<Enrollment | undefined> {
  const db = getDb()
  const encontradas = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseSlug, courseSlug)))
    .limit(1)
  return encontradas[0]
}

/** Slugs das aulas concluídas numa matrícula. */
export async function aulasConcluidas(enrollmentId: string): Promise<string[]> {
  const db = getDb()
  const linhas = await db
    .select({ lessonSlug: lessonProgress.lessonSlug })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.enrollmentId, enrollmentId),
        eq(lessonProgress.status, 'completed'),
      ),
    )
  return linhas.map((l) => l.lessonSlug)
}

/**
 * Progresso da pessoa num curso. Sem matrícula devolve lista vazia em vez de
 * `null`, porque para a interface "não matriculado" e "matriculado sem nenhuma
 * aula concluída" se desenham igual.
 */
export async function progressoDoCurso(
  userId: string,
  courseSlug: string,
): Promise<string[]> {
  const matricula = await buscarMatricula(userId, courseSlug)
  if (!matricula) return []
  return aulasConcluidas(matricula.id)
}

/**
 * Marca ou desmarca uma aula, matriculando na primeira vez.
 *
 * Devolve a lista completa de concluídas em vez de só confirmar a operação:
 * quem chamou precisa redesenhar a barra de progresso, e assim não faz uma
 * segunda consulta para descobrir o novo total.
 */
export async function definirConclusao(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  concluida: boolean,
): Promise<string[]> {
  const db = getDb()
  const matricula = await matricular(userId, courseSlug)
  const agora = new Date()

  const estado = {
    status: concluida ? ('completed' as const) : ('in_progress' as const),
    // Desmarcar limpa a data: guardar a data de uma conclusão desfeita faria
    // a linha se contradizer.
    completedAt: concluida ? agora : null,
    updatedAt: agora,
  }

  await db
    .insert(lessonProgress)
    .values({ enrollmentId: matricula.id, lessonSlug, ...estado })
    .onConflictDoUpdate({
      target: [lessonProgress.enrollmentId, lessonProgress.lessonSlug],
      set: estado,
    })

  const concluidas = await aulasConcluidas(matricula.id)
  await sincronizarStatus(matricula, concluidas.length)
  return concluidas
}

/**
 * Mantém o status da matrícula coerente com as aulas concluídas.
 *
 * O total vem do conteúdo, não do banco, então acrescentar uma aula ao curso
 * reabre automaticamente as matrículas que estavam completas — que é o
 * comportamento certo: o curso cresceu e quem terminou tem o que assistir.
 */
async function sincronizarStatus(
  matricula: Enrollment,
  concluidas: number,
): Promise<void> {
  // Matrícula cancelada não volta sozinha por causa de progresso.
  if (matricula.status === 'cancelled') return

  const catalogo = buscarCurso(matricula.courseSlug)
  if (!catalogo || catalogo.totalDeAulas === 0) return

  const terminou = concluidas >= catalogo.totalDeAulas
  const alvo = terminou ? 'completed' : 'active'
  if (matricula.status === alvo) return

  const db = getDb()
  await db
    .update(enrollments)
    .set({ status: alvo, completedAt: terminou ? new Date() : null })
    .where(eq(enrollments.id, matricula.id))
}

export type MatriculaComProgresso = {
  courseSlug: string
  status: Enrollment['status']
  enrolledAt: Date
  concluidas: string[]
}

/**
 * Todas as matrículas da pessoa, com as aulas concluídas de cada uma.
 *
 * Duas consultas e o agrupamento em memória, em vez de um join com agregação:
 * o painel precisa dos slugs concluídos, não só da contagem, e o volume por
 * pessoa é de dezenas de linhas.
 */
export async function matriculasDoUsuario(
  userId: string,
): Promise<MatriculaComProgresso[]> {
  const db = getDb()

  const matriculas = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.userId, userId))

  if (matriculas.length === 0) return []

  const linhas = await db
    .select({
      enrollmentId: lessonProgress.enrollmentId,
      lessonSlug: lessonProgress.lessonSlug,
    })
    .from(lessonProgress)
    .where(
      and(
        inArray(
          lessonProgress.enrollmentId,
          matriculas.map((m) => m.id),
        ),
        eq(lessonProgress.status, 'completed'),
      ),
    )

  const porMatricula = new Map<string, string[]>()
  for (const linha of linhas) {
    const lista = porMatricula.get(linha.enrollmentId)
    if (lista) lista.push(linha.lessonSlug)
    else porMatricula.set(linha.enrollmentId, [linha.lessonSlug])
  }

  return matriculas.map((m) => ({
    courseSlug: m.courseSlug,
    status: m.status,
    enrolledAt: m.enrolledAt,
    concluidas: porMatricula.get(m.id) ?? [],
  }))
}
