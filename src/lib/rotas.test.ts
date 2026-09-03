import { describe, expect, it } from 'vitest'

import { DESTINO_PADRAO, destinoSeguro } from './rotas'

describe('destinoSeguro', () => {
  it('aceita caminho interno', () => {
    expect(destinoSeguro('/aulas/introducao')).toBe('/aulas/introducao')
    expect(destinoSeguro('/painel')).toBe('/painel')
  })

  it('recusa endereço externo', () => {
    expect(destinoSeguro('https://site-falso.com')).toBe(DESTINO_PADRAO)
    expect(destinoSeguro('http://site-falso.com')).toBe(DESTINO_PADRAO)
  })

  it('recusa as formas que o navegador lê como outro domínio', () => {
    expect(destinoSeguro('//site-falso.com')).toBe(DESTINO_PADRAO)
    expect(destinoSeguro('/\\site-falso.com')).toBe(DESTINO_PADRAO)
  })

  it('recusa esquemas perigosos', () => {
    expect(destinoSeguro('javascript:alert(1)')).toBe(DESTINO_PADRAO)
    expect(destinoSeguro('data:text/html,<script>')).toBe(DESTINO_PADRAO)
  })

  it('cai no padrão quando não veio destino', () => {
    expect(destinoSeguro(null)).toBe(DESTINO_PADRAO)
    expect(destinoSeguro(undefined)).toBe(DESTINO_PADRAO)
    expect(destinoSeguro('')).toBe(DESTINO_PADRAO)
    expect(destinoSeguro(42)).toBe(DESTINO_PADRAO)
  })

  it('ignora espaços em volta', () => {
    expect(destinoSeguro('  /painel  ')).toBe('/painel')
    expect(destinoSeguro('  https://site-falso.com  ')).toBe(DESTINO_PADRAO)
  })
})
