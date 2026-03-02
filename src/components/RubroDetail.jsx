import { cop, fDate } from '../utils/format'

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

function SumCard({ label, value, color, border, accent }) {
  return (
    <div className={`bg-white rounded-2xl border ${border} shadow-sm p-4 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${accent} rounded-l-2xl`} />
      <div className="pl-2">
        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">{label}</div>
        <div className={`text-lg font-extrabold ${color}`}>{value}</div>
      </div>
    </div>
  )
}

export default function RubroDetail({ rubro, onEdit, onDelete, onAddCuenta, onDeleteCuenta, onEditCuenta }) {
  const { cuentas = [], resumen = {} } = rubro

  const ingresos = cuentas.filter(c => c.tipo === 'ingreso')
  const gastos   = cuentas.filter(c => c.tipo === 'gasto')

  return (
    <div className="space-y-4">

      {/* ── Cabecera ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex justify-between items-start gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{rubro.nombre}</h2>
          </div>
          {rubro.descripcion && (
            <p className="text-sm text-slate-500 ml-10">{rubro.descripcion}</p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <EditIcon /> Editar
          </button>
          <button onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <XIcon /> Eliminar
          </button>
        </div>
      </div>

      {/* ── Resumen ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <SumCard
          label="Ingresos"
          value={cop(resumen.total_ingresos)}
          color="text-emerald-700"
          border="border-emerald-100"
          accent="bg-emerald-500"
        />
        <SumCard
          label="Gastos"
          value={cop(resumen.total_gastos)}
          color="text-red-600"
          border="border-red-100"
          accent="bg-red-500"
        />
        <SumCard
          label="Balance"
          value={resumen.balance >= 0 ? cop(resumen.balance) : `-${cop(-resumen.balance)}`}
          color={resumen.balance >= 0 ? 'text-emerald-700' : 'text-red-600'}
          border={resumen.balance >= 0 ? 'border-emerald-100' : 'border-red-100'}
          accent={resumen.balance >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
        />
      </div>

      {/* ── Lista de cuentas ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-sm font-bold text-slate-700">Movimientos</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{cuentas.length}</span>
          </div>
          <button onClick={onAddCuenta}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar
          </button>
        </div>

        {cuentas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Sin movimientos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-5 py-3 font-semibold">Fecha</th>
                  <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-5 py-3 font-semibold">Descripción</th>
                  <th className="text-left text-xs text-slate-400 uppercase tracking-wide px-5 py-3 font-semibold">Nota</th>
                  <th className="text-right text-xs text-slate-400 uppercase tracking-wide px-5 py-3 font-semibold">Valor</th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cuentas.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{fDate(c.fecha)}</td>
                    <td className="px-5 py-3 text-slate-800 font-medium">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          c.tipo === 'ingreso' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {c.descripcion}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{c.nota || <span className="text-slate-200">—</span>}</td>
                    <td className="px-5 py-3 font-bold text-right whitespace-nowrap">
                      <span className={c.tipo === 'ingreso' ? 'text-emerald-700' : 'text-red-600'}>
                        {c.tipo === 'gasto' ? '-' : '+'}{cop(c.valor)}
                      </span>
                    </td>
                    <td className="pr-3 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => onEditCuenta(c)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-cyan-600 hover:bg-cyan-50 transition-colors" title="Editar">
                          <EditIcon />
                        </button>
                        <button onClick={() => onDeleteCuenta(c.id, c.descripcion)}
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

        {/* Subtotales al pie si hay movimientos */}
        {cuentas.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 flex justify-end gap-6 text-xs">
            {ingresos.length > 0 && (
              <span className="text-emerald-700 font-semibold">
                Ingresos: {cop(resumen.total_ingresos)}
              </span>
            )}
            {gastos.length > 0 && (
              <span className="text-red-600 font-semibold">
                Gastos: {cop(resumen.total_gastos)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
