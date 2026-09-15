import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_URL } from '../../api/client'
import type { World } from '../../api/types'
import { ColdStartHint } from '../../components/ColdStartHint'
import { NightAmbience } from '../../components/NightAmbience'
import { nightFor } from '../../theme/genres'
import { WorldMap } from './WorldMap'

type State =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'offline' }
  | { status: 'ready'; world: World }

export function WorldPage() {
  const { username } = useParams()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    // vitrine pública: não manda token, não precisa de sessão
    fetch(`${API_URL}/users/${username}/world`)
      .then(async response => {
        if (cancelled) return
        if (response.ok) setState({ status: 'ready', world: await response.json() })
        else setState({ status: 'missing' })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'offline' })
      })

    return () => {
      cancelled = true
    }
  }, [username])

  if (state.status === 'loading') {
    return (
      <Curtain>
        <p className="font-pixel text-[10px] text-ember-200/80 lw-blink">CARREGANDO O MUNDO</p>
        <ColdStartHint />
      </Curtain>
    )
  }

  if (state.status === 'offline') {
    return (
      <Curtain>
        <p className="font-display text-2xl text-ember-100 tracking-wide">o mundo está fora do ar</p>
        <p className="font-serif italic text-slate-500">o servidor não respondeu — confira se ele está rodando</p>
        <BackLink />
      </Curtain>
    )
  }

  if (state.status === 'missing') {
    return (
      <Curtain>
        <p className="font-pixel text-[10px] text-slate-500">PÁGINA EM BRANCO</p>
        <p className="font-display text-2xl text-ember-100 tracking-wide">ninguém mora aqui</p>
        <p className="font-serif italic text-slate-500">
          não existe um leitor com o nome “{username}”
        </p>
        <BackLink />
      </Curtain>
    )
  }

  const { world } = state
  const hasRegions = world.genres.some(genre => genre.booksFinished >= 1)

  if (!hasRegions) {
    return (
      <Curtain palette={world.username}>
        <svg width="110" height="110" viewBox="0 0 48 48" className="mx-auto lw-pixel lw-bob" aria-hidden="true">
          <rect x="6" y="30" width="36" height="10" fill="#2f6f4e" />
          <rect x="6" y="30" width="36" height="3" fill="#3f8a62" />
          <rect x="22" y="18" width="4" height="14" fill="#6b4a22" />
          <rect x="14" y="8" width="20" height="12" rx="4" fill="#4cb869" />
          <rect x="18" y="4" width="12" height="9" rx="4" fill="#68d489" />
          <rect x="21" y="0" width="6" height="5" fill="#fcd34d" className="lw-blink" />
        </svg>
        <p className="font-display text-2xl text-ember-100 tracking-wide">
          o mundo de {world.displayName}
        </p>
        <p className="font-serif italic text-slate-400 max-w-md mx-auto leading-relaxed">
          ainda é só terra batida — cada livro concluído ergue uma região nova, com casas, moradores e
          um marco para a história lida
        </p>
        <BackLink label="ir para a mesa" />
      </Curtain>
    )
  }

  return (
    <WorldMap
      worldUsername={world.username}
      displayName={world.displayName}
      genres={world.genres}
      books={world.books}
    />
  )
}

function Curtain({ children, palette }: { children: React.ReactNode; palette?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <NightAmbience palette={nightFor(null)} seed={palette ?? 'mundo'} />
      <div className="text-center space-y-4 lw-rise">{children}</div>
    </div>
  )
}

function BackLink({ label = 'voltar' }: { label?: string }) {
  return (
    <Link
      to="/"
      className="inline-block font-pixel text-[8px] uppercase text-ember-200 border-2 border-ember-400/40
                 rounded px-4 py-3 hover:bg-ember-400/10 hover:text-ember-100 transition mt-2"
    >
      ← {label}
    </Link>
  )
}
