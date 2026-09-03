import Link from 'next/link'

import { usuarioAtual } from '@/lib/auth/current-user'

export async function Cabecalho() {
  const usuario = await usuarioAtual()

  return (
    <header className="border-b border-borda">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Começa.ai <span className="text-tinta-suave">Academy</span>
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-5 text-sm">
          <Link href="/cursos" className="font-medium hover:text-marca">
            Cursos
          </Link>
          {usuario ? (
            <Link href="/painel" className="font-medium hover:text-marca">
              Meu painel
            </Link>
          ) : (
            <>
              <Link href="/entrar" className="font-medium hover:text-marca">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-md bg-marca px-3.5 py-2 font-medium text-papel hover:bg-marca-forte"
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
