import { and, eq, gt, isNull } from 'drizzle-orm'

import { getDb } from '@/db/client'
import { passwordResetTokens } from '@/db/schema'
import {
  DURACAO_DO_TOKEN_EM_MINUTOS,
  gerarTokenDeRedefinicao,
  hashDoToken,
} from '@/lib/auth/reset-token'

export async function criarTokenDeRedefinicao(
  userId: string,
): Promise<{ token: string; expiraEm: Date }> {
  const db = getDb()
  const { token, hash } = gerarTokenDeRedefinicao()
  const expiraEm = new Date(Date.now() + DURACAO_DO_TOKEN_EM_MINUTOS * 60 * 1000)

  await db
    .insert(passwordResetTokens)
    .values({ userId, tokenHash: hash, expiresAt: expiraEm })

  return { token, expiraEm }
}

/**
 * Consome um token de redefinição: se existir, ainda não tiver sido usado e
 * ainda não tiver expirado, marca como usado e devolve o dono.
 *
 * As três condições vivem no WHERE do próprio UPDATE, o que torna o consumo
 * atômico. Duas requisições simultâneas com o mesmo token não passam as
 * duas: o Postgres serializa a segunda atrás do lock de linha da primeira, e
 * quando ela roda, `usedAt` já não é mais nulo — zero linhas afetadas.
 */
export async function consumirTokenDeRedefinicao(
  token: string,
): Promise<string | undefined> {
  const db = getDb()
  const hash = hashDoToken(token)

  const linhas = await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .returning({ userId: passwordResetTokens.userId })

  return linhas[0]?.userId
}
