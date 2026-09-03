import type { Metadata } from 'next'
import Link from 'next/link'

import { Cabecalho } from '@/components/cabecalho'
import { listarCursos } from '@/content'

export const metadata: Metadata = {
  title: 'Quem conduz os cursos',
  description:
    'Jhonata Emerick — cofundador e CEO da Datarisk, presidente da ABRIA e doutor em Engenharia da Computação pela Poli-USP.',
}

export default function InstrutorPage() {
  // O instrutor vem do curso: enquanto houver um só, não faz sentido manter um
  // cadastro separado que possa divergir do que aparece na página do curso.
  const instrutor = listarCursos()[0]?.instrutor
  if (!instrutor) return null

  return (
    <>
      <Cabecalho />

      <section className="halo border-b border-borda">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-marca">
            Quem conduz os cursos
          </p>
          <h1 className="font-display mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            {instrutor.nome}
          </h1>
          <p className="mt-4 text-lg text-tinta-media">{instrutor.titulo}</p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {instrutor.site ? (
              <a
                href={instrutor.site}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-tinta-suave transition-colors hover:text-marca"
              >
                jhonataemerick.com.br ↗
              </a>
            ) : null}
            {instrutor.handle ? (
              <span className="font-mono text-tinta-suave">@{instrutor.handle}</span>
            ) : null}
          </div>
        </div>
      </section>

      <main id="conteudo" className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xl leading-relaxed text-tinta-media text-pretty">
          {instrutor.resumo}
        </p>

        <h2 className="mt-14 text-xs font-semibold uppercase tracking-widest text-tinta-suave">
          Trajetória
        </h2>
        <ul className="mt-6 flex list-none flex-col gap-0">
          {instrutor.credenciais.map((credencial, indice) => (
            <li
              key={credencial}
              className="flex gap-5 border-t border-borda py-5 last:border-b"
            >
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-sm text-marca"
              >
                {String(indice + 1).padStart(2, '0')}
              </span>
              <p className="leading-relaxed text-tinta-media">{credencial}</p>
            </li>
          ))}
        </ul>

        <Link
          href="/cursos"
          className="mt-12 inline-block rounded-xl bg-marca-fundo px-6 py-3 font-semibold text-tinta transition-colors hover:bg-marca-fundo-forte"
        >
          Ver os cursos
        </Link>
      </main>
    </>
  )
}
