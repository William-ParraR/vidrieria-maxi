import { useState, useEffect } from 'react'
import { api } from '../utils/api'

function GlassIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.8"/>
      <path d="M3 9h18M9 21V9" strokeWidth="1.8"/>
    </svg>
  )
}

export default function Login({ onLogin }) {
  const [mode,    setMode]    = useState('loading')
  const [form,    setForm]    = useState({ nombre: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function init() {
      if (api.getToken()) {
        try { await api.get('/auth/me'); onLogin(); return } catch { api.clearSession() }
      }
      try {
        const { needsSetup } = await api.get('/auth/setup-needed')
        setMode(needsSetup ? 'setup' : 'login')
      } catch { setMode('login') }
    }
    init()
  }, [onLogin])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/setup'
      const body     = mode === 'login'
        ? { email: form.email, password: form.password }
        : { nombre: form.nombre, email: form.email, password: form.password }
      const data = await api.post(endpoint, body)
      api.setSession(data.token, data.nombre)
      onLogin()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'loading') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo: imagen ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80"
          alt="Vidriería Maxi"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-cyan-950/70 to-slate-800/90" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center backdrop-blur-sm">
              <GlassIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide">Vidriería Maxi</span>
          </div>

          {/* Quote */}
          <div className="max-w-sm">
            <div className="w-12 h-0.5 bg-cyan-400 mb-8" />
            <p className="text-white/90 text-2xl font-light leading-relaxed mb-4">
              Claridad, precisión<br />y excelencia en<br />cada trabajo.
            </p>
            <p className="text-cyan-300/80 text-sm font-medium tracking-wide uppercase">
              Sistema de Gestión de Pedidos
            </p>
          </div>
        </div>
      </div>

      {/* ── Panel derecho: formulario ────────────────────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-white px-8 py-14">
        <div className="w-full max-w-sm">

          {/* Logo móvil */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <GlassIcon className="w-7 h-7 text-cyan-700" />
            <span className="text-slate-800 font-bold text-lg">Vidriería Maxi</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
            {mode === 'setup' ? 'Configuración inicial' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {mode === 'setup'
              ? 'Crea la cuenta del administrador para comenzar.'
              : 'Ingresa tus credenciales para acceder al sistema.'}
          </p>

          {mode === 'setup' && (
            <div className="flex items-start gap-3 bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 mb-6">
              <svg className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-cyan-800">
                Primera vez en el sistema. Configura el administrador para comenzar.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'setup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nombre completo
                </label>
                <input type="text" value={form.nombre} onChange={set('nombre')} required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  placeholder="Juan García" />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input type="email" value={form.email} onChange={set('email')} required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                placeholder="admin@vidrieria.com" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Contraseña {mode === 'setup' && <span className="text-slate-400 font-normal normal-case">(mín. 8 caracteres)</span>}
              </label>
              <input type="password" value={form.password} onChange={set('password')}
                required minLength={mode === 'setup' ? 8 : undefined}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                placeholder="••••••••" />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-cyan-700 hover:bg-cyan-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm tracking-wide shadow-sm">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                : mode === 'login' ? 'Ingresar al sistema' : 'Crear administrador'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
