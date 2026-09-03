'use client'

import { useEffect, useState } from 'react'

/**
 * Leitura do progresso no navegador.
 *
 * As páginas de curso e de aula saem prontas do build, iguais para todo mundo.
 * O que varia por pessoa entra depois da hidratação, por este gancho — é o
 * preço de manter o site estático, e é um preço baixo: quem não tem conta
 * nunca vê estes controles.
 */

export type EstadoDoProgresso =
  | { fase: 'carregando' }
  | { fase: 'anonimo' }
  | { fase: 'pronto'; concluidas: string[] }

export type DefinirProgresso = (estado: EstadoDoProgresso) => void

export function useProgresso(curso: string): [EstadoDoProgresso, DefinirProgresso] {
  const [estado, definir] = useState<EstadoDoProgresso>({ fase: 'carregando' })

  useEffect(() => {
    // Evita gravar estado depois que o componente saiu, o que acontece ao
    // navegar entre aulas antes de a resposta chegar.
    let vivo = true

    fetch(`/api/progresso/${encodeURIComponent(curso)}`, {
      credentials: 'same-origin',
    })
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`resposta ${resposta.status}`)
        return resposta.json()
      })
      .then((dados: { autenticado: boolean; concluidas: string[] }) => {
        if (!vivo) return
        definir(
          dados.autenticado
            ? { fase: 'pronto', concluidas: dados.concluidas }
            : { fase: 'anonimo' },
        )
      })
      // Falha de rede cai no mesmo lugar que "não autenticado": os controles
      // somem. Melhor a página inteira continuar utilizável do que mostrar um
      // erro sobre um recurso que é acessório à aula.
      .catch(() => {
        if (vivo) definir({ fase: 'anonimo' })
      })

    return () => {
      vivo = false
    }
  }, [curso])

  return [estado, definir]
}
