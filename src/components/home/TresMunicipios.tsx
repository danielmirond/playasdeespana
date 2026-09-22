// src/components/home/TresMunicipios.tsx — tres municipios en la home, que
// cambian cada semana.
//
// PARA QUÉ. Las páginas de municipio (qué hacer, el tiempo, mareas, barcos)
// solo se enlazaban desde dentro del propio municipio: nada en la home
// llevaba a ellas. Tres tarjetas que rotan hacen que a lo largo del año
// todas pasen por la portada, y dan a Google un enlace desde la página con
// más autoridad del sitio sin convertir la home en un listado.
//
// CÓMO ROTA. Por número de semana desde 1970, no al azar: la home es ISR de
// una hora y con un `Math.random()` cada regeneración enseñaría tres
// distintas —y el HTML del servidor y el del cliente no coincidirían—. Con
// la semana, los siete días son los mismos tres para todo el mundo, y el
// lunes cambian. El orden del fondo es por slug, estable entre despliegues.
//
// QUIÉN ENTRA. Los municipios que tienen las dos páginas grandes: la de
// playas (cuatro o más) y la de qué hacer (cinco sitios o más). Sin eso la
// tarjeta prometería más de lo que hay detrás.
import Link from 'next/link'
import { getMunicipios, getPlayasByMunicipio } from '@/lib/playas'
import { getMunicipiosConPois } from '@/lib/municipio-pois'
import { enlacesMunicipio } from '@/lib/enlaces-municipio'
import { getFotos } from '@/lib/fotos'

const CUANTOS = 3

// Mismos degradados que el carrusel de «qué hacer»: cuando no hay foto, la
// tarjeta no queda gris.
const FONDOS = [
  'linear-gradient(180deg, #c7d8dc 0%, #a3b9c0 35%, #e8d9b8 55%, #d9c7a0 100%)',
  'linear-gradient(180deg, #a3b6b8 0%, #6b8890 40%, #d4c090 60%, #b8a06a 100%)',
  'linear-gradient(180deg, #d8ccae 0%, #b5a582 45%, #9d8a62 70%, #6b5840 100%)',
]

export default async function TresMunicipios() {
  const [municipios, conPois] = await Promise.all([getMunicipios(), getMunicipiosConPois()])
  const pois = new Set(conPois)
  const fondo = municipios.filter(m => pois.has(m.slug)).sort((a, b) => a.slug.localeCompare(b.slug))
  if (fondo.length < CUANTOS) return null

  const semana = Math.floor(Date.now() / (7 * 86_400_000))
  const elegidos = Array.from({ length: CUANTOS }, (_, k) => fondo[(semana * CUANTOS + k) % fondo.length])

  const tarjetas = await Promise.all(elegidos.map(async (m, i) => {
    const [playas, enlaces] = await Promise.all([getPlayasByMunicipio(m.slug), enlacesMunicipio(m.slug, m.nombre)])
    // La foto de su playa mejor equipada, solo si ya está resuelta en el
    // sidecar: la home no puede permitirse ir a buscarla a la red.
    const top = [...playas].sort((a, b) =>
      ((b.bandera ? 5 : 0) + (b.socorrismo ? 2 : 0)) - ((a.bandera ? 5 : 0) + (a.socorrismo ? 2 : 0)))[0]
    const fotos = top ? await getFotos(top.nombre, top.municipio, top.lat, top.lng, top.provincia, top.slug) : []
    const foto = fotos.find(f => f.fuente !== 'generica')?.thumb ?? null
    return { m, n: playas.length, foto, fondo: FONDOS[i % FONDOS.length], enlaces: enlaces.filter(e => e.clave !== 'playas') }
  }))

  return (
    <section aria-labelledby="tres-municipios" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
      <div style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.35rem' }}>
        Esta semana
      </div>
      <h2 id="tres-municipios" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem', lineHeight: 1.15 }}>
        Tres pueblos de costa <em style={{ fontWeight: 500, color: 'var(--accent)' }}>para mirar de cerca</em>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '.85rem' }}>
        {tarjetas.map(t => (
          <article key={t.m.slug} style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
            <Link href={`/municipio/${t.m.slug}`} aria-label={`Playas de ${t.m.nombre}`} style={{ display: 'block' }}>
              {t.foto
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={t.foto} alt="" width={320} height={150} loading="lazy" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', background: 'var(--card-bg)' }} />
                : <div aria-hidden style={{ height: 150, background: t.fondo }} />}
            </Link>
            <div style={{ padding: '.9rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '.5rem', flex: 1 }}>
              <div>
                <Link href={`/municipio/${t.m.slug}`} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {t.m.nombre}
                </Link>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{t.m.provincia} · {t.n} playas</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '.4rem .8rem', fontSize: '.85rem' }}>
                {t.enlaces.map(e => (
                  <li key={e.clave}>
                    <Link href={e.href} style={{ color: 'var(--ink)', fontWeight: 600, borderBottom: '1px dotted var(--muted)' }}>
                      {e.clave === 'queHacer' ? 'Qué hacer' : e.clave === 'elTiempo' ? 'El tiempo' : e.clave === 'mareas' ? 'Mareas' : 'Barcos'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
