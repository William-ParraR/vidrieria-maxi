-- ═══════════════════════════════════════════
-- Vidriería Maxi — Schema D1 (Cloudflare SQLite)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre        TEXT    NOT NULL,
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,
  rol           TEXT    NOT NULL DEFAULT 'admin',
  created_at    TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clientes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  telefono   TEXT,
  email      TEXT,
  direccion  TEXT,
  notas      TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pedidos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id  INTEGER NOT NULL,
  descripcion TEXT    NOT NULL,
  valor       REAL    NOT NULL,
  estado      TEXT    DEFAULT 'pendiente',
  fecha       TEXT    DEFAULT (date('now')),
  created_at  TEXT    DEFAULT (datetime('now')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS abonos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  monto      REAL    NOT NULL,
  nota       TEXT,
  fecha      TEXT    DEFAULT (date('now')),
  created_at TEXT    DEFAULT (datetime('now')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
