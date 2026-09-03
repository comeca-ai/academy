import type { ComponentProps } from 'react'

/**
 * Campos dos formulários de autenticação.
 *
 * O rótulo é sempre um `<label>` de verdade ligado ao campo, e a mensagem de
 * erro é anunciada por leitor de tela via `role="alert"`. Nada aqui depende de
 * cor sozinha para comunicar estado.
 */

export function Campo({
  label,
  id,
  dica,
  ...props
}: ComponentProps<'input'> & { label: string; id: string; dica?: string }) {
  const idDaDica = dica ? `${id}-dica` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={idDaDica}
        className="rounded-md border border-borda bg-superficie px-3 py-2.5 text-base outline-none focus:border-marca"
        {...props}
      />
      {dica ? (
        <p id={idDaDica} className="text-sm text-tinta-suave">
          {dica}
        </p>
      ) : null}
    </div>
  )
}

export function Erro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null
  return (
    <p
      role="alert"
      className="rounded-md border border-borda bg-superficie px-3 py-2.5 text-sm"
    >
      {mensagem}
    </p>
  )
}

export function Enviar({ children, pendente }: { children: string; pendente: boolean }) {
  return (
    <button
      type="submit"
      disabled={pendente}
      className="rounded-md bg-marca-fundo px-4 py-2.5 font-medium text-tinta hover:bg-marca-fundo-forte disabled:opacity-60"
    >
      {pendente ? 'Aguarde…' : children}
    </button>
  )
}
