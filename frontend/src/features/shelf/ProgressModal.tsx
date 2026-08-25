import { useState } from 'react'
import { api } from '../../api/client'
import type { ShelfItem } from '../../api/types'

interface Props {
  item: ShelfItem
  onClose: () => void
  onUpdated: () => void
}

export function ProgressModal({ item, onClose, onUpdated }: Props) {
  const [page, setPage] = useState(item.currentPage > 0 ? String(item.currentPage) : '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isDone = item.status === 'LIDO'

  async function updateProgress() {
    const pageNumber = Number(page)
    if (!page.trim() || isNaN(pageNumber) || pageNumber < 0) {
      setError('digite um número de página válido')
      return
    }
    setSubmitting(true)
    setError(null)

    const response = await api(`/shelf/${item.id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ page: pageNumber }),
    })

    setSubmitting(false)
    if (!response.ok) {
      setError('não foi possível salvar o progresso')
      return
    }

    onUpdated()
    onClose()
  }

  async function finishBook() {
    setSubmitting(true)
    setError(null)

    const response = await api(`/shelf/${item.id}/finish`, { method: 'POST' })

    setSubmitting(false)
    if (!response.ok) {
      setError('não foi possível concluir a leitura')
      return
    }

    onUpdated()
    onClose()
  }

  async function reopenBook() {
    setSubmitting(true)
    setError(null)

    const response = await api(`/shelf/${item.id}/reopen`, { method: 'POST' })

    setSubmitting(false)
    if (!response.ok) {
      setError('não foi possível reabrir a leitura')
      return
    }

    onUpdated()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg text-amber-100 tracking-wide truncate">{item.title}</h2>
            <p className="font-sans text-sm text-slate-500 truncate">{item.authors}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 font-sans text-sm shrink-0">
            fechar
          </button>
        </div>

        {isDone ? (
          <div className="space-y-4">
            <p className="font-serif italic text-emerald-400/90">
              história concluída
              {item.pageCount ? ` — ${item.pageCount} páginas vividas` : ''}
            </p>
            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={reopenBook}
                disabled={submitting}
                className="w-full rounded-lg border border-amber-400/50 text-amber-300 font-sans font-medium py-2.5
                           hover:bg-amber-400/10 hover:border-amber-400 hover:text-amber-200
                           shadow-[0_0_12px_rgba(251,191,36,0.08)]
                           transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? 'reabrindo...' : 'reabrir leitura'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="font-sans text-sm text-slate-400">
                em que página você parou hoje?
                {item.pageCount ? <span className="text-slate-600"> (de {item.pageCount})</span> : ''}
              </label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="number"
                  min={0}
                  placeholder={String(item.currentPage)}
                  value={page}
                  onChange={e => setPage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && updateProgress()}
                  className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-4 py-3 text-base text-slate-100 placeholder-slate-600
                             focus:outline-none focus:border-amber-400/40 font-sans"
                />
                <button
                  onClick={updateProgress}
                  disabled={submitting}
                  className="rounded-lg bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-sans font-medium px-5
                             transition-all duration-300 disabled:opacity-50"
                >
                  {submitting ? '...' : 'marcar'}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={finishBook}
                disabled={submitting}
                className="w-full font-sans text-sm text-slate-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
              >
                terminei este livro
              </button>
            </div>
          </>
        )}

        {error && <p className="font-sans text-sm text-red-400/90 text-center">{error}</p>}
      </div>
    </div>
  )
}