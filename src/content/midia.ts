import type { Material, Parte } from './tipos'

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

export type ItemDaSequencia = {
  /** Identificador de 32 caracteres no Cloudflare Stream. */
  video: string
  /** Título definitivo. Enquanto `null`, a aula aparece marcada como provisória. */
  titulo: string | null
  /** Resumo da aula. Opcional. */
  resumo?: string
  /** Chaves de arquivo no bucket R2 que acompanham esta aula. */
  materiais?: { titulo: string; tipo: Material['tipo']; chave: string }[]
}

/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  A SEQUÊNCIA DO CURSO                                                    │
 * │                                                                          │
 * │  Esta lista É o curso: cada item vira uma aula, na ordem em que está     │
 * │  escrita. Para reordenar, mova a linha. Para nomear, preencha `titulo`.  │
 * │                                                                          │
 * │  Enquanto `titulo` for null, a aula é publicada com um rótulo provisório │
 * │  e um aviso na tela — o vídeo já toca, mas ninguém confunde rascunho     │
 * │  com versão final.                                                       │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
export const SEQUENCIA: ItemDaSequencia[] = [
  {
    video: '88496712714cef55dd2eb4a590bc3618',
    titulo: 'Dados e conceitos fundamentais',
    resumo:
      'Os conceitos fundamentais de dados e por que eles são a base de tudo que a inteligência artificial faz. Como a IA se inspira no aprendizado humano e qual o papel dos dados para a máquina se adaptar e decidir.',
    materiais: [
      {
        titulo: 'Slides da aula',
        tipo: 'slides',
        chave: 'dados_conceitos_fundamentais.pdf',
      },
    ],
  },
  { video: '024add77618c677acac29262cb30346f', titulo: null },
  { video: '7face257fe47462b5cb90470cad0bc5d', titulo: null },
  { video: 'ad3e07bc094a8fbb0f715b9b28f51834', titulo: null },
  { video: '3b8ee92e31510a0f9b6e34c2b63b4398', titulo: null },
  { video: '25b12b297ec043e2b1242f81f2b1471c', titulo: null },
  { video: 'e42fa90595806f96ab6d0e860dd5ba59', titulo: null },
  { video: '4f0bf4fd92e5da7f44b286e1835fbfd7', titulo: null },
  { video: 'fb5e06afa1290f342e864727b223ba7d', titulo: null },
]

/**
 * Material que vale para o curso inteiro.
 *
 * Os slides ficam aqui, e não presos a uma aula, enquanto não soubermos a qual
 * aula cada deck pertence. Chutar essa ligação colocaria o PDF errado embaixo
 * do vídeo certo, que é pior do que deixá-los juntos num lugar só.
 */
export const MATERIAIS_DO_CURSO: { titulo: string; tipo: Material['tipo']; chave: string }[] = [
  { titulo: 'Algoritmos', tipo: 'slides', chave: 'Algoritmos.pdf' },
  { titulo: 'DeZeroAo100Flix', tipo: 'slides', chave: 'De0ao100Flix.pdf' },
  {
    titulo: 'Precisamos falar sobre privacidade',
    tipo: 'pdf',
    chave: 'Precisamos falar sobre privacidade.pdf',
  },
  { titulo: 'Biografia do instrutor', tipo: 'pdf', chave: 'BiografiadoInstrutor.pdf' },
]

/**
 * Valida e converte um identificador em parte reproduzível.
 *
 * O que não for hexadecimal de 32 caracteres é descartado, para um erro de
 * digitação virar aula sem vídeo em vez de player quebrado na tela.
 */
export function parteDe(video: string): Parte[] {
  const id = video.trim()
  return /^[0-9a-f]{32}$/i.test(id) ? [{ video: id }] : []
}
