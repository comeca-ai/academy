'use client'

import Link from 'next/link'

import { duracaoHumana } from '@/lib/formato'
import { percentualConcluido, proximaAulaPendente } from '@/lib/progresso'
import { useProgresso } from '@/lib/progresso-cliente'

export type AulaResumida = {
  slug: string
  titulo: string
  duracaoEmMinutos: number
  provisoria: boolean
}

export type ModuloResumido = {
  titulo: string
  aulas: AulaResumida[]
}

type Props = {
  curso: string
  modulos: ModuloResumido[]
}

/**
 * A lista de aulas do curso, com o progresso de quem está autenticado.
 *
 * É componente de cliente por causa do progresso, mas os dados do catálogo
 * chegam por propriedade e são serializados no build: o HTML sai completo do
 * servidor, e quem abre sem conta ou sem JavaScript vê a lista inteira. Só as
 * marcas de conclusão dependem da hidratação.
 */
export function ConteudoDoCurso({ curso, modulos }: Props) {
  const [estado] = useProgresso(curso)

  const sequencia = modulos.flatMap((m) => m.aulas)
  const concluidas = estado.fase === 'pronto' ? estado.concluidas : []
  const feitas = new Set(concluidas)
  // Conta só o que existe no conteúdo: uma aula removida do curso continua
  // com linha no banco e inflaria o total.
  const total = sequencia.length
  const quantasFeitas = sequencia.filter((a) => feitas.has(a.slug)).length
  const comecou = estado.fase === 'pronto' && quantasFeitas > 0

  const proximoSlug = proximaAulaPendente(
    sequencia.map((a) => a.slug),
    feitas,
  )
  const proxima = sequencia.find((a) => a.slug === proximoSlug) ?? null

  let contador = 0

  return (
    <section aria-labelledby="conteudo-do-curso">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2
          id="conteudo-do-curso"
          className="text-xs font-semibold uppercase tracking-widest text-tinta-suave"
        >
          Conteúdo do curso
        </h2>
        {comecou ? (
          <p className="font-mono text-xs text-marca">
            {quantasFeitas} de {total} concluídas
          </p>
        ) : null}
      </div>

      {comecou ? (
        <div className="mt-4">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-superficie-alta"
            role="progressbar"
            aria-valuenow={percentualConcluido(quantasFeitas, total)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso no curso"
          >
            <div
              className="h-full rounded-full bg-marca-fundo transition-[width] duration-500"
              style={{ width: `${percentualConcluido(quantasFeitas, total)}%` }}
            />
          </div>

          {proxima ? (
            <Link
              href={`/cursos/${curso}/${proxima.slug}`}
              className="mt-4 inline-block rounded-xl bg-marca-fundo px-5 py-2.5 font-semibold text-tinta transition-colors hover:bg-marca-fundo-forte"
            >
              Continuar: {proxima.titulo} →
            </Link>
          ) : (
            <p className="mt-4 font-medium text-marca">
              Curso concluído. Parabéns.
            </p>
          )}
        </div>
      ) : null}

      <ol className="mt-6 flex list-none flex-col gap-6">
        {modulos.map((modulo, indice) => (
          <li key={modulo.titulo}>
            <h3 className="flex items-baseline gap-2.5 text-lg font-semibold tracking-tight">
              <span className="text-sm font-mono text-marca">
                {String(indice + 1).padStart(2, '0')}
              </span>
              {modulo.titulo}
            </h3>

            <ul className="mt-3 flex list-none flex-col overflow-hidden rounded-xl border border-borda">
              {modulo.aulas.map((aula) => {
                contador += 1
                const feita = feitas.has(aula.slug)
                return (
                  <li key={aula.slug} className="border-b border-borda last:border-0">
                    <Link
                      href={`/cursos/${curso}/${aula.slug}`}
                      className="flex items-center justify-between gap-4 bg-superficie px-5 py-4 transition-colors hover:bg-superficie-alta"
                    >
                      <span className="flex items-center gap-3.5">
                        <span
                          className={
                            feita
                              ? 'font-mono text-sm text-marca'
                              : 'font-mono text-sm text-tinta-suave'
                          }
                        >
                          {String(contador).padStart(2, '0')}
                        </span>
                        <span className="font-medium">{aula.titulo}</span>
                        {aula.provisoria ? (
                          <span className="rounded bg-superficie-alta px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-tinta-suave">
                            título a definir
                          </span>
                        ) : null}
                      </span>

                      <span className="flex shrink-0 items-center gap-3">
                        {aula.duracaoEmMinutos > 0 ? (
                          <span className="text-sm text-tinta-suave">
                            {duracaoHumana(aula.duracaoEmMinutos * 60)}
                          </span>
                        ) : null}
                        {feita ? (
                          <span className="font-mono text-marca">
                            <span aria-hidden="true">✓</span>
                            <span className="sr-only">Aula concluída</span>
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
