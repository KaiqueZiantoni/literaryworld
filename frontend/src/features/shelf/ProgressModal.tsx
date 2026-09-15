import { useMemo, useState } from 'react'
import { api, errorMessage } from '../../api/client'
import type { ShelfItem } from '../../api/types'
import { progressPercent } from '../../api/types'
import { themeFor } from '../../theme/genres'
import { Modal } from '../../ui/Modal'
import { useToast } from '../../ui/Toast'
import { BookCover } from './BookCover'

interface Props {
  item: ShelfItem
  onClose: () => void
  onApply: (item: ShelfItem) => void
}

const QUICK_STEPS = [1, 5, 10, 25]

export function ProgressModal({ item, onClose, onApply }: Props) {
  const toast = useToast()
  const total = item.pageCount ?? 0
  const [page, setPage] = useState(item.currentPage)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDone = item.status === 'LIDO'
  const theme = themeFor(item.genreSlug)

  const preview = useMemo(() => {
    if (isDone) return 100
    if (!total) return progressPercent(item)
    return Math.min(100, Math.round((page / total) * 100))
  }, [isDone, total, page, item])

  const pagesLeft = total > 0 ? Math.max(0, total - page) : null
  const changed = page !== item.currentPage

  function nudge(delta: number) {
    setError(null)
    setPage(current => {
      const next = current + delta
      if (next < 0) return 0
      if (total > 0 && next > total) return total
      return next
    })
  }

  async function send(path: string, options: RequestInit, successMessage: string) {
    setSubmitting(true)
    setError(null)
    try {
      const response = await api(path, options)
      if (!response.ok) {
        setError(await errorMessage(response, 'não foi possível salvar agora'))
        return
      }
      const updated: ShelfItem = await response.json()
      onApply(updated)
      toast.success(successMessage)
      onClose()
    } catch {
      setError('o servidor não respondeu — tente de novo')
    } finally {
      setSubmitting(false)
    }
  }

  const saveProgress = () =>
    send(`/shelf/${item.id}/progress`, { method: 'PATCH', body: JSON.stringify({ page }) },
      total > 0 && page >= total ? `"${item.title}" concluído` : 'marcador guardado')

  const finishBook = () =>
    send(`/shelf/${item.id}/finish`, { method: 'POST' }, `"${item.title}" entrou para as histórias vividas`)

  const reopenBook = () =>
    send(`/shelf/${item.id}/reopen`, { method: 'POST' }, 'leitura reaberta')

  return (
    <Modal onClose={onClose} size="md" title={item.title} subtitle={item.authors}>
      <div className="flex gap-5">
        <BookCover
          title={item.title}
          authors={item.authors}
          coverUrl={item.coverUrl}
          genreSlug={item.genreSlug}
          className="w-24 shrink-0 aspect-[2/3] rounded-lg shadow-2xl"
        />

        <div className="grow min-w-0 space-y-4">
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className="font-pixel text-[9px] uppercase tracking-wider" style={{ color: theme.world.accent }}>
                {isDone ? 'concluído' : 'progresso'}
              </span>
              <span className="font-pixel text-[13px] text-ember-200 tabular-nums">{preview}%</span>
            </div>
            <div className="lw-xp h-2.5">
              <div
                className="lw-xp-fill"
                style={{
                  width: `${preview}%`,
                  backgroundImage: `linear-gradient(90deg, ${theme.world.roofShade}, ${theme.world.accent})`,
                  animation: 'none',
                }}
              />
            </div>
            <p className="font-serif italic text-sm text-slate-500">
              {isDone
                ? total
                  ? `${total} páginas vividas`
                  : 'história fechada'
                : pagesLeft === null
                  ? 'este livro não tem contagem de páginas no acervo'
                  : pagesLeft === 0
                    ? 'a última página está a um marcador de distância'
                    : `faltam ${pagesLeft} páginas`}
            </p>
          </div>

          {isDone ? (
            <button onClick={reopenBook} disabled={submitting} className="lw-btn lw-btn-ghost w-full">
              {submitting ? 'reabrindo...' : 'reabrir leitura'}
            </button>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="page-input" className="font-sans text-sm text-slate-400 block">
                  em que página você parou hoje?
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => nudge(-1)}
                    disabled={submitting || page <= 0}
                    aria-label="uma página a menos"
                    className="lw-btn lw-btn-ghost h-11 w-11 !px-0 text-lg"
                  >
                    −
                  </button>
                  <input
                    id="page-input"
                    autoFocus
                    type="number"
                    min={0}
                    max={total || undefined}
                    value={page}
                    onChange={event => {
                      setError(null)
                      const parsed = Number(event.target.value)
                      setPage(Number.isFinite(parsed) ? Math.max(0, parsed) : 0)
                    }}
                    onKeyDown={event => event.key === 'Enter' && changed && saveProgress()}
                    className="lw-field text-center tabular-nums text-lg"
                  />
                  <button
                    onClick={() => nudge(1)}
                    disabled={submitting || (total > 0 && page >= total)}
                    aria-label="uma página a mais"
                    className="lw-btn lw-btn-ghost h-11 w-11 !px-0 text-lg"
                  >
                    +
                  </button>
                </div>

                {total > 0 && (
                  <input
                    type="range"
                    min={0}
                    max={total}
                    value={Math.min(page, total)}
                    onChange={event => setPage(Number(event.target.value))}
                    className="w-full accent-ember-400 cursor-pointer"
                    aria-label="arrastar até a página"
                  />
                )}

                <div className="flex flex-wrap gap-1.5">
                  {QUICK_STEPS.map(step => (
                    <button
                      key={step}
                      onClick={() => nudge(step)}
                      disabled={submitting || (total > 0 && page >= total)}
                      className="font-sans text-xs px-2.5 py-1.5 rounded-md border border-ink-700 text-slate-400
                                 hover:border-ember-400/50 hover:text-ember-100 hover:bg-ember-400/5
                                 transition-all duration-200 disabled:opacity-40"
                    >
                      +{step}
                    </button>
                  ))}
                  {total > 0 && (
                    <button
                      onClick={() => setPage(total)}
                      disabled={submitting || page >= total}
                      className="font-sans text-xs px-2.5 py-1.5 rounded-md border border-quest-400/40 text-quest-400
                                 hover:bg-quest-500/10 transition-all duration-200 disabled:opacity-40"
                    >
                      última página
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveProgress}
                  disabled={submitting || !changed}
                  className="lw-btn lw-btn-primary lw-sheen grow disabled:!opacity-40 disabled:!cursor-not-allowed"
                >
                  {submitting ? 'guardando...' : changed ? 'guardar marcador' : 'sem mudança'}
                </button>
                <button onClick={finishBook} disabled={submitting} className="lw-btn lw-btn-ghost">
                  terminei
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <p className="font-sans text-sm text-danger-400 text-center mt-4">{error}</p>}
    </Modal>
  )
}
