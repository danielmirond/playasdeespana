// src/app/cookies/page.tsx — Política de cookies conforme LSSI-CE y RGPD
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export const metadata: Metadata = {
  title: 'Política de cookies — Playas de España',
  description: 'Información sobre las cookies que utiliza playas-espana.com: tipos, finalidad, duración y cómo gestionarlas.',
  alternates: { canonical: '/cookies' },
  robots: { index: true, follow: true },
}

export default function CookiesPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 750, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Política de cookies</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem',
        }}>
          Política de cookies
        </h1>
        <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '.5rem' }}>
          <strong>Última actualización:</strong> abril 2026
        </p>
        <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Esta política explica qué cookies utiliza <strong>playas-espana.com</strong>, con qué finalidad
          y cómo puedes aceptarlas, rechazarlas o configurarlas. Cumplimos con el artículo 22.2 de la
          <strong> Ley 34/2002 de Servicios de la Sociedad de la Información</strong> (LSSI-CE) y el
          <strong> Reglamento General de Protección de Datos</strong> (RGPD).
        </p>

        {/* ¿Qué son las cookies? */}
        <Section title="¿Qué son las cookies?">
          <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
          (ordenador, móvil o tablet) cuando los visitas. Permiten al sitio recordar tus acciones y
          preferencias durante un periodo de tiempo.</p>
        </Section>

        {/* Cookies que usamos */}
        <Section title="Cookies que utilizamos">
          <CookieTable />
        </Section>

        {/* Cookies técnicas */}
        <Section title="1. Cookies técnicas (necesarias)">
          <p>Estas cookies son <strong>estrictamente necesarias</strong> para que la web funcione. No requieren
          consentimiento (exención del art. 22.2 LSSI-CE).</p>
          <ul>
            <li><strong>cookie_consent_v2</strong> — almacena tu elección de cookies. Duración: 1 año. Propia.</li>
            <li><strong>playas_favoritas</strong> — lista de playas guardadas como favoritas. Duración: permanente. Propia (localStorage).</li>
            <li><strong>voto:{'{slug}'}</strong> — tu valoración por estrellas en una playa. Duración: permanente. Propia (localStorage).</li>
            <li><strong>rep:{'{slug}:{tipo}'}</strong> — tu reporte de condiciones en una playa. Duración: 24h. Propia (localStorage).</li>
          </ul>
        </Section>

        {/* Cookies analíticas */}
        <Section title="2. Cookies analíticas">
          <p>Solo se activan si aceptas las cookies analíticas en el banner de consentimiento.</p>
          <ul>
            <li><strong>_ga, _ga_*</strong> — Google Analytics 4 (GA4). Identificador anónimo de sesión. Duración: 2 años. Terceros (Google LLC).</li>
            <li>Finalidad: medir el número de visitas, páginas vistas, tiempo en el sitio y fuente del tráfico. Los datos son anónimos y agregados.</li>
            <li>Proveedor: Google LLC (EE.UU.). <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de privacidad de Google</a>.</li>
          </ul>
        </Section>

        {/* Cookies de marketing */}
        <Section title="3. Cookies de marketing y afiliación">
          <p>Solo se activan si aceptas las cookies de marketing en el banner.</p>
          <ul>
            <li><strong>Google AdSense</strong> — cookies de publicidad personalizadas. Duración: variable. Terceros (Google LLC).</li>
            <li><strong>Cookies de afiliados</strong> — cuando haces clic en un enlace de afiliado (Booking.com, Amazon,
            Civitatis, Click&Boat, Rentalcars, TheFork, Parclick, Pitchup, Heymondo, IATI, Chapka, Samboat,
            Nautal, Direct Ferries, Baleària), el proveedor puede instalar cookies de seguimiento para atribuirnos
            la referencia. Cada proveedor tiene su propia política de cookies.</li>
          </ul>
        </Section>

        {/* Disclosure afiliación */}
        <Section title="4. Transparencia sobre enlaces de afiliación">
          <p>Algunas páginas de playas-espana.com contienen <strong>enlaces de afiliación</strong>. Esto significa
          que si haces clic y realizas una compra o reserva, podemos recibir una comisión del proveedor
          <strong> sin coste adicional para ti</strong>. Estos enlaces están marcados con el atributo
          <code> rel=&quot;sponsored&quot;</code> en el HTML.</p>
          <p>Los proveedores con los que trabajamos incluyen:</p>
          <ul>
            <li>Booking.com — hoteles y alojamiento</li>
            <li>Amazon.es — equipo de playa, protectores solares</li>
            <li>Civitatis — actividades y excursiones</li>
            <li>Click&Boat, Samboat, Nautal — alquiler de barcos</li>
            <li>Rentalcars — alquiler de coches</li>
            <li>TheFork — reservas de restaurantes</li>
            <li>Parclick — reservas de parking</li>
            <li>Pitchup — reservas de campings</li>
            <li>Heymondo, IATI, Chapka — seguros de viaje</li>
            <li>Direct Ferries, Baleària — ferries</li>
          </ul>
          <p>La afiliación <strong>no influye</strong> en los datos meteorológicos, puntuaciones, rankings ni
          contenido informativo. Estos provienen de fuentes independientes (Open-Meteo, MITECO, EEA, OSM).</p>
        </Section>

        {/* Cómo gestionar */}
        <Section title="5. Cómo gestionar tus cookies">
          <p>Puedes cambiar tus preferencias en cualquier momento:</p>
          <ul>
            <li><strong>Banner de consentimiento</strong>: al borrar la cookie <code>cookie_consent_v2</code>
            de tu navegador, el banner volverá a aparecer.</li>
            <li><strong>Configuración del navegador</strong>: todos los navegadores permiten bloquear o eliminar
            cookies desde su menú de privacidad.</li>
          </ul>
          <p>Enlaces a la configuración de cookies en los principales navegadores:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
            <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>
        </Section>

        {/* Base legal */}
        <Section title="6. Base legal">
          <p>Las cookies técnicas se instalan en base al <strong>interés legítimo</strong> del responsable
          (art. 22.2 LSSI-CE, exención para cookies necesarias).</p>
          <p>Las cookies analíticas y de marketing se instalan en base al <strong>consentimiento</strong>
          del usuario (art. 6.1.a RGPD), obtenido mediante el banner de cookies con opción granular de
          aceptar o rechazar cada categoría.</p>
        </Section>

        {/* Contacto */}
        <Section title="7. Responsable y contacto">
          <p>Responsable del tratamiento: el titular de <strong>playas-espana.com</strong>.</p>
          <p>Para ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación o
          portabilidad, puedes contactarnos a través de la dirección indicada en el aviso legal del sitio.</p>
        </Section>
      </main>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>{title}</h2>
      <div style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>
        {children}
      </div>
      <style>{`
        section ul { padding-left: 1.2rem; margin: .5rem 0; }
        section li { margin-bottom: .35rem; }
        section p { margin-bottom: .65rem; }
        section code { background: rgba(107,64,10,.08); padding: .1rem .35rem; borderRadius: 4; fontSize: .82rem; }
        section a { color: var(--accent, #6b400a); text-decoration: underline; }
      `}</style>
    </section>
  )
}

