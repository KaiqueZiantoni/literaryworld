import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { SearchResult } from '../../api/types'

export function useBookSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)
      setError(null)

      const response = await api(`/catalog/search?q=${encodeURIComponent(query.trim())}`)

      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      } else if (response.status === 503) {
        setError('a busca está temporariamente indisponível — tente de novo em instantes')
      } else {
        setError('não foi possível buscar agora')
      }

      setSearching(false)
    }, 500)

    return () => clearTimeout(timeout)
  }, [query])

  return { results, searching, error }
}