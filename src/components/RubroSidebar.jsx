import { cop } from '../utils/format'

export default function RubroSidebar({ rubros, selectedId, onSelect, onNewRubro }) {
  return (
    <aside className="w-full h-full flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

      {/* Cabecera */}
      <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
        <button onClick={onNewRubro}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo rubro
        </button>
      </div>

      {/* Lista de rubros */}
      <div className="flex-1 overflow-y-auto">
        {rubros.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 text-sm p-10 gap-3">
            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sin rubros aún.<br />Crea el primero arriba.</span>
          </div>
        ) : rubros.map(r => {
          const active = r.id === selectedId
          const bal    = r.balance
          return (
            <div key={r.id} onClick={() => onSelect(r.id)}
              className={`flex justify-between items-center px-4 py-3.5 border-b border-slate-100 cursor-pointer transition-all ${
                active
                  ? 'bg-emerald-50 border-l-[3px] border-l-emerald-600'
                  : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
              }`}>
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${active ? 'text-emerald-900' : 'text-slate-800'}`}>
                  {r.nombre}
                </div>
                {r.descripcion && (
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{r.descripcion}</div>
                )}
              </div>
              <div className={`text-xs font-bold ml-2 text-right flex-shrink-0 ${
                bal > 0 ? 'text-emerald-600' : bal < 0 ? 'text-red-500' : 'text-slate-400'
              }`}>
                {bal !== 0 ? cop(Math.abs(bal)) : '—'}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
