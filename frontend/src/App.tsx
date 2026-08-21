import { useEffect, useState } from 'react'
import { api } from './api/client'

export default function App() {
  const [status, setStatus] = useState('consultando...')

  useEffect(() => {
    api('/health')
      .then(r => r.json())
      .then(d => setStatus(`backend: ${d.status}`))
      .catch(() => setStatus('backend: FALHOU (olha o console! F12)'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-amber-100 drop-shadow-[0_0_25px_rgba(251,191,36,0.35)]">
          LiteraryWorld
        </h1>
        <p className="text-slate-400">{status}</p>
      </div>
    </div>
  )
}