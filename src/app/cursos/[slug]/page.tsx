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
  const primeira = curso.modulos[0]?.aulas[0]

  let contador = 0

  return (
    <>
      <Cabecalho />

      <section className="grade border-b border-borda">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-14">
          <Link
            href="/cursos"
            className="text-sm font-medium text-tinta-suave transition-colors hover:text-marca"
          >
            ← Todos os cursos
          </Link>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">
            {curso.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-tinta-media text-pretty">
            {curso.resumo}
          </p>

          <p className="mt-5 text-sm text-tinta-suave">
            {plural(curso.modulos.length, 'módulo', 'módulos')} ·{' '}
            {plural(totalDeAulas, 'aula', 'aulas')}
            {duracaoEmMinutos > 0 ? ` · ${duracaoHumana(duracaoEmMinutos * 60)}` : ''}
          </p>

          {primeira ? (
            <Link
              href={`/cursos/${curso.slug}/${primeira.slug}`}
              className="mt-7 inline-block rounded-md bg-marca px-6 py-3 font-semibold text-fundo transition-colors hover:bg-marca-forte"
            >
              Começar pela primeira aula
            </Link>
          ) : null}
        </div>
      </section>

      <main id="conteudo" className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
          <section aria-labelledby="conteudo-do-curso">
            <h2
              id="conteudo-do-curso"
              className="text-xs font-semibold uppercase tracking-widest text-tinta-suave"
            >
              Conteúdo do curso
            </h2>

            <ol className="mt-6 flex list-none flex-col gap-6">
              {curso.modulos.map((modulo, indice) => (
                <li key={modulo.titulo}>
                  <h3 className="flex items-baseline gap-2.5 text-lg font-semibold tracking-tight">
                    <span className="text-sm font-mono text-marca">
                      {String(indice + 1).padStart(2, '0')}
                    </span>
                    {modulo.titulo}
                  </h3>

                  <ul className="mt-3 flex list-none flex-col overflow-hidden rounded-xl border border-borda">
                    {modulo.aulas.map((aula) => {
                      contador += 1
                      return (
                        <li key={aula.slug} className="border-b border-borda last:border-0">
                          <Link
                            href={`/cursos/${curso.slug}/${aula.slug}`}
                            className="flex items-center justify-between gap-4 bg-superficie px-5 py-4 transition-colors hover:bg-superficie-alta"
                          >
                            <span className="flex items-center gap-3.5">
                              <span className="font-mono text-sm text-tinta-suave">
                                {String(contador).padStart(2, '0')}
                              </span>
                              <span className="font-medium">{aula.titulo}</span>
                            </span>
                            {aula.duracaoEmMinutos > 0 ? (
                              <span className="shrink-0 text-sm text-tinta-suave">
                                {duracaoHumana(aula.duracaoEmMinutos * 60)}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <aside>
            <div className="rounded-xl border border-borda bg-superficie p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-marca">
                Quem ensina
              </h2>
              <p className="mt-3 font-semibold">{curso.instrutor.nome}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-tinta-suave">
                {curso.instrutor.bio}
              </p>
            </div>
          </aside>
        </div>

        <section aria-labelledby="sobre" className="mt-16 max-w-2xl">
          <h2
            id="sobre"
            className="text-xs font-semibold uppercase tracking-widest text-tinta-suave"
          >
            Sobre o curso
          </h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-tinta-media">
            {curso.descricao}
          </p>
        </section>
      </main>
    </>
  )
}
