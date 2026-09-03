'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { entrar } from '../actions'
import type { EstadoDoFormulario } from '../actions'
import { Campo, Enviar, Erro } from '../campos'

const INICIAL: EstadoDoFormulario = {}

export function FormularioDeLogin({ destino }: { destino: string }) {
  const [estado, acao, pendente] = useActionState(entrar, INICIAL)

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="destino" value={destino} />

      <Campo
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        required
      />
      <Campo
        id="password"
        name="password"
        type="password"
        label="Senha"
        autoComplete="current-password"
        required
        rotuloExtra={
          <Link
            href="/esqueci-senha"
            className="text-sm font-medium text-tinta-suave hover:text-marca"
          >
            Esqueceu a senha?
          </Link>
        }
      />

      <Erro mensagem={estado.erro} />
      <Enviar pendente={pendente}>Entrar</Enviar>
    </form>
  )
}
