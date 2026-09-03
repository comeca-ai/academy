import { describe, expect, it } from 'vitest'

import { criarLimitador } from './rate-limit'

const JANELA = 60_000
const T0 = 1_700_000_000_000

function limitador() {
  return criarLimitador({ maxTentativas: 3, janelaMs: JANELA })
}

describe('criarLimitador', () => {
  it('permite até o limite e bloqueia a partir dele', () => {
    const lim = limitador()
    for (let i = 0; i < 3; i++) {
      expect(lim.conferir('ana', T0).permitido).toBe(true)
      lim.registrar('ana', T0)
    }
    expect(lim.conferir('ana', T0).permitido).toBe(false)
  })

  it('libera quando a tentativa mais antiga sai da janela', () => {
    const lim = limitador()
    for (let i = 0; i < 3; i++) lim.registrar('ana', T0)

    expect(lim.conferir('ana', T0 + JANELA - 1).permitido).toBe(false)
    expect(lim.conferir('ana', T0 + JANELA).permitido).toBe(true)
  })

  it('conta chaves de forma independente', () => {
    const lim = limitador()
    for (let i = 0; i < 3; i++) lim.registrar('ana', T0)

    expect(lim.conferir('ana', T0).permitido).toBe(false)
    expect(lim.conferir('bruno', T0).permitido).toBe(true)
  })

  it('informa quantos segundos faltam para liberar', () => {
    const lim = limitador()
    for (let i = 0; i < 3; i++) lim.registrar('ana', T0)

    const veredito = lim.conferir('ana', T0 + 20_000)
    expect(veredito.permitido).toBe(false)
    expect(veredito.esperarSegundos).toBe(40)
  })

  it('nunca informa espera menor que um segundo enquanto bloqueia', () => {
    const lim = limitador()
    for (let i = 0; i < 3; i++) lim.registrar('ana', T0)

    const veredito = lim.conferir('ana', T0 + JANELA - 1)
    expect(veredito.permitido).toBe(false)
    expect(veredito.esperarSegundos).toBeGreaterThanOrEqual(1)
  })

  it('zera a contagem em limpar', () => {
    const lim = limitador()
    for (let i = 0; i < 3; i++) lim.registrar('ana', T0)
    expect(lim.conferir('ana', T0).permitido).toBe(false)

    lim.limpar('ana')
    expect(lim.conferir('ana', T0).permitido).toBe(true)
  })

  it('usa janela deslizante, não blocos fixos', () => {
    const lim = limitador()
    lim.registrar('ana', T0)
    lim.registrar('ana', T0 + 30_000)
    lim.registrar('ana', T0 + 50_000)
    expect(lim.conferir('ana', T0 + 50_000).permitido).toBe(false)

    // A primeira tentativa saiu da janela: abre exatamente uma vaga.
    expect(lim.conferir('ana', T0 + 60_000).permitido).toBe(true)
    lim.registrar('ana', T0 + 60_000)
    expect(lim.conferir('ana', T0 + 60_000).permitido).toBe(false)
  })
})
