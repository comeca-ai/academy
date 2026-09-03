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
