import { describe, expect, it } from 'vitest'

import { SENHA_MINIMA, conferirSenha, hashDeSenha, validarForcaDaSenha } from './password'

describe('validarForcaDaSenha', () => {
  it('recusa senha curta demais', () => {
    expect(validarForcaDaSenha('a'.repeat(SENHA_MINIMA - 1))).toContain(
      String(SENHA_MINIMA),
    )
  })

  it('aceita senha no comprimento mínimo', () => {
    expect(validarForcaDaSenha('a'.repeat(SENHA_MINIMA))).toBeNull()
  })

  it('recusa senha absurdamente longa', () => {
    expect(validarForcaDaSenha('a'.repeat(1025))).not.toBeNull()
  })
})

describe('hashDeSenha e conferirSenha', () => {
  it('confere a senha correta', async () => {
    const hash = await hashDeSenha('segredo-bem-grande')
    await expect(conferirSenha('segredo-bem-grande', hash)).resolves.toBe(true)
  })

  it('recusa a senha errada', async () => {
    const hash = await hashDeSenha('segredo-bem-grande')
    await expect(conferirSenha('outra-coisa-qualquer', hash)).resolves.toBe(false)
  })

  it('gera hashes diferentes para a mesma senha', async () => {
    const a = await hashDeSenha('segredo-bem-grande')
    const b = await hashDeSenha('segredo-bem-grande')
    expect(a).not.toBe(b)
  })

  it('recusa em vez de quebrar quando o hash está corrompido', async () => {
    await expect(conferirSenha('segredo-bem-grande', 'nao-e-um-hash')).resolves.toBe(false)
  })

  it('não deixa criar hash de senha fraca', async () => {
    await expect(hashDeSenha('curta')).rejects.toThrow()
  })
})
