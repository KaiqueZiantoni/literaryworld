import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import type { ShelfItem } from '../../api/types'

/**
 * A estante do leitor, em memória.
 *
 * Toda escrita (progresso, conclusão, remoção) devolve o item já recalculado pelo
 * backend — `applyItem` costura essa resposta na lista. O refetch da estante inteira
 * fica reservado para a primeira carga e para o botão de recarregar; é o que faz a
 * atualização de um livro parecer instantânea em vez de piscar a grade toda.
 */
export function useShelf() {
  const [items, setItems] = useState<ShelfItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      const response = await api('/shelf')
      if (response.ok) {
        setItems(await response.json())
      } else {
        setError('não foi possível carregar sua estante')
      }
    } catch {
      setError('o servidor não respondeu — ele está no ar?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  /** Substitui um item pelo que o backend devolveu; insere no topo se for novo. */
  const applyItem = useCallback((item: ShelfItem) => {
    setItems(current => {
      const index = current.findIndex(existing => existing.id === item.id)
      if (index === -1) return [item, ...current]
      const next = [...current]
      next[index] = item
      return next
    })
  }, [])

  const dropItem = useCallback((itemId: string) => {
    setItems(current => current.filter(item => item.id !== itemId))
  }, [])

  const stats = useMemo(() => {
    const finished = items.filter(item => item.status === 'LIDO')
    const reading = items.filter(item => item.status === 'LENDO')
    const pages = finished.reduce((total, item) => total + (item.pageCount ?? 0), 0)
      + reading.reduce((total, item) => total + item.currentPage, 0)

    // o gênero dominante pesa o livro concluído acima do que só está começando
    const weights = new Map<string, number>()
    for (const item of items) {
      if (!item.genreSlug) continue
      const weight = item.status === 'LIDO' ? 3 : item.status === 'LENDO' ? 2 : 1
      weights.set(item.genreSlug, (weights.get(item.genreSlug) ?? 0) + weight)
    }
    const dominantGenre = [...weights.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    return { total: items.length, finished: finished.length, reading: reading.length, pages, dominantGenre }
  }, [items])

  return { items, loading, error, reload, applyItem, dropItem, stats }
}
