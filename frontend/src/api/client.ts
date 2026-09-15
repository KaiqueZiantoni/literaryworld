export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

let accessToken: string | null = null

/** Um refresh em voo por vez: várias 401 simultâneas compartilham a mesma rotação. */
let refreshInFlight: Promise<boolean> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        setAccessToken(null)
        return false
      }

      const data = await response.json()
      setAccessToken(data.accessToken)
      return true
    } catch {
      setAccessToken(null)
      return false
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export async function api(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' })

  // Access token expirou? Rotaciona UMA vez e repete a requisição original.
  if (response.status === 401 && accessToken) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers.set('Authorization', `Bearer ${getAccessToken()}`)
      response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' })
    }
  }

  return response
}

/** Mensagem de erro do backend, já achatada — o cliente nunca precisa cavar o JSON. */
export async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json()
    if (body?.fields) {
      const messages = Object.values(body.fields as Record<string, string>)
      if (messages.length > 0) return messages.join(' · ')
    }
    return body?.message ?? fallback
  } catch {
    return fallback
  }
}
