import { useState } from 'react'
import { AuthScene } from './AuthScene'
import { Brand } from './Brand'
import { useAuth } from './AuthContext'

export function LoginPage({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const failure = await login(email, password)
    setSubmitting(false)
    if (failure) setError(failure.message)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthScene
        quote="Um leitor vive mil vidas antes de morrer. O homem que nunca lê vive apenas uma."
        author="George R. R. Martin"
      />

      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="lg:hidden">
          <AuthSceneBackdrop />
        </div>

        <div className="w-full max-w-md space-y-9 lw-rise">
          <Brand tagline="todo mundo começa com uma página em branco" />

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="font-sans text-xs text-slate-500 uppercase tracking-wider">
                e-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                className="lw-field"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="font-sans text-xs text-slate-500 uppercase tracking-wider">
                senha
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
                className="lw-field"
              />
            </div>

            {error && (
              <p role="alert" className="lw-fade-in font-sans text-sm text-danger-400 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="lw-btn lw-btn-primary lw-sheen w-full !py-3.5"
            >
              {submitting ? 'abrindo o livro...' : 'entrar'}
            </button>
          </form>

          <p className="text-center text-base text-slate-500 font-sans">
            primeira vez aqui?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-ember-200 hover:text-ember-100 underline underline-offset-4 decoration-ember-400/40"
            >
              começar minha história
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

/** No celular não cabe a cena inteira — só o céu dela. */
function AuthSceneBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-b from-ink-950 via-ink-900 to-[#1b1640]" aria-hidden="true" />
  )
}
