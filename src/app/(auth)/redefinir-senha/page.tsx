import type { Metadata } from 'next'
import Link from 'next/link'

import { SENHA_MINIMA } from '@/lib/auth/password'

import { FormularioDeNovaSenha } from './formulario'

export const metadata: Metadata = { title: 'Nova senha' }

type Props = { searchParams: Promise<{ token?: string }> }

export default async function RedefinirSenhaPage({ searchParams }: Props) {
  const token = (await searchParams).token

  // Sem token não há o que fazer aqui além de mandar pedir um link de novo —
  // não existe formulário sensato para preencher.
  if (!token) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Link inválido</h1>
        <p className="mt-2 text-tinta-suave">
          Este link de redefinição está incompleto ou foi copiado errado.{' '}
          <Link href="/esqueci-senha" className="font-medium text-marca hover:underline">
            Peça um novo
          </Link>
          .
        </p>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Escolha uma senha nova</h1>
      <p className="mt-2 mb-6 text-tinta-suave">
        Isto encerra sua sessão em todos os aparelhos — entre de novo com a
        senha nova.
      </p>

      <FormularioDeNovaSenha token={token} senhaMinima={SENHA_MINIMA} />
    </>
  )
}
