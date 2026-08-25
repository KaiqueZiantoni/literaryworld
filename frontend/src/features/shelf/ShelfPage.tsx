import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { api } from '../../api/client'
import { useShelf } from './useShelf'
import { BookCard } from './BookCard'
import { AddBookModal } from './AddBookModal'
import { ProgressModal } from './ProgressModal'
import { NightAmbience } from '../../components/NightAmbience'
import type { ShelfItem } from '../../api/types'
import { atmosphereFor } from '../../components/atmospheres'
import { useDominantGenre } from './useDominantGenre'

export function ShelfPage() {
  const { user, logout } = useAuth()
  const { items, loading, error, reload } = useShelf()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShelfItem | null>(null)
  const dominantGenre = useDominantGenre()
  console.log('>>> genero dominante:', dominantGenre)

  async function handleRemove(item: ShelfItem) {
    if (!confirm(`Tirar "${item.title}" da sua mesa? O histórico de leitura dele será apagado.`)) {
      return
    }
    const response = await api(`/shelf/${item.id}`, { method: 'DELETE' })
    if (response.ok || response.status === 204) {
      reload()
    } else {
      alert('não foi possível remover o livro — tente novamente')
    }
  }

  const bookmarkShape = { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)' }

  return (
    <div className="min-h-screen relative">
    <NightAmbience atmosphere={atmosphereFor(dominantGenre)} />
    
      <div className="relative">
        <header className="max-w-6xl mx-auto px-6 flex items-start justify-between">
          <h1 className="font-display text-2xl font-semibold text-amber-100 tracking-[0.14em] uppercase py-7
                         drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            Literary<span className="text-amber-400">World</span>
          </h1>

          {/* os marcadores de fita — pendem do topo do livro */}
          <nav className="flex items-start gap-4 font-sans">
            <Link
              to={`/u/${user?.username}`}
              className="group relative w-24 pt-6 pb-5 text-center
               bg-gradient-to-b from-amber-500/90 to-amber-400/80 text-slate-950
               shadow-[0_4px_24px_rgba(251,191,36,0.35)]
               hover:from-amber-400 hover:to-amber-300 hover:translate-y-2
               hover:shadow-[0_6px_32px_rgba(251,191,36,0.5)]
               transition-all duration-300"
              style={bookmarkShape}
            >
              <span className="font-display text-[13px] font-semibold tracking-[0.12em] uppercase">
                meu<br />mundo
              </span>
            </Link>

            <button
              onClick={logout}
              className="group relative w-20 pt-6 pb-5 text-center bg-slate-800/50 text-slate-500
               hover:bg-red-950/70 hover:text-red-300 hover:translate-y-1.5
               hover:shadow-[0_4px_20px_rgba(239,68,68,0.25)]
               transition-all duration-300"
              style={bookmarkShape}
            >
              <span className="font-sans text-[12px] tracking-wider">sair</span>
            </button>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-sm text-slate-500 tracking-wide">ex libris</span>
                <span className="h-px w-8 bg-slate-700" />
                <span className="font-serif text-sm text-amber-200/70 tracking-wide">@{user?.username}</span>
              </div>
              <h2 className="font-display text-4xl text-amber-100 tracking-wide
                 drop-shadow-[0_0_30px_rgba(251,191,36,0.15)]">
                Minha Mesa
              </h2>
              <p className="font-serif italic text-lg text-slate-400">
                {items.length === 0 && !loading
                  ? 'toda biblioteca começa com um primeiro livro'
                  : `${items.length} ${items.length === 1 ? 'história' : 'histórias'} sob a luz`}
              </p>
              <span className="block h-px w-24 bg-gradient-to-r from-amber-400/60 to-transparent" />
            </div>
            <button
              className="rounded-lg bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-sans font-medium px-6 py-3
                         shadow-[0_0_24px_rgba(251,191,36,0.25)] hover:shadow-[0_0_40px_rgba(251,191,36,0.45)]
                         hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => setShowAddModal(true)}
            >
              Buscar livro
            </button>
          </div>

          {loading && <p className="font-serif italic text-slate-500 animate-pulse">Abrindo a estante...</p>}
          {error && <p className="font-sans text-red-400/90">{error}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map(item => (
              <BookCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                onRemove={() => handleRemove(item)}
              />
            ))}
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddBookModal
          onClose={() => setShowAddModal(false)}
          onAdded={reload}
        />
      )}

      {selectedItem && (
        <ProgressModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdated={reload}
        />
      )}
    </div>
  )
}