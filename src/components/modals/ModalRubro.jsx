import { useState } from 'react'
import { api } from '../../utils/api'
import ModalBase, { Field, inputCls, ErrMsg, ModalActions } from './ModalBase'

export default function ModalRubro({ rubro, onClose, onSave }) {
  const isEdit = !!rubro?.id
  const [form, setForm] = useState({
    nombre:      rubro?.nombre      || '',
    descripcion: rubro?.descripcion || '',
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
        nombre:      form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
      }
      const data = isEdit
        ? await api.put(`/rubros/${rubro.id}`, payload)
        : await api.post('/rubros', payload)
      onSave(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase title={isEdit ? 'Editar rubro' : 'Nuevo rubro'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Nombre del rubro" required>
          <input type="text" value={form.nombre} onChange={set('nombre')} required
            className={inputCls} placeholder="Ej: Cacao, Ganado, Café..." />
        </Field>
        <Field label="Descripción (opcional)">
          <input type="text" value={form.descripcion} onChange={set('descripcion')}
            className={inputCls} placeholder="Ej: Venta de cacao seco en baba" />
        </Field>
        <ErrMsg msg={error} />
        <ModalActions
          onClose={onClose}
          submitLabel={isEdit ? 'Actualizar' : 'Crear rubro'}
          loading={loading}
          color="bg-emerald-700 hover:bg-emerald-800"
        />
      </form>
    </ModalBase>
  )
}
