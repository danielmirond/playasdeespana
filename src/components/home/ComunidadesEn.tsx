// src/components/home/ComunidadesEn.tsx
import Link from 'next/link'
import styles from './Comunidades.module.css'

interface Comunidad { nombre: string; slug: string; count: number }
interface Props { comunidades: Comunidad[] }

const COLORES: Record<string, [string, string]> = {
  'Andalucía':     ['#c44a1a', '#e88030'],
  'Galicia':       ['#1a4a6e', '#2e7bb4'],
  'Cataluña':      ['#8a2020', '#c04040'],
  'C. Valenciana': ['#6b400a', '#e8a030'],
  'Canarias':      ['#5a2a8a', '#8a50c0'],
  'Baleares':      ['#1a6a5a', '#2a9a7a'],
  'Asturias':      ['#2a5a2a', '#4a8a4a'],
  'Cantabria':     ['#1a3a6a', '#2a5aa0'],
  'País Vasco':    ['#3a1a6a', '#6a3aaa'],
  'Murcia':        ['#8a3810', '#c06030'],
}

const NOMBRES_EN: Record<string, string> = {
  'Andalucía':        'Andalusia',
  'Galicia':          'Galicia',
  'Cataluña':         'Catalonia',
  'C. Valenciana':    'Valencia',
  'Canarias':         'Canary Islands',
  'Baleares':         'Balearic Islands',
  'Asturias':         'Asturias',
  'Cantabria':        'Cantabria',
  'País Vasco':       'Basque Country',
  'Murcia':           'Murcia',
  'Aragón':           'Aragon',
  'Navarra':          'Navarre',
  'La Rioja':         'La Rioja',
  'Madrid':           'Madrid',
  'Extremadura':      'Extremadura',
  'Castilla y León':  'Castile and León',
  'Castilla-La Mancha': 'Castilla-La Mancha',
  'Ceuta':            'Ceuta',
  'Melilla':          'Melilla',
}

function IluCom({ dark, light }: { dark: string; light: string }) {
  return (
    <svg viewBox="0 0 48 38" fill="none" width="48" height="38">
      <rect x="2" y="28" width="44" height="6" rx="2" fill={dark} opacity=".3"/>
      <rect x="0" y="32" width="48" height="6" fill={dark} opacity=".45"/>
      <path d="M2,30 C8,26 16,30 24,27 C32,24 40,28 46,26" fill="none" stroke={light} strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
      <path d="M14,28 A10,10 0 0,1 34,28" fill={light} opacity=".8"/>
      <circle cx="24" cy="28" r="8" fill={dark} opacity=".7"/>
      <circle cx="24" cy="28" r="5" fill={light} opacity=".9"/>
      <line x1="24" y1="12" x2="24" y2="17" stroke={light} strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      <line x1="14" y1="16" x2="17" y2="20" stroke={light} strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
      <line x1="34" y1="16" x2="31" y2="20" stroke={light} strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
    </svg>
  )
}

export default function ComunidadesEn({ comunidades }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.hd}>
        <span className={styles.hdTitle}>By region</span>
        <Link href="/en/communities" className={styles.hdAction}>View all →</Link>
      </div>
      <div className={styles.grid}>
        {comunidades.map(c => {
          const [dark, light] = COLORES[c.nombre] ?? ['#6b400a', '#e8a030']
          const nombreEn = NOMBRES_EN[c.nombre] ?? c.nombre
          return (
            <Link key={c.slug} href={`/en/communities/${c.slug}`} className={styles.item}>
              <div className={styles.ilu}><IluCom dark={dark} light={light}/></div>
              <span className={styles.nombre}>{nombreEn}</span>
              <span className={styles.n}>{c.count} beaches</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
