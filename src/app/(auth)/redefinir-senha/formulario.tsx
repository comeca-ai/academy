'use client'

import { useActionState } from 'react'

import { redefinirSenha } from '../actions'
import type { EstadoDoFormulario } from '../actions'
import { Campo, Enviar, Erro } from '../campos'

const INICIAL: EstadoDoFormulario = {}

export function FormularioDeNovaSenha({
  token,
  senhaMinima,
}: {
  token: string
  senhaMinima: number
}) {
  const [estado, acao, pendente] = useActionState(redefinirSenha, INICIAL)

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <Campo
        id="password"
        name="password"
        type="password"
        label="Nova senha"
        autoComplete="new-password"
        minLength={senhaMinima}
        dica={`Pelo menos ${senhaMinima} caracteres.`}
        required
      />

      <Erro mensagem={estado.erro} />
      <Enviar pendente={pendente}>Salvar nova senha</Enviar>
    </form>
  )
}
