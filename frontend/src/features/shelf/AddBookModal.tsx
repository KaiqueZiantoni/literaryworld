import { useEffect, useMemo, useState } from 'react'
import { api, errorMessage } from '../../api/client'
import type { Genre, ReadingStatus, SearchResult, ShelfItem } from '../../api/types'
import { themeFor } from '../../theme/genres'
import { Modal } from '../../ui/Modal'
import { Skeleton } from '../../ui/Skeleton'
import { useToast } from '../../ui/Toast'
import { BookCover } from './BookCover'
import { useBookSearch } from './useBookSearch'

interface Props {
  onClose: () => void
  onAdded: (item: ShelfItem) => void
  /** Títulos já na estante — a busca marca o que o leitor já tem. */
  shelf: ShelfItem[]
}

const STATUS_OPTIONS: [ReadingStatus, string][] = [
  ['QUERO_LER', 'quero ler'],
  ['LENDO', 'já estou lendo'],
  ['LIDO', 'já li'],
]

const MAX_GENRES = 5

export function AddBookModal({ onClose, onAdded, shelf }: Props) {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const { results, searching, error: searchError } = useBookSearch(query)

  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])
  const [chosenGenres, setChosenGenres] = useState<Set<number>>(new Set())
  const [status, setStatus] = useState<ReadingStatus>('QUERO_LER')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    api('/catalog/genres')
      .then(async response => {
        if (response.ok) setGenres(await response.json())
      })
      .catch(() => setSubmitError('não foi possível carregar os gêneros'))
  }, [])

  // o mesmo livro pode voltar da Google Books com títulos ligeiramente diferentes;
  // a comparação normalizada é o que basta para avisar o leitor
  const shelfTitles = useMemo(
    () => new Set(shelf.map(item => item.title.trim().toLowerCase())),
    [shelf],
  )

  function toggleGenre(id: number) {
    setSubmitError(null)
    setChosenGenres(previous => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_GENRES) next.add(id)
      return next
    })
  }

  async function handleAdd() {
    if (!selected) return
    if (chosenGenres.size === 0) {
      setSubmitError('escolha pelo menos um gênero — é ele que ergue a região no seu mundo')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const bookResponse = await api('/catalog/books', {
        method: 'POST',
        body: JSON.stringify({
          googleBooksId: selected.googleBooksId,
          title: selected.title,
          authors: selected.authors,
          pageCount: selected.pageCount > 0 ? selected.pageCount : null,
          coverUrl: selected.coverUrl || null,
          genreIds: [...chosenGenres],
        }),
      })

      if (!bookResponse.ok) {
        setSubmitError(await errorMessage(bookResponse, 'não foi possível cadastrar o livro'))
        return
      }

      const book = await bookResponse.json()

      const shelfResponse = await api('/shelf', {
        method: 'POST',
        body: JSON.stringify({ bookId: book.id, status }),
      })

      if (!shelfResponse.ok) {
        setSubmitError(await errorMessage(shelfResponse, 'o livro entrou no acervo, mas não na sua mesa'))
        return
      }

      const { item, alreadyOnShelf } = await shelfResponse.json()
      onAdded(item)

      if (alreadyOnShelf) toast.info(`"${item.title}" já estava na sua mesa`)
      else toast.success(`"${item.title}" chegou à sua mesa`)

      onClose()
    } catch {
      setSubmitError('o servidor não respondeu — tente de novo')
    } finally {
      setSubmitting(false)
    }
  }

  const showEmptyState = !searching && !searchError && query.trim().length >= 3 && results.length === 0

  return (
    <Modal
      onClose={onClose}
      size="lg"
      align="top"
      title={selected ? 'quase lá' : 'buscar livro'}
      subtitle={selected ? 'gênero e ponto de partida' : 'título, autor, série...'}
      footer={
        selected ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelected(null)
                setChosenGenres(new Set())
                setSubmitError(null)
              }}
              disabled={submitting}
              className="lw-btn lw-btn-ghost"
            >
              voltar
            </button>
            <button
              onClick={handleAdd}
              disabled={submitting}
              className="lw-btn lw-btn-primary lw-sheen grow"
            >
              {submitting ? 'colocando na estante...' : 'adicionar à minha mesa'}
            </button>
          </div>
        ) : undefined
      }
    >
      {!selected ? (
        <div className="space-y-4">
          <input
            autoFocus
            type="text"
            placeholder="o nome da história que você procura"
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="lw-field"
          />

          {searching && (
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex gap-3 items-center p-3 rounded-xl border border-ink-800">
                  <Skeleton className="h-16 w-11 rounded" />
                  <div className="grow space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchError && <p className="font-sans text-sm text-danger-400">{searchError}</p>}

          {showEmptyState && (
            <div className="text-center py-8 space-y-1.5">
              <p className="font-pixel text-[10px] text-slate-500">SEM RESULTADO</p>
              <p className="font-serif italic text-slate-400">
                nada encontrado para "{query.trim()}"
              </p>
              <p className="font-sans text-sm text-slate-600">confira a grafia — ou busque só pelo autor</p>
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-2">
              {results.map(book => {
                const owned = shelfTitles.has(book.title.trim().toLowerCase())
                return (
                  <button
                    key={book.googleBooksId}
                    onClick={() => setSelected(book)}
                    className="w-full text-left flex gap-3 items-center p-2.5 rounded-xl border border-ink-800
                               hover:border-ember-400/45 hover:bg-ember-400/5 hover:translate-x-1
                               transition-all duration-200"
                  >
                    <BookCover
                      title={book.title}
                      authors={book.authors}
                      coverUrl={book.coverUrl}
                      variant="chip"
                      className="h-16 w-11 shrink-0 rounded"
                    />
                    <div className="grow min-w-0">
                      <p className="font-sans text-[15px] text-slate-100 truncate">{book.title}</p>
                      <p className="font-sans text-sm text-slate-500 truncate">
                        {book.authors}
                        {book.pageCount > 0 && ` · ${book.pageCount} págs`}
                      </p>
                    </div>
                    {owned && (
                      <span className="shrink-0 font-pixel text-[7px] uppercase px-2 py-1.5 rounded
                                       border border-quest-400/40 text-quest-400 bg-quest-500/10">
                        na mesa
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4 p-3 rounded-xl bg-ink-950/60 border border-ink-800">
            <BookCover
              title={selected.title}
              authors={selected.authors}
              coverUrl={selected.coverUrl}
              className="h-28 w-20 shrink-0 rounded-lg shadow-xl"
            />
            <div className="min-w-0 grow">
              <p className="font-sans text-base text-slate-100 leading-snug">{selected.title}</p>
              <p className="font-sans text-sm text-slate-500 mt-1">{selected.authors}</p>
              {selected.pageCount > 0 && (
                <p className="font-sans text-sm text-slate-600 mt-0.5">{selected.pageCount} páginas</p>
              )}
              {shelfTitles.has(selected.title.trim().toLowerCase()) && (
                <p className="font-serif italic text-sm text-ember-300/90 mt-2">
                  um livro com este título já está na sua mesa
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="font-sans text-sm text-slate-400">
              quais gêneros contam essa história?{' '}
              <span className="text-slate-600">({chosenGenres.size}/{MAX_GENRES})</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => {
                const active = chosenGenres.has(genre.id)
                const accent = themeFor(genre.slug).world.accent
                return (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className="font-sans text-sm px-3.5 py-1.5 rounded-full border transition-all duration-200
                               hover:-translate-y-0.5"
                    style={
                      active
                        ? { backgroundColor: accent, borderColor: accent, color: '#0a0d1c', fontWeight: 600 }
                        : { borderColor: '#24304f', color: '#94a3b8' }
                    }
                  >
                    {genre.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="font-sans text-sm text-slate-400">como começa essa relação?</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`font-sans text-sm px-4 py-2 rounded-lg border transition-all duration-200 ${
                    status === value
                      ? 'bg-ink-800 text-ember-100 border-ember-400/50'
                      : 'bg-transparent text-slate-500 border-ink-800 hover:text-slate-300 hover:border-ink-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {submitError && <p className="font-sans text-sm text-danger-400">{submitError}</p>}
        </div>
      )}
    </Modal>
  )
}
