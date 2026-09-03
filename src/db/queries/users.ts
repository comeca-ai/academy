import { and, eq } from 'drizzle-orm'

import { getDb } from '@/db/client'
import { memberships, organizations, users } from '@/db/schema'
import type { OrgRole, Organization, User } from '@/db/schema'
import { env } from '@/lib/env'

/**
 * O e-mail é a identidade da conta, então precisa ter uma única forma
 * canônica. Normalizamos na escrita e na leitura para que "Ana@Exemplo.com "
 * e "ana@exemplo.com" nunca virem duas contas.
 */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

const SLUG_PADRAO = 'academy'

/**
 * Garante que existe uma organização para pendurar as pessoas.
 *
 * O produto começa com uma única organização; o modelo já é multi-tenant para
 * não exigir migração dolorosa depois. O `onConflictDoNothing` cobre duas
 * requisições simultâneas de cadastro tentando criar a organização ao mesmo
 * tempo — a segunda não falha, apenas relê.
 */
export async function garantirOrganizacaoPadrao(): Promise<Organization> {
  const db = getDb()

  const existente = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, SLUG_PADRAO))
    .limit(1)

  if (existente[0]) return existente[0]

  await db
    .insert(organizations)
    .values({ slug: SLUG_PADRAO, name: 'Começa.ai Academy' })
    .onConflictDoNothing({ target: organizations.slug })

  const criada = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, SLUG_PADRAO))
    .limit(1)

  const org = criada[0]
  if (!org) {
    throw new Error('Não foi possível criar nem localizar a organização padrão.')
  }
  return org
}

export async function buscarUsuarioPorEmail(email: string): Promise<User | undefined> {
  const db = getDb()
  const encontrados = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizarEmail(email)))
    .limit(1)
  return encontrados[0]
}

export async function buscarUsuarioPorId(id: string): Promise<User | undefined> {
  const db = getDb()
  const encontrados = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return encontrados[0]
}

/**
 * Decide o papel de uma conta recém-criada.
 *
 * Quem tem o e-mail de `OWNER_EMAIL` entra como dono — é assim que a primeira
 * pessoa administradora nasce, sem script de instalação e sem senha padrão
 * embutida no código. Todo o resto entra como aluno e é promovido por alguém
 * que já tem permissão.
 */
export function papelInicialPara(email: string): OrgRole {
  const dono = env.OWNER_EMAIL
  if (dono && normalizarEmail(dono) === normalizarEmail(email)) return 'owner'
  return 'student'
}

export async function criarUsuario(dados: {
  email: string
  name: string
  passwordHash: string
}): Promise<User> {
  const db = getDb()
  const organizacao = await garantirOrganizacaoPadrao()
  const email = normalizarEmail(dados.email)

  const inseridos = await db
    .insert(users)
    .values({ email, name: dados.name.trim(), passwordHash: dados.passwordHash })
    .returning()

  const usuario = inseridos[0]
  if (!usuario) throw new Error('Falha ao criar a conta.')

  await db
    .insert(memberships)
    .values({
      userId: usuario.id,
      organizationId: organizacao.id,
      role: papelInicialPara(email),
    })
    .onConflictDoNothing()

  return usuario
}

export async function papelDoUsuario(
  userId: string,
  organizationId: string,
): Promise<OrgRole | undefined> {
  const db = getDb()
  const encontrados = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.organizationId, organizationId),
      ),
    )
    .limit(1)

  return encontrados[0]?.role
}
