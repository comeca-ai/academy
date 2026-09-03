import type { Material } from '@/content/tipos'

const ROTULO: Record<Material['tipo'], string> = {
  slides: 'Slides',
  pdf: 'PDF',
  link: 'Link',
  arquivo: 'Arquivo',
}

/**
 * Materiais de apoio da aula.
 *
 * Abrem em nova aba porque tirar a pessoa do meio da aula para ver um PDF faz
 * ela perder o ponto onde estava no vídeo. O `rel` acompanha o `target` por
 * segurança: sem ele a página aberta ganha referência à nossa.
 */
export function MateriaisDaAula({ materiais }: { materiais: Material[] }) {
  if (materiais.length === 0) return null

  return (
    <section aria-labelledby="materiais" className="mt-10">
      <h2
        id="materiais"
        className="text-xs font-semibold uppercase tracking-widest text-tinta-suave"
      >
        Material de apoio
      </h2>
      <ul className="mt-4 flex list-none flex-col gap-2.5">
        {materiais.map((material) => (
          <li key={material.url}>
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-xl border border-borda bg-superficie px-5 py-4 transition-colors hover:border-marca"
            >
              <span className="font-medium">{material.titulo}</span>
              <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-marca">
                {ROTULO[material.tipo]} ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
