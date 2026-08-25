import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../../api/client'
import { useShelf } from './useShelf'
import { BookCard } from './BookCard'
import { AddBookModal } from './AddBookModal'
import { ProgressModal } from './ProgressModal'
import type { ShelfItem } from '../../api/types'

export function ShelfPage() {
  const { user, logout } = useAuth()
  const { items, loading, error, reload } = useShelf()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShelfItem | null>(null)

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

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-900 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="font-display text-2xl font-semibold text-amber-100 tracking-[0.12em] uppercase">
          Literary<span className="text-amber-400">World</span>
        </h1>
        <div className="flex items-center gap-4 font-sans text-sm">
          <span className="text-slate-400">@{user?.username}</span>
          <button onClick={logout} className="text-slate-500 hover:text-slate-300 transition-colors">
            sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl text-amber-100 tracking-wide">Minha Mesa</h2>
            <p className="font-serif italic text-lg text-slate-400 mt-1">
              {items.length === 0 && !loading
                ? 'toda biblioteca começa com um primeiro livro'
                : `${items.length} ${items.length === 1 ? 'história' : 'histórias'} na estante`}
            </p>
          </div>
          <button
            className="rounded-lg bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-sans font-medium px-5 py-2.5
                       shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]
                       transition-all duration-300"
            onClick={() => setShowAddModal(true)}
          >
            buscar livro
          </button>
        </div>

        {loading && <p className="font-serif italic text-slate-500 animate-pulse">abrindo a estante...</p>}
        {error && <p className="font-sans text-red-400/90">{error}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
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