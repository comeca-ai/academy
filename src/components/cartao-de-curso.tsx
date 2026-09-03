import Link from 'next/link'

import type { Course } from '@/db/schema'

export function CartaoDeCurso({ curso }: { curso: Course }) {
  return (
    <li>
      <Link
        href={`/cursos/${curso.slug}`}
        className="group flex h-full flex-col rounded-lg border border-borda bg-papel-fundo p-5 transition-colors hover:border-marca"
      >
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-marca">
          {curso.title}
        </h3>
        {curso.summary ? (
          <p className="mt-2 text-sm text-tinta-media">{curso.summary}</p>
        ) : null}
        <span
          aria-hidden="true"
          className="mt-auto pt-4 text-sm font-medium text-marca"
        >
          Ver curso →
        </span>
      </Link>
    </li>
  )
}
