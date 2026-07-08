// Rejilla de webcams de playa para el hub /webcams. SERVER component (sin JS ni
// hidratación): cada tarjeta muestra la imagen actual y enlaza al directo de
// Windy (nueva pestaña) y a la ficha de su playa. Ligero y 100% crawleable.
import Link from 'next/link'
import { Play, MapPin } from '@phosphor-icons/react/dist/ssr'

export interface HubWebcam {
  id: string
  title: string
  thumb: string | null
  embedUrl: string | null
  provincia: string
  municipio: string | null
  playaSlug: string | null
  playaNombre: string | null
}
export interface HubGroup { comunidad: string; cams: HubWebcam[] }

function Card({ w }: { w: HubWebcam }) {
  const verFicha = w.playaSlug ? `/playas/${w.playaSlug}` : null
  const label = w.playaNombre && w.municipio && w.municipio !== w.playaNombre
    ? `${w.playaNombre} · ${w.municipio}` : (w.playaNombre ?? w.municipio ?? '')
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <a
        href={w.embedUrl ?? verFicha ?? '#'}
        target={w.embedUrl ? '_blank' : undefined}
        rel={w.embedUrl ? 'noopener noreferrer' : undefined}
        aria-label={`Ver webcam en directo de ${w.title}`}
        style={{ position: 'relative', display: 'block', aspectRatio: '16 / 9', background: '#0b1620', textDecoration: 'none' }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: w.thumb ? `url(${w.thumb})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,.55)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={19} weight="fill" />
          </span>
        </span>
      </a>
      <div style={{ padding: '.6rem .75rem .7rem', display: 'flex', flexDirection: 'column', gap: '.25rem', flex: 1 }}>
        <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}>{w.title}</div>
        {verFicha && (
          <Link href={verFicha} style={{ fontSize: '.72rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.25rem', marginTop: 'auto' }}>
            <MapPin size={12} weight="bold" aria-hidden="true" /> {label}
          </Link>
        )}
      </div>
    </div>
  )
}

export default function WebcamsHub({ groups }: { groups: HubGroup[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {groups.map(g => (
        <section key={g.comunidad} aria-label={`Webcams en ${g.comunidad}`}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .85rem', display: 'flex', alignItems: 'baseline', gap: '.5rem' }}>
            {g.comunidad}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--muted)', fontWeight: 400 }}>{g.cams.length} cámaras</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '.75rem' }}>
            {g.cams.map(w => <Card key={w.id} w={w} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
