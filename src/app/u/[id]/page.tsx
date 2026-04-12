// src/app/u/[id]/page.tsx — Perfil público de un usuario.
//
// Muestra el nickname, fecha de primer comentario, conteo, y la lista
// de comentarios ordenados del más reciente al más antiguo.
//
// Este perfil es "anónimo por dispositivo" — no hay dueño real, solo
// un UUID que apareció comentando. El objetivo de la página es dar
// contexto cuando alguien clica en el nickname de un comentario, no
// crear una red social.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getComentariosByUser, type Comentario } from '@/lib/comentarios'
import { avatarColor, avatarIniciales } from '@/lib/perfilCliente'

export const revalidate = 60

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const comentarios = await getComentariosByUser(id, 1)
  const nickname = comentarios[0]?.nickname ?? 'Usuario'
  return {
    title: `${nickname} — Perfil`,
    description: `Comentarios publicados por ${nickname} en playas-espana.com`,
    robots: { index: false, follow: false }, // perfiles anónimos no se indexan
  }
}

function tiempoRelativo(ts: number): string {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 60)   return 'hace un momento'
  const m = Math.floor(s / 60)
  if (m < 60)   return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24)   return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30)   return `hace ${d} días`
  const mo = Math.floor(d / 30)
  if (mo < 12)  return `hace ${mo} meses`
  return new Date(ts).toLocaleDateString('es')
}

export default async function PerfilPage({ params }: Props) {
  const { id } = await params
  const comentarios: Comentario[] = await getComentariosByUser(id, 100)

  const nickname = comentarios[0]?.nickname ?? 'Usuario anónimo'
  const avatarSeed = comentarios[0]?.avatarSeed ?? id
  const primero = comentarios.length > 0
    ? Math.min(...comentarios.map(c => c.ts))
    : null

  return (
    <>
      <Nav />
      <main role="main" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        {/* Cabecera del perfil */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          marginBottom: '2rem', paddingBottom: '1.25rem',
          borderBottom: '1.5px solid var(--line)',
        }}>
          <div
            aria-hidden="true"
            style={{
              flexShrink: 0, width: 72, height: 72, borderRadius: '50%',
              background: avatarColor(avatarSeed),
              color: '#fff', fontWeight: 800, fontSize: '1.5rem',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {avatarIniciales(nickname)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 900,
              color: 'var(--ink)', margin: 0, letterSpacing: '-.02em',
            }}>
              {nickname}
            </h1>
            <p style={{
              margin: '.25rem 0 0',
              fontSize: '.82rem', color: 'var(--muted)',
            }}>
              {comentarios.length === 0
                ? 'Sin comentarios publicados.'
                : `${comentarios.length} ${comentarios.length === 1 ? 'comentario' : 'comentarios'}${primero ? ` · primer comentario ${tiempoRelativo(primero)}` : ''}`}
            </p>
          </div>
        </header>

        {/* Lista */}
        {comentarios.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            <p>Este usuario todavía no ha publicado comentarios.</p>
            <p style={{ marginTop: '.5rem' }}>
              <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Volver al inicio
              </Link>
            </p>
          </div>
        ) : (
          <ul role="list" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {comentarios.map(c => (
              <li key={c.id} style={{
                background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                borderRadius: 14, padding: '1rem 1.1rem',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', gap: '.5rem',
                  marginBottom: '.4rem', flexWrap: 'wrap',
                }}>
                  <Link
                    href={`/playas/${c.playa}`}
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1rem', fontWeight: 800,
                      color: 'var(--accent)', textDecoration: 'none',
                    }}
                  >
                    {c.playaNombre ?? c.playa}
                  </Link>
                  <time dateTime={new Date(c.ts).toISOString()} style={{
                    fontSize: '.72rem', color: 'var(--muted)',
                  }}>
                    {tiempoRelativo(c.ts)}
                  </time>
                </div>
                <p style={{
                  margin: 0, fontSize: '.88rem', lineHeight: 1.55,
                  color: 'var(--ink)',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {c.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
