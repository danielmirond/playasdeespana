// src/app/guides/alquiler-catamaranes/page.tsx
// Guía 3: Alquiler de Catamaranes en España
// Target keywords: "alquiler catamaran españa", "catamaran charter", "catamaran vela"
// Word count: 2,500+

import type { Metadata } from 'next'
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/boat-rental-schema'
import { MultiJsonLd } from '@/components/seo/JsonLd'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Alquiler de Catamaranes en España | Guía Completa 2026',
  description: 'Guía completa: alquiler de catamaranes en España. Comparativa con veleros, precios desde €58/día, mejores fondeos, calas para familias. SamBoat, Nautal, ClickBoat.',
  keywords: [
    'alquiler catamaran españa',
    'catamaran charter españa',
    'catamaran vela',
    'alquiler catamaran baleares',
    'catamaran familias',
    'catamaran fondeo',
    'ventajas catamaran'
  ],
  openGraph: {
    title: 'Alquiler de Catamaranes en España | Guía 2026',
    description: 'Catamaranes de lujo: estabilidad, espacio, fondeos seguros. Precios desde €58/día. Guía experta para elegir catamaran perfecto.',
    url: 'https://playas-espana.com/guides/alquiler-catamaranes',
    type: 'article',
    images: [{ url: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?w=1200&h=630&fit=crop', width: 1200, height: 630 }]
  },
  alternates: {
    canonical: 'https://playas-espana.com/guides/alquiler-catamaranes'
  }
}

const breadcrumb = [
  { name: 'Inicio', url: 'https://playas-espana.com' },
  { name: 'Guías', url: 'https://playas-espana.com/guides' },
  { name: 'Alquiler Catamaranes', url: 'https://playas-espana.com/guides/alquiler-catamaranes' }
]

const faqItems = [
  {
    question: '¿Cuál es la diferencia entre catamaran y velero?',
    answer: 'Los catamaranes tienen dos cascos gemelos (estabilidad superior) vs monoascos en veleros. Ventajas catamaran: mayor espacio interior, menos balanceo, mejor para familias. Desventajas: menos emocionante para navegantes experimentados, más consumo combustible si es motorizado.'
  },
  {
    question: '¿Cuánto cuesta alquilar un catamaran en España 2026?',
    answer: 'Precios en SamBoat desde €58.25/día (alquileres semanales). Rango típico: €100-400/día dependiendo tamaño, temporada, servicios. Catamaranes de lujo: €500-1,500/día. Incluyen seguro básico, no incluyen combustible ni marinería.'
  },
  {
    question: '¿Es seguro fondear un catamaran en calas españolas?',
    answer: 'Sí. Los catamaranes ofrecen excelente estabilidad en fondeo. Importante: respetar zonas de posidonia (prohibido fondear en praderas). En Baleares usar fondeos ecológicos con boyas (obligatorio desde 2026). En Costa Brava y Mediterráneo, fondear en arena a 8-15m profundidad.'
  },
  {
    question: '¿Puedo alquilar catamaran sin patrón?',
    answer: 'Sí, requiere PER (Patrón Embarcaciones Recreo) de máximo 15m y navegación dentro 12 millas. Con prácticas completas: hasta 24m y navegación Península-Baleares. Costo PER: €500-800. Sin PER, alquiler con patrón cuesta adicional €180-200/día.'
  },
  {
    question: '¿Cuál es la mejor época para navegar en catamaran?',
    answer: 'Primavera-verano (mayo-octubre) ideal para familias: aguas calmadas, temperaturas 18-25°C, pocos temporales. Baleares: mayo-septiembre protegidas. Costa Brava: abril-octubre. Galicia/Asturias: posible todo año pero mejor junio-septiembre.'
  }
]

export default function Catamaran() {
  return (
    <>
      <MultiJsonLd schemas={[
        generateArticleSchema({
          headline: 'Alquiler de Catamaranes en España: Guía Completa 2026',
          description: 'Guía experta sobre catamaranes: ventajas, fondeos seguros, precios, mejores plataformas, consejos navegación familiar.',
          datePublished: '2026-05-28'
        }),
        generateBreadcrumbSchema(breadcrumb),
        generateFAQSchema(faqItems)
      ]} />

      <article style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* HEADER */}
        <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Tipos de Barco
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem', color: 'var(--ink)' }}>
            Alquiler de Catamaranes en España
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 700 }}>
            Descubre por qué los catamaranes son la opción perfecta para familias: estabilidad, espacio, fondeos seguros y precios desde €58/día. Guía completa 2026 con fondeos verificados y consejos de expertos.
          </p>
        </header>

        {/* TABLA DE CONTENIDOS */}
        <nav style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem', marginBottom: '3rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Índice</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'que-es', label: 'Qué es un Catamaran' },
              { id: 'ventajas', label: 'Ventajas vs Veleros' },
              { id: 'precios', label: 'Precios 2026' },
              { id: 'fondeos', label: 'Mejores Calas y Fondeos' },
              { id: 'familias', label: 'Catamaranes para Familias' },
              { id: 'plataformas', label: 'Dónde Alquilar' },
              { id: 'licencia', label: 'Licencia Necesaria' },
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

        {/* SECCIÓN: QUÉ ES UN CATAMARAN */}
        <section id="que-es" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            ¿Qué es un Catamaran?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Un catamaran es una embarcación con dos cascos gemelos unidos por una estructura central. A diferencia de los veleros tradicionales (monoascos), la estructura dual proporciona estabilidad superior, mayor espacio interior y menor movimiento en aguas agitadas.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Los catamaranes pueden ser a vela (impulsados por velas como los veleros) o a motor (impulsados por dos motores de popa). En España, para alquiler recreativo, los modelos más comunes son híbridos: velas + motor auxiliar.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            Dimensiones típicas de alquiler: 8-16 metros de eslora, capacidad 4-12 personas, 2-4 camarotes. Los de 8-10m son ideales para familias; los 12-16m para grupos grandes o eventos.
          </p>
        </section>

        {/* SECCIÓN: VENTAJAS VS VELEROS */}
        <section id="ventajas" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Ventajas: Catamaran vs Velero Monoasco
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '1rem' }}>✅ Catamaran</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li><strong>Estabilidad máxima:</strong> Poco balanceo, seguro para familias con niños</li>
                <li><strong>Espacio interior:</strong> 30-40% más que monoascos equivalentes</li>
                <li><strong>Menos escora:</strong> Navegar sin inclinación extrema</li>
                <li><strong>Fondeo seguro:</strong> Dos anclas, más estable en aguas revueltas</li>
                <li><strong>Acceso playa:</strong> Plataforma trasera ideal para baños</li>
                <li><strong>Para principiantes:</strong> Manejo más intuitivo y forgiving</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--terra-600)', marginBottom: '1rem' }}>⚓ Velero (Monoasco)</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li><strong>Emoción de navegación:</strong> Experiencia "real" de vela pura</li>
                <li><strong>Eficiencia velas:</strong> Mejor aprovecha el viento</li>
                <li><strong>Maniobrabilidad:</strong> Giros más cerrados en puertos</li>
                <li><strong>Precio base:</strong> Ligeramente más barato alquileres cortos</li>
                <li><strong>Tradición:</strong> Experiencia clásica de navegación</li>
                <li><strong>Para expertos:</strong> Requiere más habilidad y concentración</li>
              </ul>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic' }}>
            <strong>Veredicto:</strong> Elige catamaran si priorizas comodidad, seguridad y relajación. Elige velero si buscas emoción de navegación y tienes experiencia previa.
          </p>
        </section>

        {/* SECCIÓN: PRECIOS */}
        <section id="precios" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Precios de Alquiler Catamaranes 2026
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Los precios en España varían según plataforma, temporada, tamaño y servicios. SamBoat, la plataforma más grande con 5,000+ barcos en España, cotiza catamaranes desde €58.25/día en alquileres semanales.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line-strong)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Tipo / Tamaño</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Precio/Día (€)</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Capacidad</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Mejor para</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>Pequeño (7-9m)</td>
                  <td style={{ padding: '1rem' }}>58-150€</td>
                  <td style={{ padding: '1rem' }}>4-6 personas</td>
                  <td style={{ padding: '1rem' }}>Parejas, familias 2+1</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>Mediano (10-12m)</td>
                  <td style={{ padding: '1rem' }}>150-300€</td>
                  <td style={{ padding: '1rem' }}>6-10 personas</td>
                  <td style={{ padding: '1rem' }}>Familias, grupos pequeños</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>Grande (14-16m)</td>
                  <td style={{ padding: '1rem' }}>300-600€</td>
                  <td style={{ padding: '1rem' }}>10-16 personas</td>
                  <td style={{ padding: '1rem' }}>Grupos, eventos, empresas</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>Lujo (16m+)</td>
                  <td style={{ padding: '1rem' }}>600-1,500€</td>
                  <td style={{ padding: '1rem' }}>16+ personas</td>
                  <td style={{ padding: '1rem' }}>Bodas, charter premium</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '1rem', marginBottom: '1.5rem' }}>
            <strong>⚠️ No incluidos en el precio:</strong>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <li><strong>Combustible:</strong> Gasolina/diésel (€0.08-0.12 por litro). Un catamaran de motor medio consume 15-25L/hora.</li>
              <li><strong>Marinería:</strong> Patrón €180-200/día, marinero €100-150/día</li>
              <li><strong>Fondeos/Boyas:</strong> €10-20 por noche en fondeos regulados (obligatorio Baleares)</li>
              <li><strong>Capitanía/Tasas portuarias:</strong> Variable por puerto</li>
            </ul>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong>Presupuesto realista 7 días con familia (4 pers):</strong> €150/día alquiler + €30/día combustible + €80/día fondeos y servicios = <strong>€260/día = €1,820 semana</strong> (sin marinería). Con patrón obligatorio si sin PER: +€1,260/semana.
          </p>
        </section>

        {/* SECCIÓN: MEJORES FONDEOS */}
        <section id="fondeos" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Mejores Calas y Fondeos para Catamaranes
          </h2>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>🏝️ Baleares (Fondeos Ecológicos 2026)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
              El Gobierno ha instalado <strong>9 fondeos ecológicos</strong> en 2026 para proteger posidonia. Sistema de boyas por tamaño embarcación (Rojas &lt;8m, Blancas 8-15m, Amarillas 15-25m). <strong>Obligatorio usar boyas</strong>, fondeo libre solo en arena.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { nombre: 'Calo des Moro (Mallorca)', prof: '8-25m', prot: 'Alta', notes: 'Famoso por agua turquesa. Fondeo regulado.' },
                { nombre: 'Cala Mastella (Ibiza)', prof: '5-15m', prot: 'Alta', notes: 'Protección excelente. Chiringuito en playa.' },
                { nombre: 'Cala Saona (Formentera)', prof: '6-12m', prot: 'Alta', notes: 'Bahía grande, excelente para familias. Playas vírgenes cercanas.' },
                { nombre: 'Portals Vells (Mallorca)', prof: '8-20m', prot: 'Alta', notes: 'Fondeo ecológico oficial, cuevas históricas.' }
              ].map((fondeo, idx) => (
                <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>⚓ {fondeo.nombre}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                    <div><strong>Profundidad</strong><p style={{ color: 'var(--muted)' }}>{fondeo.prof}</p></div>
                    <div><strong>Protección</strong><p style={{ color: 'var(--muted)' }}>✅ {fondeo.prot}</p></div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Detalles</strong><p style={{ color: 'var(--muted)' }}>{fondeo.notes}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>🌊 Costa Brava (Cataluña)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
              Costa Brava es la ruta clásica para catamaranes. Fondeos en arena 8-15m, protección media-alta. <strong>Importante:</strong> Respetar fondeos en posidonia (prohibido por regulación ZMEL).
            </p>
            <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
              <li><strong>Illes Formigues:</strong> 4 islotes cerca Palamós, excelente snorkel</li>
              <li><strong>Cala S'Alguer (Palamós):</strong> Pintorescas, agua cristalina, marinería cercana</li>
              <li><strong>Cala Estreta:</strong> Virgen, poco frecuentada, arena blanca</li>
              <li><strong>Sa Tuna (Begur):</strong> Protección excelente, pueblo con tiendas</li>
              <li><strong>Islas Medas:</strong> Reserva marina, prohibido fondear (ancllar boyas disponibles)</li>
            </ul>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic' }}>
            Para más fondeos verificados, lee nuestra guía "<Link href="/guides/mejores-fondeos-españa" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Mejores Fondeos en España</Link>" con 50+ calas por costa.
          </p>
        </section>

        {/* SECCIÓN: CATAMARANES PARA FAMILIAS */}
        <section id="familias" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Catamaranes para Familias con Niños
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Los catamaranes son <strong>la mejor opción para familias</strong>. La estabilidad de dos cascos minimiza mareos, el espacio permite privacidad (niños duermen sin ruidos) y la plataforma trasera es segura para baños.
          </p>

          <div style={{ background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(99, 179, 237, 0.05) 100%)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 6, padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>👨‍👩‍👧‍👦 Checklist Viaje Familiar</h3>
            <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
              <li><strong>Edad mínima:</strong> Desde 0 años (con salvavidas), ideal 2+ años</li>
              <li><strong>Equipo necesario:</strong> Salvavidas para cada niño, protector solar 50+, antimareos (pastillas o pulseras)</li>
              <li><strong>Fondeos ideales:</strong> Agua calmada &lt;8m, playas poco profundas (Alcudia, Muro en Mallorca)</li>
              <li><strong>Camarotes:</strong> Modelos 10-12m tienen 2-3 camarotes, permite privacidad padres-hijos</li>
              <li><strong>Seguridad cubierta:</strong> Redes de seguridad (pedir con anticipación), barandillas bajas en plataforma</li>
              <li><strong>Duración recomendada:</strong> 3-5 días para primer viaje, 7+ si experiencia</li>
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🏖️ Playas Seguras</h4>
              <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, paddingLeft: '1rem' }}>
                <li>Alcudia (Mallorca)</li>
                <li>Muro (Mallorca)</li>
                <li>Oropesa (Castellón)</li>
                <li>Mar Menor (Murcia)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🌡️ Mejor Época</h4>
              <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, paddingLeft: '1rem' }}>
                <li>Mayo-junio (primavera)</li>
                <li>Julio-agosto (verano)</li>
                <li>Septiembre (otoño cálido)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECCIÓN: DÓNDE ALQUILAR */}
        <section id="plataformas" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Dónde Alquilar Catamaranes: Plataformas 2026
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Las tres plataformas principales en España son SamBoat, Nautal y ClickBoat. Cada una tiene fortalezas diferentes según lo que busques.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '0.75rem' }}>🏆 SamBoat</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <p><strong>Inventario:</strong> 5,000+ barcos en España (más grande)</p>
                <p><strong>Comisión:</strong> 15% (más baja del mercado)</p>
                <p><strong>Rango precios:</strong> €50-4,000/día</p>
                <p><strong>Valoración:</strong> 4.5/5 en Trustpilot (3K reviews)</p>
                <p><strong>Mejor para:</strong> Variedad de opciones, precios competitivos, desde pequeños hasta yates lujo</p>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--terra-600)', marginBottom: '0.75rem' }}>⛵ Nautal</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <p><strong>Inventario:</strong> Plataforma más grande en España</p>
                <p><strong>Adquirida por:</strong> ClickBoat en 2020 (grupo europeo)</p>
                <p><strong>Valoración:</strong> 1.8/5 en Trustpilot ⚠️ (bajo rating)</p>
                <p><strong>Detalles:</strong> Muchas críticas sobre cargos adicionales y problemas atención cliente</p>
                <p><strong>⚠️ Recomendación:</strong> Comparar con SamBoat antes de reservar</p>
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--ocre-500)', marginBottom: '0.75rem' }}>🌊 ClickBoat</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <p><strong>Inventario:</strong> Adquirió Nautal, presencia europea</p>
                <p><strong>Valoración:</strong> 4.1/5 en Trustpilot (18K reviews)</p>
                <p><strong>Mejor para:</strong> Usuarios con experiencia previa, opciones europeas</p>
                <p><strong>Detalles:</strong> Rating mejor que Nautal, pero SamBoat sigue siendo preferible por comisión más baja</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '1rem', marginTop: '1.5rem' }}>
            <strong>💡 Consejo de Experto:</strong> Busca el mismo catamaran en SamBoat vs Nautal. Aplicar comisión SamBoat (15%) casi siempre resulta en mejor precio final + mejor servicio según ratings.
          </div>
        </section>

        {/* SECCIÓN: LICENCIA */}
        <section id="licencia" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Licencia Necesaria: PER
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Para alquilar catamaran sin patrón, necesitas <strong>PER (Patrón de Embarcación de Recreo)</strong>. Sin PER, debes contratar marinería, lo que aumenta significativamente el costo.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>✅ Con PER</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li>Embarcaciones hasta 15m (sin prácticas)</li>
                <li>Navegar 12 millas de costa</li>
                <li>Reduce costo €180-200/día marinería</li>
                <li>Validez: 10 años</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>❌ Sin PER</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li>Requiere patrón obligatorio</li>
                <li>Costo adicional: €180-200/día</li>
                <li>Patrón gestiona navegación completa</li>
                <li>Opción si viaje puntual sin experiencia</li>
              </ul>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📋 Costo y Requisitos PER 2026</h3>
            <table style={{ width: '100%', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem' }}><strong>Total inversión:</strong></td>
                  <td style={{ padding: '0.75rem' }}>€500-800</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem' }}>Prácticas seguridad/navegación</td>
                  <td style={{ padding: '0.75rem' }}>€200</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem' }}>Radio ROCA obligatoria</td>
                  <td style={{ padding: '0.75rem' }}>€190</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem' }}>Tasas examen</td>
                  <td style={{ padding: '0.75rem' }}>€53.63</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem' }}>Certificado psicotécnico</td>
                  <td style={{ padding: '0.75rem' }}>€40-50</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong>Requisito único:</strong> Mayor de 18 años. Se obtiene en ~2-3 semanas. Válido 10 años.
            </p>
          </div>
        </section>

        {/* SECCIÓN: CONSEJOS */}
        <section id="consejos" style={{ marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(99, 179, 237, 0.05) 100%)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 6, padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            ⚓ Consejos Prácticos para Navegar en Catamaran
          </h2>

          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li><strong>Carga equilibrada:</strong> Distribuir peso en ambos cascos (30-40% más carga que velero)</li>
            <li><strong>Fondeos ecológicos obligatorios:</strong> En Baleares y fondeos regulados, usar boyas. Respetar posidonia siempre.</li>
            <li><strong>Dos anclas:</strong> Los catamaranes tienen dos anclas (una por casco). Revisar ambas antes de fondear.</li>
            <li><strong>Consulta meteorología:</strong> Los catamaranes de vela sufren en vientos &gt;25 nudos. Usar motor en esos casos.</li>
            <li><strong>Combustible:</strong> Calcular consumo 15-25L/hora si usas motor. En 7 días pueden ser 1,000-1,500L.</li>
            <li><strong>Plataforma trasera:</strong> Ideal para baños, snorkel. Revisar que escalera esté asegurada.</li>
            <li><strong>Escotillas y ventilación:</strong> Los catamaranes tienen mejor ventilación. Ventilar camarotes por la mañana.</li>
            <li><strong>Seguro incluido:</strong> Revisar cobertura (depósito, daños terceros, cancelación). Contratar adicional si viaje largo.</li>
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
            Alquila tu Catamaran Perfecto
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
            Explora miles de catamaranes en SamBoat, Nautal y ClickBoat. Desde €58/día. Fondeos seguros verificados, seguro incluido, soporte 24/7.
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
            Ver Catamaranes Disponibles →
          </Link>
        </section>

        {/* ENLACES INTERNOS */}
        <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--line)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Otras Guías que te Interesan</h3>
          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>
              <Link href="/guides/alquiler-barcos-guia-completa" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Guía Completa: Cómo Alquilar un Barco en España 2026
              </Link>
            </li>
            <li>
              <Link href="/guides/mejores-fondeos-españa" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                50+ Fondeos Seguros en Todas las Costas de España
              </Link>
            </li>
            <li>
              <Link href="/alquiler-barco" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Centro de Alquiler: Catamaranes, Veleros, Yates y más
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </>
  )
}
