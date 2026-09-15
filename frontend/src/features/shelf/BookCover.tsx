import { useEffect, useState } from 'react'
import { coverGradient } from '../../theme/genres'

interface Props {
  title: string
  authors: string
  coverUrl?: string | null
  genreSlug?: string | null
  className?: string
  /** 'card' na estante, 'chip' nas listas compactas de busca. */
  variant?: 'card' | 'chip'
}

/**
 * A Google Books entrega a miniatura em http e com a borda enrolada de scanner.
 * Aqui ela chega em https, sem o `edge=curl` e num zoom que aguenta o tamanho do
 * card. Se a imagem não vier, a capa tipográfica entra no lugar — o card nunca
 * fica com o buraco de imagem quebrada.
 */
function normalizeCoverUrl(raw?: string | null): string | null {
  if (!raw || !raw.trim()) return null
  try {
    const url = new URL(raw.trim())
    url.protocol = 'https:'
    url.searchParams.delete('edge')
    if (url.searchParams.has('zoom')) {
      url.searchParams.set('zoom', '2')
    }
    return url.toString()
  } catch {
    return null
  }
}

export function BookCover({ title, authors, coverUrl, genreSlug, className = '', variant = 'card' }: Props) {
  const source = normalizeCoverUrl(coverUrl)
  const [broken, setBroken] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setBroken(false)
    setLoaded(false)
  }, [source])

  const [dark, bright] = coverGradient(title, genreSlug ?? null)
  const showFallback = !source || broken

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(150deg, ${bright} 0%, ${dark} 62%, #05060f 100%)` }}
    >
      {showFallback ? (
        <div className={`h-full w-full flex flex-col items-center justify-center text-center gap-2
                         ${variant === 'card' ? 'p-4' : 'p-2'}`}>
          <div className="h-full w-full border border-white/20 rounded-sm flex flex-col items-center justify-center gap-2 px-2">
            <span className={`font-display text-ember-100/95 uppercase tracking-[0.14em] leading-relaxed
                              ${variant === 'card' ? 'text-[13px] line-clamp-4' : 'text-[9px] line-clamp-2'}`}>
              {title}
            </span>
            {variant === 'card' && (
              <>
                <span className="h-px w-8 bg-white/35" />
                <span className="font-serif italic text-[11px] text-white/70 line-clamp-2">{authors}</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {!loaded && <div className="absolute inset-0 lw-skeleton" />}
          <img
            src={source}
            alt={`capa de ${title}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
            className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </>
      )}

      {/* lombada e verniz — o que faz a imagem plana parecer um objeto */}
      <span className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/55 to-transparent" />
      <span className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-white/10" />
    </div>
  )
}
