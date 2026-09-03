import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * Modelo de dados da Academy.
 *
 * O catálogo NÃO está aqui: curso, módulo e aula são conteúdo, definidos em
 * `src/content` e versionados junto com o código. O banco guarda apenas o que
 * é gerado por pessoas usando a plataforma — identidade, sessão, matrícula e
 * progresso.
 *
 * Por isso matrícula e progresso referenciam o conteúdo por `slug`, e não por
 * chave estrangeira: o alvo vive no repositório, não em outra tabela. O preço
 * é que renomear um slug exige migrar as linhas que apontam para ele.
 */

// ── Identidade e organização ────────────────────────────────────────────────

/** Papéis dentro de uma organização, do mais forte para o mais fraco. */
export const orgRole = pgEnum('org_role', ['owner', 'admin', 'instructor', 'student'])

export const organizations = pgTable(
  'organizations',
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull(),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('organizations_slug_key').on(t.slug)],
)

export const users = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull(),
    name: text().notNull(),
    /** Hash argon2id. Nulo enquanto a conta só usa login por código de e-mail. */
    passwordHash: text(),
    emailVerifiedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  // O e-mail é guardado já normalizado em minúsculas pela camada de escrita,
  // então um índice único simples basta para impedir contas duplicadas.
  (t) => [uniqueIndex('users_email_key').on(t.email)],
)

export const memberships = pgTable(
  'memberships',
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: orgRole().notNull().default('student'),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.organizationId] }),
    index('memberships_organization_id_idx').on(t.organizationId),
  ],
)

/**
 * Sessões ficam no banco, e não apenas no cookie, para que "sair de todos os
 * aparelhos" seja possível e para que uma sessão comprometida possa ser
 * revogada sem trocar o segredo da aplicação inteira.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    revokedAt: timestamp({ withTimezone: true }),
    userAgent: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_user_id_idx').on(t.userId)],
)

/**
 * Token de redefinição de senha.
 *
 * Guarda o hash, nunca o token em si: o link sai por e-mail, um canal mais
 * exposto que o cookie de sessão (inbox, provedor, encaminhamento, log de
 * servidor de e-mail), e uma cópia deste banco não deve bastar para redefinir
 * a senha de ninguém.
 */
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    /** Nulo enquanto não usado. Um token só redefine uma senha, uma vez. */
    usedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('password_reset_tokens_token_hash_key').on(t.tokenHash),
    index('password_reset_tokens_user_id_idx').on(t.userId),
  ],
)

// ── Matrícula e progresso ───────────────────────────────────────────────────

export const enrollmentStatus = pgEnum('enrollment_status', [
  'active',
  'completed',
  'cancelled',
])

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Slug do curso em `src/content`. */
    courseSlug: text().notNull(),
    status: enrollmentStatus().notNull().default('active'),
    enrolledAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    // Uma matrícula por pessoa e curso. Rematrícula reaproveita a linha
    // existente em vez de criar histórico paralelo.
    uniqueIndex('enrollments_user_id_course_slug_key').on(t.userId, t.courseSlug),
  ],
)

export const progressStatus = pgEnum('progress_status', [
  'not_started',
  'in_progress',
  'completed',
])

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid().primaryKey().defaultRandom(),
    enrollmentId: uuid()
      .notNull()
      .references(() => enrollments.id, { onDelete: 'cascade' }),
    /** Slug da aula dentro do curso da matrícula. */
    lessonSlug: text().notNull(),
    status: progressStatus().notNull().default('not_started'),
    /** Maior posição alcançada no vídeo, em segundos. Permite retomar de onde parou. */
    secondsWatched: integer().notNull().default(0),
    completedAt: timestamp({ withTimezone: true }),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('lesson_progress_enrollment_id_lesson_slug_key').on(
      t.enrollmentId,
      t.lessonSlug,
    ),
  ],
)

// ── Tipos inferidos ─────────────────────────────────────────────────────────

export type Organization = typeof organizations.$inferSelect
export type User = typeof users.$inferSelect
export type Membership = typeof memberships.$inferSelect
export type Session = typeof sessions.$inferSelect
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect
export type Enrollment = typeof enrollments.$inferSelect
export type LessonProgress = typeof lessonProgress.$inferSelect

export type OrgRole = (typeof orgRole.enumValues)[number]
