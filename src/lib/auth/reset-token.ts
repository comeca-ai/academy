import { createHash, randomBytes } from 'node:crypto'

/**
 * Token de redefinição de senha.
 *
 * O token que sai no e-mail nunca é o que fica gravado — só o hash. O link de
 * e-mail passa por um canal mais exposto que o cookie de sessão (inbox,
 * provedor, encaminhamento, log de servidor de e-mail), então uma cópia do
 * banco não deve bastar para redefinir a senha de ninguém.
 *
 * SHA-256 simples basta aqui, ao contrário do hash de senha: o token nasce
 * com 256 bits de entropia aleatória, não é uma frase curta que alguém
 * escolheu e que precisa de custo computacional para resistir a tentativa e
 * erro.
 */

const BYTES_DO_TOKEN = 32

/** Por quanto tempo um token vale, a partir de quando é gerado. */
export const DURACAO_DO_TOKEN_EM_MINUTOS = 30

export function hashDoToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function gerarTokenDeRedefinicao(): { token: string; hash: string } {
  const token = randomBytes(BYTES_DO_TOKEN).toString('base64url')
  return { token, hash: hashDoToken(token) }
}
