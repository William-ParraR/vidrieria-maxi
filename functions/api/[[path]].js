/**
 * Vidriería Maxi — API Backend
 * Hono.js en Cloudflare Pages Functions + D1
 *
 * SEGURIDAD: JWT_SECRET vive SOLO en variables de entorno de Cloudflare.
 * Nunca llega al frontend. Contraseñas: PBKDF2-SHA256 (WebCrypto nativo).
 *
 * NOTA CLOUDFLARE WORKERS FREE TIER:
 * El límite de CPU es 10ms por request. PBKDF2 se ejecuta en código nativo
 * de WebCrypto (no cuenta como CPU JavaScript), por eso usamos 10.000 iter.
 */

import { Hono }   from 'hono'
import { handle } from 'hono/cloudflare-pages'

// ── JWT nativo con WebCrypto (funciona en Cloudflare Workers/Pages) ───────────
const b64url = {
  encode: buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
  decode: str => Uint8Array.from(
    atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)
  ),
}
const enc = new TextEncoder()
const dec = new TextDecoder()

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
}

async function sign(payload, secret) {
  const h = b64url.encode(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const p = b64url.encode(enc.encode(JSON.stringify(payload)))
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${h}.${p}`))
  return `${h}.${p}.${b64url.encode(sig)}`
}

async function verify(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Token inválido')
  const [h, p, s] = parts
  const key = await hmacKey(secret)
  const ok = await crypto.subtle.verify('HMAC', key, b64url.decode(s), enc.encode(`${h}.${p}`))
  if (!ok) throw new Error('Firma inválida')
  const payload = JSON.parse(dec.decode(b64url.decode(p)))
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) throw new Error('Token expirado')
  return payload
}

const app = new Hono().basePath('/api')

// ── Hashing de contraseñas (PBKDF2-SHA256 via WebCrypto nativo) ───────────────
// 10.000 iteraciones: seguro para uso interno, compatible con límite de CPU de Workers
const ITERATIONS = 10_000

const toHex   = buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
const fromHex = hex => new Uint8Array((hex.match(/.{2}/g) || []).map(b => parseInt(b, 16)))

async function hashPassword(password) {
  const enc  = new TextEncoder()
  const key  = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256
  )
  return `${ITERATIONS}$${toHex(salt)}$${toHex(bits)}`
}

async function verifyPassword(password, stored) {
  // Formato: "iterations$saltHex$hashHex"
  const parts = stored.split('$')
  if (parts.length !== 3) return false
  const [iterStr, saltHex, hashHex] = parts
  const iter = parseInt(iterStr) || ITERATIONS

  const enc  = new TextEncoder()
  const key  = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: iter }, key, 256
  )
  return toHex(bits) === hashHex
}

// ── Middleware de autenticación ───────────────────────────────────────────────
const requireAuth = async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return c.json({ error: 'No autorizado. Inicia sesión.' }, 401)
  try {
    const payload = await verify(header.slice(7), c.env.JWT_SECRET)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Sesión expirada. Inicia sesión nuevamente.' }, 401)
  }
}

// ── Helper: crear JWT ─────────────────────────────────────────────────────────
function makeToken(payload, secret) {
  return sign({ ...payload, exp: Math.floor(Date.now() / 1000) + 28_800 }, secret)
}

const today = () => new Date().toISOString().split('T')[0]

// ════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════

// ¿Necesita configuración inicial?
app.get('/auth/setup-needed', async (c) => {
  const row = await c.env.DB.prepare('SELECT COUNT(*) AS cnt FROM usuarios').first()
  return c.json({ needsSetup: row.cnt === 0 })
})

// Crear primer administrador
app.post('/auth/setup', async (c) => {
  // Verificar que los bindings estén disponibles
  if (!c.env.DB)         return c.json({ error: 'Base de datos no configurada (DB binding faltante).' }, 503)
  if (!c.env.JWT_SECRET) return c.json({ error: 'JWT_SECRET no configurado en Cloudflare (Pages → Settings → Environment variables → Secrets).' }, 503)

  const row = await c.env.DB.prepare('SELECT COUNT(*) AS cnt FROM usuarios').first()
  if (row.cnt > 0) return c.json({ error: 'El sistema ya está configurado.' }, 403)

  let body
  try { body = await c.req.json() } catch {
    return c.json({ error: 'El cuerpo de la solicitud no es JSON válido.' }, 400)
  }
  const { nombre, email, password } = body

  if (!nombre?.trim() || !email?.trim() || !password)
    return c.json({ error: 'Nombre, email y contraseña son requeridos.' }, 400)
  if (password.length < 8)
    return c.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 400)

  const hash   = await hashPassword(password)
  const result = await c.env.DB.prepare(
    'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)'
  ).bind(nombre.trim(), email.trim().toLowerCase(), hash, 'superadmin').run()

  const token = await makeToken(
    { userId: result.meta.last_row_id, email: email.trim().toLowerCase(), rol: 'superadmin' },
    c.env.JWT_SECRET
  )
  return c.json({ token, nombre: nombre.trim(), email: email.trim().toLowerCase(), rol: 'superadmin' })
})

// Login
app.post('/auth/login', async (c) => {
  if (!c.env.DB)         return c.json({ error: 'Base de datos no configurada.' }, 503)
  if (!c.env.JWT_SECRET) return c.json({ error: 'JWT_SECRET no configurado en Cloudflare.' }, 503)

  let body
  try { body = await c.req.json() } catch {
    return c.json({ error: 'El cuerpo de la solicitud no es JSON válido.' }, 400)
  }
  const { email, password } = body
  if (!email || !password) return c.json({ error: 'Email y contraseña son requeridos.' }, 400)

  const user  = await c.env.DB.prepare('SELECT * FROM usuarios WHERE email = ?').bind(email.toLowerCase()).first()
  const valid = user ? await verifyPassword(password, user.password_hash) : false
  if (!user || !valid) return c.json({ error: 'Credenciales incorrectas.' }, 401)

  const token = await makeToken({ userId: user.id, email: user.email, rol: user.rol }, c.env.JWT_SECRET)
  return c.json({ token, nombre: user.nombre, email: user.email, rol: user.rol })
})

// Obtener usuario actual
app.get('/auth/me', requireAuth, async (c) => {
  const u   = c.get('user')
  const row = await c.env.DB.prepare('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?').bind(u.userId).first()
  if (!row) return c.json({ error: 'Usuario no encontrado.' }, 404)
  return c.json(row)
})

// Crear usuario del sistema
app.post('/auth/usuarios', requireAuth, async (c) => {
  let body
  try { body = await c.req.json() } catch {
    return c.json({ error: 'JSON inválido.' }, 400)
  }
  const { nombre, email, password, rol } = body
  if (!nombre?.trim() || !email?.trim() || !password)
    return c.json({ error: 'Nombre, email y contraseña son requeridos.' }, 400)
  if (password.length < 8)
    return c.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 400)
  try {
    const hash   = await hashPassword(password)
    const result = await c.env.DB.prepare(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)'
    ).bind(nombre.trim(), email.trim().toLowerCase(), hash, rol || 'admin').run()
    return c.json({ id: result.meta.last_row_id, nombre: nombre.trim(), email: email.trim().toLowerCase() }, 201)
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return c.json({ error: 'Ese email ya está registrado.' }, 400)
    throw err
  }
})

// ════════════════════════════════════════════════════════════════
// CLIENTES
// ════════════════════════════════════════════════════════════════

app.get('/clientes', requireAuth, async (c) => {
  const s = `%${(c.req.query('search') || '').trim()}%`
  const { results } = await c.env.DB.prepare(`
    SELECT
      c.id, c.nombre, c.telefono, c.email, c.direccion, c.notas, c.created_at,
      COALESCE((SELECT SUM(p.valor) FROM pedidos p WHERE p.cliente_id = c.id), 0) AS total_pedidos,
      COALESCE((SELECT SUM(a.monto) FROM abonos  a WHERE a.cliente_id = c.id), 0) AS total_abonos
    FROM clientes c
    WHERE c.nombre LIKE ? OR c.telefono LIKE ? OR c.email LIKE ?
    ORDER BY c.nombre COLLATE NOCASE
  `).bind(s, s, s).all()
  return c.json(results.map(r => ({ ...r, balance: r.total_pedidos - r.total_abonos })))
})

app.get('/clientes/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const cliente = await c.env.DB.prepare('SELECT * FROM clientes WHERE id = ?').bind(id).first()
  if (!cliente) return c.json({ error: 'Cliente no encontrado.' }, 404)

  const { results: pedidos } = await c.env.DB.prepare(
    'SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY fecha DESC, id DESC'
  ).bind(id).all()
  const { results: abonos } = await c.env.DB.prepare(
    'SELECT * FROM abonos WHERE cliente_id = ? ORDER BY fecha DESC, id DESC'
  ).bind(id).all()

  const totalPedidos = pedidos.reduce((s, p) => s + p.valor, 0)
  const totalAbonos  = abonos.reduce((s, a)  => s + a.monto, 0)
  return c.json({
    ...cliente, pedidos, abonos,
    resumen: { total_pedidos: totalPedidos, total_abonos: totalAbonos, balance: totalPedidos - totalAbonos },
  })
})

app.post('/clientes', requireAuth, async (c) => {
  const { nombre, telefono, email, direccion, notas } = await c.req.json()
  if (!nombre?.trim()) return c.json({ error: 'El nombre del cliente es requerido.' }, 400)
  const result = await c.env.DB.prepare(
    'INSERT INTO clientes (nombre, telefono, email, direccion, notas) VALUES (?, ?, ?, ?, ?)'
  ).bind(nombre.trim(), telefono || null, email || null, direccion || null, notas || null).run()
  return c.json({ id: result.meta.last_row_id, nombre: nombre.trim(), telefono, email, direccion, notas }, 201)
})

app.put('/clientes/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const { nombre, telefono, email, direccion, notas } = await c.req.json()
  if (!nombre?.trim()) return c.json({ error: 'El nombre es requerido.' }, 400)
  const result = await c.env.DB.prepare(
    'UPDATE clientes SET nombre=?, telefono=?, email=?, direccion=?, notas=? WHERE id=?'
  ).bind(nombre.trim(), telefono || null, email || null, direccion || null, notas || null, id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Cliente no encontrado.' }, 404)
  return c.json({ success: true })
})

app.delete('/clientes/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare('DELETE FROM clientes WHERE id = ?').bind(id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Cliente no encontrado.' }, 404)
  return c.json({ success: true })
})

// ════════════════════════════════════════════════════════════════
// PEDIDOS
// ════════════════════════════════════════════════════════════════

app.post('/pedidos', requireAuth, async (c) => {
  const { cliente_id, descripcion, valor, estado, fecha } = await c.req.json()
  if (!cliente_id || !descripcion?.trim()) return c.json({ error: 'cliente_id y descripción son requeridos.' }, 400)
  if (typeof valor !== 'number' || valor <= 0) return c.json({ error: 'El valor debe ser mayor a 0.' }, 400)
  const result = await c.env.DB.prepare(
    'INSERT INTO pedidos (cliente_id, descripcion, valor, estado, fecha) VALUES (?, ?, ?, ?, ?)'
  ).bind(cliente_id, descripcion.trim(), valor, estado || 'pendiente', fecha || today()).run()
  return c.json({ id: result.meta.last_row_id, cliente_id, descripcion: descripcion.trim(), valor }, 201)
})

app.put('/pedidos/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const { descripcion, valor, estado, fecha } = await c.req.json()
  if (!descripcion?.trim() || typeof valor !== 'number' || valor <= 0)
    return c.json({ error: 'Descripción y valor válido son requeridos.' }, 400)
  const result = await c.env.DB.prepare(
    'UPDATE pedidos SET descripcion=?, valor=?, estado=?, fecha=? WHERE id=?'
  ).bind(descripcion.trim(), valor, estado || 'pendiente', fecha, id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Pedido no encontrado.' }, 404)
  return c.json({ success: true })
})

app.delete('/pedidos/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare('DELETE FROM pedidos WHERE id = ?').bind(id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Pedido no encontrado.' }, 404)
  return c.json({ success: true })
})

// ════════════════════════════════════════════════════════════════
// ABONOS
// ════════════════════════════════════════════════════════════════

app.post('/abonos', requireAuth, async (c) => {
  const { cliente_id, monto, nota, fecha } = await c.req.json()
  if (!cliente_id || typeof monto !== 'number' || monto <= 0)
    return c.json({ error: 'cliente_id y monto válido son requeridos.' }, 400)
  const result = await c.env.DB.prepare(
    'INSERT INTO abonos (cliente_id, monto, nota, fecha) VALUES (?, ?, ?, ?)'
  ).bind(cliente_id, monto, nota?.trim() || null, fecha || today()).run()
  return c.json({ id: result.meta.last_row_id, cliente_id, monto, nota: nota?.trim() || null }, 201)
})

app.put('/abonos/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const { monto, nota, fecha } = await c.req.json()
  if (typeof monto !== 'number' || monto <= 0)
    return c.json({ error: 'Monto válido es requerido.' }, 400)
  const result = await c.env.DB.prepare(
    'UPDATE abonos SET monto=?, nota=?, fecha=? WHERE id=?'
  ).bind(monto, nota?.trim() || null, fecha, id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Abono no encontrado.' }, 404)
  return c.json({ success: true })
})

app.delete('/abonos/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare('DELETE FROM abonos WHERE id = ?').bind(id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Abono no encontrado.' }, 404)
  return c.json({ success: true })
})

// ════════════════════════════════════════════════════════════════
// RUBROS (Finca personal)
// ════════════════════════════════════════════════════════════════

app.get('/rubros', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT
      r.id, r.nombre, r.descripcion, r.created_at,
      COALESCE((SELECT SUM(cf.valor) FROM cuentas_finca cf WHERE cf.rubro_id = r.id AND cf.tipo = 'ingreso'), 0) AS total_ingresos,
      COALESCE((SELECT SUM(cf.valor) FROM cuentas_finca cf WHERE cf.rubro_id = r.id AND cf.tipo = 'gasto'),   0) AS total_gastos
    FROM rubros r
    ORDER BY r.nombre COLLATE NOCASE
  `).all()
  return c.json(results.map(r => ({ ...r, balance: r.total_ingresos - r.total_gastos })))
})

