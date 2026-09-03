import { resolverVideo } from '@/lib/video'

/**
 * Player da aula, com proporção 16:9 preservada em qualquer largura.
 *
 * Devolve `null` quando a aula não tem vídeo — aula de texto é caso normal,
 * não erro, e não deve reservar espaço vazio na página.
 */
export function PlayerDeVideo({
  videoUrl,
  titulo,
}: {
  videoUrl: string | null | undefined
  titulo: string
}) {
  const video = resolverVideo(videoUrl)
  if (!video) return null

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-borda bg-tinta">
      {video.tipo === 'arquivo' ? (
        <video
          src={video.src}
          controls
          preload="metadata"
          className="h-full w-full"
          // Sem legenda cadastrada ainda; o atributo declara a ausência em vez
          // de deixar o leitor de tela sem informação nenhuma.
          aria-label={`Vídeo da aula: ${titulo}`}
        />
      ) : (
        <iframe
          src={video.src}
          title={`Vídeo da aula: ${titulo}`}
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="h-full w-full border-0"
        />
      )}
    </div>
  )
}
