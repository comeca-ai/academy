import { and, asc, eq, ilike, or } from 'drizzle-orm'

import { getDb } from '@/db/client'
import { courses, lessonMaterials, lessons, modules } from '@/db/schema'
import type { Course, Lesson, LessonMaterial, Module } from '@/db/schema'

export type ModuloComAulas = { module: Module; lessons: Lesson[] }

export type CursoCompleto = {
  course: Course
  modules: ModuloComAulas[]
  totalDeAulas: number
  duracaoEmSegundos: number
}

/**
 * Cursos visíveis ao público.
 *
 * Só `published` aparece: rascunho e arquivado ficam fora do catálogo mesmo
 * para quem souber a URL, porque a listagem e a página de detalhe usam o mesmo
 * filtro. A busca é por título e resumo, sem diferenciar maiúsculas.
 */
export async function listarCursosPublicados(busca?: string): Promise<Course[]> {
  const db = getDb()
  const termo = busca?.trim()

  const filtroDePublicacao = eq(courses.status, 'published')
  const filtro = termo
    ? and(
        filtroDePublicacao,
        or(ilike(courses.title, `%${termo}%`), ilike(courses.summary, `%${termo}%`)),
      )
    : filtroDePublicacao

  return db.select().from(courses).where(filtro).orderBy(asc(courses.title))
}

/**
 * Curso publicado com todo o seu conteúdo, pronto para a página de detalhe.
 *
 * Faz duas consultas em vez de uma junção grande: uma para o curso e outra
 * trazendo módulos e aulas juntos. Montar a árvore em memória sai mais barato
 * do que desduplicar as linhas repetidas que uma junção única devolveria.
 */
export async function buscarCursoPublicado(slug: string): Promise<CursoCompleto | null> {
  const db = getDb()

  const encontrados = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.status, 'published')))
    .limit(1)

  const course = encontrados[0]
  if (!course) return null

  const linhas = await db
    .select({ module: modules, lesson: lessons })
    .from(modules)
    .leftJoin(
      lessons,
      and(eq(lessons.moduleId, modules.id), eq(lessons.status, 'published')),
    )
    .where(eq(modules.courseId, course.id))
    .orderBy(asc(modules.position), asc(lessons.position))

  const porModulo = new Map<string, ModuloComAulas>()
  for (const linha of linhas) {
    let entrada = porModulo.get(linha.module.id)
    if (!entrada) {
      entrada = { module: linha.module, lessons: [] }
      porModulo.set(linha.module.id, entrada)
    }
    // A junção à esquerda devolve o módulo mesmo sem aula publicada; nesse
    // caso `lesson` vem nulo e o módulo aparece vazio, em vez de sumir.
    if (linha.lesson) entrada.lessons.push(linha.lesson)
  }

  const modulos = [...porModulo.values()]
  const todasAsAulas = modulos.flatMap((m) => m.lessons)

  return {
    course,
    modules: modulos,
    totalDeAulas: todasAsAulas.length,
    duracaoEmSegundos: todasAsAulas.reduce((soma, a) => soma + a.durationSeconds, 0),
  }
}

export type AulaEmContexto = {
  course: Course
  module: Module
  lesson: Lesson
  materials: LessonMaterial[]
  /** Posição da aula na sequência inteira do curso, começando em 1. */
  indice: number
  total: number
  anterior: Lesson | null
  proxima: Lesson | null
}

/**
 * Uma aula publicada, com o material de apoio e a vizinhança dentro do curso.
 *
 * Reaproveita `buscarCursoPublicado` em vez de repetir a montagem da árvore:
 * o curso inteiro já vem ordenado, e achatá-lo dá a sequência de navegação de
 * graça. Também garante que aula de curso não publicado nunca abre.
 */
export async function buscarAulaPublicada(
  cursoSlug: string,
  aulaSlug: string,
): Promise<AulaEmContexto | null> {
  const curso = await buscarCursoPublicado(cursoSlug)
  if (!curso) return null

  const sequencia = curso.modules.flatMap((m) =>
    m.lessons.map((lesson) => ({ lesson, module: m.module })),
  )

  const posicao = sequencia.findIndex((item) => item.lesson.slug === aulaSlug)
  if (posicao === -1) return null

  const atual = sequencia[posicao]
  if (!atual) return null

  const materiais = await getDb()
    .select()
    .from(lessonMaterials)
    .where(eq(lessonMaterials.lessonId, atual.lesson.id))
    .orderBy(asc(lessonMaterials.position))

  return {
    course: curso.course,
    module: atual.module,
    lesson: atual.lesson,
    materials: materiais,
    indice: posicao + 1,
    total: sequencia.length,
    anterior: sequencia[posicao - 1]?.lesson ?? null,
    proxima: sequencia[posicao + 1]?.lesson ?? null,
  }
}
