/**
 * Limite de tentativas por janela deslizante.
 *
 * Guarda os carimbos de tempo das tentativas recentes por chave e descarta os
 * que saíram da janela. Serve para segurar força bruta em login e em
 * recuperação de senha.
 *
 * Limitação conhecida: o estado vive na memória do processo. Com mais de uma
 * instância da aplicação, cada uma conta em separado e o limite efetivo é
 * multiplicado pelo número de instâncias. Antes de escalar horizontalmente,
 * isto precisa migrar para um armazenamento compartilhado. A interface foi
 * desenhada para que essa troca não mexa em quem chama.
 */

export type Veredito = {
  permitido: boolean
  /** Quantos segundos faltam até liberar. Zero quando permitido. */
  esperarSegundos: number
}

export type Limitador = {
  conferir(chave: string, agora?: number): Veredito
  registrar(chave: string, agora?: number): void
  limpar(chave: string): void
}

export function criarLimitador(opcoes: {
  maxTentativas: number
  janelaMs: number
}): Limitador {
  const { maxTentativas, janelaMs } = opcoes
  const tentativas = new Map<string, number[]>()

  function recentes(chave: string, agora: number): number[] {
    const todas = tentativas.get(chave) ?? []
    const validas = todas.filter((t) => agora - t < janelaMs)
    if (validas.length > 0) tentativas.set(chave, validas)
    else tentativas.delete(chave)
    return validas
  }

  return {
    conferir(chave, agora = Date.now()) {
      const validas = recentes(chave, agora)
      if (validas.length < maxTentativas) {
        return { permitido: true, esperarSegundos: 0 }
      }
      // A mais antiga da janela é a que vai expirar primeiro e liberar uma vaga.
      const maisAntiga = Math.min(...validas)
      const faltamMs = janelaMs - (agora - maisAntiga)
      return {
        permitido: false,
        esperarSegundos: Math.max(1, Math.ceil(faltamMs / 1000)),
      }
    },

    registrar(chave, agora = Date.now()) {
      const validas = recentes(chave, agora)
      validas.push(agora)
      tentativas.set(chave, validas)
    },

    limpar(chave) {
      tentativas.delete(chave)
    },
  }
}

/**
 * Limitador do login. Cinco tentativas erradas por chave a cada quinze
 * minutos — folgado para quem errou a senha, apertado para quem está
 * varrendo. Só tentativas falhas são registradas; um acerto limpa a contagem.
 */
export const limitadorDeLogin = criarLimitador({
  maxTentativas: 5,
  janelaMs: 15 * 60 * 1000,
})
