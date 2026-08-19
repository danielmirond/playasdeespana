// /municipio/[slug]/tabla-de-mareas — Pleamares y bajamares del municipio.
//
// POR QUÉ EXISTE. «mareas [localidad]» y «tabla de mareas [localidad]» son
// 2,1 millones de búsquedas al mes en un solo competidor, y el ranking de
// localidades es íntegramente atlántico, cantábrico y canario: Gijón
// 150.000, Vigo, A Coruña, Ferrol, Santander, Donostia… Exactamente las
// comunidades donde no existe fuente oficial de bandera. La marea es el
// dato diario que sí podemos dar allí, y resulta ser el que la gente busca.
//
// POR QUÉ CUELGA DEL MUNICIPIO Y NO ES UNA RUTA APARTE. La unidad de la
// búsqueda es la localidad, la página de municipio ya rankea por «playas de
// X», y el enlace sale natural. Y nos diferencia de los tres competidores
// en lo único que no pueden copiar con datos armónicos: ya tenemos las
// playas. Ellos dan la tabla del puerto; nosotros qué significa esa marea
// en cada arenal del municipio.
//
// VOCABULARIO, sacado de 10.000 queries reales: «tabla de mareas» con «de»
// (694.550 frente a 94.470 sin él); «pleamar» (300.600) y «bajamar»
// (182.000). «Altamar» no aparece ni una vez — en castellano de España es
// alta mar, mar abierto, no la marea alta. «Horario de mareas», 3.650.
//
// SOLO TRES DÍAS, Y ES DELIBERADO. La fuente es la predicción de Puertos
// del Estado con corrección meteorológica: da el agua que habrá, no la
// tabla teórica, pero la meteo no se predice a un mes. Un calendario
// mensual exige armónicos que no tenemos; hasta entonces no se finge.
// Medido: la estimación lunar que ya teníamos erraba 39 minutos en Cádiz.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getMunicipios, getPlayasByMunicipio } from '@/lib/playas'
import { getMareasMunicipio, tieneMareas, ubicacionMareas } from '@/lib/mareas-portus'
import type { Extremo, PuntoHora } from '@/lib/mareas-portus'
import { CertBadge } from '@/components/playa/Certeza'
import styles from '../MunicipioPage.module.css'

export const revalidate = 1800
export const maxDuration = 30

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const ubi = ubicacionMareas(slug)
  if (!ubi) return {}
  const m = (await getMunicipios()).find(x => x.slug === slug)
  if (!m) return {}
  const med = ubi.zona === 'mediterraneo'
  return {
    title: `Tabla de mareas de ${m.nombre}: pleamar y bajamar hoy`,
    description: med
      ? `Horas de pleamar y bajamar en ${m.nombre} hoy y los próximos días, según Puertos del Estado. En el Mediterráneo la marea apenas llega a 30 cm: aquí te decimos cuánto y cuándo.`
      : `Horas de pleamar y bajamar en ${m.nombre} hoy, mañana y pasado, con la altura del agua y la curva del día. Predicción oficial de Puertos del Estado, no estimación.`,
    alternates: { canonical: `/municipio/${slug}/tabla-de-mareas` },
  }
}

