import { describe, expect, it } from 'vitest'

import { STREAM_SUBDOMINIO, resolverVideo } from './video'

const UID = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'

describe('resolverVideo', () => {
  it('expande identificador do Stream para a URL de incorporação', () => {
    expect(resolverVideo(UID)).toEqual({
      tipo: 'incorporado',
      src: `https://${STREAM_SUBDOMINIO}.cloudflarestream.com/${UID}/iframe`,
    })
  })

  it('aceita identificador em maiúsculas', () => {
    const resolvido = resolverVideo(UID.toUpperCase())
    expect(resolvido?.tipo).toBe('incorporado')
    expect(resolvido?.src).toContain(UID.toUpperCase())
  })

  it('trata arquivo de vídeo como reprodução nativa', () => {
    expect(resolverVideo('https://cdn.exemplo.com/aula.mp4')).toEqual({
      tipo: 'arquivo',
      src: 'https://cdn.exemplo.com/aula.mp4',
    })
    expect(resolverVideo('https://cdn.exemplo.com/aula.webm?v=2')?.tipo).toBe('arquivo')
  })

  it('passa adiante URL de incorporação de qualquer provedor', () => {
    expect(resolverVideo('https://player.vimeo.com/video/123')).toEqual({
      tipo: 'incorporado',
      src: 'https://player.vimeo.com/video/123',
    })
  })

  it('recusa esquema que não seja http ou https', () => {
    expect(resolverVideo('javascript:alert(1)')).toBeNull()
    expect(resolverVideo('data:text/html,<script>')).toBeNull()
    expect(resolverVideo('//exemplo.com/video')).toBeNull()
  })

  it('devolve nulo quando não há vídeo', () => {
    expect(resolverVideo(null)).toBeNull()
    expect(resolverVideo(undefined)).toBeNull()
    expect(resolverVideo('   ')).toBeNull()
  })
})
