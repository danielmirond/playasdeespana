// src/lib/perfilCliente.ts
// Gestión del perfil anónimo en localStorage. El perfil vive en el
// navegador, se genera en el primer comentario y se persiste entre
// visitas. No hay auth en el servidor — el servidor confía en el UUID
// que viene en el body del POST y lo asocia al comentario.
//
// Si el usuario limpia el localStorage o cambia de dispositivo pierde
// la identidad y empieza de cero. Es un tradeoff consciente para
// mantener el site sin infraestructura de auth.

export interface PerfilLocal {
  id:         string       // UUID
  nickname:   string       // visible
  avatarSeed: string       // para el color del avatar (= id normalmente)
  createdAt:  number       // Date.now()
}

const KEY = 'playas:perfil'

export function leerPerfil(): PerfilLocal | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<PerfilLocal>
    if (!p.id || !p.nickname) return null
    return {
      id: p.id,
      nickname: p.nickname,
      avatarSeed: p.avatarSeed ?? p.id,
      createdAt: p.createdAt ?? Date.now(),
    }
  } catch {
    return null
  }
}

export function guardarPerfil(p: PerfilLocal): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function crearPerfil(nickname: string): PerfilLocal {
  const clean = nickname.trim().slice(0, 30)
  const id = crypto.randomUUID()
  const p: PerfilLocal = {
    id,
    nickname: clean,
    avatarSeed: id,
    createdAt: Date.now(),
  }
  guardarPerfil(p)
  return p
}

export function actualizarNickname(nickname: string): PerfilLocal | null {
  const current = leerPerfil()
  if (!current) return null
  const next: PerfilLocal = { ...current, nickname: nickname.trim().slice(0, 30) }
  guardarPerfil(next)
  return next
}

// ── Avatar generator ───────────────────────────────────────────────
// Color de fondo determinista a partir del seed (UUID). Las iniciales
// vienen del nickname (primer carácter de cada palabra, max 2).
const PALETA = [
  '#6b400a', '#0ea5e9', '#a855f7', '#22c55e', '#f97316',
  '#ef4444', '#eab308', '#14b8a6', '#e879a0', '#8b5cf6',
]

export function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return PALETA[Math.abs(hash) % PALETA.length]
}

export function avatarIniciales(nickname: string): string {
  const parts = nickname.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p.charAt(0).toUpperCase()).join('') || '?'
}
