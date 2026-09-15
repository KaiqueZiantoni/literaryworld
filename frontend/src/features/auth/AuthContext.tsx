import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, setAccessToken } from '../../api/client'

interface User {
  id: string
  username: string
  displayName: string
  bio: string | null
  createdAt: string
}

/** Erro de autenticação já separado: a frase geral e, quando houver, o campo culpado. */
export interface AuthError {
  message: string
  fields?: Record<string, string>
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthError | null>
  register: (username: string, displayName: string, email: string, password: string) => Promise<AuthError | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const OFFLINE: AuthError = { message: 'o servidor não respondeu — ele está no ar?' }

async function toAuthError(response: Response, fallback: string): Promise<AuthError> {
  try {
    const body = await response.json()
    if (body?.fields) {
      const fields = body.fields as Record<string, string>
      return { message: Object.values(fields).join(' · '), fields }
    }
    return { message: body?.message ?? fallback }
  } catch {
    return { message: fallback }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const response = await api('/users/me')
    if (response.ok) setUser(await response.json())
  }, [])

  // Ao abrir o app: tenta restaurar a sessão pelo cookie de refresh
  useEffect(() => {
    api('/auth/refresh', { method: 'POST' })
      .then(async response => {
        if (!response.ok) return
        const data = await response.json()
        setAccessToken(data.accessToken)
        await fetchMe()
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [fetchMe])

  const login = useCallback(async (email: string, password: string): Promise<AuthError | null> => {
    try {
      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (!response.ok) {
        return await toAuthError(response, 'e-mail ou senha não conferem')
      }

      const data = await response.json()
      setAccessToken(data.accessToken)
      await fetchMe()
      return null
    } catch {
      return OFFLINE
    }
  }, [fetchMe])

  const register = useCallback(async (
    username: string,
    displayName: string,
    email: string,
    password: string,
  ): Promise<AuthError | null> => {
    try {
      const response = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          displayName: displayName.trim(),
          email: email.trim(),
          password,
        }),
      })

      if (!response.ok) {
        return await toAuthError(response, 'não foi possível criar a conta')
      }

      return login(email, password)
    } catch {
      return OFFLINE
    }
  }, [login])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return context
}
