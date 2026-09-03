import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { usuarioAtual } from '@/lib/auth/current-user'
import { destinoSeguro } from '@/lib/rotas'

import { Status } from '../campos'
import { FormularioDeLogin } from './formulario'

export const metadata: Metadata = { title: 'Entrar' }

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; redefinida?: string }>
}) {
  const parametros = await searchParams
  const destino = destinoSeguro(parametros.destino)

  // Quem já está autenticado não tem o que fazer na tela de login.
  if (await usuarioAtual()) redirect(destino)

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
      <p className="mt-2 mb-6 text-tinta-suave">Bom te ver de novo.</p>

      {parametros.redefinida ? (
        <div className="mb-4">
          <Status mensagem="Senha alterada. Entre com a senha nova." />
        </div>
      ) : null}

      <FormularioDeLogin destino={destino} />

      <p className="mt-6 text-sm text-tinta-suave">
        Ainda não tem conta?{' '}
        <Link href="/cadastro" className="font-medium text-marca hover:underline">
          Criar conta
        </Link>
      </p>
    </>
  )
}
