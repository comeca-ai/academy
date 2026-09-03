import { describe, expect, it } from 'vitest'

import { duracaoHumana, plural } from './formato'

describe('duracaoHumana', () => {
  it('mostra minutos abaixo de uma hora', () => {
    expect(duracaoHumana(45 * 60)).toBe('45 min')
    expect(duracaoHumana(60)).toBe('1 min')
  })

  it('mostra horas e minutos acima de uma hora', () => {
    expect(duracaoHumana(80 * 60)).toBe('1 h 20 min')
    expect(duracaoHumana(125 * 60)).toBe('2 h 5 min')
  })

  it('omite os minutos quando a hora é cheia', () => {
    expect(duracaoHumana(60 * 60)).toBe('1 h')
    expect(duracaoHumana(3 * 60 * 60)).toBe('3 h')
  })

  it('arredonda para baixo, para não prometer menos tempo que o real', () => {
    expect(duracaoHumana(59)).toBe('menos de 1 min')
    expect(duracaoHumana(119)).toBe('1 min')
  })

  it('trata zero e valores inválidos sem quebrar', () => {
    expect(duracaoHumana(0)).toBe('menos de 1 min')
    expect(duracaoHumana(-10)).toBe('menos de 1 min')
    expect(duracaoHumana(Number.NaN)).toBe('menos de 1 min')
  })
})

describe('plural', () => {
  it('concorda com o número', () => {
    expect(plural(1, 'aula', 'aulas')).toBe('1 aula')
    expect(plural(4, 'aula', 'aulas')).toBe('4 aulas')
    expect(plural(0, 'aula', 'aulas')).toBe('0 aulas')
  })
})
