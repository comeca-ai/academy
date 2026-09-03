import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { buscarSessaoValida } from '@/db/queries/sessions'
import type { Session, User } from '@/db/schema'

import { NOME_DO_COOKIE, lerToken } from './session'

export type SessaoAtual = { session: Session; user: User }

/**
 * Quem está pedindo esta requisição, ou `null`.
 *
 * Envolvido em `cache` para que várias chamadas dentro da mesma requisição —
 * o layout, a página e um componente aninhado, por exemplo — compartilhem uma
 * única ida ao banco.
 *
 * Um cookie inválido é tratado como ausência de sessão, nunca como erro: token
 * adulterado, expirado ou de sessão revogada levam todos ao mesmo lugar, que é
 * não estar autenticado.
 */
export const sessaoAtual = cache(async (): Promise<SessaoAtual | null> => {
  const token = (await cookies()).get(NOME_DO_COOKIE)?.value
  if (!token) return null

  const sessionId = await lerToken(token)
  if (!sessionId) return null

  return (await buscarSessaoValida(sessionId)) ?? null
})

export async function usuarioAtual(): Promise<User | null> {
  return (await sessaoAtual())?.user ?? null
}

/**
 * Exige autenticação numa rota. Redireciona para o login guardando o destino,
 * para a pessoa voltar ao que estava tentando abrir depois de entrar.
 */
export async function exigirUsuario(destino?: string): Promise<User> {
  const usuario = await usuarioAtual()
  if (usuario) return usuario

  const query = destino ? `?destino=${encodeURIComponent(destino)}` : ''
  redirect(`/entrar${query}`)
}
