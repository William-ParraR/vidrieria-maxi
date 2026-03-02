import { useState, useCallback } from 'react'
import { api }          from '../utils/api'
import { cop }          from '../utils/format'
import RubroSidebar     from '../components/RubroSidebar'
import RubroDetail      from '../components/RubroDetail'
import Toast            from '../components/Toast'
import ModalRubro       from '../components/modals/ModalRubro'
import ModalCuenta      from '../components/modals/ModalCuenta'
import ModalConfirm     from '../components/modals/ModalConfirm'

let toastFincaId = 0

export default function FincaDashboard() {
  const [rubros,       setRubros]       = useState([])
  const [rubroDetalle, setRubroDetalle] = useState(null)
  const [modal,        setModal]        = useState(null)
  const [toasts,       setToasts]       = useState([])
  const [mobileView,   setMobileView]   = useState('list')
  const [loaded,       setLoaded]       = useState(false)

  const toast = useCallback((msg, type = 'ok') => {
    const id = ++toastFincaId
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])

  const loadRubros = useCallback(async () => {
    try {
      const data = await api.get('/rubros')
      setRubros(data)
      setLoaded(true)
    } catch (err) { toast(err.message, 'error') }
  }, [toast])

  // Cargar rubros la primera vez que se monta
  const [initialized, setInitialized] = useState(false)
  if (!initialized) {
    setInitialized(true)
    loadRubros()
  }

  const selectRubro = useCallback(async (id) => {
    try {
      const data = await api.get('/rubros/' + id)
      setRubroDetalle(data)
      setMobileView('detail')
    } catch (err) { toast(err.message, 'error') }
  }, [toast])

  const refreshRubro = useCallback(async () => {
    if (!rubroDetalle) return
    await selectRubro(rubroDetalle.id)
    await loadRubros()
  }, [rubroDetalle, selectRubro, loadRubros])

  // ── Handlers de rubros ─────────────────────────────────────────
  const handleSaveRubro = useCallback(async (data) => {
    toast(rubroDetalle && data?.id === rubroDetalle.id ? 'Rubro actualizado.' : 'Rubro creado.')
    await loadRubros()
    if (data?.id) await selectRubro(data.id)
  }, [rubroDetalle, toast, loadRubros, selectRubro])

  const handleDeleteRubro = useCallback(() => {
    setModal({
      type: 'confirm',
      title: '¿Eliminar rubro?',
      message: `Se eliminará "${rubroDetalle?.nombre}" junto con todos sus movimientos. Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await api.delete('/rubros/' + rubroDetalle.id)
        toast('Rubro eliminado.')
        setRubroDetalle(null)
        setMobileView('list')
        await loadRubros()
      },
    })
  }, [rubroDetalle, toast, loadRubros])

  // ── Handlers de cuentas ────────────────────────────────────────
  const handleSaveCuenta = useCallback(async () => {
    toast('Movimiento registrado.')
    await refreshRubro()
  }, [toast, refreshRubro])

  const handleUpdateCuenta = useCallback(async () => {
    toast('Movimiento actualizado.')
    await refreshRubro()
  }, [toast, refreshRubro])

  const handleDeleteCuenta = useCallback((id, desc) => {
    setModal({
      type: 'confirm',
      title: '¿Eliminar movimiento?',
      message: `Se eliminará "${desc}". Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await api.delete('/cuentas-finca/' + id)
        toast('Movimiento eliminado.')
        await refreshRubro()
      },
    })
  }, [toast, refreshRubro])

  const closeModal = () => setModal(null)

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* Sidebar de rubros */}
      <div className={`${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 flex-shrink-0 flex-col overflow-hidden`}>
        <RubroSidebar
          rubros={rubros}
          selectedId={rubroDetalle?.id}
          onSelect={selectRubro}
          onNewRubro={() => setModal({ type: 'rubro' })}
        />
      </div>

      {/* Panel de detalle */}
      <main className={`${mobileView === 'list' ? 'hidden lg:flex' : 'flex'} flex-1 overflow-y-auto flex-col p-4 lg:p-5`}>
        {/* Botón volver en móvil */}
        {mobileView === 'detail' && (
          <button onClick={() => setMobileView('list')}
            className="lg:hidden mb-3 inline-flex items-center gap-1.5 text-sm text-emerald-700 font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Rubros
          </button>
        )}

        {rubroDetalle ? (
          <RubroDetail
            rubro={rubroDetalle}
            onEdit={() => setModal({ type: 'rubro', data: rubroDetalle })}
            onDelete={handleDeleteRubro}
            onAddCuenta={() => setModal({ type: 'cuenta' })}
            onDeleteCuenta={handleDeleteCuenta}
            onEditCuenta={c => setModal({ type: 'cuenta', data: c })}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-500">Selecciona un rubro</h3>
            <p className="text-sm text-slate-400 text-center">Elige un rubro de la lista para ver sus movimientos.</p>
          </div>
        )}
      </main>

      {/* Modales */}
      {modal?.type === 'rubro' && (
        <ModalRubro
          rubro={modal.data}
          onClose={closeModal}
          onSave={handleSaveRubro}
        />
      )}
      {modal?.type === 'cuenta' && rubroDetalle && (
        <ModalCuenta
          rubroId={rubroDetalle.id}
          cuenta={modal.data}
          onClose={closeModal}
          onSave={modal.data ? handleUpdateCuenta : handleSaveCuenta}
        />
      )}
      {modal?.type === 'confirm' && (
        <ModalConfirm
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  )
}
