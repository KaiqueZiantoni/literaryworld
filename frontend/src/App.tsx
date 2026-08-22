import { useState } from 'react'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'

function AppContent() {
  const { user, loading, logout } = useAuth()
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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="font-display text-3xl font-semibold text-amber-100 tracking-wide">
          bem-vindo, {user.displayName}
        </h1>
        <p className="font-sans text-slate-400">@{user.username}</p>
        <button onClick={logout} className="font-sans text-slate-500 hover:text-slate-300 underline underline-offset-4 text-sm">
          sair
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}