import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { ShelfPage } from './features/shelf/ShelfPage'
import { WorldPage } from './features/world/WorldPage'

function AuthGate() {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="font-serif italic text-lg text-amber-100/60 animate-pulse">acendendo a luz...</p>
      </div>
    )
  }

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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthGate />} />
          <Route path="/u/:username" element={<WorldPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}