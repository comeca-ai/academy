import type { Metadata } from 'next'

import { AvisoSemBanco } from '@/components/aviso-sem-banco'
import { Cabecalho } from '@/components/cabecalho'
import { CartaoDeCurso } from '@/components/cartao-de-curso'
import { listarCursosPublicados } from '@/db/queries/courses'
import { bancoConfigurado } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Cursos',
  description: 'Todos os cursos publicados na Começa.ai Academy.',
}

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>
}) {
  const busca = (await searchParams).busca?.trim() ?? ''
  const cursos = bancoConfigurado ? await listarCursosPublicados(busca) : []

  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Cursos</h1>
        <p className="mt-2 text-tinta-media">
          Comece por onde fizer sentido para você. Cada curso é dividido em
          módulos curtos.
        </p>

        {/* Busca por GET: o termo fica na URL, então o resultado pode ser
            compartilhado, favoritado e funciona sem JavaScript. */}
        <form role="search" className="mt-8 flex gap-2">
          <label htmlFor="busca" className="sr-only">
            Buscar cursos
          </label>
          <input
            id="busca"
            name="busca"
            type="search"
            defaultValue={busca}
            placeholder="Buscar por assunto"
            className="w-full max-w-sm rounded-md border border-borda bg-papel px-3 py-2.5 outline-none focus:border-marca"
          />
          <button
            type="submit"
            className="rounded-md border border-borda px-4 py-2.5 font-medium hover:bg-papel-fundo"
          >
            Buscar
          </button>
        </form>

        {!bancoConfigurado ? (
          <div className="mt-10">
            <AvisoSemBanco />
          </div>
        ) : cursos.length === 0 ? (
          <p className="mt-10 rounded-lg border border-borda bg-papel-fundo p-6 text-tinta-media">
            {busca
              ? `Nenhum curso encontrado para “${busca}”.`
              : 'Nenhum curso publicado ainda.'}
          </p>
        ) : (
          <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso) => (
              <CartaoDeCurso key={curso.id} curso={curso} />
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
