import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Genre, SearchResult, ReadingStatus } from '../../api/types'
import { useBookSearch } from './useBookSearch'

interface Props {
    onClose: () => void
    onAdded: () => void
}

export function AddBookModal({ onClose, onAdded }: Props) {
    const [query, setQuery] = useState('')
    const { results, searching, error: searchError } = useBookSearch(query)

    const [selected, setSelected] = useState<SearchResult | null>(null)
    const [genres, setGenres] = useState<Genre[]>([])
    const [chosenGenres, setChosenGenres] = useState<Set<number>>(new Set())
    const [status, setStatus] = useState<ReadingStatus>('QUERO_LER')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        api('/catalog/genres').then(async r => {
            if (r.ok) setGenres(await r.json())
        })
    }, [])

    function toggleGenre(id: number) {
        setChosenGenres(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else if (next.size < 5) {
                next.add(id)
            }
            return next
        })
    }

    async function handleAdd() {
        if (!selected || chosenGenres.size === 0) {
            setSubmitError('escolha pelo menos um gênero')
            return
        }
        setSubmitting(true)
        setSubmitError(null)

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
            setSubmitError('não foi possível cadastrar o livro')
            setSubmitting(false)
            return
        }

        const book = await bookResponse.json()

        const shelfResponse = await api('/shelf', {
            method: 'POST',
            body: JSON.stringify({ bookId: book.id, status }),
        })

        setSubmitting(false)

        if (!shelfResponse.ok) {
            setSubmitError('livro cadastrado, mas não foi possível adicionar à estante')
            return
        }

        onAdded()
        onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl text-amber-100 tracking-wide">
                        {selected ? 'quase lá' : 'buscar livro'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 font-sans text-sm">
                        fechar
                    </button>
                </div>

                {!selected ? (
                    <>
                        <input
                            autoFocus
                            type="text"
                            placeholder="título, autor..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-3 text-base text-slate-100 placeholder-slate-500
                         focus:outline-none focus:border-amber-400/40 font-sans"
                        />

                        {searching && <p className="font-serif italic text-slate-500 animate-pulse">procurando nas estantes do mundo...</p>}
                        {searchError && <p className="font-sans text-sm text-red-400/90">{searchError}</p>}
                        {!searching && !searchError && query.trim().length >= 3 && results.length === 0 && (
                            <div className="text-center py-6 space-y-1">
                                <p className="font-serif italic text-slate-400">nenhuma história encontrada para "{query.trim()}"</p>
                                <p className="font-sans text-sm text-slate-600">confere a grafia — ou tenta buscar só pelo autor</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            {results.map(book => (
                                <button
                                    key={book.googleBooksId}
                                    onClick={() => setSelected(book)}
                                    className="w-full text-left flex gap-3 items-center p-3 rounded-lg border border-slate-800
                             hover:border-amber-400/40 hover:bg-slate-800/50 transition-all"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-sans text-[15px] text-slate-100 truncate">{book.title}</p>
                                        <p className="font-sans text-sm text-slate-500 truncate">
                                            {book.authors}
                                            {book.pageCount > 0 && ` · ${book.pageCount} págs`}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                            <p className="font-sans text-[15px] text-slate-100">{selected.title}</p>
                            <p className="font-sans text-sm text-slate-500">
                                {selected.authors}
                                {selected.pageCount > 0 && ` · ${selected.pageCount} páginas`}
                            </p>
                            <button
                                onClick={() => { setSelected(null); setChosenGenres(new Set()) }}
                                className="font-sans text-sm text-amber-200/80 hover:text-amber-100 mt-2"
                            >
                                escolher outro
                            </button>
                        </div>

                        <div className="space-y-2">
                            <p className="font-sans text-sm text-slate-400">
                                quais gêneros contam essa história? <span className="text-slate-600">(até 5)</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {genres.map(genre => {
                                    const active = chosenGenres.has(genre.id)
                                    return (
                                        <button
                                            key={genre.id}
                                            onClick={() => toggleGenre(genre.id)}
                                            className={`font-sans text-sm px-3.5 py-1.5 rounded-full border transition-all duration-200 ${active
                                                    ? 'bg-amber-400/90 text-slate-950 border-amber-400 font-medium'
                                                    : 'bg-transparent text-slate-400 border-slate-700 hover:border-amber-400/40 hover:text-slate-200'
                                                }`}
                                        >
                                            {genre.name}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="font-sans text-sm text-slate-400">como começa essa relação?</p>
                            <div className="flex gap-2">
                                {([['QUERO_LER', 'quero ler'], ['LENDO', 'já estou lendo'], ['LIDO', 'já li']] as [ReadingStatus, string][]).map(([value, label]) => (
                                    <button
                                        key={value}
                                        onClick={() => setStatus(value)}
                                        className={`font-sans text-sm px-3.5 py-2 rounded-lg border transition-all duration-200 ${status === value
                                                ? 'bg-slate-800 text-amber-100 border-amber-400/40'
                                                : 'bg-transparent text-slate-500 border-slate-800 hover:text-slate-300'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {submitError && <p className="font-sans text-sm text-red-400/90">{submitError}</p>}

                        <button
                            onClick={handleAdd}
                            disabled={submitting}
                            className="w-full rounded-lg bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-sans font-medium py-3
                         shadow-[0_0_24px_rgba(251,191,36,0.2)] transition-all duration-300
                         disabled:opacity-50 disabled:cursor-wait"
                        >
                            {submitting ? 'colocando na estante...' : 'adicionar à minha mesa'}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}