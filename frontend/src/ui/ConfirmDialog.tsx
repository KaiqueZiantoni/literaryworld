import { useState } from 'react'
import { Modal } from './Modal'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'normal'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/** Substitui o confirm() do navegador — mesma pergunta, na linguagem do app. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'confirmar',
  cancelLabel = 'cancelar',
  tone = 'normal',
  onConfirm,
  onCancel,
}: Props) {
  const [working, setWorking] = useState(false)

  async function handleConfirm() {
    setWorking(true)
    try {
      await onConfirm()
    } finally {
      setWorking(false)
    }
  }

  return (
    <Modal onClose={onCancel} size="sm" title={title}>
      <p className="font-serif text-[17px] text-slate-300 leading-relaxed">{message}</p>

      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} disabled={working} className="lw-btn lw-btn-ghost flex-1">
          {cancelLabel}
        </button>
        <button
          onClick={handleConfirm}
          disabled={working}
          className={`lw-btn flex-1 ${tone === 'danger' ? 'lw-btn-danger' : 'lw-btn-primary lw-sheen'}`}
        >
          {working ? 'um instante...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
