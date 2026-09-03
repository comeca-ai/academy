import { emailConfigurado, env, isProduction } from './env'

/**
 * Envio de e-mail transacional, via Resend.
 *
 * Cloudflare não tem serviço equivalente: Email Routing encaminha e-mail
 * recebido para uma caixa de entrada, não envia e-mail a partir do servidor.
 * Por isso esta é uma integração à parte, fora do Cloudflare que o resto da
 * plataforma usa para vídeo e arquivo.
 *
 * Silenciosa por design quando falha. Quem chama isto está numa rota que
 * nunca deve revelar se um e-mail existe ou se o envio funcionou — a pessoa
 * que pede a redefinição vê sempre a mesma mensagem, dando certo o envio ou
 * não. Erro de configuração ou de envio vai para o log do servidor, nunca
 * para a tela.
 */

type Email = {
  para: string
  assunto: string
  texto: string
  html: string
}

export async function enviarEmail(email: Email): Promise<void> {
  if (!emailConfigurado) {
    // Em desenvolvimento, o corpo no console — link de redefinição incluído —
    // é o que permite testar o fluxo inteiro sem uma conta no Resend. Em
    // produção isso seria uma instalação mal configurada, e o link não entra
    // no log: um link de redefinição vale como credencial por 30 minutos, e
    // log de servidor costuma ir para lugares com mais gente vendo do que uma
    // caixa de entrada.
    if (isProduction) {
      console.error('[email] RESEND_API_KEY/EMAIL_REMETENTE não configurados em produção.')
    } else {
      console.warn(`[email] Envio não configurado. Corpo do e-mail para ${email.para}:\n${email.texto}`)
    }
    return
  }

  try {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_REMETENTE,
        to: email.para,
        subject: email.assunto,
        text: email.texto,
        html: email.html,
      }),
    })

    if (!resposta.ok) {
      console.error(`[email] Resend recusou o envio: ${resposta.status} ${await resposta.text()}`)
    }
  } catch (erro) {
    console.error('[email] Falha de rede ao enviar e-mail:', erro)
  }
}
