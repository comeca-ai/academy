import Link from 'next/link'

import { Cabecalho } from '@/components/cabecalho'
import { CartaoDeCurso } from '@/components/cartao-de-curso'
import { listarCursos } from '@/content'

export default function Home() {
  const cursos = listarCursos()
  const destaque = cursos[0]

  return (
    <>
      <Cabecalho />

      <main id="conteudo">
        <section className="mx-auto max-w-3xl px-6 pb-4 pt-20">
          <p className="text-sm font-medium uppercase tracking-wide text-tinta-suave">
            Começa.ai Academy
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Inteligência artificial explicada do começo
          </h1>
          <p className="mt-5 text-lg text-tinta-media text-pretty">
            Sem pré-requisito técnico e sem promessa fácil. Você vai entender o
            que a tecnologia realmente faz, onde ela erra, e como usar isso no
            seu trabalho.
          </p>

          {destaque ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/cursos/${destaque.slug}`}
                className="rounded-md bg-marca px-5 py-3 font-medium text-papel hover:bg-marca-forte"
              >
                Começar por {destaque.titulo}
              </Link>
              <Link
                href="/cursos"
                className="rounded-md border border-borda px-5 py-3 font-medium hover:bg-papel-fundo"
              >
                Ver todos os cursos
              </Link>
            </div>
          ) : null}
        </section>

        {cursos.length > 0 ? (
          <section
            aria-labelledby="catalogo"
            className="mx-auto max-w-5xl px-6 py-16"
          >
            <h2 id="catalogo" className="text-2xl font-semibold tracking-tight">
              No catálogo
            </h2>
            <ul className="mt-6 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cursos.map((curso) => (
                <CartaoDeCurso key={curso.slug} curso={curso} />
              ))}
            </ul>
          </section>
        ) : null}

        {destaque ? (
          <section
            aria-labelledby="instrutor"
            className="border-t border-borda bg-papel-fundo"
          >
            <div className="mx-auto max-w-3xl px-6 py-16">
              <h2
                id="instrutor"
                className="text-sm font-semibold uppercase tracking-wide text-tinta-suave"
              >
                Quem ensina
              </h2>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                {destaque.instrutor.nome}
              </p>
              <p className="mt-3 text-tinta-media text-pretty">
                {destaque.instrutor.bio}
              </p>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-borda">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-tinta-suave">
          Começa.ai Academy
        </div>
      </footer>
    </>
  )
}
