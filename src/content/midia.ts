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
  // "Dados e Conceitos fundamentais [Parte 5]" — confirmado no painel.
  // Faltam as partes 1 a 4; ao inserir, coloque-as ANTES desta.
  'dados-conceitos-fundamentais': ['88496712714cef55dd2eb4a590bc3618'],
  algoritmos: [],
  'de-zero-ao-cem-flix': [],
  'quem-e-o-instrutor': [],
  'privacidade-e-dados-pessoais': [],
}

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
