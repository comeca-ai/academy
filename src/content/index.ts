import { deZeroAoCem } from './de-zero-ao-cem'
import type { Aula, Curso, Modulo } from './tipos'

/**
 * Consulta ao catálogo.
 *
 * Mesmo formato de retorno que uma camada de dados teria, mas resolvido em
 * memória: o catálogo inteiro é pequeno e conhecido no build. Isso deixa as
 * páginas do curso sem dependência de banco e o site inteiro estático.
 */

const CURSOS: Curso[] = [deZeroAoCem]

export function listarCursos(busca?: string): Curso[] {
  const termo = busca?.trim().toLowerCase()
  if (!termo) return CURSOS

  return CURSOS.filter((curso) =>
    [curso.titulo, curso.resumo, curso.descricao]
      .join(' ')
      .toLowerCase()
      .includes(termo),
  )
}

export type CursoComTotais = {
  curso: Curso
  totalDeAulas: number
  duracaoEmMinutos: number
}

function todasAsAulas(curso: Curso): Aula[] {
  return curso.modulos.flatMap((modulo) => modulo.aulas)
}

export function buscarCurso(slug: string): CursoComTotais | null {
  const curso = CURSOS.find((c) => c.slug === slug)
  if (!curso) return null

  const aulas = todasAsAulas(curso)
  return {
    curso,
    totalDeAulas: aulas.length,
    duracaoEmMinutos: aulas.reduce((soma, a) => soma + a.duracaoEmMinutos, 0),
  }
}

export type AulaEmContexto = {
  curso: Curso
  modulo: Modulo
  aula: Aula
  /** Posição na sequência inteira do curso, começando em 1. */
  indice: number
  total: number
  anterior: Aula | null
  proxima: Aula | null
}

export function buscarAula(cursoSlug: string, aulaSlug: string): AulaEmContexto | null {
  const curso = CURSOS.find((c) => c.slug === cursoSlug)
  if (!curso) return null

  // Achatar os módulos dá a sequência de navegação sem estrutura extra: a
  // ordem de leitura é exatamente a ordem em que as aulas estão declaradas.
  const sequencia = curso.modulos.flatMap((modulo) =>
    modulo.aulas.map((aula) => ({ aula, modulo })),
  )

  const posicao = sequencia.findIndex((item) => item.aula.slug === aulaSlug)
  if (posicao === -1) return null

  const atual = sequencia[posicao]
  if (!atual) return null

  return {
    curso,
    modulo: atual.modulo,
    aula: atual.aula,
    indice: posicao + 1,
    total: sequencia.length,
    anterior: sequencia[posicao - 1]?.aula ?? null,
    proxima: sequencia[posicao + 1]?.aula ?? null,
  }
}

