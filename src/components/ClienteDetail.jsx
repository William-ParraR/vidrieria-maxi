import { cop, fDate } from '../utils/format'

const estadoCls = {
  pendiente: 'bg-amber-50  text-amber-800  border border-amber-200',
  entregado: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  cancelado: 'bg-red-50    text-red-800    border border-red-200',
}

function toWA(phone) {
  const d = phone.replace(/\D/g, '')
  return d.length === 10 ? '57' + d : d
}

function shareToWhatsApp(phone, message) {
  const url = `https://wa.me/${toWA(phone)}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

function buildCotizacionMsg(cliente, pedidos, resumen) {
  const fecha = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
  let msg = `*VIDRIERÍA MAXI*\n`
  msg += `_Cotización_\n\n`
  msg += `Fecha: ${fecha}\n`
  msg += `Cliente: *${cliente.nombre}*\n`
  if (cliente.direccion) msg += `Dirección: ${cliente.direccion}\n`
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`
  msg += `*DETALLE DE PRODUCTOS*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`
  pedidos.forEach((p, i) => {
    msg += `${i + 1}. ${p.descripcion}\n`
    msg += `   Valor: *${cop(p.valor)}*\n`
    msg += `   Estado: ${p.estado}\n\n`
  })
  msg += `━━━━━━━━━━━━━━━━━━━━\n`
  msg += `*TOTAL: ${cop(resumen.total_pedidos)}*\n`
  if (resumen.total_abonos > 0) {
    msg += `Abonado: ${cop(resumen.total_abonos)}\n`
    msg += `*Saldo: ${cop(resumen.balance)}*\n`
  }
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`
  msg += `Gracias por su preferencia.\n`
  msg += `_Vidriería Maxi_`
  return msg
}

function buildPedidoMsg(cliente, pedido) {
  const fecha = fDate(pedido.fecha)
  let msg = `*VIDRIERÍA MAXI*\n\n`
  msg += `Hola *${cliente.nombre}*,\n\n`
  msg += `Le compartimos información de su pedido:\n\n`
  msg += `Descripción: *${pedido.descripcion}*\n`
  msg += `Valor: *${cop(pedido.valor)}*\n`
  msg += `Estado: ${pedido.estado}\n`
  msg += `Fecha: ${fecha}\n\n`
  msg += `Cualquier duda estamos a su disposición.\n`
  msg += `_Vidriería Maxi_`
  return msg
}

function buildAbonoMsg(cliente, abono, resumen) {
  const fecha = fDate(abono.fecha)
  let msg = `*VIDRIERÍA MAXI*\n`
  msg += `_Confirmación de Abono_\n\n`
  msg += `Hola *${cliente.nombre}*,\n\n`
  msg += `Confirmamos su abono:\n\n`
  msg += `Monto: *${cop(abono.monto)}*\n`
  msg += `Fecha: ${fecha}\n`
  if (abono.nota) msg += `Nota: ${abono.nota}\n`
  msg += `\n━━━━━━━━━━━━━━━━━━━━\n`
  msg += `Total pedidos: ${cop(resumen.total_pedidos)}\n`
  msg += `Total abonado: ${cop(resumen.total_abonos)}\n`
  msg += `*Saldo pendiente: ${resumen.balance > 0 ? cop(resumen.balance) : 'Al día'}*\n`
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`
  msg += `Gracias por su pago.\n`
  msg += `_Vidriería Maxi_`
  return msg
}

function PhoneIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

