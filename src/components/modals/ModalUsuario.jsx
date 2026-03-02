import { useState } from 'react'
import { api } from '../../utils/api'
import ModalBase, { Field, inputCls, ErrMsg, ModalActions } from './ModalBase'

export default function ModalUsuario({ onClose }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/usuarios', {
        nombre:   form.nombre.trim(),
        email:    form.email.trim(),
        password: form.password,
      })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <ModalBase title="Usuario creado" onClose={onClose} maxW="max-w-sm">
      <p className="text-sm text-slate-600 mb-4">
        El usuario <strong>{form.nombre}</strong> fue creado exitosamente. Ya puede iniciar sesión.
      </p>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-5 py-2 bg-cyan-700 text-white text-sm font-bold rounded-lg hover:bg-cyan-800">
          Cerrar
        </button>
      </div>
    </ModalBase>
  )

  return (
    <ModalBase title="Crear usuario del sistema" onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Nombre completo" required>
          <input type="text" value={form.nombre} onChange={set('nombre')} required className={inputCls} />
        </Field>
        <Field label="Correo electrónico" required>
          <input type="email" value={form.email} onChange={set('email')} required className={inputCls} />
        </Field>
        <Field label="Contraseña" required>
          <input type="password" value={form.password} onChange={set('password')} required minLength={8} className={inputCls}
            placeholder="Mínimo 8 caracteres" />
        </Field>
        <ErrMsg msg={error} />
        <ModalActions onClose={onClose} submitLabel="Crear usuario" loading={loading} />
      </form>
    </ModalBase>
  )
}
