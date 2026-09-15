import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** 'sm' para confirmações, 'md' para formulários, 'lg' para listas de busca. */
  size?: 'sm' | 'md' | 'lg'
  align?: 'center' | 'top'
}

const WIDTH: Record<NonNullable<Props['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

/**
 * Janela em portal com o comportamento que todo modal do app deve ter:
 * Esc fecha, clique no fundo fecha, a página atrás para de rolar e o foco
 * entra na caixa em vez de ficar perdido no documento.
 */
export function Modal({ onClose, title, subtitle, children, footer, size = 'md', align = 'center' }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    boxRef.current?.focus({ preventScroll: true })

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] flex justify-center px-4 bg-ink-950/85 backdrop-blur-md lw-fade-in
                  ${align === 'top' ? 'items-start pt-[8vh] pb-8' : 'items-center py-8'}`}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={boxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`lw-pop lw-panel w-full ${WIDTH[size]} rounded-2xl flex flex-col max-h-[86vh] outline-none`}
      >
        {(title || subtitle) && (
          <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-ink-800">
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-xl text-ember-100 tracking-wide truncate">{title}</h2>
              )}
              {subtitle && <p className="font-sans text-sm text-slate-500 truncate mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="fechar"
              className="shrink-0 h-8 w-8 rounded-lg border border-ink-700 text-slate-500
                         hover:text-ember-200 hover:border-ember-400/50 hover:bg-ember-400/10
                         transition-all duration-200"
            >
              ✕
            </button>
          </header>
        )}

        <div className="px-6 py-5 overflow-y-auto grow">{children}</div>

        {footer && <footer className="px-6 py-4 border-t border-ink-800">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
