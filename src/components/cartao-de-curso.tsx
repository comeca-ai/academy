import Link from 'next/link'

import type { Curso } from '@/content/tipos'

export function CartaoDeCurso({ curso }: { curso: Curso }) {
  const totalDeAulas = curso.modulos.reduce((soma, m) => soma + m.aulas.length, 0)

  return (
    <li>
      <Link
        href={`/cursos/${curso.slug}`}
        className="group flex h-full flex-col rounded-lg border border-borda bg-papel-fundo p-5 transition-colors hover:border-marca"
      >
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-marca">
          {curso.titulo}
        </h3>
        <p className="mt-2 text-sm text-tinta-media">{curso.resumo}</p>
        <p className="mt-4 text-sm text-tinta-suave">
          {curso.modulos.length} módulos · {totalDeAulas} aulas
        </p>
        <span aria-hidden="true" className="mt-auto pt-4 text-sm font-medium text-marca">
          Ver curso →
        </span>
      </Link>
    </li>
  )
}
