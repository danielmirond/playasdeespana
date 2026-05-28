// src/app/guides/yates-lujo-charter/page.tsx
// Guía 4: Yates de Lujo - Charter Premium en España
// Target keywords: "yate lujo españa", "charter yate", "yate privado", "boda yate"
// Word count: 2,000+

import type { Metadata } from 'next'
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/boat-rental-schema'
import { MultiJsonLd } from '@/components/seo/JsonLd'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Alquiler de Yates de Lujo en España | Charter Premium 2026',
  description: 'Yates de lujo para charter en España: definición, experiencia premium, precios €500-3,000/día, regiones exclusivas, bodas y eventos. Guía completa.',
  keywords: [
    'yate lujo españa',
    'charter yate premium',
    'yate privado españa',
    'alquiler yate',
    'boda yate',
    'yate capitán'
  ],
  openGraph: {
    title: 'Alquiler de Yates de Lujo | Charter Premium España 2026',
    description: 'Yates exclusivos con capitán: camarotes de lujo, chef a bordo, servicios personalizados. Desde €500/día.',
    url: 'https://playas-espana.com/guides/yates-lujo-charter',
    type: 'article',
    images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=630&fit=crop', width: 1200, height: 630 }]
  },
  alternates: {
    canonical: 'https://playas-espana.com/guides/yates-lujo-charter'
  }
}

const breadcrumb = [
  { name: 'Inicio', url: 'https://playas-espana.com' },
  { name: 'Guías', url: 'https://playas-espana.com/guides' },
  { name: 'Yates de Lujo', url: 'https://playas-espana.com/guides/yates-lujo-charter' }
]

const faqItems = [
  {
    question: '¿Cuál es la diferencia entre yate y barco?',
    answer: 'Técnicamente, "yate" es término informal para embarcación de recreo >8 metros con cabina y servicios de lujo. Por regulación española, los yates >8m requieren Capitán Yate obligatorio. Barco es término genérico que incluye catamaranes, veleros y lanchas de cualquier tamaño.'
  },
  {
    question: '¿Cuánto cuesta alquilar un yate de lujo 2026?',
    answer: 'Precios típicos: €500-1,500/día para yates 10-15m (4-8 personas), €1,500-3,000+/día para yates 15-25m (8-15 personas), €3,000+/día para yates >25m. Incluye capitán, combustible, seguros. Extra: chef (€150-250/día), marinero (€100-150/día), eventos (catering, DJ).'
  },
  {
    question: '¿Requiere licencia PER un yate?',
    answer: 'No, porque los yates >8m requieren Capitán Yate obligatorio (no puedes pilotarlo sin capitán certificado). El capitán es responsable de la embarcación. Tú solo necesitas ser pasajero. Para pilotar un yate necesitarías Capitán Yate (mucho más exigente que PER).'
  },
  {
    question: '¿Puedo hacer eventos (bodas, despedidas) en un yate?',
    answer: 'Sí. Es muy popular en Costa del Sol, Costa Brava, Baleares. Precios eventos: €2,000-4,000 para grupos 20-40 pers, €5,000-15,000 para bodas. Incluye: catering, bebidas, DJ, marinería. Debes contratar con empresa especializada (ofertan paquetes eventos completos).'
  },
  {
    question: '¿Cuál es la mejor región para charter de lujo?',
    answer: 'Costa del Sol (Marbella, Málaga): destino premium clásico, puertos lujosos, clima perfecto mayo-octubre. Baleares: Ibiza/Formentera para fiestas, Mallorca para familias lujo. Costa Brava: más exclusivo, menos concurrido. Cada región tiene especialistas en yates lujo con servicios VIP.'
  }
]

