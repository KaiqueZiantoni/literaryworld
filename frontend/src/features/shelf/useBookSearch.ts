import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { SearchResult } from '../../api/types'

const MIN_QUERY = 3
const DEBOUNCE_MS = 420

/**
 * Busca com debounce e cancelamento: a resposta de uma consulta antiga nunca
 * sobrescreve a da consulta atual, que é o que fazia a lista "pular" ao digitar.
 */
export function useBookSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const term = query.trim()
    if (term.length < MIN_QUERY) {
      setResults([])
      setError(null)
      setSearching(false)
      return
    }

    let cancelled = false
    setSearching(true)

    const timeout = setTimeout(async () => {
      setError(null)
      try {
        const response = await api(`/catalog/search?q=${encodeURIComponent(term)}`)
        if (cancelled) return

        if (response.ok) {
          const data = await response.json()
          setResults(data.results ?? [])
        } else if (response.status === 503) {
          setError('a busca está fora do ar por um instante — tente de novo')
          setResults([])
        } else {
          setError('não foi possível buscar agora')
          setResults([])
        }
      } catch {
        if (!cancelled) {
          setError('o servidor não respondeu')
          setResults([])
        }
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  return { results, searching, error }
}
