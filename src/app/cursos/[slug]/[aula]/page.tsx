import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Cabecalho } from '@/components/cabecalho'
import { MateriaisDaAula } from '@/components/materiais-da-aula'
import { PlayerDeVideo } from '@/components/player-de-video'
import { buscarAulaPublicada } from '@/db/queries/courses'
import { bancoConfigurado } from '@/lib/env'
import { duracaoHumana } from '@/lib/formato'

type Props = { params: Promise<{ slug: string; aula: string }> }

async function carregar(params: Props['params']) {
  if (!bancoConfigurado) return null
  const { slug, aula } = await params
  return buscarAulaPublicada(slug, aula)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dados = await carregar(params)
  if (!dados) return { title: 'Aula não encontrada' }
  return { title: `${dados.lesson.title} · ${dados.course.title}` }
}

export default async function AulaPage({ params }: Props) {
  const dados = await carregar(params)
  if (!dados) notFound()

  const { course, module, lesson, materials, indice, total, anterior, proxima } = dados

  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="mx-auto max-w-3xl px-6 py-10">
        <nav aria-label="Trilha de navegação" className="text-sm text-tinta-suave">
          <Link href={`/cursos/${course.slug}`} className="hover:text-tinta">
            {course.title}
          </Link>
          <span aria-hidden="true"> · </span>
          <span>{module.title}</span>
        </nav>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance">
          {lesson.title}
        </h1>

        <p className="mt-2 text-sm text-tinta-suave">
          Aula {indice} de {total}
          {lesson.durationSeconds > 0
            ? ` · ${duracaoHumana(lesson.durationSeconds)}`
            : ''}
        </p>

        {/* Barra de posição na sequência. É decorativa: o texto acima já diz
            a mesma coisa para quem usa leitor de tela. */}
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
          <PlayerDeVideo videoUrl={lesson.videoUrl} titulo={lesson.title} />
        </div>

        {lesson.content ? (
          <div className="mt-8 whitespace-pre-line text-lg text-tinta-media text-pretty">
            {lesson.content}
          </div>
        ) : null}

        <MateriaisDaAula materiais={materials} />

        <nav
          aria-label="Navegação entre aulas"
          className="mt-12 flex flex-wrap justify-between gap-3 border-t border-borda pt-6"
        >
          {anterior ? (
            <Link
              href={`/cursos/${course.slug}/${anterior.slug}`}
              className="rounded-md border border-borda px-4 py-2.5 font-medium hover:bg-papel-fundo"
            >
              ← {anterior.title}
            </Link>
          ) : (
            <span />
          )}

          {proxima ? (
            <Link
              href={`/cursos/${course.slug}/${proxima.slug}`}
              className="rounded-md bg-marca px-4 py-2.5 font-medium text-papel hover:bg-marca-forte"
            >
              {proxima.title} →
            </Link>
          ) : (
            <Link
              href={`/cursos/${course.slug}`}
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
