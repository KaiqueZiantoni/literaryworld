import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import type { ReadingStatus, ShelfItem } from '../../api/types'
import { NightAmbience } from '../../components/NightAmbience'
import { nightFor, themeFor } from '../../theme/genres'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { ShelfSkeleton } from '../../ui/Skeleton'
import { useToast } from '../../ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { AddBookModal } from './AddBookModal'
import { BookCard } from './BookCard'
import { ProgressModal } from './ProgressModal'
import { useShelf } from './useShelf'

type Filter = 'TODOS' | ReadingStatus

const FILTERS: [Filter, string][] = [
  ['TODOS', 'tudo'],
  ['LENDO', 'lendo'],
  ['QUERO_LER', 'quero ler'],
  ['LIDO', 'lidos'],
  ['ABANDONADO', 'largados'],
]

export function ShelfPage() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const { items, loading, error, reload, applyItem, dropItem, stats } = useShelf()

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShelfItem | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<ShelfItem | null>(null)
  const [filter, setFilter] = useState<Filter>('TODOS')

  const theme = themeFor(stats.dominantGenre)

  const visible = useMemo(
    () => (filter === 'TODOS' ? items : items.filter(item => item.status === filter)),
    [items, filter],
  )

  const counts = useMemo(() => {
    const byStatus = new Map<Filter, number>([['TODOS', items.length]])
    for (const item of items) {
      byStatus.set(item.status, (byStatus.get(item.status) ?? 0) + 1)
    }
    return byStatus
  }, [items])

  async function confirmRemoval() {
    const item = pendingRemoval
    if (!item) return

    // some da tela primeiro; só volta se o servidor recusar
    dropItem(item.id)
    setPendingRemoval(null)

    try {
      const response = await api(`/shelf/${item.id}`, { method: 'DELETE' })
      if (response.ok || response.status === 204) {
        toast.success(`"${item.title}" saiu da mesa`)
      } else {
        applyItem(item)
        toast.error('não foi possível remover o livro')
      }
    } catch {
      applyItem(item)
      toast.error('o servidor não respondeu — o livro continua na mesa')
    }
  }

  return (
    <div className="min-h-screen relative">
      <NightAmbience palette={nightFor(stats.dominantGenre)} seed={user?.username ?? 'mesa'} moonAt="none" dim={0.58} />

      <header className="max-w-6xl mx-auto px-6 flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ember-100 tracking-[0.14em] uppercase py-7
                       drop-shadow-[0_0_20px_rgba(251,191,36,0.25)]">
          Literary<span className="text-ember-400">World</span>
        </h1>

        {/* os marcadores de fita — pendem do topo da página como de um livro */}
        <nav className="flex items-start gap-3 font-sans">
          <Link
            to={`/u/${user?.username}`}
            className="group w-24 pt-6 pb-5 text-center text-ink-950
                       hover:translate-y-2 hover:brightness-110 transition-all duration-300
                       shadow-[0_6px_24px_-6px_rgba(0,0,0,0.8)]"
            style={{
              background: `linear-gradient(180deg, ${theme.world.accent}, ${theme.world.roof})`,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)',
            }}
          >
            <span className="font-pixel text-[8px] leading-[1.6] uppercase">
              meu<br />mundo
            </span>
          </Link>

          <button
            onClick={logout}
            className="w-20 pt-6 pb-5 text-center bg-ink-800/70 text-slate-500
                       hover:bg-danger-400/20 hover:text-danger-400 hover:translate-y-1.5
                       transition-all duration-300"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)' }}
          >
            <span className="font-pixel text-[8px] uppercase">sair</span>
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20 space-y-8">
        {/* ─── O cabeçalho da mesa, com o placar do leitor ─── */}
        <section className="lw-rise flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-sm text-slate-500">ex libris</span>
              <span className="h-px w-8 bg-ink-700" />
              <span className="font-serif text-sm text-ember-200/80">@{user?.username}</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl text-ember-100 tracking-wide
                           drop-shadow-[0_0_30px_rgba(251,191,36,0.18)]">
              Minha Mesa
            </h2>
            <p className="font-serif italic text-lg text-slate-400">
              {loading
                ? 'acendendo a luminária...'
                : items.length === 0
                  ? 'toda biblioteca começa com um primeiro livro'
                  : `${items.length} ${items.length === 1 ? 'história' : 'histórias'} sob a luz`}
            </p>
            <span
              className="block h-px w-28"
              style={{ background: `linear-gradient(to right, ${theme.world.accent}, transparent)` }}
            />
          </div>

          <div className="flex items-stretch gap-2.5">
            <StatTile label="lendo" value={stats.reading} color={theme.world.accent} />
            <StatTile label="lidos" value={stats.finished} color="#4ade80" />
            <StatTile label="páginas" value={stats.pages} color="#22d3ee" />
            <button
              onClick={() => setShowAddModal(true)}
              className="lw-btn lw-btn-primary lw-sheen px-6 self-stretch"
            >
              + livro
            </button>
          </div>
        </section>

        {/* ─── Os filtros de status ─── */}
        {items.length > 0 && (
          <nav className="flex flex-wrap gap-2 lw-rise">
            {FILTERS.map(([value, label]) => {
              const count = counts.get(value) ?? 0
              if (value !== 'TODOS' && count === 0) return null
              const active = filter === value
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`font-sans text-sm px-3.5 py-1.5 rounded-full border transition-all duration-200
                              ${active
                                ? 'bg-ember-400 border-ember-400 text-ink-950 font-semibold'
                                : 'border-ink-700 text-slate-400 hover:text-slate-200 hover:border-ink-600'}`}
                >
                  {label}
                  <span className={`ml-2 tabular-nums ${active ? 'text-ink-950/70' : 'text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </nav>
        )}

        {error && (
          <div className="lw-panel rounded-xl p-5 flex items-center justify-between gap-4">
            <p className="font-sans text-danger-400">{error}</p>
            <button onClick={reload} className="lw-btn lw-btn-ghost">tentar de novo</button>
          </div>
        )}

        {loading ? (
          <ShelfSkeleton />
        ) : items.length === 0 ? (
          <EmptyShelf onAdd={() => setShowAddModal(true)} accent={theme.world.accent} />
        ) : (
          <div
            key={filter}
            className="lw-stagger grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
          >
            {visible.map(item => (
              <BookCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                onRemove={() => setPendingRemoval(item)}
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddBookModal
          shelf={items}
          onClose={() => setShowAddModal(false)}
          onAdded={applyItem}
        />
      )}

      {selectedItem && (
        <ProgressModal
          item={items.find(item => item.id === selectedItem.id) ?? selectedItem}
          onClose={() => setSelectedItem(null)}
          onApply={applyItem}
        />
      )}

      {pendingRemoval && (
        <ConfirmDialog
          tone="danger"
          title="tirar da mesa?"
          message={`"${pendingRemoval.title}" sai da estante e o histórico de leitura dele é apagado. Se estava lido, o placar do seu mundo também recua.`}
          confirmLabel="tirar da mesa"
          onConfirm={confirmRemoval}
          onCancel={() => setPendingRemoval(null)}
        />
      )}
    </div>
  )
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="lw-panel rounded-xl px-4 py-3 min-w-[5.5rem] text-center">
      <p className="font-pixel text-[15px] tabular-nums leading-none" style={{ color }}>
        {value > 9999 ? `${Math.round(value / 1000)}k` : value}
      </p>
      <p className="font-sans text-[11px] text-slate-500 mt-2 uppercase tracking-wider">{label}</p>
    </div>
  )
}

function EmptyShelf({ onAdd, accent }: { onAdd: () => void; accent: string }) {
  return (
    <div className="lw-panel rounded-2xl py-20 px-6 text-center space-y-5 lw-rise">
      <svg width="96" height="96" viewBox="0 0 48 48" className="mx-auto lw-pixel lw-bob" aria-hidden="true">
        <rect x="8" y="10" width="14" height="28" fill="#24304f" />
        <rect x="10" y="12" width="10" height="24" fill="#38476c" />
        <rect x="26" y="10" width="14" height="28" fill={accent} opacity="0.85" />
        <rect x="28" y="12" width="10" height="24" fill="#0a0d1c" opacity="0.35" />
        <rect x="6" y="38" width="36" height="4" fill="#2b2314" />
        <rect x="22" y="4" width="4" height="6" fill={accent} />
      </svg>
      <div className="space-y-1.5">
        <p className="font-pixel text-[11px] text-slate-500">ESTANTE VAZIA</p>
        <p className="font-serif italic text-xl text-slate-300">
          nenhuma história aqui ainda — e todo mundo começa assim
        </p>
        <p className="font-sans text-sm text-slate-500">
          cada livro concluído ergue uma região nova no seu mundo explorável
        </p>
      </div>
      <button onClick={onAdd} className="lw-btn lw-btn-primary lw-sheen">buscar o primeiro livro</button>
    </div>
  )
}
