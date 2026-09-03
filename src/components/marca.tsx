/**
 * A assinatura da começa.ai.
 *
 * Wordmark puro, sem símbolo: não existe arte de marca própria da começa.ai
 * neste repositório, e desenhar um símbolo do zero, sem briefing de design,
 * inventaria identidade em vez de aplicá-la. Um wordmark bem tipografado é
 * uma marca completa por si — não um substituto provisório.
 *
 * "começa" carrega o peso; ".ai" sai na cor de marca, ecoando o domínio.
 */
export function Marca({ className }: { className?: string }) {
  return (
    <span
      className={`font-marca text-xl font-semibold tracking-tight text-tinta ${className ?? ''}`}
    >
      começa<span className="text-marca">.ai</span>
    </span>
  )
}
