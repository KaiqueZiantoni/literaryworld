import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ColdStartHint } from './components/ColdStartHint'
import { NightAmbience } from './components/NightAmbience'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ShelfPage } from './features/shelf/ShelfPage'
import { WorldPage } from './features/world/WorldPage'
import { ToastProvider } from './ui/Toast'

/** A tela dos primeiros milissegundos, enquanto o cookie de refresh é conferido. */
function BootScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <NightAmbience />
      <div className="text-center space-y-5">
        <svg width="72" height="72" viewBox="0 0 36 36" className="mx-auto lw-pixel lw-bob" aria-hidden="true">
          <rect x="4" y="8" width="28" height="22" fill="#2b2314" />
          <rect x="6" y="10" width="11" height="18" fill="#e5e0d2" />
          <rect x="19" y="10" width="11" height="18" fill="#cfc9ba" />
          <rect x="17" y="8" width="2" height="22" fill="#4a3d22" />
          <rect x="8" y="14" width="7" height="1" fill="#94a3b8" />
          <rect x="8" y="17" width="7" height="1" fill="#94a3b8" />
          <rect x="21" y="14" width="7" height="1" fill="#94a3b8" />
          <rect x="16" y="2" width="4" height="4" fill="#fbbf24" className="lw-blink" />
        </svg>
        <p className="font-pixel text-[10px] text-ember-200/70 lw-blink">ACENDENDO A LUZ</p>
        <ColdStartHint />
      </div>
    </div>
  )
}

function AuthGate() {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) return <BootScreen />

  if (!user) {
    return showRegister
      ? <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
      : <LoginPage onSwitchToRegister={() => setShowRegister(true)} />
  }

  return <ShelfPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthGate />} />
            <Route path="/u/:username" element={<WorldPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
