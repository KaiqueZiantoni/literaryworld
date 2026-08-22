import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { ShelfItem } from '../../api/types'

export function useShelf() {
  const [items, setItems] = useState<ShelfItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    const response = await api('/shelf')
    if (response.ok) {
      setItems(await response.json())
    } else {
      setError('não foi possível carregar sua estante')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { items, loading, error, reload }
}