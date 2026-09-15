import { useMemo } from 'react'
import type { NightPalette } from '../theme/genres'
import { DEFAULT_THEME, hashText } from '../theme/genres'

/**
 * O fundo vivo da interface: um céu que muda de cor conforme o gênero que o
 * leitor mais lê. Fica atrás de tudo, não intercepta clique e não rola com a página.
 */
export function NightAmbience({
  palette = DEFAULT_THEME.night,
  seed = 'literaryworld',
  moonAt = 'right',
  dim = 0,
}: {
  palette?: NightPalette
  seed?: string
  /** Onde pendurar a lua — ou 'none', nas telas em que ela cairia sobre o conteúdo. */
  moonAt?: 'left' | 'right' | 'none'
  /** Quanto de preto entra na frente do céu. Acima de zero nas telas de leitura,
      onde a cor do gênero deve ser um tom de fundo, não uma lavagem por cima do texto. */
  dim?: number
}) {
  const [top, mid, bottom] = palette.sky

  // as estrelas nascem de uma semente estável — não trocam de lugar a cada render
  const stars = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        left: (hashText(seed, index * 3 + 1) % 1000) / 10,
        top: (hashText(seed, index * 7 + 2) % 900) / 10,
        size: 1 + (hashText(seed, index * 11 + 3) % 3) * 0.6,
        delay: (hashText(seed, index * 13 + 5) % 40) / 10,
        opacity: 0.25 + (hashText(seed, index * 17 + 7) % 60) / 100,
      })),
    [seed],
  )

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 transition-[background] duration-1000"
        style={{ background: `linear-gradient(to bottom, ${top}, ${mid} 55%, ${bottom})` }}
      />

      {/* a aurora — a faixa de luz do gênero atravessando o céu */}
      <div
        className="absolute -top-24 inset-x-0 h-[55vh] blur-3xl transition-[background] duration-1000"
        style={{ background: `linear-gradient(115deg, transparent 12%, ${palette.aurora} 45%, transparent 82%)` }}
      />

      {/* a lua — a luz de apoio da cena */}
      {moonAt !== 'none' && (
        <div
          className={`absolute top-[9%] h-20 w-20 rounded-full lw-bob transition-colors duration-1000
                      ${moonAt === 'left' ? 'left-[14%]' : 'right-[12%]'}`}
          style={{ backgroundColor: palette.moon, boxShadow: `0 0 90px 30px ${palette.moonHalo}` }}
        />
      )}

      {/* o horizonte — a cidade distante brilhando no rodapé */}
      <div
        className="absolute bottom-0 inset-x-0 h-80 blur-2xl transition-[background] duration-1000"
        style={{ background: `linear-gradient(to top, ${palette.horizon}, transparent)` }}
      />

      {stars.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `lw-blink ${2.4 + star.delay}s steps(1) infinite`,
          }}
        />
      ))}

      {/* vinheta — puxa o olho para o centro da página */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

      {/* o véu que devolve o contraste ao texto por cima */}
      {dim > 0 && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ backgroundColor: '#05060f', opacity: dim }}
        />
      )}
    </div>
  )
}
