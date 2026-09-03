'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Estado =
  | { fase: 'indefinido' }
  | { fase: 'anonimo' }
  | { fase: 'autenticado'; primeiroNome: string | null }

/**
 * A parte do cabeçalho que depende de quem está olhando.
 *
 * Enquanto a resposta não chega, o espaço fica reservado e vazio — nunca com
 * o menu errado. Mostrar "Criar conta" para quem já entrou e trocar depois
 * seria pior do que um instante em branco: a primeira versão é uma
 * informação falsa, a segunda é só ausência.
 */
export function NavDaConta() {
  const [estado, definir] = useState<Estado>({ fase: 'indefinido' })

  useEffect(() => {
    let vivo = true

    fetch('/api/sessao', { credentials: 'same-origin' })
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`resposta ${resposta.status}`)
        return resposta.json()
      })
      .then((dados: { autenticado: boolean; primeiroNome: string | null }) => {
        if (!vivo) return
        definir(
          dados.autenticado
            ? { fase: 'autenticado', primeiroNome: dados.primeiroNome }
            : { fase: 'anonimo' },
        )
      })
      // Falha de rede cai em "anônimo": os caminhos de entrar e criar conta
      // continuam disponíveis, que é o estado seguro para quem não sabemos.
      .catch(() => {
        if (vivo) definir({ fase: 'anonimo' })
      })

    return () => {
      vivo = false
    }
  }, [])

  if (estado.fase === 'indefinido') {
    // Reserva a largura aproximada do menu autenticado para o cabeçalho não
    // pular quando o estado chegar.
    return <span aria-hidden="true" className="inline-block w-24" />
  }

  if (estado.fase === 'autenticado') {
    return (
      <Link href="/painel" className="font-medium text-tinta-media hover:text-marca">
        {estado.primeiroNome ? `Painel de ${estado.primeiroNome}` : 'Meu painel'}
      </Link>
    )
  }

  return (
    <>
      <Link href="/entrar" className="font-medium text-tinta-media hover:text-marca">
        Entrar
      </Link>
      <Link
        href="/cadastro"
        className="rounded-md bg-marca-fundo px-3.5 py-2 font-semibold text-marca-tinta transition-colors hover:bg-marca-fundo-forte"
      >
        Criar conta
      </Link>
    </>
  )
}