app.get('/rubros/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const rubro = await c.env.DB.prepare('SELECT * FROM rubros WHERE id = ?').bind(id).first()
  if (!rubro) return c.json({ error: 'Rubro no encontrado.' }, 404)

  const { results: cuentas } = await c.env.DB.prepare(
    'SELECT * FROM cuentas_finca WHERE rubro_id = ? ORDER BY fecha DESC, id DESC'
  ).bind(id).all()

  const totalIngresos = cuentas.filter(c => c.tipo === 'ingreso').reduce((s, c) => s + c.valor, 0)
  const totalGastos   = cuentas.filter(c => c.tipo === 'gasto').reduce((s, c) => s + c.valor, 0)
  return c.json({
    ...rubro, cuentas,
    resumen: { total_ingresos: totalIngresos, total_gastos: totalGastos, balance: totalIngresos - totalGastos },
  })
})

app.post('/rubros', requireAuth, async (c) => {
  const { nombre, descripcion } = await c.req.json()
  if (!nombre?.trim()) return c.json({ error: 'El nombre del rubro es requerido.' }, 400)
  const result = await c.env.DB.prepare(
    'INSERT INTO rubros (nombre, descripcion) VALUES (?, ?)'
  ).bind(nombre.trim(), descripcion?.trim() || null).run()
  return c.json({ id: result.meta.last_row_id, nombre: nombre.trim(), descripcion: descripcion?.trim() || null }, 201)
})

