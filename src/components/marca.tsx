/**
 * A assinatura da marca, no mesmo arranjo do site do instrutor: o monograma
 * dentro de um disco claro, seguido do nome.
 *
 * O monograma é desenhado em texto, não em imagem — o arquivo original do
 * símbolo ainda não está no repositório. Quando ele chegar, troca-se apenas o
 * miolo deste componente e a assinatura se atualiza em toda a plataforma.
 */
export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tinta"
      >
        <span className="font-display text-[15px] font-semibold leading-none tracking-tight text-fundo">
          JE
        </span>
      </span>
      {compacta ? null : (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[19px] font-semibold tracking-tight">
            Jhonata Emerick
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-tinta-suave">
            Academy
          </span>
        </span>
      )}
    </span>
  )
}
