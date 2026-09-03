import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Cabecalho } from '@/components/cabecalho'
import { buscarCursoPublicado } from '@/db/queries/courses'
import { usuarioAtual } from '@/lib/auth/current-user'
import { bancoConfigurado } from '@/lib/env'
import { duracaoHumana, plural } from '@/lib/formato'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const curso = bancoConfigurado
    ? await buscarCursoPublicado((await params).slug)
    : null
  if (!curso) return { title: 'Curso não encontrado' }

  return {
    title: curso.course.title,
    description: curso.course.summary || undefined,
  }
}

export default async function CursoPage({ params }: Props) {
  const curso = bancoConfigurado
    ? await buscarCursoPublicado((await params).slug)
    : null
  if (!curso) notFound()

  const { course, modules, totalDeAulas, duracaoEmSegundos } = curso
  const usuario = await usuarioAtual()

  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/cursos" className="text-sm font-medium text-tinta-suave hover:text-tinta">
          ← Todos os cursos
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
          {course.title}
        </h1>
        {course.summary ? (
          <p className="mt-3 max-w-2xl text-lg text-tinta-media text-pretty">
            {course.summary}
          </p>
        ) : null}

        <p className="mt-4 text-sm text-tinta-suave">
          {plural(modules.length, 'módulo', 'módulos')} ·{' '}
          {plural(totalDeAulas, 'aula', 'aulas')}
          {duracaoEmSegundos > 0 ? ` · ${duracaoHumana(duracaoEmSegundos)}` : ''}
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_260px]">
          <section aria-labelledby="conteudo-do-curso">
            <h2 id="conteudo-do-curso" className="text-xl font-semibold tracking-tight">
              Conteúdo do curso
            </h2>

            {modules.length === 0 ? (
              <p className="mt-4 text-tinta-media">
                O conteúdo deste curso ainda está sendo preparado.
              </p>
            ) : (
              <ol className="mt-4 flex list-none flex-col gap-4">
                {modules.map((modulo, indice) => (
                  <li
                    key={modulo.module.id}
                    className="rounded-lg border border-borda bg-papel-fundo p-5"
                  >
                    <h3 className="font-semibold">
                      <span className="text-tinta-suave">{indice + 1}.</span>{' '}
                      {modulo.module.title}
                    </h3>
                    {modulo.lessons.length === 0 ? (
                      <p className="mt-2 text-sm text-tinta-suave">Em breve.</p>
                    ) : (
                      <ul className="mt-3 flex list-none flex-col gap-2 text-sm">
                        {modulo.lessons.map((aula) => (
                          <li
                            key={aula.id}
                            className="flex justify-between gap-4 border-t border-borda pt-2 first:border-0 first:pt-0"
                          >
                            <span>{aula.title}</span>
                            {aula.durationSeconds > 0 ? (
                              <span className="shrink-0 text-tinta-suave">
                                {duracaoHumana(aula.durationSeconds)}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <aside className="lg:pt-1">
            <div className="rounded-lg border border-borda p-5">
              <p className="text-sm text-tinta-media">
                {usuario
                  ? 'A matrícula entra na próxima fatia do produto.'
                  : 'Crie sua conta para acompanhar seu progresso neste curso.'}
              </p>
              <Link
                href={usuario ? '/painel' : `/cadastro?destino=/cursos/${course.slug}`}
                className="mt-4 block rounded-md bg-marca px-4 py-2.5 text-center font-medium text-papel hover:bg-marca-forte"
              >
                {usuario ? 'Ir para o painel' : 'Criar conta'}
              </Link>
            </div>
          </aside>
        </div>

        {course.description ? (
          <section aria-labelledby="sobre" className="mt-12 max-w-2xl">
            <h2 id="sobre" className="text-xl font-semibold tracking-tight">
              Sobre o curso
            </h2>
            <p className="mt-3 whitespace-pre-line text-tinta-media">
              {course.description}
            </p>
          </section>
        ) : null}
      </main>
    </>
  )
}
