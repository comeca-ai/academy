/**
 * A marca do curso, reconstruída em CSS.
 *
 * É o mesmo bloco que assina os slides: o selo "0-100", o nome por extenso e
 * as barras. Fica em componente para o cabeçalho, a home e qualquer peça
 * futura usarem exatamente o mesmo desenho.
 */
export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="rounded-[3px] bg-tinta px-1.5 py-0.5 text-sm font-black leading-none tracking-tight text-fundo">
        0-100
      </span>
      {compacta ? null : (
        <span className="flex flex-col gap-1 leading-none">
          <span className="text-sm font-medium tracking-tight">de zero ao cem</span>
          <Barras />
        </span>
      )}
    </span>
  )
}

/**
 * As barras verticais sob o nome. Decorativas: escondidas de leitor de tela,
 * já que não carregam informação que o texto ao lado não dê.
 */
function Barras() {
  // Larguras irregulares fixas — um padrão aleatório mudaria a cada render e
  // faria a marca "piscar" diferente entre servidor e cliente.
  const larguras = [2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2]

  return (
    <span aria-hidden="true" className="flex h-2 items-end gap-[2px]">
      {larguras.map((largura, i) => (
        <span
          key={i}
          className="h-full bg-tinta-suave"
          style={{ width: `${largura}px` }}
        />
      ))}
    </span>
  )
}
