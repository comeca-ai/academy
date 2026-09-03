/**
 * Formato do conteúdo do curso.
 *
 * O conteúdo é código, não linha de banco: fica versionado, passa por revisão
 * em pull request e sobe junto com a aplicação. Para um catálogo escrito pela
 * própria equipe isso vale mais do que um painel de administração — some o
 * banco do caminho de leitura e o site inteiro fica estático.
 */

export type TipoDeMaterial = 'slides' | 'pdf' | 'link' | 'arquivo'

export type Material = {
  titulo: string
  tipo: TipoDeMaterial
  /** URL completa. Use `arquivo()` de `midia.ts` para montar a partir da chave no R2. */
  url: string
}

export type Aula = {
  slug: string
  titulo: string
  /** Uma ou duas frases sobre o que a aula entrega. */
  resumo: string
  /** Identificador do vídeo no Cloudflare Stream, ou `null` enquanto não houver. */
  video: string | null
  duracaoEmMinutos: number
  materiais: Material[]
}

export type Modulo = {
  titulo: string
  aulas: Aula[]
}

export type Curso = {
  slug: string
  titulo: string
  resumo: string
  descricao: string
  instrutor: { nome: string; bio: string }
  modulos: Modulo[]
}
