import { useState, useRef } from 'react'
import { api } from '../../utils/api'
import { today } from '../../utils/format'
import ModalBase, { Field, inputCls, ErrMsg, ModalActions } from './ModalBase'

export default function ModalPedido({ clienteId, pedido, onClose, onSave }) {
  const isEdit = !!pedido?.id
  const [form, setForm] = useState({
    descripcion: pedido?.descripcion || '',
    valor:       String(pedido?.valor || ''),
    estado:      pedido?.estado      || 'pendiente',
    fecha:       pedido?.fecha       || today(),
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function addChecklistItem() {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = form.descripcion
    // Insertar en la posición actual o al final
    const before = text.substring(0, start)
    const after = text.substring(end)
    const needsNewline = before.length > 0 && !before.endsWith('\n')
    const newItem = (needsNewline ? '\n' : '') + '[ ] '
    const newText = before + newItem + after
    setForm(f => ({ ...f, descripcion: newText }))
    // Mover cursor después del [ ]
    setTimeout(() => {
      const newPos = start + newItem.length
      ta.focus()
      ta.setSelectionRange(newPos, newPos)
    }, 0)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        descripcion: form.descripcion.trim(),
        valor:       parseFloat(form.valor),
        estado:      form.estado,
        fecha:       form.fecha,
      }
      const data = isEdit
        ? await api.put(`/pedidos/${pedido.id}`, payload)
        : await api.post('/pedidos', { cliente_id: clienteId, ...payload })
      onSave(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase title={isEdit ? 'Editar pedido' : 'Agregar ítem al pedido'} onClose={onClose} maxW="max-w-lg">
      <form onSubmit={submit}>
        <Field label="Descripción" required>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={form.descripcion}
              onChange={set('descripcion')}
              required
              rows={5}
              className={`${inputCls} resize-none font-mono text-sm`}
              placeholder="Ej: Ventana 1.20 × 0.80 m&#10;&#10;Usa [ ] para crear checklist de cortes"
            />
            <button
              type="button"
              onClick={addChecklistItem}
              className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded transition-colors"
              title="Agregar item de checklist"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Checklist
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tip: Escribe <code className="bg-slate-100 px-1 rounded">[ ]</code> para items pendientes o <code className="bg-slate-100 px-1 rounded">[x]</code> para completados
          </p>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (COP)" required>
            <input type="number" value={form.valor} onChange={set('valor')} required min="1" step="any"
              className={inputCls} placeholder="300000" />
          </Field>
          <Field label="Fecha">
            <input type="date" value={form.fecha} onChange={set('fecha')} className={inputCls} />
          </Field>
        </div>
        <Field label="Estado">
          <select value={form.estado} onChange={set('estado')} className={inputCls}>
            <option value="pendiente">Pendiente</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </Field>
        <ErrMsg msg={error} />
        <ModalActions onClose={onClose} submitLabel={isEdit ? 'Actualizar' : 'Agregar pedido'} loading={loading} />
      </form>
    </ModalBase>
  )
}