function CookieTable() {
  const cookies = [
    { nombre: 'cookie_consent_v2', tipo: 'Técnica',   proveedor: 'Propia',     duracion: '1 año',      finalidad: 'Almacenar preferencias de cookies' },
    { nombre: 'playas_favoritas',  tipo: 'Técnica',   proveedor: 'Propia',     duracion: 'Permanente', finalidad: 'Lista de playas favoritas' },
    { nombre: '_ga, _ga_*',        tipo: 'Analítica', proveedor: 'Google LLC', duracion: '2 años',     finalidad: 'Medir tráfico (GA4)' },
    { nombre: 'IDE, DSID',        tipo: 'Marketing', proveedor: 'Google LLC', duracion: '1 año',      finalidad: 'Publicidad AdSense' },
    { nombre: 'Cookies afiliados', tipo: 'Marketing', proveedor: 'Varios',    duracion: 'Variable',   finalidad: 'Atribución de referencia' },
  ]
  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 6, marginBottom: '1.5rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
        <thead>
          <tr style={{ background: 'rgba(107,64,10,.08)' }}>
            {['Cookie', 'Tipo', 'Proveedor', 'Duración', 'Finalidad'].map(h => (
              <th key={h} style={{ padding: '.55rem .75rem', textAlign: 'left', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cookies.map((c, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
              <td style={{ padding: '.55rem .75rem', fontWeight: 600 }}>{c.nombre}</td>
              <td style={{ padding: '.55rem .75rem' }}>{c.tipo}</td>
              <td style={{ padding: '.55rem .75rem' }}>{c.proveedor}</td>
              <td style={{ padding: '.55rem .75rem' }}>{c.duracion}</td>
              <td style={{ padding: '.55rem .75rem' }}>{c.finalidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
