import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { usuarioAtual } from '@/lib/auth/current-user'
import { SENHA_MINIMA } from '@/lib/auth/password'
import { destinoSeguro } from '@/lib/rotas'

import { FormularioDeCadastro } from './formulario'

export const metadata: Metadata = { title: 'Criar conta' }

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>
}) {
  const destino = destinoSeguro((await searchParams).destino)

  if (await usuarioAtual()) redirect(destino)

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
      <p className="mt-2 mb-6 text-tinta-suave">Leva menos de um minuto.</p>

      <FormularioDeCadastro destino={destino} senhaMinima={SENHA_MINIMA} />

      <p className="mt-6 text-sm text-tinta-suave">
        Já tem conta?{' '}
        <Link href="/entrar" className="font-medium text-marca hover:underline">
          Entrar
        </Link>
      </p>
    </>
  )
}
