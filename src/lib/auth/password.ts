import { hash, verify } from '@node-rs/argon2'

/**
 * Hashing de senha com argon2id.
 *
 * Os parâmetros seguem a recomendação do OWASP para argon2id (19 MiB de
 * memória, 2 iterações, paralelismo 1). Eles ficam registrados no próprio
 * hash, então aumentar o custo aqui no futuro não invalida as senhas
 * existentes — hashes antigos continuam verificando com os parâmetros com que
 * foram criados.
 */
const PARAMETROS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const

/** Comprimento mínimo aceito. Curto demais não vira senha forte com nenhum hash. */
export const SENHA_MINIMA = 10

export function validarForcaDaSenha(senha: string): string | null {
  if (senha.length < SENHA_MINIMA) {
    return `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.`
  }
  if (senha.length > 1024) {
    return 'A senha é longa demais.'
  }
  return null
}

export async function hashDeSenha(senha: string): Promise<string> {
  const erro = validarForcaDaSenha(senha)
  if (erro) throw new Error(erro)
  return hash(senha, PARAMETROS)
}

/**
 * Confere a senha contra o hash guardado.
 *
 * Nunca lança por hash malformado: uma linha corrompida no banco deve negar o
 * acesso, não derrubar a rota de login.
 */
export async function conferirSenha(senha: string, hashGuardado: string): Promise<boolean> {
  try {
    return await verify(hashGuardado, senha)
  } catch {
    return false
  }
}
