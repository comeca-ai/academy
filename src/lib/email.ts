import { emailConfigurado, env, isProduction } from './env'

/**
 * Envio de e-mail transacional, via Cloudflare Email Service.
 *
 * Fica no mesmo Cloudflare que a plataforma já usa para vídeo (Stream) e
 * arquivo (R2): uma conta, um painel, um lugar só para girar credencial. O
 * serviço de envio (Email Sending) é distinto do Email Routing — Routing
 * encaminha e-mail recebido para uma caixa; Sending dispara e-mail a partir
 * do servidor, que é o que a recuperação de senha precisa.
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
    // é o que permite testar o fluxo inteiro sem credencial. Em produção isso
    // é instalação mal configurada, e o link não entra no log: um link de
    // redefinição vale como credencial por 30 minutos, e log de servidor
    // costuma ir para lugares com mais gente vendo do que uma caixa de entrada.
    if (isProduction) {
      console.error('[email] CLOUDFLARE_EMAIL_TOKEN não configurado em produção.')
    } else {
      console.warn(`[email] Envio não configurado. Corpo do e-mail para ${email.para}:\n${email.texto}`)
    }
    return
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_EMAIL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { address: env.EMAIL_REMETENTE, name: 'Começa.ai' },
        to: email.para,
        subject: email.assunto,
        text: email.texto,
        html: email.html,
      }),
    })

    if (!resposta.ok) {
      console.error(`[email] Cloudflare recusou o envio: ${resposta.status} ${await resposta.text()}`)
      return
    }

    // A API responde 200 mesmo quando não envia — por exemplo, remetente com
    // domínio não verificado devolve success:false. Só o status HTTP não basta
    // para saber que o e-mail saiu de fato.
    const corpo = (await resposta.json().catch(() => null)) as
      | { success?: boolean; errors?: Array<{ message?: string }> }
      | null
    if (corpo?.success === false) {
      const motivo =
        corpo.errors?.map((e) => e.message).filter(Boolean).join('; ') ||
        'motivo não informado'
      console.error(`[email] Cloudflare não enviou: ${motivo}`)
    }
  } catch (erro) {
    console.error('[email] Falha de rede ao enviar e-mail:', erro)
  }
}
