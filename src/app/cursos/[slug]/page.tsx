import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Cabecalho } from '@/components/cabecalho'
import { buscarCurso, todosOsCursos } from '@/content'
import { duracaoHumana, plural } from '@/lib/formato'

type Props = { params: Promise<{ slug: string }> }

/** O catálogo é conhecido no build, então todas as páginas de curso saem prontas. */
export function generateStaticParams() {
  return todosOsCursos()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dados = buscarCurso((await params).slug)
  if (!dados) return { title: 'Curso não encontrado' }
  return { title: dados.curso.titulo, description: dados.curso.resumo }
}

export default async function CursoPage({ params }: Props) {
  const dados = buscarCurso((await params).slug)
  if (!dados) notFound()

  const { curso, totalDeAulas, duracaoEmMinutos } = dados

  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="mx-auto max-w-5xl px-6 py-12">
        <Link href="/cursos" className="text-sm font-medium text-tinta-suave hover:text-tinta">
          ← Todos os cursos
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
          {curso.titulo}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-tinta-media text-pretty">
          {curso.resumo}
        </p>

        <p className="mt-4 text-sm text-tinta-suave">
          {plural(curso.modulos.length, 'módulo', 'módulos')} ·{' '}
          {plural(totalDeAulas, 'aula', 'aulas')}
          {duracaoEmMinutos > 0 ? ` · ${duracaoHumana(duracaoEmMinutos * 60)}` : ''}
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_260px]">
          <section aria-labelledby="conteudo-do-curso">
            <h2 id="conteudo-do-curso" className="text-xl font-semibold tracking-tight">
              Conteúdo do curso
            </h2>

            <ol className="mt-4 flex list-none flex-col gap-4">
              {curso.modulos.map((modulo, indice) => (
                <li
                  key={modulo.titulo}
                  className="rounded-lg border border-borda bg-papel-fundo p-5"
                >
                  <h3 className="font-semibold">
                    <span className="text-tinta-suave">{indice + 1}.</span>{' '}
                    {modulo.titulo}
                  </h3>
                  <ul className="mt-3 flex list-none flex-col gap-1 text-sm">
                    {modulo.aulas.map((aula) => (
                      <li key={aula.slug} className="border-t border-borda first:border-0">
                        <Link
                          href={`/cursos/${curso.slug}/${aula.slug}`}
                          className="flex justify-between gap-4 py-2 hover:text-marca"
                        >
                          <span>{aula.titulo}</span>
                          {aula.duracaoEmMinutos > 0 ? (
                            <span className="shrink-0 text-tinta-suave">
                              {duracaoHumana(aula.duracaoEmMinutos * 60)}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <aside className="lg:pt-1">
            <div className="rounded-lg border border-borda p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-tinta-suave">
                Quem ensina
              </h2>
              <p className="mt-2 font-medium">{curso.instrutor.nome}</p>
              <p className="mt-2 text-sm text-tinta-media">{curso.instrutor.bio}</p>
            </div>
          </aside>
        </div>

        <section aria-labelledby="sobre" className="mt-12 max-w-2xl">
          <h2 id="sobre" className="text-xl font-semibold tracking-tight">
            Sobre o curso
          </h2>
          <p className="mt-3 whitespace-pre-line text-tinta-media">{curso.descricao}</p>
        </section>
      </main>
    </>
  )
}
