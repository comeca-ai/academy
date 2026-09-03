import { and, asc, eq, ilike, or } from 'drizzle-orm'

import { getDb } from '@/db/client'
import { courses, lessons, modules } from '@/db/schema'
import type { Course, Lesson, Module } from '@/db/schema'

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
