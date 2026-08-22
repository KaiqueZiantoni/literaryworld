import { useState } from 'react'
import { useAuth } from './AuthContext'

export function LoginPage({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const err = await login(email, password)
    setSubmitting(false)
    if (err) setError(err)
  }

  return (
    <div className="min-h-screen bg-slate-950 grid lg:grid-cols-2">

      {/* ── A cena: noite, castelo, a luz de apoio ── */}
      <div className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#111827] to-[#1e1b2e]" />

        {/* a lua âmbar — a luz de apoio */}
        <div className="absolute top-24 right-32 h-24 w-24 rounded-full bg-amber-200/90
                        shadow-[0_0_80px_40px_rgba(251,191,36,0.25)]" />

        {/* estrelas */}
        <div className="absolute inset-0 opacity-60"
             style={{
               backgroundImage: 'radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 60% 15%, #fff, transparent), radial-gradient(1.5px 1.5px at 80% 40%, #fff, transparent), radial-gradient(1px 1px at 40% 60%, #fff, transparent), radial-gradient(1px 1px at 90% 70%, #fff, transparent), radial-gradient(1px 1px at 10% 75%, #fff, transparent)'
             }} />

        {/* o castelo em silhueta */}
        <svg viewBox="0 0 800 400" className="absolute bottom-0 w-full" preserveAspectRatio="xMidYMax slice">
          <path
            d="M0,400 L0,320 L60,320 L60,280 L80,280 L80,240 L100,240 L100,280 L120,280 L120,320
               L200,320 L200,220 L215,220 L215,190 L230,175 L245,190 L245,220 L260,220 L260,320
               L340,320 L340,260 L360,260 L360,150 L375,150 L375,120 L390,100 L405,120 L405,150 L420,150 L420,260 L440,260 L440,320
               L520,320 L520,230 L535,230 L535,200 L550,185 L565,200 L565,230 L580,230 L580,320
               L660,320 L660,290 L680,290 L680,250 L700,250 L700,290 L720,290 L720,320 L800,320 L800,400 Z"
            fill="#050810"
          />
          {/* janelas acesas — pontos de leitura na noite */}
          <rect x="371" y="180" width="8" height="12" fill="rgba(251,191,36,0.7)" rx="1" />
          <rect x="226" y="235" width="7" height="10" fill="rgba(251,191,36,0.5)" rx="1" />
          <rect x="546" y="245" width="7" height="10" fill="rgba(251,191,36,0.6)" rx="1" />
        </svg>

        {/* a citação, na voz do miolo de livro */}
        <div className="absolute bottom-16 left-12 right-12">
          <p className="font-serif italic text-2xl text-slate-300/90 leading-relaxed max-w-md">
            "Um leitor vive mil vidas antes de morrer. O homem que nunca lê vive apenas uma."
          </p>
          <p className="font-sans text-xs text-slate-500 mt-3 tracking-widest uppercase">George R. R. Martin</p>
        </div>
      </div>

      {/* ── O formulário ── */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-10">

          <div className="text-center space-y-3">
            <h1 className="font-display text-5xl font-semibold text-amber-100 tracking-[0.12em] uppercase
                           drop-shadow-[0_0_30px_rgba(251,191,36,0.25)]">
              Literary<span className="text-amber-400">World</span>
            </h1>
            <p className="font-serif italic text-lg text-slate-400">todo mundo começa com uma página em branco</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <input
              type="email"
              placeholder="e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-slate-900/80 border border-slate-800 px-4 py-3.5 text-base text-slate-100 placeholder-slate-500
                         focus:outline-none focus:border-amber-400/40 focus:shadow-[0_0_24px_rgba(251,191,36,0.12)]
                         transition-all duration-300"
            />
            <input
              type="password"
              placeholder="senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-slate-900/80 border border-slate-800 px-4 py-3.5 text-base text-slate-100 placeholder-slate-500
                         focus:outline-none focus:border-amber-400/40 focus:shadow-[0_0_24px_rgba(251,191,36,0.12)]
                         transition-all duration-300"
            />

            {error && <p className="text-red-400/90 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-amber-400/90 hover:bg-amber-300 text-slate-950 font-medium py-3.5 text-base
                         shadow-[0_0_28px_rgba(251,191,36,0.2)] hover:shadow-[0_0_40px_rgba(251,191,36,0.35)]
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
            >
              {submitting ? 'abrindo o livro...' : 'entrar'}
            </button>
          </form>

          <p className="text-center text-base text-slate-500 font-sans">
            primeira vez aqui?{' '}
            <button onClick={onSwitchToRegister} className="text-amber-200/80 hover:text-amber-100 underline underline-offset-4">
              começar minha história
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}