'use client'

import { useActionState } from 'react'

import { pedirRedefinicaoDeSenha } from '../actions'
import type { EstadoDoFormulario } from '../actions'
import { Campo, Enviar, Erro, Status } from '../campos'

const INICIAL: EstadoDoFormulario = {}

const MENSAGEM_DE_SUCESSO =
  'Se existir uma conta com este e-mail, você vai receber um link para redefinir a senha em instantes.'

export function FormularioDeEsqueciSenha() {
  const [estado, acao, pendente] = useActionState(pedirRedefinicaoDeSenha, INICIAL)

  if (estado.sucesso) {
    return <Status mensagem={MENSAGEM_DE_SUCESSO} />
  }

  return (
    <form action={acao} className="flex flex-col gap-4">
      <Campo
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        required
      />

      <Erro mensagem={estado.erro} />
      <Enviar pendente={pendente}>Enviar link</Enviar>
    </form>
  )
}
