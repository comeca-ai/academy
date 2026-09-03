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
 * Modelo de domínio da Academy.
 *
 * Três blocos: identidade e organização, catálogo de conteúdo, e matrícula
 * com progresso. O catálogo é hierárquico (curso > módulo > aula) e o
 * progresso é registrado por aula dentro de uma matrícula — nunca por
 * usuário solto, para que o histórico continue coerente se a pessoa se
 * matricular de novo no mesmo curso.
 */

// ── Identidade e organização ────────────────────────────────────────────────

/**
 * Papéis dentro de uma organização, do mais forte para o mais fraco.
 * `owner` é único por organização e não pode ser removido por outro membro.
 */
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

// ── Catálogo ────────────────────────────────────────────────────────────────

export const publishStatus = pgEnum('publish_status', ['draft', 'published', 'archived'])

export const lessonKind = pgEnum('lesson_kind', ['video', 'text'])

export const courses = pgTable(
  'courses',
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    slug: text().notNull(),
    title: text().notNull(),
    /** Uma linha de resumo, usada em cartões de listagem e em metadados. */
    summary: text().notNull().default(''),
    description: text().notNull().default(''),
    coverUrl: text(),
    status: publishStatus().notNull().default('draft'),
    publishedAt: timestamp({ withTimezone: true }),
    createdBy: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // O slug é único dentro da organização, não globalmente: duas escolas
    // podem ter um curso "introducao-a-ia".
    uniqueIndex('courses_organization_id_slug_key').on(t.organizationId, t.slug),
    index('courses_organization_id_status_idx').on(t.organizationId, t.status),
  ],
)

export const modules = pgTable(
  'modules',
  {
    id: uuid().primaryKey().defaultRandom(),
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    /** Ordem de exibição dentro do curso, começando em 1. */
    position: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('modules_course_id_position_key').on(t.courseId, t.position)],
)

export const lessons = pgTable(
  'lessons',
  {
    id: uuid().primaryKey().defaultRandom(),
    moduleId: uuid()
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    slug: text().notNull(),
    title: text().notNull(),
    kind: lessonKind().notNull().default('video'),
    /** Corpo em texto rico. Para aulas de vídeo, funciona como transcrição ou apoio. */
    content: text().notNull().default(''),
    videoUrl: text(),
    /** Duração em segundos, usada para estimar o tempo do curso. */
    durationSeconds: integer().notNull().default(0),
    position: integer().notNull(),
    status: publishStatus().notNull().default('draft'),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('lessons_module_id_position_key').on(t.moduleId, t.position),
    uniqueIndex('lessons_module_id_slug_key').on(t.moduleId, t.slug),
  ],
)

export const materialKind = pgEnum('material_kind', ['slides', 'pdf', 'link', 'arquivo'])

/**
 * Material de apoio de uma aula: slides, PDF, planilha, link externo.
 *
 * A URL aponta para onde o arquivo já vive (armazenamento de objetos, CDN),
 * porque a plataforma serve conteúdo, não hospeda arquivo. Isso mantém o banco
 * pequeno e deixa a entrega com quem faz isso bem.
 */
export const lessonMaterials = pgTable(
  'lesson_materials',
  {
    id: uuid().primaryKey().defaultRandom(),
    lessonId: uuid()
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    kind: materialKind().notNull().default('pdf'),
    url: text().notNull(),
    position: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('lesson_materials_lesson_id_position_key').on(t.lessonId, t.position)],
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
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: enrollmentStatus().notNull().default('active'),
    enrolledAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    // Uma matrícula ativa por pessoa e curso. Rematrícula reaproveita a linha
    // existente em vez de criar histórico paralelo.
    uniqueIndex('enrollments_course_id_user_id_key').on(t.courseId, t.userId),
    index('enrollments_user_id_idx').on(t.userId),
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
    lessonId: uuid()
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    status: progressStatus().notNull().default('not_started'),
    /** Maior posição alcançada no vídeo, em segundos. Permite retomar de onde parou. */
    secondsWatched: integer().notNull().default(0),
    completedAt: timestamp({ withTimezone: true }),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('lesson_progress_enrollment_id_lesson_id_key').on(
      t.enrollmentId,
      t.lessonId,
    ),
  ],
)

// ── Tipos inferidos ─────────────────────────────────────────────────────────

export type Organization = typeof organizations.$inferSelect
export type User = typeof users.$inferSelect
export type Membership = typeof memberships.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Course = typeof courses.$inferSelect
export type Module = typeof modules.$inferSelect
export type Lesson = typeof lessons.$inferSelect
export type LessonMaterial = typeof lessonMaterials.$inferSelect
export type Enrollment = typeof enrollments.$inferSelect
export type LessonProgress = typeof lessonProgress.$inferSelect

export type OrgRole = (typeof orgRole.enumValues)[number]
