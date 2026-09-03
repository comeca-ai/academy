'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { criarSessao, revogarSessao } from '@/db/queries/sessions'
import { buscarUsuarioPorEmail, criarUsuario, normalizarEmail } from '@/db/queries/users'
import { sessaoAtual } from '@/lib/auth/current-user'
import { SENHA_MINIMA, conferirSenha, hashDeSenha } from '@/lib/auth/password'
import { limitadorDeLogin } from '@/lib/auth/rate-limit'
import {
  NOME_DO_COOKIE,
  assinarToken,
  calcularExpiracao,
  opcoesDoCookie,
} from '@/lib/auth/session'
import { destinoSeguro } from '@/lib/rotas'

export type EstadoDoFormulario = { erro?: string }

const esquemaDeCadastro = z.object({
  name: z.string().trim().min(2, 'Escreva seu nome.').max(120, 'Nome longo demais.'),
  email: z.string().trim().email('E-mail inválido.'),
  password: z
    .string()
    .min(SENHA_MINIMA, `A senha precisa de ao menos ${SENHA_MINIMA} caracteres.`),
})

const esquemaDeLogin = z.object({
  email: z.string().trim().email('E-mail ou senha incorretos.'),
  password: z.string().min(1, 'E-mail ou senha incorretos.'),
})

/**
 * Hash descartável usado para gastar o mesmo tempo quando a conta não existe.
 *
 * Sem isso, um login com e-mail inexistente responde perceptivelmente mais
 * rápido que um com e-mail real e senha errada, e essa diferença de tempo
 * revela quais e-mails têm conta. Calculado uma vez e reaproveitado.
 */
let hashFicticio: Promise<string> | undefined
function obterHashFicticio(): Promise<string> {
  hashFicticio ??= hashDeSenha('senha-ficticia-para-igualar-o-tempo')
  return hashFicticio
}

async function abrirSessao(userId: string): Promise<void> {
  const agente = (await headers()).get('user-agent')
  const sessao = await criarSessao(userId, agente)
  const expiraEm = sessao.expiresAt ?? calcularExpiracao()
  const token = await assinarToken(sessao.id, expiraEm)
  ;(await cookies()).set(NOME_DO_COOKIE, token, opcoesDoCookie(expiraEm))
}

export async function cadastrar(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const dados = esquemaDeCadastro.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? 'Confira os dados informados.' }
  }

  const email = normalizarEmail(dados.data.email)

  if (await buscarUsuarioPorEmail(email)) {
    // Contar que a conta existe é aceitável aqui: quem cadastra precisa saber
    // que deve ir para o login. O caminho sensível é o oposto, no login.
    return { erro: 'Já existe uma conta com este e-mail. Tente entrar.' }
  }

  const usuario = await criarUsuario({
    email,
    name: dados.data.name,
    passwordHash: await hashDeSenha(dados.data.password),
  })

  await abrirSessao(usuario.id)
  redirect(destinoSeguro(formData.get('destino')))
}

export async function entrar(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const dados = esquemaDeLogin.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!dados.success) return { erro: 'E-mail ou senha incorretos.' }

  const email = normalizarEmail(dados.data.email)

  const veredito = limitadorDeLogin.conferir(email)
  if (!veredito.permitido) {
    return {
      erro: `Tentativas demais. Espere ${veredito.esperarSegundos} segundos e tente de novo.`,
    }
  }

  const usuario = await buscarUsuarioPorEmail(email)

  // Sempre confere um hash, exista conta ou não, para o tempo de resposta não
  // denunciar quais e-mails estão cadastrados.
  const hash = usuario?.passwordHash ?? (await obterHashFicticio())
  const senhaConfere = await conferirSenha(dados.data.password, hash)

  if (!usuario || !usuario.passwordHash || !senhaConfere) {
    limitadorDeLogin.registrar(email)
    return { erro: 'E-mail ou senha incorretos.' }
  }

  limitadorDeLogin.limpar(email)
  await abrirSessao(usuario.id)
  redirect(destinoSeguro(formData.get('destino')))
}

export async function sair(): Promise<void> {
  const atual = await sessaoAtual()
  if (atual) await revogarSessao(atual.session.id)
  ;(await cookies()).delete(NOME_DO_COOKIE)
  redirect('/')
}
