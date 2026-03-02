/** Envoltorio genérico de modal */
export default function ModalBase({ title, onClose, children, maxW = 'max-w-lg' }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`modal-enter bg-white rounded-2xl shadow-2xl w-full ${maxW} p-7`}>
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-base font-bold text-cyan-900">{title}</h4>
          <button onClick={onClose}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-xl leading-none">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Campo de formulario reutilizable */
export function Field({ label, required, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

/** Input estándar */
export const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500'

/** Mensaje de error inline */
export function ErrMsg({ msg }) {
  if (!msg) return null
  return <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700 mb-3">{msg}</div>
}

/** Botones de acción del modal */
export function ModalActions({ onClose, submitLabel, loading, color = 'bg-cyan-700 hover:bg-cyan-800' }) {
  return (
    <div className="flex justify-end gap-3 mt-2">
      <button type="button" onClick={onClose}
        className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
        Cancelar
      </button>
      <button type="submit" disabled={loading}
        className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2 ${color}`}>
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
          : submitLabel
        }
      </button>
    </div>
  )
}
