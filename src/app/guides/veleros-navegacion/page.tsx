// src/app/guides/veleros-navegacion/page.tsx
// Guía 5: Veleros en España - Navegación a Vela
// Target keywords: "alquiler velero españa", "navegación vela", "travesía velero"
// Word count: 2,000+

import type { Metadata } from 'next'
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/boat-rental-schema'
import { MultiJsonLd } from '@/components/seo/JsonLd'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Alquiler de Veleros en España | Guía de Navegación a Vela 2026',
  description: 'Veleros para charter en España: tipos, rutas clásicas, condiciones de viento por costa, escuelas de vela. PER, precios desde €57/día. Guía experta.',
  keywords: [
    'alquiler velero españa',
    'navegación vela',
    'velero charter',
    'alquiler velero baleares',
    'travesía vela',
    'curso vela',
    'condiciones viento españa'
  ],
  openGraph: {
    title: 'Alquiler de Veleros | Navegación a Vela España 2026',
    description: 'Veleros: la emoción pura de navegar a vela. Rutas, condiciones de viento, escuelas certificadas. Desde €57/día.',
    url: 'https://playas-espana.com/guides/veleros-navegacion',
    type: 'article',
    images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=630&fit=crop', width: 1200, height: 630 }]
  },
  alternates: {
    canonical: 'https://playas-espana.com/guides/veleros-navegacion'
  }
}

const breadcrumb = [
  { name: 'Inicio', url: 'https://playas-espana.com' },
  { name: 'Guías', url: 'https://playas-espana.com/guides' },
  { name: 'Veleros y Navegación', url: 'https://playas-espana.com/guides/veleros-navegacion' }
]

const faqItems = [
  {
    question: '¿Cuál es la diferencia entre velero de vela pura y crucero?',
    answer: 'Velero de vela pura (racer): diseño aerodinámico, velas ajustadas, enfoque en velocidad, camarotes mínimos. Velero crucero: cómodo, cabina completa, mejor para familias, menos emoción de navegación. Para alquiler, 95% son veleros crucero (son alquilables a todos los niveles).'
  },
  {
    question: '¿Necesito experiencia previa para alquilar velero?',
    answer: 'Depende: (1) Con PER válido: puedes alquilar velero pequeño sin experiencia (pero se recomienda curso previo). (2) Sin PER: requiere patrón obligatorio (€180-200/día). (3) Mejor opción: tomar curso de 3-5 días en escuela certificada, luego alquilar con patrón de respaldo.'
  },
  {
    question: '¿Cuánto cuesta alquilar velero 2026?',
    answer: 'Desde €57/día en SamBoat (semanal). Rango típico: €80-250/día pequeños (6-8m), €200-400/día medianos (10-12m). Precios suben en julio-agosto (temporada). Incluye seguro básico. Extra: patrón (si sin PER), combustible motor auxiliar, marinería.'
  },
  {
    question: '¿Cuál es la mejor época para navegar a vela en España?',
    answer: 'Mayo-octubre: vientos constantes, temperaturas agradables. Específicamente: (1) Primavera (mayo-junio): vientos moderados, aguas tranquilas, pocos turistas. (2) Verano (julio-agosto): alisios fuertes (especialmente mediterráneo), muy concurrido. (3) Otoño (septiembre-octubre): vientos van bajando, todavía buena temperatura.'
  },
  {
    question: '¿Dónde hay escuelas de vela certificadas?',
    answer: 'Principales regiones: Costa Brava (Port de la Selva, L\'Estartit), Costa del Sol (Marbella, Málaga), Baleares (Palma, Ibiza, Mahón), Galicia (Vigo, Pontevedra). Busca escuelas certificadas por AENM (Asociación Española de Náutica Recreativa). Cursos 3-5 días: €300-600 incluyen PER.'
  }
]

