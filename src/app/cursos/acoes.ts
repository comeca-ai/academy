'use server'

import { z } from 'zod'

import { buscarAula } from '@/content'
import { definirConclusao } from '@/db/queries/enrollments'
import { usuarioAtual } from '@/lib/auth/current-user'
import { bancoConfigurado } from '@/lib/env'

export type RespostaDeProgresso =
  | { ok: true; concluidas: string[] }
  | { ok: false; erro: string }

const esquema = z.object({
  curso: z.string().min(1).max(200),
  aula: z.string().min(1).max(200),
  concluida: z.boolean(),
})

/**
 * Marca ou desmarca uma aula para quem está autenticado.
 *
 * Os slugs chegam do navegador, então são conferidos contra o catálogo antes
 * de virar linha no banco. `buscarAula` faz as duas checagens de uma vez: que
 * a aula existe e que ela pertence àquele curso — sem isso daria para gravar
 * progresso de uma aula em um curso alheio, ou encher a tabela de slugs
 * inventados.
 */
export async function alternarAula(entrada: {
  curso: string
  aula: string
  concluida: boolean
}): Promise<RespostaDeProgresso> {
  if (!bancoConfigurado) {
    return { ok: false, erro: 'Esta instalação ainda não tem banco de dados configurado.' }
  }

  const dados = esquema.safeParse(entrada)
  if (!dados.success) return { ok: false, erro: 'Requisição inválida.' }

  const usuario = await usuarioAtual()
  if (!usuario) return { ok: false, erro: 'Entre na sua conta para salvar o progresso.' }

  const { curso, aula, concluida } = dados.data
  if (!buscarAula(curso, aula)) return { ok: false, erro: 'Aula não encontrada.' }

  const concluidas = await definirConclusao(usuario.id, curso, aula, concluida)
  return { ok: true, concluidas }
}
