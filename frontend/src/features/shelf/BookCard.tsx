import type { ShelfItem } from '../../api/types'

const STATUS_LABEL: Record<ShelfItem['status'], string> = {
  QUERO_LER: 'quero ler',
  LENDO: 'lendo',
  LIDO: 'lido',
  ABANDONADO: 'abandonado',
}

const GENRE_COLORS: Record<string, string> = {
  'fantasia': '#3b0764',
  'ficcao-cientifica': '#082f49',
  'romance': '#4a044e',
  'terror': '#450a0a',
  'suspense': '#1e1b4b',
  'drama': '#422006',
  'aventura': '#052e16',
  'biografia': '#431407',
  'historia': '#3f2d04',
  'poesia': '#2e1065',
  'autoajuda': '#064e3b',
  'tecnico': '#1e293b',
  'classico': '#451a03',
  'infantojuvenil': '#7c2d12',
  'quadrinhos': '#7f1d1d',
}

const FALLBACK_COLORS = ['#1e1b4b', '#450a0a', '#052e16', '#3b0764', '#431407', '#082f49', '#4a044e', '#422006']

function coverColor(item: { title: string; genreSlug: string | null }): string {
  if (item.genreSlug && GENRE_COLORS[item.genreSlug]) {
    return GENRE_COLORS[item.genreSlug]
  }
  let hash = 0
  for (let i = 0; i < item.title.length; i++) {
    hash = (hash * 31 + item.title.charCodeAt(i)) | 0
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}

function progressPercent(item: ShelfItem): number {
  if (item.status === 'LIDO') return 100
  if (!item.pageCount || item.pageCount === 0) return 0
  return Math.min(100, Math.round((item.currentPage / item.pageCount) * 100))
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
  const isDone = item.status === 'LIDO'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className="group relative text-left w-full rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden
                 hover:border-amber-400/40 hover:shadow-[0_0_24px_rgba(251,191,36,0.08)]
                 transition-all duration-300 cursor-pointer"
    >
      {/* o X de excluir — aparece no hover do card */}
      <button
        onClick={e => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`tirar ${item.title} da mesa`}
        className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-slate-950/80 border border-slate-700
                   text-slate-400 hover:text-red-400 hover:border-red-400/50
                   flex items-center justify-center text-sm font-sans
                   opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        ✕
      </button>

      {/* Capa tipográfica por gênero — o ramo do CDN está desligado (false &&)
          até a hospedagem própria de capas existir */}
      {false && item.coverUrl ? (
        <img
          src={item.coverUrl}
          alt={`capa de ${item.title}`}
          className="h-44 w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
      ) : (
        <div
          className="h-44 w-full flex items-center justify-center p-3 group-hover:brightness-110 transition-all duration-500"
          style={{ backgroundColor: coverColor(item) }}
        >
          <div className="h-full w-full border border-amber-100/25 rounded-sm flex flex-col items-center justify-center gap-2 px-3">
            <span className="font-display text-[13px] text-amber-50/90 tracking-[0.15em] uppercase text-center leading-relaxed">
              {item.title}
            </span>
            <span className="h-px w-8 bg-amber-100/30" />
            <span className="font-serif italic text-[11px] text-amber-100/60 text-center">
              {item.authors}
            </span>
          </div>
        </div>
      )}

      <div className="p-3.5 space-y-2">
        <p className="font-sans text-[15px] font-medium text-slate-100 truncate">{item.title}</p>
        <p className="font-sans text-sm text-slate-500 truncate">{item.authors}</p>

        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className={`font-sans text-sm ${isDone ? 'text-emerald-400' : 'text-amber-300/90'}`}>
          {STATUS_LABEL[item.status]}
          {item.status === 'LENDO' && item.pageCount
            ? ` · pág ${item.currentPage} de ${item.pageCount}`
            : isDone && item.pageCount
              ? ` · ${item.pageCount} páginas`
              : ''}
        </p>
      </div>
    </div>
  )
}