export default function YatesLujo() {
  return (
    <>
      <MultiJsonLd schemas={[
        generateArticleSchema({
          headline: 'Alquiler de Yates de Lujo en España: Guía Premium 2026',
          description: 'Guía experta sobre yates de lujo: definición, servicios, precios premium, mejores regiones, charter para eventos y bodas.',
          datePublished: '2026-05-28'
        }),
        generateBreadcrumbSchema(breadcrumb),
        generateFAQSchema(faqItems)
      ]} />

      <article style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* HEADER */}
        <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Tipos de Barco Premium
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1rem', color: 'var(--ink)' }}>
            Yates de Lujo: Charter Premium en España
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 700 }}>
            Descubre el mundo exclusivo de los yates de lujo. Charter con capitán, servicios personalizados, bodas a bordo. Precios €500-3,000/día en los destinos más exclusivos de España.
          </p>
        </header>

        {/* TOC */}
        <nav style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem', marginBottom: '3rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Índice</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'definicion', label: 'Qué es un Yate' },
              { id: 'experiencia', label: 'Experiencia de Lujo' },
              { id: 'precios', label: 'Precios y Servicios' },
              { id: 'destinos', label: 'Destinos Exclusivos' },
              { id: 'eventos', label: 'Bodas y Eventos' },
              { id: 'capitán', label: 'Capitán y Tripulación' },
              { id: 'consejos', label: 'Consejos de Lujo' }
            ].map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  → {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* SECCIÓN: DEFINICIÓN */}
        <section id="definicion" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            ¿Qué es un Yate?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Un <strong>yate</strong> es una embarcación de recreo de tamaño significativo (habitualmente &gt;8 metros de eslora) equipada con cabina habitable, camarotes, cocina, baños completos y servicios de lujo. A diferencia de catamaranes o veleros, los yates priorizan <strong>comodidad y servicios personalizados</strong> sobre la experiencia de navegación.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            <strong>Regulación crítica:</strong> Los yates &gt;8m <strong>requieren Capitán Yate obligatorio</strong> por ley española. No puedes pilotarlos sin certificación profesional. Esto significa que siempre viajas como pasajero, con tripulación profesional gestionando navegación y servicios.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong>Dimensiones típicas:</strong> Yates de charter vienen en rangos:
            <br />• <strong>Pequeños:</strong> 10-15m (4-8 pasajeros)
            <br />• <strong>Medianos:</strong> 15-25m (8-15 pasajeros)
            <br />• <strong>Grandes:</strong> 25-40m+ (15-50+ pasajeros)
          </p>
        </section>

        {/* SECCIÓN: EXPERIENCIA */}
        <section id="experiencia" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            La Experiencia: Lujo a Bordo
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Alquilar un yate de lujo es fundamentalmente diferente a un catamaran o velero. No navegas; <strong>te trasladas en un palacio flotante</strong> con todas las comodidades del hogar (o mejor).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--accent)' }}>🛏️ Alojamiento</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li>Camarotes con baño privado (no compartido)</li>
                <li>Camas tamaño queen/doble</li>
                <li>Aire acondicionado individual</li>
                <li>Espacio suficiente para moverse</li>
                <li>Ropa de cama de lujo (800+ hilos)</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--ocre-500)' }}>👨‍🍳 Gastronomía</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li>Chef a bordo (opcional +€150-250/día)</li>
                <li>Cocina profesional totalmente equipada</li>
                <li>Menús personalizados (dietas especiales)</li>
                <li>Cenas temáticas en cubierta</li>
                <li>Vinos y champagne de calidad</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--terra-700)' }}>🌊 Entretenimiento</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li>Snorkel y buceo (equipo incluido)</li>
                <li>Tabla de paddle o kayaks</li>
                <li>Jet ski opcional</li>
                <li>Sistemas de sonido en cubierta</li>
                <li>Wifi y entretenimiento multimedia</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--mar-500)' }}>🏖️ Servicios</h3>
              <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li>Marinero personal (camarotes, cubierta)</li>
                <li>Gestor de itinerarios y fondeos</li>
                <li>Limpieza diaria del yate</li>
                <li>Spa y masajes a bordo (contratables)</li>
                <li>Concierge 24/7 para solicitudes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECCIÓN: PRECIOS */}
        <section id="precios" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Precios: Estructura de Costos 2026
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Los precios de charter de lujo se cotizan generalmente por persona o por día de yate completo. A diferencia de catamaranes, el modelo es "all-inclusive" pero con costos significativos.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line-strong)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Tamaño Yate</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Capacidad</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Precio/Día</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Incluye</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>10-15m</td>
                  <td style={{ padding: '1rem' }}>4-8 pers</td>
                  <td style={{ padding: '1rem' }}>€500-1,000</td>
                  <td style={{ padding: '1rem' }}>Capitán, marinero, combustible</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>15-25m</td>
                  <td style={{ padding: '1rem' }}>8-15 pers</td>
                  <td style={{ padding: '1rem' }}>€1,000-2,000</td>
                  <td style={{ padding: '1rem' }}>Cap, 1-2 marineros, combustible</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>25-40m</td>
                  <td style={{ padding: '1rem' }}>15-40 pers</td>
                  <td style={{ padding: '1rem' }}>€2,000-3,500</td>
                  <td style={{ padding: '1rem' }}>Cap, 2-3 marineros, chef</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>40m+</td>
                  <td style={{ padding: '1rem' }}>40+ pers</td>
                  <td style={{ padding: '1rem' }}>€3,500+</td>
                  <td style={{ padding: '1rem' }}>Equipo completo, lujo total</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '1rem', marginBottom: '1.5rem' }}>
            <strong>⚠️ Costos Adicionales (fuera del precio base):</strong>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              <li><strong>Chef a bordo:</strong> +€150-250/día (muy recomendado)</li>
              <li><strong>Marinero adicional:</strong> +€100-150/día</li>
              <li><strong>Fondeos ecológicos (Baleares):</strong> +€15-30/noche</li>
              <li><strong>Combustible extras:</strong> Si consumo supera lo incluido</li>
              <li><strong>Actividades agua:</strong> Jet ski, buceo guiado (€200-500)</li>
              <li><strong>Catering especial:</strong> Picnics gourmet, cenas temáticas (€300-800)</li>
            </ul>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong>Presupuesto realista 7 días para 8 personas:</strong> €1,500/día yate + €250/día chef + €100/día marinero extra + €200 fondeos = <strong>€2,050/día = €14,350 semana</strong> (o €1,794 por persona).
          </p>
        </section>

        {/* SECCIÓN: DESTINOS */}
        <section id="destinos" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Destinos Exclusivos para Charter de Lujo
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>☀️ Costa del Sol (Marbella, Málaga)</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <strong>El destino premium clásico.</strong> Puertos de lujo como Puerto Banús con infraestructura de 5 estrellas. Clima perfecto mayo-octubre. Cercano a Gibraltar (viajes a Marruecos). Precios: los más altos de España (€1,000-3,500/día). Mejor para: parejas lujo, bodas, directivos.
              </p>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>🎉 Baleares (Ibiza, Formentera, Mallorca)</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <strong>Variado según isla.</strong> <u>Ibiza:</u> Fiestas, despedidas, público joven, DJ a bordo (€600-1,500/día). <u>Formentera:</u> Romántico, calas secretas, parejas. <u>Mallorca:</u> Familias lujo, fondeos seguros, infraestructura completa. Fondeos ecológicos obligatorios (regulación 2026).
              </p>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>🏛️ Costa Brava (Barcelona, Sitges, Girona)</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                <strong>Exclusivo y culturalmente rico.</strong> Calas secluidas, pueblos medievales accesibles. Menos concurrido que Costa del Sol. Precios moderadamente más bajos (€800-2,000/día). Ideal para: parejas sofisticadas, viajes culturales, bodas íntimas.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN: EVENTOS */}
        <section id="eventos" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Bodas y Eventos en Yate
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Celebrar una boda, despedida o evento corporativo en un yate es la experiencia de lujo más memorable. Hay empresas especializadas en eventos a bordo con paquetes "llave en mano".
          </p>

          <div style={{ background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(99, 179, 237, 0.05) 100%)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 6, padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>💍 Precio Eventos según Tamaño</h3>
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(99, 179, 237, 0.3)' }}>
                  <td style={{ padding: '0.75rem' }}><strong>Despedida (15-30 pers)</strong></td>
                  <td style={{ padding: '0.75rem' }}>€2,000-4,000</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(99, 179, 237, 0.3)' }}>
                  <td style={{ padding: '0.75rem' }}><strong>Evento corporativo (30-50 pers)</strong></td>
                  <td style={{ padding: '0.75rem' }}>€4,000-8,000</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(99, 179, 237, 0.3)' }}>
                  <td style={{ padding: '0.75rem' }}><strong>Boda (40-80 pers)</strong></td>
                  <td style={{ padding: '0.75rem' }}>€8,000-15,000+</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem' }}><strong>Boda lujo (80+ pers, yate grande)</strong></td>
                  <td style={{ padding: '0.75rem' }}>€15,000-40,000+</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            <strong>Incluido típicamente:</strong>
          </p>
          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>Yate equipado, tripulación completa, combustible</li>
            <li>Catering (tapas, menú, cena gala)</li>
            <li>Bebidas (barra libre cerveza, vino, cava, licores)</li>
            <li>DJ/Música (equipo de sonido profesional)</li>
            <li>Decoración básica (flores, velas, iluminación)</li>
            <li>Personal de servicios (meseros, barman, sommelier)</li>
          </ul>

          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic' }}>
            <strong>Empresas especializadas en Marbella:</strong> G3 BCN, Real Yacht Charter, CharterAlia (ofrecen paquetes bodas llave en mano con coordinación completa).
          </p>
        </section>

        {/* SECCIÓN: CAPITÁN */}
        <section id="capitán" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            Capitán y Tripulación Profesional
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            <strong>El capitán es obligatorio.</strong> Por regulación española, yates &gt;8m deben ser pilotados por un Capitán Yate certificado. El capitán no solo navega: es responsable de seguridad, itinerario, comunicaciones oficiales.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>⚓ Capitán Yate</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: '1rem' }}>
                <li><strong>Responsabilidades:</strong> Navegación, seguridad, regulaciones</li>
                <li><strong>Incluido:</strong> Siempre (obligatorio)</li>
                <li><strong>Experiencia:</strong> Típicamente 15+ años mar</li>
                <li><strong>Comunicación:</strong> Discreta, profesional</li>
              </ul>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>👨‍💼 Marinero/Tripulación</h3>
              <ul style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: '1rem' }}>
                <li><strong>Responsabilidades:</strong> Camarotes, cubierta, servicios</li>
                <li><strong>Costo:</strong> €100-150/día (adicional)</li>
                <li><strong>Típicamente:</strong> 1-2 marineros en yates medianos</li>
                <li><strong>Discreto:</strong> Están "pero no están"</li>
              </ul>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong>Chef a bordo (opcional):</strong> Especialmente recomendado para lujo. Costo adicional €150-250/día. Prepara menús personalizados, gestiona despensa, servicio formal en cubierta.
          </p>
        </section>

        {/* SECCIÓN: CONSEJOS */}
        <section id="consejos" style={{ marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.1) 0%, rgba(99, 179, 237, 0.05) 100%)', border: '1px solid rgba(99, 179, 237, 0.2)', borderRadius: 6, padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
            ⚡ Consejos para Charter de Lujo
          </h2>

          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li><strong>Reserva con anticipación:</strong> Yates lujo se agotan 3-4 meses antes, especialmente verano/bodas</li>
            <li><strong>Comunica preferencias:</strong> Dietas, alergias, mobiliario, musica. El capitán/chef preparan todo.</li>
            <li><strong>Fondeos ecológicos obligatorios:</strong> Baleares requiere fondeos con boyas regulados. El capitán lo gestiona.</li>
            <li><strong>Seguro incluido:</strong> Verifica cobertura completa (daños, cancelación, evacuación médica)</li>
            <li><strong>Propinas:</strong> Costumbre dar 5-10% a tripulación al final (no obligatorio pero apreciado)</li>
            <li><strong>Intimidad:</strong> El yate es privado. Capitán/tripulación respetan total privacidad en camarotes</li>
            <li><strong>Itinerarios flexibles:</strong> A diferencia de cruceros, puedes cambiar ruta según deseos (clima, cambio planes)</li>
            <li><strong>Comunicación en avance:</strong> Menú, vinos, actividades especiales deben comunicarse antes del charter</li>
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
            Alquila tu Yate de Lujo
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
            Charter exclusivo con capitán, chef, marinería. Bodas, eventos, viajes privados. Desde €500/día en las mejores regiones de España.
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
            Explorar Yates de Lujo →
          </Link>
        </section>

        {/* ENLACES INTERNOS */}
        <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--line)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Otras Guías Relacionadas</h3>
          <ul style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>
              <Link href="/guides/alquiler-catamaranes" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Alquiler de Catamaranes: Mejor para Familias
              </Link>
            </li>
            <li>
              <Link href="/guides/alquiler-barcos-guia-completa" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Guía Completa: Cómo Alquilar Barco en España
              </Link>
            </li>
            <li>
              <Link href="/alquiler-barco" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Centro de Alquiler: Todos los Tipos de Embarcaciones
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </>
  )
}
