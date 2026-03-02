import { useState } from 'react'
import { api } from '../../utils/api'
import { today } from '../../utils/format'
import ModalBase, { Field, inputCls, ErrMsg, ModalActions } from './ModalBase'

export default function ModalCuenta({ rubroId, cuenta, onClose, onSave }) {
  const isEdit = !!cuenta?.id
  const [form, setForm] = useState({
    descripcion: cuenta?.descripcion || '',
    valor:       String(cuenta?.valor || ''),
    tipo:        cuenta?.tipo        || 'ingreso',
    fecha:       cuenta?.fecha       || today(),
    nota:        cuenta?.nota        || '',
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
        descripcion: form.descripcion.trim(),
        valor:       parseFloat(form.valor),
        tipo:        form.tipo,
        fecha:       form.fecha,
        nota:        form.nota.trim() || null,
      }
      const data = isEdit
        ? await api.put(`/cuentas-finca/${cuenta.id}`, payload)
        : await api.post('/cuentas-finca', { rubro_id: rubroId, ...payload })
      onSave(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isIngreso = form.tipo === 'ingreso'

  return (
    <ModalBase title={isEdit ? 'Editar cuenta' : 'Registrar cuenta'} onClose={onClose}>
      <form onSubmit={submit}>

        {/* Selector de tipo */}
        <div className="flex rounded-lg overflow-hidden border border-slate-200 mb-4">
          <button type="button" onClick={() => setForm(f => ({ ...f, tipo: 'ingreso' }))}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              isIngreso ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}>
            Ingreso
          </button>
          <button type="button" onClick={() => setForm(f => ({ ...f, tipo: 'gasto' }))}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-l border-slate-200 ${
              !isIngreso ? 'bg-red-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}>
            Gasto
          </button>
        </div>

        <Field label="Descripción" required>
          <input type="text" value={form.descripcion} onChange={set('descripcion')} required
            className={inputCls} placeholder={isIngreso ? 'Ej: Venta 50kg de cacao' : 'Ej: Compra de abono'} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (COP)" required>
            <input type="number" value={form.valor} onChange={set('valor')} required min="1" step="any"
              className={inputCls} placeholder="500000" />
          </Field>
          <Field label="Fecha">
            <input type="date" value={form.fecha} onChange={set('fecha')} className={inputCls} />
          </Field>
        </div>

        <Field label="Nota (opcional)">
          <input type="text" value={form.nota} onChange={set('nota')}
            className={inputCls} placeholder="Ej: Comprador: Juan García" />
        </Field>

        <ErrMsg msg={error} />
        <ModalActions
          onClose={onClose}
          submitLabel={isEdit ? 'Actualizar' : (isIngreso ? 'Registrar ingreso' : 'Registrar gasto')}
          loading={loading}
          color={isIngreso ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-600 hover:bg-red-700'}
        />
      </form>
    </ModalBase>
  )
}
