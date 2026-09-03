'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { criarTokenDeRedefinicao, consumirTokenDeRedefinicao } from '@/db/queries/password-resets'
import { criarSessao, revogarSessao, revogarSessoesDoUsuario } from '@/db/queries/sessions'
import {
  atualizarSenha,
  buscarUsuarioPorEmail,
  criarUsuario,
  normalizarEmail,
} from '@/db/queries/users'
import { sessaoAtual } from '@/lib/auth/current-user'
import { SENHA_MINIMA, conferirSenha, hashDeSenha } from '@/lib/auth/password'
import { limitadorDeLogin, limitadorDeRedefinicao } from '@/lib/auth/rate-limit'
import { DURACAO_DO_TOKEN_EM_MINUTOS } from '@/lib/auth/reset-token'
import {
  NOME_DO_COOKIE,
  assinarToken,
  calcularExpiracao,
  opcoesDoCookie,
} from '@/lib/auth/session'
import { enviarEmail } from '@/lib/email'
import { bancoConfigurado, env } from '@/lib/env'
import { destinoSeguro } from '@/lib/rotas'

export type EstadoDoFormulario = { erro?: string; sucesso?: boolean }

const SEM_BANCO =
  'Esta instalação ainda não tem banco de dados configurado, então não é possível criar conta, entrar nem recuperar senha.'

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

const esquemaDePedidoDeRedefinicao = z.object({
  email: z.string().trim().email('E-mail inválido.'),
})

const esquemaDeNovaSenha = z.object({
  token: z.string().min(1, 'Link inválido.'),
  password: z
    .string()
    .min(SENHA_MINIMA, `A senha precisa de ao menos ${SENHA_MINIMA} caracteres.`),
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
  if (!bancoConfigurado) return { erro: SEM_BANCO }

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
  if (!bancoConfigurado) return { erro: SEM_BANCO }

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

/**
 * Pede o link de redefinição de senha.
 *
 * Responde igual, exista conta com este e-mail ou não — a mensagem de sucesso
 * mora no componente que chama isto, não aqui, porque a diferença entre
 * "conta existe" e "conta não existe" não pode aparecer em lugar nenhum da
 * resposta. Por isso o retorno não distingue os dois casos, e o e-mail em si
 * só sai quando a conta existe de fato.
 *
 * O limitador conta toda tentativa válida, não só as que falham como no
 * login: aqui não existe "acertar" um pedido, e o risco é inundar a caixa de
 * entrada de outra pessoa, não adivinhar credencial.
 */
export async function pedirRedefinicaoDeSenha(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  if (!bancoConfigurado) return { erro: SEM_BANCO }

  const dados = esquemaDePedidoDeRedefinicao.safeParse({ email: formData.get('email') })
  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? 'E-mail inválido.' }
  }

  const email = normalizarEmail(dados.data.email)

  const veredito = limitadorDeRedefinicao.conferir(email)
  if (!veredito.permitido) {
    return {
      erro: `Tentativas demais. Espere ${veredito.esperarSegundos} segundos e tente de novo.`,
    }
  }
  limitadorDeRedefinicao.registrar(email)

  const usuario = await buscarUsuarioPorEmail(email)

  if (usuario) {
    const { token } = await criarTokenDeRedefinicao(usuario.id)
    const link = `${env.APP_URL}/redefinir-senha?token=${token}`

    await enviarEmail({
      para: usuario.email,
      assunto: 'Redefinir sua senha — Começa.ai Academy',
      texto:
        `Alguém pediu para redefinir a senha desta conta. Se foi você, abra o ` +
        `link abaixo — ele vale por ${DURACAO_DO_TOKEN_EM_MINUTOS} minutos:\n\n${link}\n\n` +
        `Se não foi você, ignore este e-mail: sua senha continua a mesma.`,
      html:
        `<p>Alguém pediu para redefinir a senha desta conta. Se foi você, abra o link ` +
        `abaixo — ele vale por ${DURACAO_DO_TOKEN_EM_MINUTOS} minutos:</p>` +
        `<p><a href="${link}">${link}</a></p>` +
        `<p>Se não foi você, ignore este e-mail: sua senha continua a mesma.</p>`,
    })
  }

  return { sucesso: true }
}

/**
 * Troca a senha usando um token de redefinição.
 *
 * Revoga todas as sessões da pessoa ao final — uma sessão aberta em outro
 * aparelho antes da redefinição não deveria sobreviver a ela. Quem redefiniu
 * entra de novo com a senha nova, em todo lugar.
 */
export async function redefinirSenha(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  if (!bancoConfigurado) return { erro: SEM_BANCO }

  const dados = esquemaDeNovaSenha.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  })

  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? 'Confira os dados informados.' }
  }

  const userId = await consumirTokenDeRedefinicao(dados.data.token)
  if (!userId) {
    return { erro: 'Este link não é mais válido. Peça um novo.' }
  }

  await atualizarSenha(userId, await hashDeSenha(dados.data.password))
  await revogarSessoesDoUsuario(userId)

  redirect('/entrar?redefinida=1')
}

export async function sair(): Promise<void> {
  const atual = await sessaoAtual()
  if (atual) await revogarSessao(atual.session.id)
  ;(await cookies()).delete(NOME_DO_COOKIE)
  redirect('/')
}
