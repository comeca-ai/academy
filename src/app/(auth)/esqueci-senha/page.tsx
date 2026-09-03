import type { Metadata } from 'next'
import Link from 'next/link'

import { FormularioDeEsqueciSenha } from './formulario'

export const metadata: Metadata = { title: 'Recuperar senha' }

export default function EsqueciSenhaPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
      <p className="mt-2 mb-6 text-tinta-suave">
        Informe o e-mail da sua conta. Se ele existir, você recebe um link
        para escolher uma senha nova.
      </p>

      <FormularioDeEsqueciSenha />

      <p className="mt-6 text-sm text-tinta-suave">
        Lembrou a senha?{' '}
        <Link href="/entrar" className="font-medium text-marca hover:underline">
          Entrar
        </Link>
      </p>
    </>
  )
}
