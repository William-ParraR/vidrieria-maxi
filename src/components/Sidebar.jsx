import { cop } from '../utils/format'

export default function Sidebar({ clientes, selectedId, search, onSearch, onSelect, onNewCliente }) {
  return (
    <aside className="w-full h-full flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

      {/* Cabecera */}
      <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
        <button onClick={onNewCliente}
          className="w-full bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo cliente
        </button>

        {/* Búsqueda */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input type="text" value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 bg-slate-50 focus:bg-white transition-all" />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="flex-1 overflow-y-auto">
        {clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-slate-400 text-sm p-10 gap-3">
            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {search
              ? <span>Sin resultados para<br /><strong className="text-slate-500">"{search}"</strong></span>
              : <span>Sin clientes aún.<br />Crea el primero arriba.</span>
            }
          </div>
        ) : clientes.map(c => {
          const active = c.id === selectedId
          const bal    = c.balance
          return (
            <div key={c.id} onClick={() => onSelect(c.id)}
              className={`flex justify-between items-center px-4 py-3.5 border-b border-slate-100 cursor-pointer transition-all ${
                active
                  ? 'bg-cyan-50 border-l-[3px] border-l-cyan-600'
                  : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
              }`}>
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${active ? 'text-cyan-900' : 'text-slate-800'}`}>
                  {c.nombre}
                </div>
                {c.telefono && (
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{c.telefono}</div>
                )}
              </div>
              <div className={`text-xs font-bold ml-2 text-right flex-shrink-0 ${
                bal > 0 ? 'text-red-600' : bal < 0 ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {bal > 0 ? cop(bal) : bal < 0 ? 'Favor' : 'Al dia'}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
