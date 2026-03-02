export default function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`toast-enter px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-xl min-w-[200px] ${
            t.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
