import { SignJWT, jwtVerify } from 'jose'

import { isProduction, requireAppSecret } from '@/lib/env'

/**
 * Sessões assinadas.
 *
 * O cookie carrega apenas o identificador da sessão, assinado. Todo o estado
 * de verdade — a quem pertence, quando expira, se foi revogada — vive na
 * tabela `sessions`. Assim o cookie não pode ser usado depois de a sessão ser
 * revogada, e nenhum dado do usuário trafega dentro do token.
 */

export const NOME_DO_COOKIE = 'academy_session'

/** Duração padrão de uma sessão nova. */
export const DURACAO_DA_SESSAO_EM_DIAS = 30

const EMISSOR = 'academy'

function segredo(): Uint8Array {
  return new TextEncoder().encode(requireAppSecret())
}

export async function assinarToken(sessionId: string, expiraEm: Date): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sessionId)
    .setIssuer(EMISSOR)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiraEm.getTime() / 1000))
    .sign(segredo())
}

/**
 * Devolve o identificador da sessão, ou `null` para qualquer token que não
 * sirva — assinatura inválida, expirado, emissor errado ou lixo. O chamador
 * trata todos esses casos do mesmo jeito: não está autenticado.
 */
export async function lerToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, segredo(), {
      issuer: EMISSOR,
      algorithms: ['HS256'],
    })
    return payload.sub ?? null
  } catch {
    return null
  }
}

export function calcularExpiracao(agora: Date = new Date()): Date {
  return new Date(agora.getTime() + DURACAO_DA_SESSAO_EM_DIAS * 24 * 60 * 60 * 1000)
}

/**
 * Opções do cookie de sessão. `httpOnly` tira o cookie do alcance de qualquer
 * script na página, e `sameSite: 'lax'` bloqueia o envio em requisições
 * cross-site que não sejam navegação de topo, que é o que barra CSRF nas
 * rotas de escrita.
 */
export function opcoesDoCookie(expiraEm: Date) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    expires: expiraEm,
  }
}
