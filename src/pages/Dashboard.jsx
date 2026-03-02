import { useState, useEffect, useCallback, useRef } from 'react'
import { api }         from '../utils/api'
import { cop }         from '../utils/format'
import Sidebar         from '../components/Sidebar'
import ClienteDetail   from '../components/ClienteDetail'
import Toast           from '../components/Toast'
import ModalCliente    from '../components/modals/ModalCliente'
import ModalPedido     from '../components/modals/ModalPedido'
import ModalAbono      from '../components/modals/ModalAbono'
import ModalUsuario    from '../components/modals/ModalUsuario'
import ModalConfirm    from '../components/modals/ModalConfirm'
import FincaDashboard  from './FincaDashboard'

let toastId = 0

export default function Dashboard({ onLogout }) {
  const [seccion,         setSeccion]         = useState('negocio') // 'negocio' | 'finca'
  const [clientes,        setClientes]        = useState([])
  const [clienteDetalle,  setClienteDetalle]  = useState(null)
  const [search,          setSearch]          = useState('')
  const [modal,           setModal]           = useState(null)
  const [toasts,          setToasts]          = useState([])
  // 'list' | 'detail' — controls which panel is visible on mobile
  const [mobileView,      setMobileView]      = useState('list')
  const searchTimer = useRef(null)

  const userName = api.getUserName()

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = 'ok') => {
    const id = ++toastId
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])

  // ── Cargar clientes ────────────────────────────────────────────────────────
  const loadClientes = useCallback(async (q = '') => {
    try {
      const data = await api.get('/clientes?search=' + encodeURIComponent(q))
      setClientes(data)
    } catch (err) { toast(err.message, 'error') }
  }, [toast])

  useEffect(() => { loadClientes() }, [loadClientes])

  // ── Búsqueda con debounce ──────────────────────────────────────────────────
  const handleSearch = useCallback(q => {
    setSearch(q)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => loadClientes(q), 300)
  }, [loadClientes])

  // ── Seleccionar cliente ────────────────────────────────────────────────────
  const selectCliente = useCallback(async (id) => {
    try {
      const data = await api.get('/clientes/' + id)
      setClienteDetalle(data)
      setMobileView('detail')
    } catch (err) { toast(err.message, 'error') }
  }, [toast])

  const refreshCliente = useCallback(async () => {
    if (!clienteDetalle) return
    await selectCliente(clienteDetalle.id)
    await loadClientes(search)
  }, [clienteDetalle, selectCliente, loadClientes, search])

  // ── Handlers de clientes ───────────────────────────────────────────────────
  const handleSaveCliente = useCallback(async (data) => {
    toast(clienteDetalle && data.id === clienteDetalle.id ? 'Cliente actualizado.' : 'Cliente creado.')
    await loadClientes(search)
    if (data.id) await selectCliente(data.id)
  }, [clienteDetalle, toast, loadClientes, search, selectCliente])

  const handleDeleteCliente = useCallback(() => {
    setModal({
      type: 'confirm',
      title: '¿Eliminar cliente?',
      message: `Se eliminará "${clienteDetalle?.nombre}" junto con todos sus pedidos y abonos. Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await api.delete('/clientes/' + clienteDetalle.id)
        toast('Cliente eliminado.')
        setClienteDetalle(null)
        setMobileView('list')
        await loadClientes(search)
      },
    })
  }, [clienteDetalle, toast, loadClientes, search])

  // ── Handlers de pedidos ────────────────────────────────────────────────────
  const handleSavePedido = useCallback(async () => {
    toast('Pedido agregado.')
    await refreshCliente()
  }, [toast, refreshCliente])

  const handleUpdatePedido = useCallback(async () => {
    toast('Pedido actualizado.')
    await refreshCliente()
  }, [toast, refreshCliente])

  const handleDeletePedido = useCallback((id, desc) => {
    setModal({
      type: 'confirm',
      title: '¿Eliminar pedido?',
      message: `Se eliminará "${desc}". Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await api.delete('/pedidos/' + id)
        toast('Pedido eliminado.')
        await refreshCliente()
      },
    })
  }, [toast, refreshCliente])

  // Toggle checkbox en descripción de pedido
  const handleTogglePedidoCheck = useCallback(async (pedidoId, lineIndex, newChecked) => {
    if (!clienteDetalle) return
    const pedido = clienteDetalle.pedidos.find(p => p.id === pedidoId)
    if (!pedido) return

    // Actualizar la línea específica
    const lines = pedido.descripcion.split('\n')
    const line = lines[lineIndex]
    if (!line) return

    // Cambiar [ ] a [x] o viceversa
    const newLine = newChecked
      ? line.replace(/^\[ \]/, '[x]')
      : line.replace(/^\[[xX]\]/, '[ ]')
    lines[lineIndex] = newLine
    const newDescripcion = lines.join('\n')

    // Actualizar localmente de inmediato (optimistic update)
    setClienteDetalle(prev => ({
      ...prev,
      pedidos: prev.pedidos.map(p =>
        p.id === pedidoId ? { ...p, descripcion: newDescripcion } : p
      )
    }))

    // Enviar al servidor
    try {
      await api.put(`/pedidos/${pedidoId}`, {
        descripcion: newDescripcion,
        valor: pedido.valor,
        estado: pedido.estado,
        fecha: pedido.fecha,
      })
    } catch (err) {
      toast(err.message, 'error')
      // Revertir en caso de error
      await refreshCliente()
    }
  }, [clienteDetalle, toast, refreshCliente])

  // ── Handlers de abonos ─────────────────────────────────────────────────────
  const handleSaveAbono = useCallback(async () => {
    toast('Abono registrado.')
    await refreshCliente()
  }, [toast, refreshCliente])

  const handleUpdateAbono = useCallback(async () => {
    toast('Abono actualizado.')
    await refreshCliente()
  }, [toast, refreshCliente])

  const handleDeleteAbono = useCallback((id, monto) => {
    setModal({
      type: 'confirm',
      title: '¿Eliminar abono?',
      message: `Se eliminará el abono de ${cop(monto)}. Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await api.delete('/abonos/' + id)
        toast('Abono eliminado.')
        await refreshCliente()
      },
    })
  }, [toast, refreshCliente])

  const closeModal = () => setModal(null)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">

      {/* ── Top Nav ─────────────────────────────────────────────────── */}
      <nav className="h-14 bg-slate-900 flex items-center justify-between px-4 flex-shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-2.5">
          {/* Botón atrás en móvil (solo en vista detalle) */}
          {mobileView === 'detail' && (
            <button onClick={() => setMobileView('list')}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors mr-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.8"/>
              <path d="M3 9h18M9 21V9" strokeWidth="1.8"/>
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-wide">
            {mobileView === 'detail' && clienteDetalle
              ? <span className="lg:hidden text-sm">{clienteDetalle.nombre}</span>
              : null}
            <span className="hidden lg:inline">Vidriería Maxi</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switcher de sección */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setSeccion('negocio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                seccion === 'negocio'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="hidden sm:inline">Vidriería</span>
            </button>
            <button
              onClick={() => setSeccion('finca')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                seccion === 'finca'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Finca</span>
            </button>
          </div>

          {userName && (
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{userName}</span>
            </div>
          )}
          <button onClick={() => setModal({ type: 'usuario' })}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="hidden sm:inline">Usuario</span>
          </button>
          <button onClick={onLogout}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </button>
        </div>
      </nav>

      {/* ── Body ────────────────────────────────────────────────────── */}
      {seccion === 'finca' && (
        <FincaDashboard toasts={toasts} setToasts={setToasts} />
      )}
      <div className={`flex flex-1 overflow-hidden ${seccion === 'finca' ? 'hidden' : ''}`}>

        {/* Sidebar: visible en móvil solo en vista 'list', siempre en desktop */}
        <div className={`${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 flex-shrink-0 flex-col overflow-hidden`}>
          <Sidebar
            clientes={clientes}
            selectedId={clienteDetalle?.id}
            search={search}
            onSearch={handleSearch}
            onSelect={selectCliente}
            onNewCliente={() => setModal({ type: 'cliente' })}
          />
        </div>

        {/* Main: visible en móvil solo en vista 'detail', siempre en desktop */}
        <main className={`${mobileView === 'list' ? 'hidden lg:flex' : 'flex'} flex-1 overflow-y-auto flex-col p-4 lg:p-5`}>
          {clienteDetalle ? (
            <ClienteDetail
              cliente={clienteDetalle}
              onEdit={() => setModal({ type: 'cliente', data: clienteDetalle })}
              onDelete={handleDeleteCliente}
              onAddPedido={() => setModal({ type: 'pedido' })}
              onAddAbono={() => setModal({ type: 'abono' })}
              onDeletePedido={handleDeletePedido}
              onDeleteAbono={handleDeleteAbono}
              onEditPedido={p => setModal({ type: 'pedido', data: p })}
              onEditAbono={a => setModal({ type: 'abono', data: a })}
              onTogglePedidoCheck={handleTogglePedidoCheck}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                  <path d="M3 9h18M9 21V9" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-500">Selecciona un cliente</h3>
              <p className="text-sm text-slate-400 text-center">Elige un cliente de la lista para ver sus pedidos y abonos.</p>
            </div>
          )}
        </main>
      </div>

      {/* ── Modales ──────────────────────────────────────────────────── */}
      {modal?.type === 'cliente' && (
        <ModalCliente
          cliente={modal.data}
          onClose={closeModal}
          onSave={handleSaveCliente}
        />
      )}
      {modal?.type === 'pedido' && clienteDetalle && (
        <ModalPedido
          clienteId={clienteDetalle.id}
          pedido={modal.data}
          onClose={closeModal}
          onSave={modal.data ? handleUpdatePedido : handleSavePedido}
        />
      )}
      {modal?.type === 'abono' && clienteDetalle && (
        <ModalAbono
          clienteId={clienteDetalle.id}
          abono={modal.data}
          onClose={closeModal}
          onSave={modal.data ? handleUpdateAbono : handleSaveAbono}
        />
      )}
      {modal?.type === 'usuario' && (
        <ModalUsuario onClose={closeModal} />
      )}
      {modal?.type === 'confirm' && (
        <ModalConfirm
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
        />
      )}

      {/* ── Toasts ───────────────────────────────────────────────────── */}
      <Toast toasts={toasts} />
    </div>
  )
}
