import { resolverVideo } from '@/lib/video'

/**
 * Player da aula, com proporção 16:9 preservada em qualquer largura.
 *
 * Devolve `null` quando a aula ainda não tem vídeo — aula só de material é
 * caso normal, não erro, e não deve reservar um retângulo preto vazio.
 */
export function PlayerDeVideo({
  video: origem,
  titulo,
}: {
  video: string | null | undefined
  titulo: string
}) {
  const video = resolverVideo(origem)
  if (!video) return null

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-borda bg-tinta">
      {video.tipo === 'arquivo' ? (
        <video
          src={video.src}
          controls
          preload="metadata"
          className="h-full w-full"
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
