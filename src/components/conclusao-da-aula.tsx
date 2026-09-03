'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { alternarAula } from '@/app/cursos/acoes'
import { useProgresso } from '@/lib/progresso-cliente'

type Props = {
  curso: string
  aula: string
  /** Para onde voltar depois de entrar, quando a pessoa ainda não tem sessão. */
  destino: string
}

/**
 * O botão de concluir a aula.
 *
 * A altura é reservada desde o primeiro quadro para o bloco não empurrar o
 * conteúdo abaixo quando a resposta do progresso chega.
 */
export function ConclusaoDaAula({ curso, aula, destino }: Props) {
  const [estado, definir] = useProgresso(curso)
  const [salvando, iniciarTransicao] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  const concluida = estado.fase === 'pronto' && estado.concluidas.includes(aula)

  function alternar() {
    if (estado.fase !== 'pronto') return
    const anterior = estado
    const alvo = !concluida

    // Resposta imediata na interface, desfeita se o servidor recusar. Marcar
    // aula é ação frequente e de baixo risco; esperar a ida e volta a cada
    // clique faz a plataforma parecer lenta.
    definir({
      fase: 'pronto',
      concluidas: alvo
        ? [...anterior.concluidas, aula]
        : anterior.concluidas.filter((s) => s !== aula),
    })
    setErro(null)

    iniciarTransicao(async () => {
      const resposta = await alternarAula({ curso, aula, concluida: alvo })
      if (resposta.ok) {
        definir({ fase: 'pronto', concluidas: resposta.concluidas })
      } else {
        definir(anterior)
        setErro(resposta.erro)
      }
    })
  }

  return (
    <div className="mt-9 min-h-[3.25rem] border-t border-borda pt-6">
      {estado.fase === 'carregando' ? null : estado.fase === 'anonimo' ? (
        <p className="text-sm text-tinta-suave">
          <Link
            href={`/entrar?destino=${encodeURIComponent(destino)}`}
            className="font-medium text-marca underline underline-offset-4"
          >
            Entre na sua conta
          </Link>{' '}
          para marcar aulas concluídas e retomar de onde parou.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={alternar}
            aria-pressed={concluida}
            disabled={salvando}
            className={
              concluida
                ? 'rounded-xl bg-marca-fundo px-5 py-3 font-semibold text-marca-tinta transition-colors hover:bg-marca-fundo-forte disabled:opacity-60'
                : 'rounded-xl border border-borda-forte px-5 py-3 font-medium text-tinta-media transition-colors hover:border-marca hover:text-marca disabled:opacity-60'
            }
          >
            <span aria-hidden="true" className="mr-2 font-mono">
              {concluida ? '✓' : '○'}
            </span>
            {concluida ? 'Aula concluída' : 'Marcar como concluída'}
          </button>

          {erro ? (
            <p role="alert" className="text-sm text-tinta-media">
              {erro}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
