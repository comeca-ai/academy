import type { Parte } from '@/content/tipos'
import { resolverVideo } from '@/lib/video'

/**
 * As gravações da aula, em ordem, com proporção 16:9 preservada.
 *
 * Devolve `null` quando não há gravação — aula só de material é caso normal,
 * não erro, e não deve reservar um retângulo preto vazio.
 *
 * Com uma única parte, nenhum rótulo aparece: a numeração só faz sentido
 * quando há mais de uma coisa para numerar.
 */
export function PlayerDeVideo({
  partes,
  titulo,
}: {
  partes: Parte[]
  titulo: string
}) {
  const reproduziveis = partes
    .map((parte, indice) => ({ ...parte, indice, video: resolverVideo(parte.video) }))
    .filter((parte) => parte.video !== null)

  if (reproduziveis.length === 0) return null

  const varias = reproduziveis.length > 1

  return (
    <div className="flex flex-col gap-6">
      {reproduziveis.map((parte) => {
        const rotulo = parte.titulo ?? `Parte ${parte.indice + 1}`
        const legenda = varias ? `${titulo} — ${rotulo}` : titulo

        return (
          <figure key={parte.video!.src} className="m-0">
            {varias ? (
              <figcaption className="mb-2 text-sm font-medium text-tinta-suave">
                {rotulo}
              </figcaption>
            ) : null}

            <div className="aspect-video w-full overflow-hidden rounded-lg border border-borda bg-tinta">
              {parte.video!.tipo === 'arquivo' ? (
                <video
                  src={parte.video!.src}
                  controls
                  preload="metadata"
                  className="h-full w-full"
                  aria-label={`Vídeo da aula: ${legenda}`}
                />
              ) : (
                <iframe
                  src={parte.video!.src}
                  title={`Vídeo da aula: ${legenda}`}
                  loading="lazy"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              )}
            </div>
          </figure>
        )
      })}
    </div>
  )
}
