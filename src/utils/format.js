/** Formato moneda colombiana: $300.000 */
export function cop(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n || 0)
}

/** Fecha YYYY-MM-DD → "18 feb. 2026" */
export function fDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/** Hoy en formato YYYY-MM-DD */
export function today() {
  return new Date().toISOString().split('T')[0]
}

/** Escape HTML básico para prevenir XSS */
export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
