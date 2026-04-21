// src/components/playa/EscuelasSection.tsx
import type { Escuela } from '@/lib/escuelas'
import { Waves, Wind, MapPin, Globe, Phone, PersonSimpleSwim } from '@phosphor-icons/react'

const TIPO_ICON: Record<string, React.ReactNode> = {
  'Surf':               <PersonSimpleSwim size={14} weight="bold"/>,
  'Buceo':              <Waves size={14} weight="bold"/>,
  'Kitesurf':           <Wind size={14} weight="bold"/>,
  'Windsurf':           <Wind size={14} weight="bold"/>,
  'Kayak':              <Waves size={14} weight="bold"/>,
  'Paddle surf':        <Waves size={14} weight="bold"/>,
  'Snorkel':            <Waves size={14} weight="bold"/>,
  'Yoga':               <PersonSimpleSwim size={14} weight="bold"/>,
  'Deportes acuáticos': <Waves size={14} weight="bold"/>,
}

interface Props {
  escuelas: Escuela[]
  locale?: 'es' | 'en'
}

export default function EscuelasSection({ escuelas, locale = 'es' }: Props) {
  if (!escuelas.length) return null

  const titulo = locale === 'en' ? 'Water sports schools' : 'Escuelas de deportes acuáticos'

  return (
    <div style={{ background: 'var(--card-bg,#faf6f0)', border: '1px solid var(--line,#e8dcc8)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }} id="s-escuelas">
      <div style={{ padding: '1rem 1.25rem .75rem', borderBottom: '1px solid var(--line,#e8dcc8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--ink,#2a1a08)', margin: 0, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <Waves size={16} weight="bold"/> {titulo}
        </h2>
        <span style={{ fontSize:'.75rem', color: 'var(--muted,#5a3d12)' }}>OpenStreetMap · {escuelas.length} resultados</span>
      </div>
      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
        {escuelas.map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', padding: '.75rem', background: 'var(--card-bg2,#f5ede0)', borderRadius: '4px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--accent,#6b400a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {TIPO_ICON[e.tipo] ?? <Waves size={14} weight="bold"/>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--ink,#2a1a08)', marginBottom: '.2rem' }}>{e.nombre}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize:'.75rem', fontWeight: 600, color: 'var(--accent,#6b400a)', background: 'var(--accent-soft,#fdecd6)', padding: '.15rem .5rem', borderRadius: '6px' }}>{e.tipo}</span>
                {e.distancia_m && <span style={{ fontSize:'.75rem', color: 'var(--muted,#5a3d12)', display: 'flex', alignItems: 'center', gap: '.2rem' }}><MapPin size={10}/>{e.distancia_m}m</span>}
              </div>
              {(e.web || e.telefono) && (
                <div style={{ display: 'flex', gap: '.75rem', marginTop: '.4rem' }}>
                  {e.web && <a href={e.web} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.72rem', color: 'var(--accent,#6b400a)', display: 'flex', alignItems: 'center', gap: '.2rem', textDecoration: 'none' }}><Globe size={11}/> Web</a>}
                  {e.telefono && <a href={`tel:${e.telefono}`} style={{ fontSize: '.72rem', color: 'var(--accent,#6b400a)', display: 'flex', alignItems: 'center', gap: '.2rem', textDecoration: 'none' }}><Phone size={11}/> {e.telefono}</a>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
