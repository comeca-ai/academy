/**
 * A assinatura da marca Jhonata Emerick.
 *
 * ATENÇÃO: o símbolo abaixo é uma RECONSTRUÇÃO vetorial, traçada a partir da
 * imagem do logotipo — não é o arquivo original do designer. As proporções
 * foram conferidas contra a arte, mas curvas e espessuras são aproximadas.
 * Assim que o .svg oficial entrar no repositório, substitua apenas o corpo de
 * `Simbolo` e a assinatura se atualiza em toda a plataforma.
 *
 * O símbolo herda a cor do texto (`currentColor`), então funciona sobre fundo
 * claro e escuro sem versão separada.
 */

export function Simbolo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 104"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* As seis hastes do brasão, três por lado */}
      <g stroke="currentColor" strokeWidth="2.2">
        <path d="M13 13 C 17 31, 25 47, 30.5 68" />
        <path d="M19 13 C 22 29, 28 44, 31.5 61" />
        <path d="M25 13 C 27 27, 30.5 40, 32 53" />
        <path d="M51 13 C 47 31, 39 47, 33.5 68" />
        <path d="M45 13 C 42 29, 36 44, 32.5 61" />
        <path d="M39 13 C 37 27, 33.5 40, 32 53" />
      </g>
      {/* A lâmina central */}
      <path
        d="M32 46 C 28.4 60, 27.6 74, 32 100 C 36.4 74, 35.6 60, 32 46 Z"
        fill="currentColor"
      />
      {/* Estrela principal, entre as hastes */}
      <path
        d="M32 11 Q33.3 20 41.5 21.5 Q33.3 23 32 32 Q30.7 23 22.5 21.5 Q30.7 20 32 11 Z"
        fill="currentColor"
      />
      {/* Estrela menor, à direita */}
      <path
        d="M42 51 Q42.6 54.4 46 55 Q42.6 55.6 42 59 Q41.4 55.6 38 55 Q41.4 54.4 42 51 Z"
        fill="currentColor"
      />
      {/* Vazado na lâmina: recortado no fundo, não pintado de uma cor fixa,
          para a marca funcionar sobre qualquer superfície. */}
      <path
        d="M32 76 Q32.5 79 35.5 79.5 Q32.5 80 32 83 Q31.5 80 28.5 79.5 Q31.5 79 32 76 Z"
        fill="var(--color-fundo)"
      />
    </svg>
  )
}

/**
 * Assinatura horizontal, para o cabeçalho: símbolo ao lado do nome.
 * Em `empilhada`, vira a versão vertical usada em peças maiores.
 */
export function Marca({ empilhada = false }: { empilhada?: boolean }) {
  if (empilhada) {
    return (
      <span className="inline-flex flex-col items-center gap-2.5">
        <Simbolo className="h-16 w-auto" />
        <span className="flex flex-col items-center leading-none">
          <span className="font-marca text-[11px] tracking-[0.38em] text-tinta-suave">
            JHON
          </span>
          <span className="font-marca mt-2 text-[22px] tracking-[0.22em]">
            EMERICK
          </span>
        </span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2.5">
      <Simbolo className="h-9 w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-marca text-[15px] tracking-[0.2em]">EMERICK</span>
        <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-tinta-suave">
          Academy
        </span>
      </span>
    </span>
  )
}
