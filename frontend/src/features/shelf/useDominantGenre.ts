import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

const API_URL = 'http://localhost:8080'

export function useDominantGenre(): string | null {
  const { user } = useAuth()
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetch(`${API_URL}/users/${user.username}/world`)
      .then(async r => {
        if (!r.ok) return
        const world = await r.json()
        if (world.genres?.length > 0) {
          setSlug(world.genres[0].slug)
        }
      })
      .catch(() => {})
  }, [user])

  return slug
}