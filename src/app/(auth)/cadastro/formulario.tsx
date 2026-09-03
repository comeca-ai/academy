'use client'

import { useActionState } from 'react'

import { cadastrar } from '../actions'
import type { EstadoDoFormulario } from '../actions'
import { Campo, Enviar, Erro } from '../campos'

const INICIAL: EstadoDoFormulario = {}

export function FormularioDeCadastro({
  destino,
  senhaMinima,
}: {
  destino: string
  senhaMinima: number
}) {
  const [estado, acao, pendente] = useActionState(cadastrar, INICIAL)

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="destino" value={destino} />

      <Campo id="name" name="name" label="Nome" autoComplete="name" required />
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
        autoComplete="new-password"
        minLength={senhaMinima}
        dica={`Pelo menos ${senhaMinima} caracteres.`}
        required
      />

      <Erro mensagem={estado.erro} />
      <Enviar pendente={pendente}>Criar conta</Enviar>
    </form>
  )
}
