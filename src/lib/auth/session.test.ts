import { describe, expect, it } from 'vitest'

import {
  DURACAO_DA_SESSAO_EM_DIAS,
  assinarToken,
  calcularExpiracao,
  lerToken,
  opcoesDoCookie,
} from './session'

const UM_ID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301'

describe('assinarToken e lerToken', () => {
  it('devolve o identificador da sessão de um token válido', async () => {
    const token = await assinarToken(UM_ID, calcularExpiracao())
    await expect(lerToken(token)).resolves.toBe(UM_ID)
  })

  it('recusa token adulterado', async () => {
    const token = await assinarToken(UM_ID, calcularExpiracao())
    const adulterado = `${token.slice(0, -3)}xyz`
    await expect(lerToken(adulterado)).resolves.toBeNull()
  })

  it('recusa token já expirado', async () => {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const token = await assinarToken(UM_ID, ontem)
    await expect(lerToken(token)).resolves.toBeNull()
  })

  it('recusa lixo sem quebrar', async () => {
    await expect(lerToken('nem-parece-um-jwt')).resolves.toBeNull()
    await expect(lerToken('')).resolves.toBeNull()
  })
})

describe('calcularExpiracao', () => {
  it('soma a duração padrão à data informada', () => {
    const agora = new Date('2026-01-01T00:00:00.000Z')
    const esperado = new Date('2026-01-31T00:00:00.000Z')
    expect(DURACAO_DA_SESSAO_EM_DIAS).toBe(30)
    expect(calcularExpiracao(agora).toISOString()).toBe(esperado.toISOString())
  })
})

describe('opcoesDoCookie', () => {
  it('mantém o cookie fora do alcance de scripts e de requisições cross-site', () => {
    const opcoes = opcoesDoCookie(new Date('2026-01-31T00:00:00.000Z'))
    expect(opcoes.httpOnly).toBe(true)
    expect(opcoes.sameSite).toBe('lax')
    expect(opcoes.path).toBe('/')
  })
})
