import { describe, expect, it } from 'vitest'

import { gerarTokenDeRedefinicao, hashDoToken } from './reset-token'

describe('gerarTokenDeRedefinicao', () => {
  it('gera um token diferente a cada chamada', () => {
    const a = gerarTokenDeRedefinicao()
    const b = gerarTokenDeRedefinicao()
    expect(a.token).not.toBe(b.token)
  })

  it('o hash devolvido é o hash do próprio token', () => {
    const { token, hash } = gerarTokenDeRedefinicao()
    expect(hashDoToken(token)).toBe(hash)
  })

  it('tokens diferentes produzem hashes diferentes', () => {
    const a = gerarTokenDeRedefinicao()
    const b = gerarTokenDeRedefinicao()
    expect(a.hash).not.toBe(b.hash)
  })

  it('o token só usa caracteres seguros em URL, sem precisar de escape', () => {
    const { token } = gerarTokenDeRedefinicao()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})

describe('hashDoToken', () => {
  it('é determinístico: o mesmo token sempre produz o mesmo hash', () => {
    expect(hashDoToken('um-token-qualquer')).toBe(hashDoToken('um-token-qualquer'))
  })

  it('tokens diferentes produzem hashes diferentes', () => {
    expect(hashDoToken('a')).not.toBe(hashDoToken('b'))
  })
})
