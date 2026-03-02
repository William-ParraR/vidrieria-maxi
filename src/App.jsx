import { useState, useEffect } from 'react'
import { api } from './utils/api'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  // Si ya hay token → panel, si no → login
  const [page, setPage] = useState(() => (api.getToken() ? 'dashboard' : 'login'))

  const goLogin = () => { api.clearSession(); setPage('login') }

  // Escucha eventos de sesión expirada desde api.js (respuestas 401)
  useEffect(() => {
    window.addEventListener('session-expired', goLogin)
    return () => window.removeEventListener('session-expired', goLogin)
  }, [])

  if (page === 'login') {
    return <Login onLogin={() => setPage('dashboard')} />
  }
  return <Dashboard onLogout={goLogin} />
}
