import { NextResponse } from 'next/server'

import { buscarCurso } from '@/content'
import { progressoDoCurso } from '@/db/queries/enrollments'
import { usuarioAtual } from '@/lib/auth/current-user'
import { bancoConfigurado } from '@/lib/env'

/**
 * Progresso de quem está pedindo, num curso.
 *
 * Existe porque as páginas de curso e de aula são estáticas: o conteúdo sai
 * pronto do build e é o mesmo para todo mundo, então a parte que varia por
 * pessoa é buscada depois da hidratação. Assim quem chega sem conta recebe
 * HTML de CDN, e quem tem conta ganha o progresso por cima.
 */

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ curso: string }> }

/**
 * Resposta nunca cacheável.
 *
 * O corpo é específico de uma pessoa e a rota está atrás de CDN. Sem isto, o
 * progresso da primeira pessoa a abrir a página seria servido para as
 * seguintes — vazamento silencioso, e do tipo que só aparece em produção.
 */
const CABECALHOS = { 'Cache-Control': 'private, no-store, max-age=0' }

export async function GET(_requisicao: Request, { params }: Props) {
  const { curso } = await params

  if (!buscarCurso(curso)) {
    return NextResponse.json(
      { erro: 'Curso não encontrado.' },
      { status: 404, headers: CABECALHOS },
    )
  }

  // Sem banco ninguém está autenticado, e a interface some com os controles
  // de progresso em vez de mostrar um erro.
  const usuario = bancoConfigurado ? await usuarioAtual() : null
  if (!usuario) {
    return NextResponse.json(
      { autenticado: false, concluidas: [] },
      { headers: CABECALHOS },
    )
  }

  return NextResponse.json(
    { autenticado: true, concluidas: await progressoDoCurso(usuario.id, curso) },
    { headers: CABECALHOS },
  )
}
