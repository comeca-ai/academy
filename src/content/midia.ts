import type { Parte } from './tipos'

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  PONTO ÚNICO DE CONFIGURAÇÃO DE MÍDIA
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Toda referência a vídeo e a arquivo do curso passa por aqui. Se um link
 * quebrar, é este arquivo que se corrige — nenhum outro.
 *
 * A plataforma não hospeda mídia: vídeo fica no Cloudflare Stream e material
 * no bucket R2. Guardamos identificador e chave, e montamos a URL na hora.
 */

/** Subdomínio da conta no Cloudflare Stream. */
export const STREAM_SUBDOMINIO = 'customer-0b8qbusp05k8f01y'

/** Domínio público do bucket R2 onde estão os slides. */
export const R2_BASE = 'https://pub-ccd99fb20c984453a0f8c38dd5814000.r2.dev'

/**
 * Monta a URL pública de um arquivo no R2 a partir da chave do objeto.
 * Cada segmento é codificado para que acento e espaço no nome do arquivo não
 * quebrem o endereço.
 */
export function arquivo(chave: string): string {
  const caminho = chave
    .split('/')
    .map((segmento) => encodeURIComponent(segmento))
    .join('/')
  return `${R2_BASE}/${caminho}`
}

/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  PARA COMPLETAR O CURSO: cole aqui os identificadores do Stream.         │
 * │                                                                          │
 * │  Cada aula recebe a lista das suas gravações, NA ORDEM em que devem ser  │
 * │  assistidas. O identificador é o "ID do Vídeo" que aparece no painel do  │
 * │  Stream, com 32 caracteres.                                              │
 * │                                                                          │
 * │  Exemplo com três partes:                                                │
 * │    algoritmos: [                                                         │
 * │      '0f1e2d3c4b5a69788796a5b4c3d2e1f0',                                 │
 * │      'aabbccddeeff00112233445566778899',                                 │
 * │      '99887766554433221100ffeeddccbbaa',                                 │
 * │    ],                                                                    │
 * │                                                                          │
 * │  Lista vazia = aula publicada sem player, com material e texto intactos. │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
const IDENTIFICADORES: Record<string, string[]> = {
  // Confirmado no painel: "Dados e Conceitos fundamentais [Parte 5]".
  'dados-conceitos-fundamentais': ['88496712714cef55dd2eb4a590bc3618'],
  algoritmos: [],
  'de-zero-ao-cem-flix': [],
  'quem-e-o-instrutor': [],
  'privacidade-e-dados-pessoais': [],
}

/**
 * AGUARDANDO MAPEAMENTO.
 *
 * Identificadores recebidos sem indicação de a qual aula pertencem, na ordem
 * em que chegaram. Ficam registrados aqui para não se perderem; assim que
 * soubermos a que aula corresponde cada um, migram para IDENTIFICADORES acima
 * e esta lista some.
 *
 * A ordem de aulas informada foi: apresentação do professor, história da
 * inteligência artificial, primeira parte prática — o que não corresponde à
 * estrutura montada a partir dos slides, então o curso também precisa ser
 * reordenado quando o mapeamento chegar.
 */
export const AGUARDANDO_MAPEAMENTO = [
  '024add77618c677acac29262cb30346f',
  '7face257fe47462b5cb90470cad0bc5d',
  'ad3e07bc094a8fbb0f715b9b28f51834',
  '3b8ee92e31510a0f9b6e34c2b63b4398',
  '25b12b297ec043e2b1242f81f2b1471c',
  'e42fa90595806f96ab6d0e860dd5ba59',
  '4f0bf4fd92e5da7f44b286e1835fbfd7',
  'fb5e06afa1290f342e864727b223ba7d',
] as const

/**
 * As partes de uma aula, prontas para o conteúdo.
 *
 * Filtra o que não for identificador válido de 32 caracteres, para um valor
 * digitado errado virar aula sem vídeo em vez de player quebrado na tela.
 */
export function partesDe(slugDaAula: string): Parte[] {
  const ids = IDENTIFICADORES[slugDaAula] ?? []
  return ids
    .map((id) => id.trim())
    .filter((id) => /^[0-9a-f]{32}$/i.test(id))
    .map((video) => ({ video }))
}
