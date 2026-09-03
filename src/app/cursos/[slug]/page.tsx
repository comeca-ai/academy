import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Cabecalho } from '@/components/cabecalho'
import { ConteudoDoCurso } from '@/components/conteudo-do-curso'
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

  return (
    <>
      <Cabecalho />

      <section className="halo border-b border-borda">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-14">
          <Link
            href="/cursos"
            className="text-sm font-medium text-tinta-suave transition-colors hover:text-marca"
          >
            ← Todos os cursos
          </Link>

          <h1 className="font-display mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl">
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
              className="mt-7 inline-block rounded-xl bg-marca-fundo px-6 py-3 font-semibold text-tinta transition-colors hover:bg-marca-fundo-forte"
            >
              Começar pela primeira aula
            </Link>
          ) : null}
        </div>
      </section>

      <main id="conteudo" className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
          <ConteudoDoCurso
            curso={curso.slug}
            modulos={curso.modulos.map((modulo) => ({
              titulo: modulo.titulo,
              aulas: modulo.aulas.map((aula) => ({
                slug: aula.slug,
                titulo: aula.titulo,
                duracaoEmMinutos: aula.duracaoEmMinutos,
                provisoria: aula.provisoria ?? false,
              })),
            }))}
          />

          <aside>
            <div className="rounded-xl border border-borda bg-superficie p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-marca">
                Quem ensina
              </h2>
              <p className="mt-3 font-semibold">{curso.instrutor.nome}</p>
              <p className="mt-1 text-sm text-marca">{curso.instrutor.titulo}</p>
              <p className="mt-3 text-sm leading-relaxed text-tinta-suave">
                {curso.instrutor.resumo}
              </p>
              <Link
                href="/instrutor"
                className="mt-4 inline-block text-sm font-semibold text-tinta-media transition-colors hover:text-marca"
              >
                Trajetória completa →
              </Link>
            </div>
          </aside>
        </div>

        {curso.materiais.length > 0 ? (
          <section aria-labelledby="material-do-curso" className="mt-16 max-w-2xl">
            <h2
              id="material-do-curso"
              className="text-xs font-semibold uppercase tracking-widest text-tinta-suave"
            >
              Material do curso
            </h2>
            <ul className="mt-4 flex list-none flex-col gap-2.5">
              {curso.materiais.map((material) => (
                <li key={material.url}>
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-xl border border-borda bg-superficie px-5 py-4 transition-colors hover:border-marca"
                  >
                    <span className="font-medium">{material.titulo}</span>
                    <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-marca">
                      abrir ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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
