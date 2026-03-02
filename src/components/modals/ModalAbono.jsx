import { useState } from 'react'
import { api } from '../../utils/api'
import { today } from '../../utils/format'
import ModalBase, { Field, inputCls, ErrMsg, ModalActions } from './ModalBase'

export default function ModalAbono({ clienteId, abono, onClose, onSave }) {
  const isEdit = !!abono?.id
  const [form, setForm] = useState({
    monto: String(abono?.monto || ''),
    nota:  abono?.nota  || '',
    fecha: abono?.fecha || today(),
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        monto: parseFloat(form.monto),
        nota:  form.nota.trim() || null,
        fecha: form.fecha,
      }
      const data = isEdit
        ? await api.put(`/abonos/${abono.id}`, payload)
        : await api.post('/abonos', { cliente_id: clienteId, ...payload })
      onSave(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase title={isEdit ? 'Editar abono' : 'Registrar abono'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monto (COP)" required>
            <input type="number" value={form.monto} onChange={set('monto')} required min="1" step="any"
              className={inputCls} placeholder="50000" />
          </Field>
          <Field label="Fecha">
            <input type="date" value={form.fecha} onChange={set('fecha')} className={inputCls} />
          </Field>
        </div>
        <Field label="Nota">
          <input type="text" value={form.nota} onChange={set('nota')}
            className={inputCls} placeholder="Ej: Pago en efectivo" />
        </Field>
        <ErrMsg msg={error} />
        <ModalActions onClose={onClose} submitLabel={isEdit ? 'Actualizar' : 'Registrar abono'} loading={loading} color="bg-emerald-600 hover:bg-emerald-700" />
      </form>
    </ModalBase>
  )
}
