import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Cabecalho } from '@/components/cabecalho'
import { MateriaisDaAula } from '@/components/materiais-da-aula'
import { PlayerDeVideo } from '@/components/player-de-video'
import { buscarAula, todosOsCaminhos } from '@/content'
import { duracaoHumana } from '@/lib/formato'

type Props = { params: Promise<{ slug: string; aula: string }> }

/** Todas as aulas são conhecidas no build e saem como páginas prontas. */
export function generateStaticParams() {
  return todosOsCaminhos()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, aula } = await params
  const dados = buscarAula(slug, aula)
  if (!dados) return { title: 'Aula não encontrada' }
  return {
    title: `${dados.aula.titulo} · ${dados.curso.titulo}`,
    description: dados.aula.resumo,
  }
}

export default async function AulaPage({ params }: Props) {
  const { slug, aula: aulaSlug } = await params
  const dados = buscarAula(slug, aulaSlug)
  if (!dados) notFound()

  const { curso, modulo, aula, indice, total, anterior, proxima } = dados

  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="mx-auto max-w-3xl px-6 py-10">
        <nav aria-label="Trilha de navegação" className="text-sm text-tinta-suave">
          <Link href={`/cursos/${curso.slug}`} className="hover:text-tinta">
            {curso.titulo}
          </Link>
          <span aria-hidden="true"> · </span>
          <span>{modulo.titulo}</span>
        </nav>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance">
          {aula.titulo}
        </h1>

        <p className="mt-2 text-sm text-tinta-suave">
          Aula {indice} de {total}
          {aula.duracaoEmMinutos > 0
            ? ` · ${duracaoHumana(aula.duracaoEmMinutos * 60)}`
            : ''}
        </p>

        {/* Barra de posição na sequência. Decorativa: a linha acima já diz o
            mesmo para quem usa leitor de tela. */}
        <div
          aria-hidden="true"
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-papel-fundo"
        >
          <div
            className="h-full rounded-full bg-marca"
            style={{ width: `${(indice / total) * 100}%` }}
          />
        </div>

        <div className="mt-8">
          <PlayerDeVideo partes={aula.partes} titulo={aula.titulo} />
        </div>

        <p className="mt-8 text-lg text-tinta-media text-pretty">{aula.resumo}</p>

        <MateriaisDaAula materiais={aula.materiais} />

        <nav
          aria-label="Navegação entre aulas"
          className="mt-12 flex flex-wrap justify-between gap-3 border-t border-borda pt-6"
        >
          {anterior ? (
            <Link
              href={`/cursos/${curso.slug}/${anterior.slug}`}
              className="rounded-md border border-borda px-4 py-2.5 font-medium hover:bg-papel-fundo"
            >
              ← {anterior.titulo}
            </Link>
          ) : (
            <span />
          )}

          {proxima ? (
            <Link
              href={`/cursos/${curso.slug}/${proxima.slug}`}
              className="rounded-md bg-marca px-4 py-2.5 font-medium text-papel hover:bg-marca-forte"
            >
              {proxima.titulo} →
            </Link>
          ) : (
            <Link
              href={`/cursos/${curso.slug}`}
              className="rounded-md border border-borda px-4 py-2.5 font-medium hover:bg-papel-fundo"
            >
              Voltar ao curso
            </Link>
          )}
        </nav>
      </main>
    </>
  )
}
