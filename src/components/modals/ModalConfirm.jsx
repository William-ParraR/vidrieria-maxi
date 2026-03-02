import { useState } from 'react'
import ModalBase from './ModalBase'

export default function ModalConfirm({ title, message, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  async function confirm() {
    setLoading(true)
    try { await onConfirm() }
    finally { setLoading(false); onClose() }
  }

  return (
    <ModalBase title="Confirmar acción" onClose={onClose} maxW="max-w-sm">
      <p className="text-base font-semibold text-slate-800 mb-2">{title}</p>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading}
          className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button onClick={confirm} disabled={loading}
          className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Eliminando...</>
            : 'Sí, eliminar'
          }
        </button>
      </div>
    </ModalBase>
  )
}
