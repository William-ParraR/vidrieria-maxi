/**
 * api.js — Cliente HTTP del frontend
 *
 * SEGURIDAD: Este archivo NO contiene claves API ni secrets.
 * Solo almacena el JWT token del usuario (credencial temporal de sesión, 8h).
 * El JWT_SECRET real nunca sale del servidor de Cloudflare.
 */

const TOKEN_KEY = 'vm_token'
const USER_KEY  = 'vm_user'

export const api = {
  getToken:    () => localStorage.getItem(TOKEN_KEY),
  getUserName: () => localStorage.getItem(USER_KEY),

  setSession(token, nombre) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY,  nombre)
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' }
    const token   = this.getToken()
    if (token) headers['Authorization'] = 'Bearer ' + token

    const opts = { method, headers }
    if (body !== undefined) opts.body = JSON.stringify(body)

    let res
    try {
      res = await fetch('/api' + path, opts)
    } catch {
      throw new Error('Sin conexión con el servidor.')
    }

    if (res.status === 401) {
      this.clearSession()
      window.dispatchEvent(new CustomEvent('session-expired'))
      throw new Error('Sesión expirada. Inicia sesión nuevamente.')
    }

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
    return data
  },

  get:    (path)       => api.request('GET',    path),
  post:   (path, body) => api.request('POST',   path, body),
  put:    (path, body) => api.request('PUT',    path, body),
  delete: (path)       => api.request('DELETE', path),
}
