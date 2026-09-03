import type { Metadata } from 'next'

import { sair } from '@/app/(auth)/actions'
import { exigirUsuario } from '@/lib/auth/current-user'

export const metadata: Metadata = { title: 'Painel' }

/**
 * Sempre renderizado por requisição.
 *
 * O conteúdo depende de quem está autenticado, e sem isto o Next pode
 * pré-renderizar a página quando a checagem de sessão termina cedo — por
 * exemplo numa instalação ainda sem banco. O resultado ficaria congelado no
 * build e erraria assim que o banco existisse.
 */
export const dynamic = 'force-dynamic'

export default async function PainelPage() {
  const usuario = await exigirUsuario('/painel')

  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Olá, {usuario.name.split(' ')[0]}
      </h1>
      <p className="mt-2 text-tinta-suave">
        Sua conta está criada. O catálogo de cursos entra na próxima fatia.
      </p>

      <form action={sair} className="mt-8">
        <button
          type="submit"
          className="rounded-md border border-borda px-4 py-2.5 font-medium hover:bg-papel-fundo"
        >
          Sair
        </button>
      </form>
    </main>
  )
}
