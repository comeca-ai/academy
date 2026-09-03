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
 * Identificadores dos vídeos no Cloudflare Stream, por aula.
 *
 * PENDENTE: preencher com o identificador de 32 caracteres de cada vídeo,
 * copiado do painel do Stream. Enquanto o valor for `null`, a aula é publicada
 * normalmente e aparece sem player — o material de apoio e o texto continuam
 * acessíveis.
 */
export const VIDEOS: Record<string, string | null> = {
  'dados-conceitos-fundamentais': null,
  algoritmos: null,
  'de-zero-ao-cem-flix': null,
  'quem-e-o-instrutor': null,
  'privacidade-e-dados-pessoais': null,
}
