import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, setAccessToken } from '../../api/client'

interface User {
  id: string
  username: string
  displayName: string
  bio: string | null
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  register: (username: string, displayName: string, email: string, password: string) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchMe() {
    const response = await api('/users/me')
    if (response.ok) {
      setUser(await response.json())
    }
  }

  // Ao abrir o app: tenta restaurar a sessão pelo cookie de refresh
  useEffect(() => {
    api('/auth/refresh', { method: 'POST' })
      .then(async r => {
        if (r.ok) {
          const data = await r.json()
          setAccessToken(data.accessToken)
          await fetchMe()
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string): Promise<string | null> {
    const response = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      return err?.message ?? 'erro ao entrar'
    }

    const data = await response.json()
    setAccessToken(data.accessToken)
    await fetchMe()
    return null
  }

  async function register(username: string, displayName: string, email: string, password: string): Promise<string | null> {
    const response = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, displayName, email, password }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      if (err?.fields) {
        return Object.values(err.fields).join(' · ')
      }
      return err?.message ?? 'erro ao registrar'
    }

    return login(email, password)
  }

  function logout() {
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}