// Renderiza descripción con checkboxes interactivos
function DescripcionConChecks({ texto, pedidoId, onToggle }) {
  if (!texto) return null

  const lines = texto.split('\n')

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        // Detectar checkbox: [ ] o [x] o [X]
        const checkMatch = line.match(/^\[( |x|X)\]\s*(.*)$/)
        if (checkMatch) {
          const isChecked = checkMatch[1].toLowerCase() === 'x'
          const content = checkMatch[2]
          return (
            <label
              key={idx}
              className="flex items-start gap-2 cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation()
                onToggle(pedidoId, idx, !isChecked)
              }}
            >
              <span className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
                isChecked
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 group-hover:border-cyan-400'
              }`}>
                {isChecked && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {content || <span className="text-slate-300 italic">Sin texto</span>}
              </span>
            </label>
          )
        }
        // Línea normal (no checkbox)
        if (line.trim()) {
          return <div key={idx} className="text-sm text-slate-700">{line}</div>
        }
        // Línea vacía
        return <div key={idx} className="h-2" />
      })}
    </div>
  )
}

// Cuenta checks completados
function countChecks(texto) {
  if (!texto) return null
  const lines = texto.split('\n')
  let total = 0, done = 0
  lines.forEach(line => {
    const m = line.match(/^\[( |x|X)\]/)
    if (m) {
      total++
      if (m[1].toLowerCase() === 'x') done++
    }
  })
  if (total === 0) return null
  return { done, total }
}

export default function ClienteDetail({ cliente, onEdit, onDelete, onAddPedido, onAddAbono, onDeletePedido, onDeleteAbono, onEditPedido, onEditAbono, onTogglePedidoCheck }) {
  const { pedidos = [], abonos = [], resumen = {} } = cliente

  return (
    <div className="space-y-4">

      {/* ── Cabecera del cliente ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex justify-between items-start gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">{cliente.nombre}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2">

            {cliente.telefono && (
              <div className="flex items-center gap-1.5">
                <PhoneIcon />
                <a href={`tel:${cliente.telefono.replace(/\D/g, '')}`}
                  className="text-sm text-slate-600 hover:text-cyan-700 transition-colors">
                  {cliente.telefono}
                </a>
                <a href={`https://wa.me/${toWA(cliente.telefono)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 font-medium transition-colors ml-0.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            )}

            {cliente.direccion && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <LocationIcon />
                <span>{cliente.direccion}</span>
              </div>
            )}

            {cliente.notas && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <NoteIcon />
                <span>{cliente.notas}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      {/* ── Resumen financiero ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <SumCard label="Total pedidos" value={cop(resumen.total_pedidos)} color="text-cyan-700" bg="bg-white" border="border-cyan-100" accent="bg-cyan-500" />
        <SumCard label="Total abonado" value={cop(resumen.total_abonos)}  color="text-emerald-700" bg="bg-white" border="border-emerald-100" accent="bg-emerald-500" />
        <SumCard
          label="Saldo pendiente"
          value={resumen.balance > 0 ? cop(resumen.balance) : resumen.balance < 0 ? `Favor ${cop(-resumen.balance)}` : 'Al día'}
          color={resumen.balance > 0 ? 'text-red-600' : 'text-emerald-700'}
          bg="bg-white"
          border={resumen.balance > 0 ? 'border-red-100' : 'border-emerald-100'}
          accent={resumen.balance > 0 ? 'bg-red-500' : 'bg-emerald-500'}
        />
      </div>

      {/* ── Pedidos ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-sm font-bold text-slate-700">Pedidos</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{pedidos.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {pedidos.length > 0 && cliente.telefono && (
              <button onClick={() => shareToWhatsApp(cliente.telefono, buildCotizacionMsg(cliente, pedidos, resumen))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">
                <ShareIcon />
                Cotización
              </button>
            )}
            <button onClick={onAddPedido}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>
          </div>
        </div>

        {pedidos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Sin pedidos registrados.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pedidos.map(p => {
              const checks = countChecks(p.descripcion)
              return (
                <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors">
                  {/* Header del pedido */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">{fDate(p.fecha)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${estadoCls[p.estado] || estadoCls.pendiente}`}>
                        {p.estado}
                      </span>
                      {checks && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          checks.done === checks.total
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {checks.done}/{checks.total} cortes
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {cliente.telefono && (
                        <button onClick={() => shareToWhatsApp(cliente.telefono, buildPedidoMsg(cliente, p))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Compartir por WhatsApp">
                          <ShareIcon />
                        </button>
                      )}
                      <button onClick={() => onEditPedido(p)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-cyan-600 hover:bg-cyan-50 transition-colors" title="Editar">
                        <EditIcon />
                      </button>
                      <button onClick={() => onDeletePedido(p.id, p.descripcion.split('\n')[0])}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
                        <XIcon />
                      </button>
                    </div>
                  </div>

                  {/* Descripción con checkboxes */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-2">
                    <DescripcionConChecks
                      texto={p.descripcion}
                      pedidoId={p.id}
                      onToggle={onTogglePedidoCheck}
                    />
                  </div>

                  {/* Valor */}
                  <div className="flex justify-end">
                    <span className="text-base font-bold text-slate-900">{cop(p.valor)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Abonos ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-sm font-bold text-slate-700">Abonos</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{abonos.length}</span>
          </div>
          <button onClick={onAddAbono}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar
          </button>
        </div>

        {abonos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Sin abonos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-5 py-3 font-semibold">Fecha</th>
                  <th className="text-right text-xs text-slate-400 uppercase tracking-wide px-5 py-3 font-semibold">Monto</th>
                  <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-5 py-3 font-semibold">Nota</th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {abonos.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{fDate(a.fecha)}</td>
                    <td className="px-5 py-3 font-bold text-right text-emerald-700 whitespace-nowrap">{cop(a.monto)}</td>
                    <td className="px-5 py-3 text-slate-500">{a.nota || <span className="text-slate-300">—</span>}</td>
                    <td className="pr-3 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {cliente.telefono && (
                          <button onClick={() => shareToWhatsApp(cliente.telefono, buildAbonoMsg(cliente, a, resumen))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Compartir por WhatsApp">
                            <ShareIcon />
                          </button>
                        )}
                        <button onClick={() => onEditAbono(a)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-cyan-600 hover:bg-cyan-50 transition-colors" title="Editar">
                          <EditIcon />
                        </button>
                        <button onClick={() => onDeleteAbono(a.id, a.monto)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
                          <XIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function SumCard({ label, value, color, bg, border, accent }) {
  return (
    <div className={`${bg} rounded-2xl border ${border} shadow-sm p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${accent} rounded-l-2xl`} />
      <div className="pl-2">
        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">{label}</div>
        <div className={`text-lg font-extrabold ${color}`}>{value}</div>
      </div>
    </div>
  )
}
