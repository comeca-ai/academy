/**
 * Resolve o vídeo de uma aula para algo que o navegador saiba tocar.
 *
 * O campo `videoUrl` da aula aceita três formas, para o cadastro de conteúdo
 * não exigir que quem escreve monte URL na mão:
 *
 * - identificador do Cloudflare Stream (32 caracteres hexadecimais);
 * - URL completa de incorporação (qualquer provedor);
 * - URL de arquivo de vídeo (.mp4, .webm, .ogg), tocado nativamente.
 *
 * Nada aqui baixa ou inspeciona o vídeo: quem carrega é o navegador de quem
 * assiste.
 */

export type VideoResolvido =
  | { tipo: 'incorporado'; src: string }
  | { tipo: 'arquivo'; src: string }
  | null

/** Subdomínio da conta no Cloudflare Stream, usado para expandir um identificador. */
export const STREAM_SUBDOMINIO =
  process.env.NEXT_PUBLIC_STREAM_SUBDOMINIO ?? 'customer-0b8qbusp05k8f01y'

const IDENTIFICADOR_STREAM = /^[0-9a-f]{32}$/i
const ARQUIVO_DE_VIDEO = /\.(mp4|webm|ogg|mov)(\?.*)?$/i

export function resolverVideo(videoUrl: string | null | undefined): VideoResolvido {
  const valor = videoUrl?.trim()
  if (!valor) return null

  if (IDENTIFICADOR_STREAM.test(valor)) {
    return {
      tipo: 'incorporado',
      src: `https://${STREAM_SUBDOMINIO}.cloudflarestream.com/${valor}/iframe`,
    }
  }

  // Só aceitamos http(s). Um valor com outro esquema — `javascript:`, `data:` —
  // viraria injeção no atributo src do iframe.
  if (!/^https?:\/\//i.test(valor)) return null

  if (ARQUIVO_DE_VIDEO.test(valor)) return { tipo: 'arquivo', src: valor }

  return { tipo: 'incorporado', src: valor }
}
