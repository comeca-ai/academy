import { and, eq, gt, isNull } from 'drizzle-orm'

import { getDb } from '@/db/client'
import { sessions, users } from '@/db/schema'
import type { Session, User } from '@/db/schema'
import { calcularExpiracao } from '@/lib/auth/session'

export async function criarSessao(
  userId: string,
  userAgent?: string | null,
): Promise<Session> {
  const db = getDb()
  const criadas = await db
    .insert(sessions)
    .values({
      userId,
      expiresAt: calcularExpiracao(),
      // Guardado só para a pessoa reconhecer os próprios aparelhos ao revisar
      // as sessões ativas. Truncado porque alguns agentes são enormes.
      userAgent: userAgent?.slice(0, 400) ?? null,
    })
    .returning()

  const sessao = criadas[0]
  if (!sessao) throw new Error('Falha ao criar a sessão.')
  return sessao
}

/**
 * Busca a sessão junto com o dono dela, aplicando as três condições que
 * definem uma sessão utilizável: existe, não foi revogada e ainda não expirou.
 *
 * A validade é conferida no banco, e não no token, para que revogar tenha
 * efeito imediato — é isso que faz "sair de todos os aparelhos" funcionar.
 */
export async function buscarSessaoValida(
  sessionId: string,
): Promise<{ session: Session; user: User } | undefined> {
  const db = getDb()
  const encontrados = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.id, sessionId),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1)

  return encontrados[0]
}

export async function revogarSessao(sessionId: string): Promise<void> {
  const db = getDb()
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)))
}

/** Revoga tudo que estiver ativo para a pessoa: o "sair de todos os aparelhos". */
export async function revogarSessoesDoUsuario(userId: string): Promise<void> {
  const db = getDb()
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
}
