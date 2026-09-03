import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Cabecalho } from '@/components/cabecalho'
import { ConclusaoDaAula } from '@/components/conclusao-da-aula'
import { MateriaisDaAula } from '@/components/materiais-da-aula'
import { PlayerDeVideo } from '@/components/player-de-video'
import { buscarAula } from '@/content'
import { exigirUsuario } from '@/lib/auth/current-user'
import { duracaoHumana } from '@/lib/formato'

type Props = { params: Promise<{ slug: string; aula: string }> }

/**
 * Dinâmica de propósito: assistir a aula exige conta, e essa checagem roda
 * por requisição — o mesmo motivo que tira a página do curso do pré-render.
 */
export const dynamic = 'force-dynamic'

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

  await exigirUsuario(`/cursos/${slug}/${aulaSlug}`)

  const { curso, modulo, aula, indice, total, anterior, proxima } = dados

  return (
    <>
      <Cabecalho />

      <main id="conteudo" className="mx-auto max-w-4xl px-6 py-12">
        <nav aria-label="Trilha de navegação" className="text-sm text-tinta-suave">
          <Link
            href={`/cursos/${curso.slug}`}
            className="transition-colors hover:text-marca"
          >
            {curso.titulo}
          </Link>
          <span aria-hidden="true" className="px-2 text-borda-forte">
            /
          </span>
          <span>{modulo.titulo}</span>
        </nav>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-balance">
            {aula.titulo}
          </h1>
          <p className="font-mono text-sm text-tinta-suave">
            {String(indice).padStart(2, '0')} / {String(total).padStart(2, '0')}
            {aula.duracaoEmMinutos > 0
              ? ` · ${duracaoHumana(aula.duracaoEmMinutos * 60)}`
              : ''}
          </p>
        </div>

        {/* Barra de posição na sequência. Decorativa: a linha acima já diz o
            mesmo para quem usa leitor de tela. */}
        <div
          aria-hidden="true"
          className="mt-4 h-1 w-full overflow-hidden rounded-full bg-superficie-alta"
        >
          <div
            className="h-full rounded-full bg-marca-fundo"
            style={{ width: `${(indice / total) * 100}%` }}
          />
        </div>

        {aula.provisoria ? (
          <p
            role="status"
            className="mt-6 rounded-lg border border-borda-forte bg-superficie px-4 py-3 text-sm text-tinta-suave"
          >
            O vídeo desta aula já está no ar. O título e a descrição ainda
            aguardam confirmação de quem produziu o curso.
          </p>
        ) : null}

        <div className="mt-9">
          <PlayerDeVideo partes={aula.partes} titulo={aula.titulo} />
        </div>

        {aula.resumo ? (
          <p className="mt-9 text-lg leading-relaxed text-tinta-media text-pretty">
            {aula.resumo}
          </p>
        ) : null}

        <MateriaisDaAula materiais={aula.materiais} />

        <ConclusaoDaAula
          curso={curso.slug}
          aula={aula.slug}
          destino={`/cursos/${curso.slug}/${aula.slug}`}
        />

        <nav
          aria-label="Navegação entre aulas"
          className="mt-14 flex flex-wrap justify-between gap-3 border-t border-borda pt-8"
        >
          {anterior ? (
            <Link
              href={`/cursos/${curso.slug}/${anterior.slug}`}
              className="rounded-xl border border-borda-forte px-5 py-3 font-medium text-tinta-media transition-colors hover:border-marca hover:text-marca"
            >
              ← {anterior.titulo}
            </Link>
          ) : (
            <span />
          )}

          {proxima ? (
            <Link
              href={`/cursos/${curso.slug}/${proxima.slug}`}
              className="rounded-xl bg-marca-fundo px-5 py-3 font-semibold text-tinta transition-colors hover:bg-marca-fundo-forte"
            >
              {proxima.titulo} →
            </Link>
          ) : (
            <Link
              href={`/cursos/${curso.slug}`}
              className="rounded-xl border border-borda-forte px-5 py-3 font-medium text-tinta-media transition-colors hover:border-marca hover:text-marca"
            >
              Voltar ao curso
            </Link>
          )}
        </nav>
      </main>
    </>
  )
}
