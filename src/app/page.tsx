import Link from 'next/link'

import { Cabecalho } from '@/components/cabecalho'
import { CartaoDeCurso } from '@/components/cartao-de-curso'
import { Marca } from '@/components/marca'
import { listarCursos } from '@/content'

export default function Home() {
  const cursos = listarCursos()
  const destaque = cursos[0]

  return (
    <>
      <Cabecalho />

      <main id="conteudo">
        <section className="grade border-b border-borda">
          <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 sm:pt-32">
            <p className="text-xs font-semibold uppercase tracking-widest text-marca">
              Começa.ai Academy
            </p>
            <h1 className="mt-5 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Inteligência artificial
              <br />
              explicada do começo
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinta-media text-pretty">
              Sem pré-requisito técnico e sem promessa fácil. Você vai entender o
              que a tecnologia realmente faz, onde ela erra, e como usar isso no
              seu trabalho.
            </p>

            {destaque ? (
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href={`/cursos/${destaque.slug}`}
                  className="rounded-md bg-marca px-6 py-3 font-semibold text-fundo transition-colors hover:bg-marca-forte"
                >
                  Começar agora
                </Link>
                <Link
                  href="/cursos"
                  className="rounded-md border border-borda-forte px-6 py-3 font-semibold text-tinta-media transition-colors hover:border-marca hover:text-marca"
                >
                  Ver o catálogo
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {cursos.length > 0 ? (
          <section aria-labelledby="catalogo" className="mx-auto max-w-5xl px-6 py-20">
            <h2
              id="catalogo"
              className="text-xs font-semibold uppercase tracking-widest text-tinta-suave"
            >
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
            className="border-t border-borda bg-superficie"
          >
            <div className="mx-auto max-w-3xl px-6 py-20">
              <h2
                id="instrutor"
                className="text-xs font-semibold uppercase tracking-widest text-marca"
              >
                Quem ensina
              </h2>
              <p className="mt-4 text-2xl font-semibold tracking-tight">
                {destaque.instrutor.nome}
              </p>
              <p className="mt-1 text-marca">{destaque.instrutor.titulo}</p>
              <p className="mt-4 leading-relaxed text-tinta-media text-pretty">
                {destaque.instrutor.resumo}
              </p>
              <Link
                href="/instrutor"
                className="mt-5 inline-block font-semibold text-tinta-media transition-colors hover:text-marca"
              >
                Trajetória completa →
              </Link>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-borda">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-10">
          <Marca />
          <p className="text-sm text-tinta-suave">Começa.ai Academy</p>
        </div>
      </footer>
    </>
  )
}
