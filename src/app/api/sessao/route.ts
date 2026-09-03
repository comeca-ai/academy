import { NextResponse } from 'next/server'

import { usuarioAtual } from '@/lib/auth/current-user'
import { bancoConfigurado } from '@/lib/env'

/**
 * Quem está autenticado, para o cabeçalho.
 *
 * O cabeçalho aparece em toda página, inclusive nas do catálogo, que são
 * estáticas. Se ele lesse o cookie no servidor, uma única linha de código
 * tiraria o site inteiro do pré-render — foi exatamente o que aconteceu
 * quando o banco entrou. Por isso a identidade é buscada aqui, depois da
 * hidratação, e o HTML continua igual para todo mundo.
 */

export const dynamic = 'force-dynamic'

/** Resposta específica de uma pessoa atrás de CDN: nunca cacheável. */
const CABECALHOS = { 'Cache-Control': 'private, no-store, max-age=0' }

export async function GET() {
  const usuario = bancoConfigurado ? await usuarioAtual() : null

  return NextResponse.json(
    {
      autenticado: Boolean(usuario),
      // Só o primeiro nome, que é tudo que o cabeçalho mostra. Não expor
      // e-mail nem identificador numa resposta que existe para desenhar menu.
      primeiroNome: usuario?.name.split(' ')[0] ?? null,
    },
    { headers: CABECALHOS },
  )
}
