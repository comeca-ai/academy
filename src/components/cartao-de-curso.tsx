import Link from 'next/link'

import type { Curso } from '@/content/tipos'

export function CartaoDeCurso({ curso }: { curso: Curso }) {
  const totalDeAulas = curso.modulos.reduce((soma, m) => soma + m.aulas.length, 0)

  return (
    <li>
      <Link
        href={`/cursos/${curso.slug}`}
        className="group flex h-full flex-col rounded-xl border border-borda bg-superficie p-6 transition-colors hover:border-marca"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-marca">
          Curso
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-balance">
          {curso.titulo}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-tinta-suave">{curso.resumo}</p>

        <p className="mt-5 border-t border-borda pt-4 text-sm text-tinta-suave">
          {curso.modulos.length} módulos · {totalDeAulas} aulas
        </p>
        <span
          aria-hidden="true"
          className="mt-3 text-sm font-semibold text-tinta-media transition-colors group-hover:text-marca"
        >
          Ver curso →
        </span>
      </Link>
    </li>
  )
}
