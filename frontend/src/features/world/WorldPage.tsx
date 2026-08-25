import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_URL = 'http://localhost:8080'

interface WorldGenre {
  slug: string
  name: string
  booksFinished: number
  pagesRead: number
}

interface WorldBook {
  title: string
  coverUrl: string
  status: string
  progressPercent: number
}

interface World {
  username: string
  displayName: string
  genres: WorldGenre[]
  books: WorldBook[]
}

export function WorldPage() {
  const { username } = useParams()
  const [world, setWorld] = useState<World | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/users/${username}/world`)
      .then(async r => {
        if (r.ok) setWorld(await r.json())
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [username])

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <p className="font-display text-2xl text-amber-100 tracking-wide">página em branco</p>
          <p className="font-serif italic text-slate-500">este leitor ainda não escreveu sua história aqui</p>
        </div>
      </div>
    )
  }

  if (!world) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="font-serif italic text-lg text-amber-100/60 animate-pulse">abrindo o mundo...</p>
      </div>
    )
  }

  const portals = world.genres.filter(g => g.booksFinished >= 1)

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-900 px-6 py-5 max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-semibold text-amber-100 tracking-[0.12em] uppercase">
          Literary<span className="text-amber-400">World</span>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl text-amber-100 tracking-wide">
            o mundo de {world.displayName}
          </h1>
          <p className="font-serif italic text-lg text-slate-400">
            @{world.username} · {world.books.length} {world.books.length === 1 ? 'história' : 'histórias'}
          </p>
        </div>

        {portals.length === 0 ? (
          <p className="text-center font-serif italic text-slate-500 py-16">
            os portais deste mundo ainda estão se formando — cada livro concluído abre um novo caminho
          </p>
        ) : (
          <div className="space-y-4">
            <h2 className="font-sans text-sm text-slate-500 tracking-widest uppercase text-center">
              portais abertos
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {portals.map(genre => (
                <button
                  key={genre.slug}
                  className="group w-32 h-44 rounded-lg border border-slate-800 hover:border-amber-400/50
                             flex flex-col items-center justify-center gap-3 px-3
                             hover:shadow-[0_0_30px_rgba(251,191,36,0.12)] transition-all duration-300"
                  onClick={() => alert(`o mundo de ${genre.name} abre em breve!`)}
                >
                  <span className="font-display text-sm text-amber-100/90 tracking-[0.15em] uppercase text-center leading-relaxed">
                    {genre.name}
                  </span>
                  <span className="h-px w-8 bg-amber-100/30" />
                  <span className="font-serif italic text-xs text-slate-500 text-center">
                    {genre.booksFinished} {genre.booksFinished === 1 ? 'história vivida' : 'histórias vividas'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}