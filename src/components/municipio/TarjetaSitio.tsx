// src/components/municipio/TarjetaSitio.tsx — un sitio de «qué hacer»:
// foto con licencia si la hay, pictograma del tipo sobre tinta si no, chip
// de tipo, nombre, el resumen de dos frases cuando existe y las acciones.
import Link from 'next/link'
import type { Poi } from '@/lib/municipio-pois'
import Pictograma from './Pictograma'
import styles from './Municipio.module.css'

export default function TarjetaSitio({ p }: { p: Poi }) {
  return (
    <article className={styles.sitio}>
      <div className={styles.sitioFoto}>
        {p.foto
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.foto.url} alt={p.nombre} loading="lazy" decoding="async" />
          : <Pictograma tipo={p.tipo} />}
        <span className={styles.sitioTipo}>{p.tipo}</span>
        {p.foto?.autor && <span className={styles.sitioCredito}>Foto: {p.foto.autor}</span>}
      </div>
      <div className={styles.sitioCuerpo}>
        <div className={styles.sitioNombre}>
          {p.website
            ? <a href={p.website} target="_blank" rel="noopener nofollow" style={{ color: 'inherit', textDecoration: 'none' }}>{p.nombre}</a>
            : p.nombre}
        </div>
        {p.resumen && <p className={styles.sitioResumen} style={{ margin: 0 }}>{p.resumen}</p>}
        <div className={styles.sitioAcciones}>
          <a href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank" rel="noopener">Cómo llegar →</a>
          {p.pmr && <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Accesible</span>}
        </div>
      </div>
    </article>
  )
}

/** Tarjeta de playa con foto, para la fila «sus playas». */
export function TarjetaPlaya({ slug, nombre, foto, bandera, socorrismo, accesible, parking }: {
  slug: string; nombre: string; foto?: { url: string } | null
  bandera?: boolean; socorrismo?: boolean; accesible?: boolean; parking?: boolean
}) {
  const meta = [socorrismo && 'Socorrismo', accesible && 'PMR', parking && 'Parking'].filter(Boolean).join(' · ')
  return (
    <Link href={`/playas/${slug}`} className={styles.playa}>
      {foto
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={foto.url} alt="" loading="lazy" decoding="async" />
        : <div style={{ position: 'absolute', left: 16, top: 16 }}><Pictograma tipo="playa" size={34} /></div>}
      <div className={styles.playaVelo} />
      {bandera && <span className={styles.playaBandera}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#faf4e6' }} />Bandera Azul</span>}
      <div className={styles.playaPie}>
        <div className={styles.playaNombre}>{nombre}</div>
        <div className={styles.playaMeta}>{meta || (foto ? '' : 'sin foto aún')}</div>
      </div>
    </Link>
  )
}
