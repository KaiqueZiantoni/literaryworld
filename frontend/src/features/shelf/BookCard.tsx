import type { CSSProperties } from 'react'
import type { ShelfItem } from '../../api/types'
import { STATUS_LABEL, progressPercent } from '../../api/types'
import { themeFor } from '../../theme/genres'
import { BookCover } from './BookCover'

const STATUS_STYLE: Record<ShelfItem['status'], { chip: string; bar: string }> = {
  QUERO_LER: { chip: 'text-slate-300 border-ink-600 bg-ink-800/70', bar: 'linear-gradient(90deg,#475569,#94a3b8)' },
  LENDO: { chip: 'text-ember-200 border-ember-400/45 bg-ember-400/10', bar: 'linear-gradient(90deg,#f59e0b,#fcd34d)' },
  LIDO: { chip: 'text-quest-400 border-quest-400/45 bg-quest-500/10', bar: 'linear-gradient(90deg,#16a34a,#4ade80)' },
  ABANDONADO: { chip: 'text-slate-500 border-ink-700 bg-ink-900', bar: 'linear-gradient(90deg,#334155,#64748b)' },
}

export function BookCard({
  item,
  onClick,
  onRemove,
}: {
  item: ShelfItem
  onClick: () => void
  onRemove: () => void
}) {
  const percent = progressPercent(item)
  const status = STATUS_STYLE[item.status]
  const genre = item.genreSlug ? themeFor(item.genreSlug) : null

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      aria-label={`${item.title} — ${STATUS_LABEL[item.status]}`}
      className="group relative rounded-2xl overflow-hidden cursor-pointer border border-ink-800
                 bg-ink-900/70 backdrop-blur-sm
                 hover:border-ember-400/45 hover:-translate-y-1.5
                 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9),0_0_28px_-6px_rgba(251,191,36,0.35)]
                 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <button
        onClick={event => {
          event.stopPropagation()
          onRemove()
        }}
        aria-label={`tirar ${item.title} da mesa`}
        className="absolute top-2.5 right-2.5 z-20 h-7 w-7 rounded-full bg-ink-950/85 border border-ink-700
                   text-slate-400 hover:text-danger-400 hover:border-danger-400/60 hover:scale-110
                   flex items-center justify-center text-xs
                   opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200"
      >
        ✕
      </button>

      <div className="relative">
        <BookCover
          title={item.title}
          authors={item.authors}
          coverUrl={item.coverUrl}
          genreSlug={item.genreSlug}
          className="aspect-[2/3] w-full group-hover:scale-[1.04] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        />

        {/* a fita de gênero, pendurada na capa */}
        {genre && (
          <span
            className="absolute top-0 left-3 px-2 pt-2 pb-3 font-pixel text-[7px] uppercase text-ink-950 shadow-lg"
            style={{
              backgroundColor: genre.world.accent,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
            }}
          >
            {genre.name.slice(0, 10)}
          </span>
        )}

        {item.status === 'LIDO' && (
          <span className="absolute bottom-2 right-2 font-pixel text-[7px] px-2 py-1.5 rounded
                           bg-quest-500 text-ink-950 shadow-lg">
            LIDO
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="p-3.5 space-y-2.5">
        <p className="font-sans text-[15px] font-semibold text-slate-100 leading-snug line-clamp-2">
          {item.title}
        </p>
        <p className="font-sans text-[13px] text-slate-500 truncate">{item.authors}</p>

        <div className="lw-xp">
          <div
            className="lw-xp-fill"
            style={{ width: `${percent}%`, '--lw-xp-color': status.bar } as CSSProperties}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={`font-pixel text-[7px] uppercase px-2 py-1.5 rounded border ${status.chip}`}>
            {STATUS_LABEL[item.status]}
          </span>
          <span className="font-sans text-[12px] text-slate-500 tabular-nums">
            {item.status === 'LENDO' && item.pageCount
              ? `${item.currentPage}/${item.pageCount}`
              : item.pageCount
                ? `${item.pageCount} págs`
                : `${percent}%`}
          </span>
        </div>
      </div>
    </article>
  )
}