export default function Veleros() {
  return (
    <>
      <MultiJsonLd schemas={[
        generateArticleSchema({
          headline: 'Alquiler de Veleros en España: Guía de Navegación a Vela 2026',
          description: 'Guía experta sobre veleros: tipos, rutas, condiciones de viento por costa, escuelas de vela, PER, consejos navegación.',
          datePublished: '2026-05-28'
        }),
        generateBreadcrumbSchema(breadcrumb),
        generateFAQSchema(faqItems)
      ]} />

      <article style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* HEADER */}
        <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Tipos de Barco - Navegación
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem', color: 'var(--ink)' }}>
            Veleros en España: La Emoción de la Navegación a Vela
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 700 }}>
            Descubre la navegación a vela pura. Veleros en España desde €57/día. Rutas clásicas, condiciones de viento verificadas, escuelas de vela, comunidades online. Guía para navegantes de todos los niveles.
          </p>
        </header>

        {/* TOC */}
        <nav style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem', marginBottom: '3rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Índice</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'tipos', label: 'Tipos de Veleros' },
              { id: 'rutas', label: 'Rutas Clásicas' },
              { id: 'viento', label: 'Condiciones de Viento' },
              { id: 'precios', label: 'Precios y Opciones' },
              { id: 'escuelas', label: 'Escuelas de Vela' },
              { id: 'per', label: 'PER y Licencia' },
              { id: 'comunidades', label: 'Comunidades Navegantes' },
              { id: 'consejos', label: 'Consejos Prácticos' }
            ].map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  → {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* SECCIÓN: TIPOS */}
        <section id="tipos" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Tipos de Veleros
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Los veleros se clasifican por diseño: <strong>vela pura</strong> (racing) vs <strong>crucero</strong> (comodidad). Para alquiler recreativo, 99% son cruceros - están diseñados para navegar con seguridad y comodidad, no para competir.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--accent)' }}>⛵ Crucero Pequeño (6-8m)</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1rem' }}>
                <li><strong>Capacidad:</strong> 2-4 personas</li>
                <li><strong>Cabina:</strong> Mínima, 1 camarote</li>
                <li><strong>Precio:</strong> €57-150/día</li>
                <li><strong>Ideal para:</strong> Parejas, principiantes</li>
                <li><strong>Manejo:</strong> Simple, forgiving</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--terra-600)' }}>⛵ Crucero Mediano (10-12m)</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1rem' }}>
                <li><strong>Capacidad:</strong> 4-8 personas</li>
                <li><strong>Cabina:</strong> 2-3 camarotes, baño</li>
                <li><strong>Precio:</strong> €150-300/día</li>
                <li><strong>Ideal para:</strong> Familias, grupos</li>
                <li><strong>Manejo:</strong> Moderado, requiere experiencia</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--ocre-500)' }}>⛵ Crucero Grande (14-16m)</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1rem' }}>
                <li><strong>Capacidad:</strong> 8-12 personas</li>
                <li><strong>Cabina:</strong> 4-5 camarotes, 2 baños</li>
                <li><strong>Precio:</strong> €300-500/día</li>
                <li><strong>Ideal para:</strong> Grupos, expediciones</li>
                <li><strong>Manejo:</strong> Avanzado obligatorio</li>
              </ul>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong>Terminología:</strong> Todos son "monoascos" (un casco, a diferencia de catamaranes con dos cascos). Las velas típicas son Mayor + Vela de Proa (Génova o Foque). Muchos tienen motor auxiliar diésel para puertos sin viento.
          </p>
        </section>

        {/* SECCIÓN: RUTAS */}
        <section id="rutas" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Rutas Clásicas: Donde Navegar a Vela
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            España tiene 4 zonas de navegación clásicas, cada una con características propias de viento, fondeos y dificultad.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🌊 Costa del Sol (Málaga, Marbella)</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <p><strong>Vientos:</strong> Levante (este) fuerte en verano, variable en primavera</p>
                <p><strong>Dificultad:</strong> Moderada (olas, corrientes)</p>
                <p><strong>Mejor época:</strong> Abril-octubre</p>
                <p><strong>Ruta clásica:</strong> Marbella → Gibraltar (48 NM, 1.5 días), Málaga → Almería (80 NM, 2 días)</p>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🏝️ Baleares (Mallorca, Ibiza, Formentera)</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <p><strong>Vientos:</strong> Tramontana (noroeste) fuerte, Mistral variable, Levante en verano</p>
                <p><strong>Dificultad:</strong> Moderada a Alta (aguas abiertas, olas)</p>
                <p><strong>Mejor época:</strong> Mayo, junio, septiembre (julio-agosto muy concurrido)</p>
                <p><strong>Rutas clásicas:</strong> Mallorca round (100 NM, 5-7 días), Ibiza-Formentera (30 NM, 1 día)</p>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🌊 Costa Brava (Barcelona, Girona)</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <p><strong>Vientos:</strong> Northerly, Levante suave, muy variable</p>
                <p><strong>Dificultad:</strong> Baja a Moderada (protegida, buena infraestructura)</p>
                <p><strong>Mejor época:</strong> Abril-octubre (primavera más tranquila)</p>
                <p><strong>Ruta clásica:</strong> Palamós → Estartit → Roses (40-50 NM, 2-3 días, pocos fondeos)</p>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🌊 Galicia (Rías Altas/Bajas)</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <p><strong>Vientos:</strong> Atlánticos moderados, muy protegidos en rías, variables en mar abierto</p>
                <p><strong>Dificultad:</strong> Baja a Moderada (muy protegidas, pero temporales pueden ser bravos)</p>
                <p><strong>Mejor época:</strong> Mayo-octubre (junio-septiembre ideal)</p>
                <p><strong>Ventaja:</strong> Navegable todo el año, fondeos seguros, comunidad activa</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN: VIENTO */}
        <section id="viento" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Condiciones de Viento 2026
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            El viento es el "motor" de la vela. Cada costa de España tiene patrones característicos.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line-strong)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700 }}>Región</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700 }}>Vientos Principales</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700 }}>Intensidad</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700 }}>Mejor Para</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem' }}>Costa del Sol</td>
                  <td style={{ padding: '0.75rem' }}>Levante, Poniente</td>
                  <td style={{ padding: '0.75rem' }}>15-25 nudos verano</td>
                  <td style={{ padding: '0.75rem' }}>Racing, experiencia</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem' }}>Baleares</td>
                  <td style={{ padding: '0.75rem' }}>Tramontana, Levante</td>
                  <td style={{ padding: '0.75rem' }}>10-20 nudos (variable)</td>
                  <td style={{ padding: '0.75rem' }}>Crucero, familias</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem' }}>Costa Brava</td>
                  <td style={{ padding: '0.75rem' }}>N/NW, muy variable</td>
                  <td style={{ padding: '0.75rem' }}>8-15 nudos típico</td>
                  <td style={{ padding: '0.75rem' }}>Principiantes, tranquilo</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem' }}>Galicia</td>
                  <td style={{ padding: '0.75rem' }}>Atlánticos moderados</td>
                  <td style={{ padding: '0.75rem' }}>10-18 nudos típico</td>
                  <td style={{ padding: '0.75rem' }}>Navegación segura</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '1rem' }}>
            <strong>🌬️ Vientos Españoles Más Intensos (para expertos):</strong>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <li><strong>Tarifa (Cádiz):</strong> Mayo-noviembre = windsurf paradise (15-25+ nudos regulares)</li>
              <li><strong>Estrechos (Mallorca):</strong> Canales Menorca-Mallorca, Ibiza-Formentera = corrientes + vientos fuertes</li>
              <li><strong>Tramontana (Baleares):</strong> NW fuerte en transiciones estacionales (25-35 nudos posible)</li>
            </ul>
          </div>
        </section>

        {/* SECCIÓN: PRECIOS */}
        <section id="precios" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Precios de Alquiler de Veleros 2026
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            SamBoat cotiza veleros en España desde €57.59/día en alquileres semanales. Los precios suben significativamente en julio-agosto.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line-strong)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Tamaño</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Precio Base/Día</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Julio-Agosto</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Incluye</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>6-8m</td>
                  <td style={{ padding: '1rem' }}>€57-100</td>
                  <td style={{ padding: '1rem' }}>€120-180</td>
                  <td style={{ padding: '1rem' }}>Seguro básico</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>10-12m</td>
                  <td style={{ padding: '1rem' }}>€120-200</td>
                  <td style={{ padding: '1rem' }}>€250-380</td>
                  <td style={{ padding: '1rem' }}>Seguro, motor auxiliar</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>14-16m</td>
                  <td style={{ padding: '1rem' }}>€200-400</td>
                  <td style={{ padding: '1rem' }}>€400-600</td>
                  <td style={{ padding: '1rem' }}>Seguro completo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong>Extras:</strong> Patrón sin PER (€180-200/día), marinero (€100-150/día), combustible motor (no incluido), fondeos regulados (€10-20/noche en Baleares).
          </p>
        </section>

        {/* SECCIÓN: ESCUELAS */}
        <section id="escuelas" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Escuelas de Vela Certificadas
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Si quieres aprender vela, hay escuelas certificadas en todas las costas españolas. La mayoría ofrecen cursos que culminan con el PER.
          </p>

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📚 Tipos de Cursos</h3>
            <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
              <li><strong>Iniciación (3 días):</strong> €300-500. Aprende fundamentos (velas, nudos, seguridad)</li>
              <li><strong>Nivel I (5 días):</strong> €500-750. Navega solo en aguas protegidas, introducción PER</li>
              <li><strong>PER Completo (1-2 semanas):</strong> €800-1,200. Examen teórico + prácticas = PER oficial</li>
              <li><strong>Avanzado (7+ días):</strong> €1,000+. Para navegantes con experiencia, técnica avanzada</li>
            </ul>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            <strong>Principales regiones con escuelas:</strong>
          </p>
          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li><strong>Costa Brava:</strong> Port de la Selva, L'Estartit, Roses</li>
            <li><strong>Costa del Sol:</strong> Marbella, Málaga, Fuengirola</li>
            <li><strong>Baleares:</strong> Palma (Mallorca), Ibiza, Mahón (Menorca)</li>
            <li><strong>Galicia:</strong> Vigo, Pontevedra, A Coruña (Rías Gallegas)</li>
          </ul>
        </section>

        {/* SECCIÓN: PER */}
        <section id="per" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            PER: Licencia para Pilotar Velero
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            El PER (Patrón Embarcación Recreo) es la licencia estándar para alquilar veleros sin patrón. Requiere menor estudio que antiguas titulaciones náuticas.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>✅ Con PER</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1rem' }}>
                <li>Pilota velero hasta 15m</li>
                <li>Navega 12 millas de costa</li>
                <li>Alquiler sin patrón obligatorio</li>
                <li>Costo: €500-800 obtener</li>
                <li>Validez: 10 años</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>❌ Sin PER</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1rem' }}>
                <li>Patrón obligatorio</li>
                <li>Costo extra: €180-200/día</li>
                <li>Opción si viaje puntual</li>
                <li>Buena para aprender</li>
                <li>No es opción barata</li>
              </ul>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong>Recomendación:</strong> Si vas a navegar &gt;2 veces/año, el PER se amortiza rápido. Muchas escuelas ofrecen cursos intensivos que culminan con PER en 1-2 semanas.
          </p>
        </section>

        {/* SECCIÓN: COMUNIDADES */}
        <section id="comunidades" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Comunidades de Navegantes
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            La navegación a vela tiene una comunidad muy activa en España. Hay grupos online, foros, y eventos donde navegantes comparten rutas, consejos y experiencias.
          </p>

          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li><strong>Reddit r/sailing:</strong> Comunidad internacional, consejos, historias navegación</li>
            <li><strong>Sailing.eu forums:</strong> Foros europeos específicos por región y embarcación</li>
            <li><strong>Grupo "Vela en España" (Facebook):</strong> Comunidad activa compartiendo rutas españolas</li>
            <li><strong>Asociaciones locales:</strong> Puertos deportivos tienen clubs de vela con eventos mensuales</li>
            <li><strong>Blogs de navegantes:</strong> "Diario de un navegante", "Rutas en Vela" (contenido en español actualizado)</li>
          </ul>
        </section>

        {/* SECCIÓN: CONSEJOS */}
        <section id="consejos" style={{ marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(99, 179, 237, 0.05) 100%)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 6, padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            ⚓ Consejos para Navegar a Vela
          </h2>

          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li><strong>Siempre revisa meteorología:</strong> Wind.com, Windy.app dan predicción detallada por zona</li>
            <li><strong>Respeta límites de viento:</strong> &lt;12 nudos = aburrido, 12-18 = óptimo, 20+ = reserva para expertos</li>
            <li><strong>Fondeos ecológicos Baleares:</strong> Usar boyas obligatorias (sistema de color por tamaño barco)</li>
            <li><strong>Cartas náuticas:</strong> Papel o Navionics (app). Conocer fondos, boyas, peligros</li>
            <li><strong>Nudo del as de guía:</strong> El nudo universal para amarre. Aprende bien desde principio</li>
            <li><strong>Comunidad apoya principiantes:</strong> No hay "vergüenza". Navegantes experiencia siempre ayudan</li>
            <li><strong>Equipo mínimo seguridad:</strong> Chalecos salvavidas, pito, linterna, botiquín, botavara de emergencia</li>
            <li><strong>Diario de navegación:</strong> Apunta rutas, vientos, fondeos. Base para experiencia futura</li>
          </ul>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Preguntas Frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqItems.map((item, idx) => (
              <details key={idx} style={{ border: '1px solid var(--line)', borderRadius: 6 }}>
                <summary style={{ padding: '1.25rem', fontWeight: 700, cursor: 'pointer' }}>
                  {item.question}
                </summary>
                <div style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, borderTop: '1px solid var(--line)' }}>
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.1) 0%, rgba(3, 105, 161, 0.05) 100%)', border: '1px solid rgba(3, 105, 161, 0.2)', borderRadius: 6, padding: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            Alquila tu Velero
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
            Miles de veleros desde €57/día. Aprende vela en escuelas certificadas. Navega las costas más hermosas de España.
          </p>
          <Link href="/alquiler-barco" style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#0369a1',
            color: 'white',
            fontWeight: 700,
            borderRadius: 6,
            textDecoration: 'none'
          }}>
            Explorar Veleros Disponibles →
          </Link>
        </section>

        {/* ENLACES INTERNOS */}
        <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--line)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Otras Guías que te Interesan</h3>
          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>
              <Link href="/guides/alquiler-catamaranes" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Catamaranes: Estabilidad y Espacio (Mejor para Familias)
              </Link>
            </li>
            <li>
              <Link href="/guides/travesia-multiday-rutas" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Travesías Multiday: Rutas 7 días en Vela
              </Link>
            </li>
            <li>
              <Link href="/alquiler-barco" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Centro de Alquiler: Todos los Tipos de Barcos
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </>
  )
}
