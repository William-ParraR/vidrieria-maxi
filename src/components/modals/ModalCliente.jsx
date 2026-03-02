import { useState } from 'react'
import { api } from '../../utils/api'
import ModalBase, { Field, inputCls, ErrMsg, ModalActions } from './ModalBase'

export default function ModalCliente({ cliente, onClose, onSave }) {
  const isEdit = !!cliente?.id
  const [form, setForm] = useState({
    nombre:    cliente?.nombre    || '',
    telefono:  cliente?.telefono  || '',
    direccion: cliente?.direccion || '',
    notas:     cliente?.notas     || '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = {
        nombre:    form.nombre.trim(),
        telefono:  form.telefono.trim()  || null,
        direccion: form.direccion.trim() || null,
        notas:     form.notas.trim()     || null,
      }
      const data = isEdit
        ? await api.put(`/clientes/${cliente.id}`, body)
        : await api.post('/clientes', body)

      onSave(isEdit ? { ...cliente, ...body } : data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase title={isEdit ? 'Editar cliente' : 'Nuevo cliente'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Nombre" required>
          <input type="text" value={form.nombre} onChange={set('nombre')} required
            className={inputCls} placeholder="Pepito Pérez" />
        </Field>
        <Field label="Teléfono">
          <input type="tel" value={form.telefono} onChange={set('telefono')}
            className={inputCls} placeholder="300 123 4567" />
        </Field>
        <Field label="Dirección">
          <input type="text" value={form.direccion} onChange={set('direccion')}
            className={inputCls} placeholder="Calle 10 # 5-20" />
        </Field>
        <Field label="Notas">
          <textarea value={form.notas} onChange={set('notas')} rows={2}
            className={inputCls} placeholder="Información adicional..." />
        </Field>
        <ErrMsg msg={error} />
        <ModalActions onClose={onClose} submitLabel={isEdit ? 'Actualizar' : 'Crear cliente'} loading={loading} />
      </form>
    </ModalBase>
  )
}
