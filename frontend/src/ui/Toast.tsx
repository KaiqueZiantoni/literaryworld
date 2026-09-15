import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ToastTone = 'success' | 'error' | 'info'

interface Toast {
  id: number
  tone: ToastTone
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TONE_STYLE: Record<ToastTone, { bar: string; text: string; icon: string }> = {
  success: { bar: 'bg-quest-400', text: 'text-quest-400', icon: '✓' },
  error: { bar: 'bg-danger-400', text: 'text-danger-400', icon: '!' },
  info: { bar: 'bg-neon-400', text: 'text-neon-400', icon: 'i' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++
    setToasts(current => [...current.slice(-3), { id, tone, message }])
    window.setTimeout(() => dismiss(id), tone === 'error' ? 6000 : 3800)
  }, [dismiss])

  const api = useMemo<ToastApi>(() => ({
    success: message => push('success', message),
    error: message => push('error', message),
    info: message => push('info', message),
  }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none">
          {toasts.map(toast => {
            const tone = TONE_STYLE[toast.tone]
            return (
              <button
                key={toast.id}
                onClick={() => dismiss(toast.id)}
                className="lw-toast-in lw-panel pointer-events-auto flex items-center gap-3 rounded-xl
                           pl-0 pr-4 py-3 max-w-sm text-left overflow-hidden hover:brightness-125 transition"
              >
                <span className={`w-1 self-stretch shrink-0 ${tone.bar}`} />
                <span className={`font-pixel text-[10px] leading-none ${tone.text}`}>{tone.icon}</span>
                <span className="font-sans text-sm text-slate-200">{toast.message}</span>
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast precisa estar dentro de ToastProvider')
  return context
}
