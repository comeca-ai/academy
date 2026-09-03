import { describe, expect, it } from 'vitest'

import { percentualConcluido, proximaAulaPendente } from './progresso'

describe('percentualConcluido', () => {
  it('devolve 0 quando nada foi concluído', () => {
    expect(percentualConcluido(0, 9)).toBe(0)
  })

  it('devolve 100 quando tudo foi concluído', () => {
    expect(percentualConcluido(9, 9)).toBe(100)
  })

  it('arredonda para baixo para não anunciar 100% com aula pendente', () => {
    // 8 de 9 é 88,9% — mostrar 89% é aceitável, mostrar 100% não seria.
    expect(percentualConcluido(8, 9)).toBe(88)
  })

  it('trata curso sem aulas sem dividir por zero', () => {
    expect(percentualConcluido(0, 0)).toBe(0)
  })

  it('não passa de 100 se houver mais concluídas que aulas', () => {
    // Acontece quando uma aula é removida do conteúdo e a linha de progresso
    // dela continua no banco.
    expect(percentualConcluido(11, 9)).toBe(100)
  })
})

describe('proximaAulaPendente', () => {
  const ordem = ['aula-01', 'aula-02', 'aula-03']

  it('começa na primeira quando nada foi concluído', () => {
    expect(proximaAulaPendente(ordem, [])).toBe('aula-01')
  })

  it('avança para a primeira pendente', () => {
    expect(proximaAulaPendente(ordem, ['aula-01'])).toBe('aula-02')
  })

  it('volta para a aula pulada em vez de seguir adiante', () => {
    expect(proximaAulaPendente(ordem, ['aula-01', 'aula-03'])).toBe('aula-02')
  })

  it('devolve null com o curso inteiro concluído', () => {
    expect(proximaAulaPendente(ordem, ordem)).toBeNull()
  })

  it('ignora slugs concluídos que não estão mais no conteúdo', () => {
    expect(proximaAulaPendente(ordem, ['aula-01', 'aula-removida'])).toBe('aula-02')
  })
})
