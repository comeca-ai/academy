import { z } from 'zod'

/**
 * Validação das variáveis de ambiente do servidor.
 *
 * A regra aqui é degradação explícita, não silenciosa: `DATABASE_URL` e
 * `APP_SECRET` são obrigatórias para o sistema funcionar, mas o processo sobe
 * sem elas em desenvolvimento para que `next dev` continue utilizável antes do
 * banco existir. Quem consome o ambiente usa `requireDatabaseUrl()` e
 * `requireAppSecret()`, que falham no ponto de uso com uma mensagem útil.
 */

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  APP_SECRET: z.string().min(32, 'APP_SECRET precisa de ao menos 32 caracteres').optional(),
  APP_URL: z.string().url().default('http://localhost:3000'),
  OWNER_EMAIL: z.string().email().optional(),
  // Envio de e-mail transacional (recuperação de senha). As duas andam juntas:
  // a chave sem remetente verificado não envia nada, e vice-versa.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_REMETENTE: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const detalhes = parsed.error.issues
    .map((i) => `  ${i.path.join('.')}: ${i.message}`)
    .join('\n')
  throw new Error(`Variáveis de ambiente inválidas:\n${detalhes}`)
}

export const env = parsed.data

export const isProduction = env.NODE_ENV === 'production'

/**
 * Se há banco configurado.
 *
 * A aplicação sobe sem banco de propósito — serve para `next dev` antes de o
 * Postgres existir e para uma implantação de vitrine ainda sem infraestrutura.
 * As telas consultam isto e mostram um aviso claro em vez de estourar erro:
 * página que quebra não informa nada a quem abriu o link.
 */
export const bancoConfigurado = Boolean(env.DATABASE_URL)

export function requireDatabaseUrl(): string {
  if (!env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL não configurada. Copie .env.example para .env e aponte para um Postgres.',
    )
  }
  return env.DATABASE_URL
}

export function requireAppSecret(): string {
  if (!env.APP_SECRET) {
    throw new Error(
      'APP_SECRET não configurada. Gere uma com: openssl rand -base64 32',
    )
  }
  return env.APP_SECRET
}

/**
 * Se há como enviar e-mail transacional.
 *
 * As duas variáveis são exigidas juntas pelo mesmo motivo de
 * `DATABASE_URL`/`APP_SECRET`: metade da configuração não funciona, e falhar
 * cedo evita descobrir isso só quando alguém pedir para redefinir a senha.
 * Sem isto configurado, o link de redefinição vai para o console do servidor
 * em vez do e-mail da pessoa — dá para testar o fluxo, mas não usar de
 * verdade.
 */
export const emailConfigurado = Boolean(env.RESEND_API_KEY && env.EMAIL_REMETENTE)
