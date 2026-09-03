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
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  ESTRUTURA REAL DA TURMA, APURADA NO MURAL DO GOOGLE CLASSROOM           │
 * │                                                                          │
 * │  Turma "Inteligência Artificial do Zero ao 100 — Turma 01".              │
 * │  Fonte: captura das 4 páginas do mural. Não é palpite: os títulos e os   │
 * │  textos abaixo saíram da camada de texto do PDF, e a contagem de anexos  │
 * │  fechou pela camada de links (17 do Drive = 10 vídeos + 5 PDFs + 2       │
 * │  imagens), o que descarta anexo escondido.                               │
 * │                                                                          │
 * │  Ordem cronológica das postagens com vídeo:                              │
 * │                                                                          │
 * │  1. Algoritmos e Modelos Preditivos              11/02/2025   3 vídeos   │
 * │     [Parte 1] Algoritmos · [Parte 2] De0ao100Flix · [Parte 3] DeepLearning│
 * │     Materiais: Algoritmos.pdf, De0ao100Flix.pdf                          │
 * │                                                                          │
 * │  2. [Sessão Prática] Algoritmos / …              11/02/2025   3 vídeos   │
 * │     [Caso 01] Relatório · [Caso 02] Precificar · [Caso 03] Leilão Imóveis │
 * │                                                                          │
 * │  3. Ética e Privacidade                          19/02/2025   4 vídeos   │
 * │     Aula - Parte1.mp4 … Parte4.mp4                                       │
 * │                                                                          │
 * │  POR QUE A SEQUÊNCIA ABAIXO AINDA NÃO ESTÁ NESSA FORMA:                  │
 * │                                                                          │
 * │  O mural mostra NOME de vídeo sem identificador; o Stream mostra         │
 * │  identificador. Não há chave comum, então nenhuma das duas fontes        │
 * │  sozinha diz qual dos 9 identificadores é qual dos 10 vídeos. Note que   │
 * │  são 10 no mural e 9 aqui: falta pelo menos um.                          │
 * │                                                                          │
 * │  Some-se que 88496712714cef55dd2eb4a590bc3618 aparece no Stream como     │
 * │  "Dados e Conceitos fundamentais [Parte 5]", e NENHUMA postagem deste    │
 * │  mural tem esse nome — ou a turma tem conteúdo fora do mural, ou esse    │
 * │  vídeo é de outra edição. Enquanto isso não fecha, agrupar por posição   │
 * │  colocaria vídeo errado sob título certo.                                │
 * │                                                                          │
 * │  PARA FECHAR: a listagem do Cloudflare Stream com nome ao lado do        │
 * │  identificador resolve tudo de uma vez.                                  │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Material que vale para o curso inteiro.
 *
 * Os dois decks pertencem, pelo mural, à aula "Algoritmos e Modelos
 * Preditivos" — ficam aqui só enquanto essa aula não existe como unidade,
 * porque prendê-los a uma das aulas provisórias colocaria o PDF certo embaixo
 * do vídeo errado.
 *
 * "Precisamos falar sobre privacidade" não é slide nem aula: é o artigo
 * publicado no FebrabanTech, postado em 19/02 como material de apoio, separado
 * da aula "Ética e Privacidade" do mesmo dia. O rótulo diz isso, para ninguém
 * abrir esperando a aula.
 */
export const MATERIAIS_DO_CURSO: { titulo: string; tipo: Material['tipo']; chave: string }[] = [
  { titulo: 'Algoritmos — slides da aula', tipo: 'slides', chave: 'Algoritmos.pdf' },
  { titulo: 'De Zero ao 100 Flix — slides da aula', tipo: 'slides', chave: 'De0ao100Flix.pdf' },
  {
    titulo: 'Artigo: Precisamos falar sobre privacidade',
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