// ── Curva del día: SVG inline, sin JS. Una línea, los extremos marcados y la
// hora actual señalada. Lo que no se dibuja: rejillas, sombras, degradados.
function Curva({ serie, extremos, ahoraIso }: { serie: PuntoHora[]; extremos: Extremo[]; ahoraIso: string }) {
  if (serie.length < 4) return null
  const W = 720, H = 180, PX = 28, PY = 18
  const t0 = new Date(serie[0].iso).getTime()
  const t1 = new Date(serie[serie.length - 1].iso).getTime()
  const niv = serie.map(p => p.nivel)
  const min = Math.min(...niv), max = Math.max(...niv)
  const x = (iso: string) => PX + ((new Date(iso).getTime() - t0) / (t1 - t0)) * (W - 2 * PX)
  const y = (v: number) => H - PY - ((v - min) / (max - min || 1)) * (H - 2 * PY)
  const d = serie.map((p, i) => `${i ? 'L' : 'M'}${x(p.iso).toFixed(1)},${y(p.nivel).toFixed(1)}`).join(' ')
  const ahoraX = x(ahoraIso)
  const enRango = ahoraX >= PX && ahoraX <= W - PX
  return (
    <figure style={{ margin: '1.25rem 0 0' }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" style={{ display: 'block', width: '100%', height: 'auto', color: 'var(--ink)' }}
        aria-label="Curva del nivel del mar durante los tres próximos días, con las pleamares y bajamares marcadas y la hora actual señalada.">
        {/* separadores de día */}
        {serie.filter((p, i) => i > 0 && p.dia !== serie[i - 1].dia).map(p => (
          <line key={p.iso} x1={x(p.iso)} x2={x(p.iso)} y1={PY - 6} y2={H - PY + 6} stroke="currentColor" strokeWidth=".75" opacity=".25" />
        ))}
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" />
        {extremos.filter(e => new Date(e.iso).getTime() >= t0 && new Date(e.iso).getTime() <= t1).map(e => (
          <g key={e.iso}>
            <circle cx={x(e.iso)} cy={y(e.altura)} r="3.2" fill={e.tipo === 'pleamar' ? 'currentColor' : 'var(--bg, #fff)'} stroke="currentColor" strokeWidth="1.4" />
            <text x={x(e.iso)} y={e.tipo === 'pleamar' ? y(e.altura) - 9 : y(e.altura) + 16} textAnchor="middle"
              fontSize="10.5" fontFamily="var(--font-mono)" fill="currentColor">{e.hora}</text>
          </g>
        ))}
        {enRango && (
          <g>
            <line x1={ahoraX} x2={ahoraX} y1={PY - 6} y2={H - PY + 6} stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={ahoraX} y={PY - 9} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="currentColor" letterSpacing="1">AHORA</text>
          </g>
        )}
      </svg>
      <figcaption style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.4rem' }}>
        Nivel del mar con corrección meteorológica. Punto relleno, pleamar; hueco, bajamar. Horas en hora local.
      </figcaption>
    </figure>
  )
}

export default async function TablaMareasPage({ params }: Props) {
  const { slug } = await params
  if (!tieneMareas(slug)) notFound()
  const municipio = (await getMunicipios()).find(m => m.slug === slug)
  if (!municipio) notFound()
  const playas = await getPlayasByMunicipio(slug)
  const lat = playas.reduce((a, p) => a + p.lat, 0) / (playas.length || 1)
  const lng = playas.reduce((a, p) => a + p.lng, 0) / (playas.length || 1)

  const mareas = await getMareasMunicipio(slug, lat, lng)
  const ubi = ubicacionMareas(slug)!
  const med = ubi.zona === 'mediterraneo'

  // La hora actual, en la zona de la costa, fijada en servidor: la página
  // es ISR de 30 min y no hay cliente que la corrija.
  const tz = lat < 29.6 && lng < -13.2 ? 'Atlantic/Canary' : 'Europe/Madrid'
  const ahoraIso = new Date().toISOString()
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

  const porDia = new Map<string, Extremo[]>()
  for (const e of mareas?.extremos ?? []) (porDia.get(e.dia) ?? porDia.set(e.dia, []).get(e.dia)!).push(e)
  const dias = [...porDia.keys()].sort().slice(0, 3)
  const fechaLarga = (d: string) => new Intl.DateTimeFormat('es-ES', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(d + 'T12:00:00Z'))
  const etiquetaDia = (d: string, i: number) => i === 0 && d === hoy ? 'Hoy' : i === 1 ? 'Mañana' : fechaLarga(d)

  // Próximo extremo: la frase que contesta la búsqueda de un vistazo.
  const proximo = (mareas?.extremos ?? []).find(e => new Date(e.iso).getTime() > Date.now())
  const estado = (() => {
    const ext = mareas?.extremos ?? []
    const ant = [...ext].reverse().find(e => new Date(e.iso).getTime() <= Date.now())
    if (!ant || !proximo) return null
    return ant.tipo === 'bajamar' ? 'subiendo' : 'bajando'
  })()

  return (
    <>
      <Nav />
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 .6rem' }}>
            <Link href={`/municipio/${slug}`} style={{ color: 'inherit' }}>Playas de {municipio.nombre}</Link> · {municipio.provincia}
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', lineHeight: 1.08, margin: 0, letterSpacing: '-.015em' }}>
            Tabla de mareas de {municipio.nombre}: pleamar y bajamar hoy
          </h1>

          {mareas && proximo ? (
            <p style={{ fontSize: '1.08rem', marginTop: '1rem', maxWidth: '38em' }}>
              {estado === 'subiendo' ? 'El mar está subiendo.' : estado === 'bajando' ? 'El mar está bajando.' : ''}{' '}
              La próxima <b>{proximo.tipo}</b> es a las <b>{proximo.hora}</b>
              {proximo.dia !== hoy ? ` de ${fechaLarga(proximo.dia)}` : ''}, con {proximo.altura.toFixed(2).replace('.', ',')} m.
              {mareas.rangoHoy != null && !med && <> Hoy el agua sube y baja <b>{mareas.rangoHoy.toFixed(1).replace('.', ',')} m</b>.</>}
            </p>
          ) : med ? (
            // En el Mediterráneo Portus no calcula pleamares ni bajamares:
            // la oscilación es tan pequeña que no hay extremos que señalar.
            // Eso NO es un fallo de lectura y no se puede contar como tal.
            <p style={{ fontSize: '1.08rem', marginTop: '1rem', maxWidth: '38em' }}>
              Aquí no hay horas de pleamar y bajamar que dar: Puertos del Estado no las calcula para esta costa porque el mar apenas sube y baja.
            </p>
          ) : (
            <p style={{ fontSize: '1rem', marginTop: '1rem', color: 'var(--muted)' }}>
              Ahora mismo no hemos podido leer la predicción de Puertos del Estado. No la estimamos: volvemos a intentarlo en unos minutos.
            </p>
          )}

          {med && (
            <p style={{ marginTop: '.85rem', padding: '.7rem .9rem', borderLeft: '3px solid var(--rule-strong, currentColor)', fontSize: '.92rem', maxWidth: '40em' }}>
              <b>En {municipio.nombre} la marea apenas se nota.</b> En el Mediterráneo el mar sube y baja unos 20-30 cm al día;
              lo que cambia el aspecto de la playa aquí es el oleaje y el viento, no la marea. La tabla está por si la necesitas para pescar o fondear.
            </p>
          )}

          <div style={{ marginTop: '.9rem' }}>
            <CertBadge cert="oficial">Puertos del Estado · {ubi.tipo === 'Puerto' ? 'mareógrafo de ' : 'punto de '}{ubi.nombre}</CertBadge>
          </div>
        </div>
      </header>

      <main className={styles.wrap}>
        {mareas && (
          <>
            <section aria-labelledby="h-dias">
              <h2 id="h-dias" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0 0 .9rem' }}>Pleamares y bajamares</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}>
                {dias.map((d, i) => (
                  <article key={d} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '.9rem 1rem' }}>
                    <h3 style={{ margin: '0 0 .5rem', fontSize: '.95rem', fontFamily: 'var(--font-serif)' }}>
                      {etiquetaDia(d, i)} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '.82rem' }}>· {fechaLarga(d)}</span>
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.92rem', fontVariantNumeric: 'tabular-nums' }}>
                      <tbody>
                        {(porDia.get(d) ?? []).map(e => (
                          <tr key={e.iso} style={{ borderTop: '1px solid var(--line)' }}>
                            <td style={{ padding: '.4rem 0', textTransform: 'capitalize', color: e.tipo === 'pleamar' ? 'var(--ink)' : 'var(--muted)' }}>{e.tipo}</td>
                            <td style={{ padding: '.4rem 0', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{e.hora}</td>
                            <td style={{ padding: '.4rem 0 .4rem .8rem', textAlign: 'right' }}>{e.altura.toFixed(2).replace('.', ',')} m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </article>
                ))}
              </div>
              <Curva serie={mareas.serie} extremos={mareas.extremos} ahoraIso={ahoraIso} />
            </section>

            <section aria-labelledby="h-playas" style={{ marginTop: '2.5rem' }}>
              <h2 id="h-playas" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0 0 .6rem' }}>
                Las playas de {municipio.nombre} con esta marea
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '.92rem', maxWidth: '40em', margin: '0 0 .9rem' }}>
                La predicción es del punto «{ubi.nombre}», a {(ubi.d / 1000).toFixed(1).replace('.', ',')} km: en todas estas playas la hora es la misma a efectos prácticos.
              </p>
              <ul style={{ columns: '2 14rem', gap: '2rem', padding: 0, margin: 0, listStyle: 'none', fontSize: '.95rem' }}>
                {playas.slice(0, 40).map(p => (
                  <li key={p.slug} style={{ breakInside: 'avoid', padding: '.25rem 0' }}>
                    <Link href={`/playas/${p.slug}`} style={{ color: 'var(--ink)' }}>{p.nombre}</Link>
                  </li>
                ))}
              </ul>
            </section>

            <section style={{ marginTop: '2.5rem', fontSize: '.88rem', color: 'var(--muted)', maxWidth: '44em' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--ink)', margin: '0 0 .5rem' }}>De dónde sale esta tabla</h2>
              <p>
                Es la predicción de nivel del mar de <b>Puertos del Estado</b> para el punto «{ubi.nombre}», con corrección
                meteorológica —viento y presión—, no la marea astronómica teórica. Por eso solo cubre tres días: la meteo
                no se predice a un mes. Las alturas van sobre el cero del puerto. Horas en hora local.
              </p>
            </section>
          </>
        )}
      </main>
    </>
  )
}