app.put('/rubros/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const { nombre, descripcion } = await c.req.json()
  if (!nombre?.trim()) return c.json({ error: 'El nombre es requerido.' }, 400)
  const result = await c.env.DB.prepare(
    'UPDATE rubros SET nombre=?, descripcion=? WHERE id=?'
  ).bind(nombre.trim(), descripcion?.trim() || null, id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Rubro no encontrado.' }, 404)
  return c.json({ success: true })
})

app.delete('/rubros/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM cuentas_finca WHERE rubro_id = ?').bind(id).run()
  const result = await c.env.DB.prepare('DELETE FROM rubros WHERE id = ?').bind(id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Rubro no encontrado.' }, 404)
  return c.json({ success: true })
})

// ════════════════════════════════════════════════════════════════
// CUENTAS FINCA
// ════════════════════════════════════════════════════════════════

app.post('/cuentas-finca', requireAuth, async (c) => {
  const { rubro_id, descripcion, valor, tipo, fecha, nota } = await c.req.json()
  if (!rubro_id || !descripcion?.trim()) return c.json({ error: 'rubro_id y descripción son requeridos.' }, 400)
  if (typeof valor !== 'number' || valor <= 0) return c.json({ error: 'El valor debe ser mayor a 0.' }, 400)
  if (!['ingreso', 'gasto'].includes(tipo)) return c.json({ error: 'El tipo debe ser ingreso o gasto.' }, 400)
  const result = await c.env.DB.prepare(
    'INSERT INTO cuentas_finca (rubro_id, descripcion, valor, tipo, fecha, nota) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(rubro_id, descripcion.trim(), valor, tipo, fecha || today(), nota?.trim() || null).run()
  return c.json({ id: result.meta.last_row_id, rubro_id, descripcion: descripcion.trim(), valor, tipo }, 201)
})

app.put('/cuentas-finca/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const { descripcion, valor, tipo, fecha, nota } = await c.req.json()
  if (!descripcion?.trim() || typeof valor !== 'number' || valor <= 0)
    return c.json({ error: 'Descripción y valor válido son requeridos.' }, 400)
  if (!['ingreso', 'gasto'].includes(tipo)) return c.json({ error: 'El tipo debe ser ingreso o gasto.' }, 400)
  const result = await c.env.DB.prepare(
    'UPDATE cuentas_finca SET descripcion=?, valor=?, tipo=?, fecha=?, nota=? WHERE id=?'
  ).bind(descripcion.trim(), valor, tipo, fecha, nota?.trim() || null, id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Cuenta no encontrada.' }, 404)
  return c.json({ success: true })
})

app.delete('/cuentas-finca/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare('DELETE FROM cuentas_finca WHERE id = ?').bind(id).run()
  if (result.meta.changes === 0) return c.json({ error: 'Cuenta no encontrada.' }, 404)
  return c.json({ success: true })
})

// ── Error handler: muestra el error real (útil para depuración) ───────────────
app.onError((err, c) => {
  console.error('API Error:', err.message)
  return c.json({ error: err.message || 'Error interno del servidor.' }, 500)
})

export const onRequest = handle(app)
