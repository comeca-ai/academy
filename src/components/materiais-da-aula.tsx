import type { LessonMaterial } from '@/db/schema'

const ROTULO: Record<LessonMaterial['kind'], string> = {
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
export function MateriaisDaAula({ materiais }: { materiais: LessonMaterial[] }) {
  if (materiais.length === 0) return null

  return (
    <section aria-labelledby="materiais" className="mt-8">
      <h2 id="materiais" className="text-lg font-semibold tracking-tight">
        Material de apoio
      </h2>
      <ul className="mt-3 flex list-none flex-col gap-2">
        {materiais.map((material) => (
          <li key={material.id}>
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-md border border-borda bg-papel-fundo px-4 py-3 hover:border-marca"
            >
              <span className="font-medium">{material.title}</span>
              <span className="shrink-0 text-sm text-tinta-suave">
                {ROTULO[material.kind]} ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
