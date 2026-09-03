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

/**
 * Uma parte gravada da aula.
 *
 * As gravações do curso são divididas em partes numeradas, então uma aula tem
 * uma lista, não um vídeo só. Com uma única parte, a interface não mostra
 * rótulo nenhum — a divisão só aparece quando existe de fato.
 */
export type Parte = {
  /** Identificador de 32 caracteres no Cloudflare Stream. */
  video: string
  /** Rótulo opcional. Quando ausente, vira "Parte N" pela posição. */
  titulo?: string
}

export type Aula = {
  slug: string
  titulo: string
  /** Uma ou duas frases sobre o que a aula entrega. Vazio enquanto não definido. */
  resumo: string
  /** Gravações da aula, em ordem. Lista vazia enquanto não houver vídeo. */
  partes: Parte[]
  duracaoEmMinutos: number
  materiais: Material[]
  /**
   * Marca aula cujo título ainda não foi confirmado por quem produziu o curso.
   * A interface sinaliza, para ninguém confundir rascunho com versão final.
   */
  provisoria?: boolean
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
  /** Material que vale para o curso todo, não para uma aula específica. */
  materiais: Material[]
}
