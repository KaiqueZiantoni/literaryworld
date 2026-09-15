import { useMemo, useState } from 'react'
import { AuthScene } from './AuthScene'
import { Brand } from './Brand'
import { useAuth } from './AuthContext'

const MIN_PASSWORD = 12
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

/** Erros de digitação que quase sempre são um domínio conhecido escrito torto. */
const TYPO_HINTS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gnail.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'iclod.com': 'icloud.com',
}

function fieldLabel(field: string) {
  return field === 'displayName' ? 'nome de exibição' : field
}

export function RegisterPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const emailTypo = useMemo(() => {
    const domain = email.trim().toLowerCase().split('@')[1]
    return domain ? TYPO_HINTS[domain] ?? null : null
  }, [email])

  const emailLooksValid = EMAIL_SHAPE.test(email.trim())
  const passwordStrength = Math.min(100, Math.round((password.length / MIN_PASSWORD) * 100))
  const canSubmit =
    username.trim().length >= 3 &&
    displayName.trim().length >= 1 &&
    emailLooksValid &&
    password.length >= MIN_PASSWORD

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setFields({})
    setSubmitting(true)
    const failure = await register(username, displayName, email, password)
    setSubmitting(false)
    if (failure) {
      setError(failure.fields ? null : failure.message)
      setFields(failure.fields ?? {})
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthScene quote="Não existe amigo tão leal quanto um livro." author="Ernest Hemingway" />

      <div className="relative flex items-center justify-center px-6 py-14">
        <div className="fixed inset-0 -z-10 lg:hidden bg-gradient-to-b from-ink-950 via-ink-900 to-[#1b1640]" />

        <div className="w-full max-w-md space-y-8 lw-rise">
          <Brand tagline="capítulo um: quem é você?" />

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <Field
              id="register-username"
              label="username"
              hint="letras, números e underscore"
              error={fields.username}
            >
              <input
                id="register-username"
                type="text"
                autoComplete="username"
                placeholder="seu_nome"
                value={username}
                onChange={event => setUsername(event.target.value)}
                required
                className="lw-field"
              />
            </Field>

            <Field id="register-display" label="nome de exibição" error={fields.displayName}>
              <input
                id="register-display"
                type="text"
                autoComplete="name"
                placeholder="como o mundo te chama"
                value={displayName}
                onChange={event => setDisplayName(event.target.value)}
                required
                className="lw-field"
              />
            </Field>

            <Field
              id="register-email"
              label="e-mail"
              hint="precisa ser um endereço que exista de verdade"
              error={fields.email}
            >
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                className="lw-field"
              />
              {emailTypo && (
                <button
                  type="button"
                  onClick={() => setEmail(current => current.replace(/@.*$/, `@${emailTypo}`))}
                  className="font-sans text-xs text-ember-300 hover:text-ember-200 underline underline-offset-2"
                >
                  você quis dizer @{emailTypo}?
                </button>
              )}
            </Field>

            <Field id="register-password" label="senha" error={fields.password}>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder={`no mínimo ${MIN_PASSWORD} caracteres`}
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
                className="lw-field"
              />
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="lw-xp h-1.5">
                    <div
                      className="lw-xp-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundImage:
                          password.length >= MIN_PASSWORD
                            ? 'linear-gradient(90deg,#16a34a,#4ade80)'
                            : 'linear-gradient(90deg,#b45309,#fbbf24)',
                        animation: 'none',
                      }}
                    />
                  </div>
                  <p className="font-sans text-xs text-slate-500">
                    {password.length >= MIN_PASSWORD
                      ? 'comprimento suficiente — tamanho vale mais que símbolo'
                      : `faltam ${MIN_PASSWORD - password.length} caracteres`}
                  </p>
                </div>
              )}
            </Field>

            {error && (
              <p role="alert" className="lw-fade-in font-sans text-sm text-danger-400 text-center leading-relaxed">
                {error}
              </p>
            )}

            {Object.keys(fields).length > 0 && !error && (
              <p role="alert" className="lw-fade-in font-sans text-sm text-danger-400 text-center">
                confira {Object.keys(fields).map(fieldLabel).join(', ')}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="lw-btn lw-btn-primary lw-sheen w-full !py-3.5 disabled:!cursor-not-allowed"
            >
              {submitting ? 'escrevendo a primeira página...' : 'começar minha história'}
            </button>
          </form>

          <p className="text-center text-base text-slate-500 font-sans">
            já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-ember-200 hover:text-ember-100 underline underline-offset-4 decoration-ember-400/40"
            >
              entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-sans text-xs text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-sans text-xs text-danger-400 lw-fade-in">{error}</p>
      ) : hint ? (
        <p className="font-sans text-xs text-slate-600">{hint}</p>
      ) : null}
    </div>
  )
}
