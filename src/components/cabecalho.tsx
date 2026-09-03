import Link from 'next/link'

import { Marca } from '@/components/marca'
import { NavDaConta } from '@/components/nav-da-conta'

/**
 * Cabeçalho de todas as páginas.
 *
 * Componente de servidor sem nenhuma API dinâmica de propósito: ele aparece
 * nas páginas do catálogo, que saem prontas do build. Ler o cookie de sessão
 * aqui bastaria para tirar o site inteiro do pré-render, então a parte que
 * varia por pessoa fica isolada em `NavDaConta`, do lado do cliente.
 */
export function Cabecalho() {
  return (
    <header className="sticky top-0 z-40 border-b border-borda bg-fundo/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3.5">
        <Link href="/" aria-label="Começa.ai Academy — início">
          <Marca />
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-5 text-sm">
          <Link href="/cursos" className="font-medium text-tinta-media hover:text-marca">
            Cursos
          </Link>
          <NavDaConta />
        </nav>
      </div>
    </header>
  )
}
