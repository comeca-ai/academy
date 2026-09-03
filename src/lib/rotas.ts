/** Para onde mandar quem entrou sem ter pedido uma página específica. */
export const DESTINO_PADRAO = '/painel'

/**
 * Valida o destino de redirecionamento vindo da requisição.
 *
 * O parâmetro `destino` chega da URL e é controlado por quem monta o link, o
 * que o torna um vetor clássico de redirecionamento aberto: um link para
 * `/entrar?destino=https://site-falso` levaria a pessoa para fora logo depois
 * de digitar a senha. Só aceitamos caminho interno absoluto.
 *
 * `//host` e `/\host` são recusados porque o navegador os interpreta como
 * endereço com outro domínio, apesar de começarem com barra.
 */
export function destinoSeguro(bruto: unknown): string {
  if (typeof bruto !== 'string') return DESTINO_PADRAO

  const valor = bruto.trim()
  if (!valor.startsWith('/')) return DESTINO_PADRAO
  if (valor.startsWith('//') || valor.startsWith('/\\')) return DESTINO_PADRAO

  return valor
}
