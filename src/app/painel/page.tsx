import type { Metadata } from 'next'
import Link from 'next/link'

import { sair } from '@/app/(auth)/actions'
import { Cabecalho } from '@/components/cabecalho'
import { CartaoDeCurso } from '@/components/cartao-de-curso'
import { buscarCurso, listarCursos } from '@/content'
import { matriculasDoUsuario } from '@/db/queries/enrollments'
import { exigirUsuario } from '@/lib/auth/current-user'
import { plural } from '@/lib/formato'
import { percentualConcluido, proximaAulaPendente } from '@/lib/progresso'

export const metadata: Metadata = { title: 'Painel' }

/**
 * Sempre renderizado por requisição.
 *
 * O conteúdo depende de quem está autenticado, e sem isto o Next pode
 * pré-renderizar a página quando a checagem de sessão termina cedo — por
 * exemplo numa instalação ainda sem banco. O resultado ficaria congelado no
 * build e erraria assim que o banco existisse.
 */
export const dynamic = 'force-dynamic'

type EmAndamento = {
  slug: string
  titulo: string
  feitas: number
  total: number
  proximaSlug: string | null
  proximaTitulo: string | null
}

export default async function PainelPage() {
  const usuario = await exigirUsuario('/painel')
  const matriculas = await matriculasDoUsuario(usuario.id)

  // Uma matrícula pode apontar para um curso que saiu do catálogo — o alvo é
  // conteúdo versionado, não linha com chave estrangeira. Nesse caso a
  // matrícula simplesmente não aparece, em vez de quebrar a página.
  const emAndamento: EmAndamento[] = matriculas.flatMap((matricula) => {
    const catalogo = buscarCurso(matricula.courseSlug)
    if (!catalogo) return []

    const sequencia = catalogo.curso.modulos.flatMap((m) => m.aulas)
    const feitas = new Set(matricula.concluidas)
    const proximaSlug = proximaAulaPendente(
      sequencia.map((a) => a.slug),
      feitas,
    )

    return [
      {
        slug: catalogo.curso.slug,
        titulo: catalogo.curso.titulo,
        feitas: sequencia.filter((a) => feitas.has(a.slug)).length,
        total: sequencia.length,
        proximaSlug,
        proximaTitulo: sequencia.find((a) => a.slug === proximaSlug)?.titulo ?? null,
      },
    ]
  })

  const iniciados = new Set(emAndamento.map((c) => c.slug))
  const naoIniciados = listarCursos().filter((curso) => !iniciados.has(curso.slug))

  return (
    <>
      <Cabecalho />

      <main id="conteudo" className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Olá, {usuario.name.split(' ')[0]}
        </h1>

        {emAndamento.length > 0 ? (
          <section aria-labelledby="em-andamento" className="mt-12">
            <h2
              id="em-andamento"
              className="text-xs font-semibold uppercase tracking-widest text-tinta-suave"
            >
              Continuar estudando
            </h2>

            <ul className="mt-5 flex list-none flex-col gap-4">
              {emAndamento.map((curso) => {
                const percentual = percentualConcluido(curso.feitas, curso.total)
                return (
                  <li
                    key={curso.slug}
                    className="rounded-xl border border-borda bg-superficie p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="text-xl font-semibold tracking-tight">
                        <Link
                          href={`/cursos/${curso.slug}`}
                          className="transition-colors hover:text-marca"
                        >
                          {curso.titulo}
                        </Link>
                      </h3>
                      <p className="font-mono text-xs text-marca">
                        {curso.feitas} de {curso.total} concluídas
                      </p>
                    </div>

                    <div
                      className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-superficie-alta"
                      role="progressbar"
                      aria-valuenow={percentual}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progresso em ${curso.titulo}`}
                    >
                      <div
                        className="h-full rounded-full bg-marca-fundo"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>

                    {curso.proximaSlug && curso.proximaTitulo ? (
                      <Link
                        href={`/cursos/${curso.slug}/${curso.proximaSlug}`}
                        className="mt-5 inline-block rounded-xl bg-marca-fundo px-5 py-2.5 font-semibold text-marca-tinta transition-colors hover:bg-marca-fundo-forte"
                      >
                        Continuar: {curso.proximaTitulo} →
                      </Link>
                    ) : (
                      <p className="mt-5 font-medium text-marca">
                        Curso concluído. Parabéns.
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ) : (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-tinta-media">
            Você ainda não começou nenhum curso. Abra uma aula e marque como
            concluída — o progresso fica salvo aqui.
          </p>
        )}

        {naoIniciados.length > 0 ? (
          <section aria-labelledby="explorar" className="mt-14">
            <h2
              id="explorar"
              className="text-xs font-semibold uppercase tracking-widest text-tinta-suave"
            >
              {emAndamento.length > 0 ? 'Outros cursos' : 'Comece por aqui'}
            </h2>
            <p className="mt-2 text-sm text-tinta-suave">
              {plural(naoIniciados.length, 'curso disponível', 'cursos disponíveis')}
            </p>
            <ul className="mt-5 grid list-none gap-5 sm:grid-cols-2">
              {naoIniciados.map((curso) => (
                <CartaoDeCurso key={curso.slug} curso={curso} />
              ))}
            </ul>
          </section>
        ) : null}

        <form action={sair} className="mt-16 border-t border-borda pt-8">
          <button
            type="submit"
            className="rounded-xl border border-borda-forte px-5 py-2.5 font-medium text-tinta-media transition-colors hover:border-marca hover:text-marca"
          >
            Sair
          </button>
        </form>
      </main>
    </>
  )
}
