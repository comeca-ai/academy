import Link from 'next/link'

import { Marca } from '@/components/marca'
import { usuarioAtual } from '@/lib/auth/current-user'

export async function Cabecalho() {
  const usuario = await usuarioAtual()

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
          {usuario ? (
            <Link href="/painel" className="font-medium text-tinta-media hover:text-marca">
              Meu painel
            </Link>
          ) : (
            <>
              <Link href="/entrar" className="font-medium text-tinta-media hover:text-marca">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-md bg-marca px-3.5 py-2 font-semibold text-fundo transition-colors hover:bg-marca-forte"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
