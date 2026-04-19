// src/app/aviso-legal/page.tsx — Aviso legal conforme LSSI-CE art. 10
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export const metadata: Metadata = {
  title: 'Aviso legal — Playas de España',
  description: 'Información legal sobre el sitio web playas-espana.com: titularidad, condiciones de uso y responsabilidad.',
  alternates: { canonical: '/aviso-legal' },
  robots: { index: true, follow: true },
}

export default function AvisoLegalPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 750, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Aviso legal</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '1rem' }}>
          Aviso legal
        </h1>
        <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          <strong>Última actualización:</strong> abril 2026
        </p>

        <Section title="1. Datos identificativos del titular">
          <p>En cumplimiento del artículo 10 de la <strong>Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y del Comercio Electrónico</strong> (LSSI-CE), se informa que el
          presente sitio web <strong>playas-espana.com</strong> es propiedad del titular del dominio.</p>
          <p>Para contactar con el responsable puedes usar el formulario de contacto del sitio o enviar
          un email a la dirección publicada en la política de privacidad.</p>
        </Section>

        <Section title="2. Objeto del sitio">
          <p><strong>playas-espana.com</strong> es una guía informativa sobre las playas de España. Ofrece:</p>
          <ul>
            <li>Datos meteorológicos y marinos en tiempo real (Open-Meteo)</li>
            <li>Información oficial de playas (MITECO, IGN, CartoCiudad)</li>
            <li>Recomendaciones, rankings y rutas</li>
            <li>Reportes y valoraciones anónimas de usuarios</li>
            <li>Enlaces de afiliación a proveedores de turismo (ver <Link href="/cookies">política de cookies</Link>)</li>
          </ul>
          <p>El sitio es gratuito y no requiere registro para acceder a la información.</p>
        </Section>

        <Section title="3. Condiciones de uso">
          <p>El uso del sitio atribuye la condición de usuario. El usuario se compromete a:</p>
          <ul>
            <li>Hacer un uso conforme a la ley, la moral y el orden público</li>
            <li>No utilizar el sitio para actividades ilícitas o fraudulentas</li>
            <li>No dañar, inutilizar, sobrecargar o deteriorar el sitio</li>
            <li>No intentar acceder a áreas restringidas del sitio o de los sistemas del titular</li>
            <li>Respetar los derechos de propiedad intelectual e industrial</li>
          </ul>
        </Section>

        <Section title="4. Propiedad intelectual e industrial">
          <p>Todos los contenidos del sitio (textos, imágenes, diseño, código, logotipos, marcas) son
          propiedad del titular o de terceros con licencia de uso. Excepto:</p>
          <ul>
            <li><strong>Datos de playas</strong>: MITECO (uso abierto), OpenStreetMap (ODbL), IGN PNOA (CC BY 4.0)</li>
            <li><strong>Datos meteorológicos</strong>: Open-Meteo (CC BY 4.0)</li>
            <li><strong>Fotografías</strong>: Wikimedia Commons (licencias libres), Flickr (Creative Commons),
            Unsplash (licencia Unsplash). Cada foto indica autor y fuente.</li>
          </ul>
          <p>El uso de los contenidos requiere respetar las licencias correspondientes.</p>
        </Section>

        <Section title="5. Exclusión de responsabilidad">
          <p>La información sobre condiciones del mar, calidad del agua, medusas, oleaje, viento y otros
          datos se ofrece con <strong>carácter orientativo</strong>. El titular <strong>no garantiza la exactitud</strong> de
          los datos en tiempo real ni la actualización permanente. El usuario asume la responsabilidad
          de verificar las condiciones reales antes de bañarse o realizar actividades acuáticas.</p>
          <p>Los reportes de usuarios (medusas, banderas, limpieza) son contribuciones voluntarias sin
          verificación, y tienen valor meramente indicativo.</p>
          <p>Los enlaces externos son responsabilidad de sus respectivos titulares. El titular no controla
          ni asume responsabilidad por los contenidos de sitios de terceros.</p>
        </Section>

        <Section title="6. Enlaces de afiliación">
          <p>Algunos enlaces del sitio son de <strong>afiliación</strong>: si realizas una compra o reserva a través
          de ellos, el titular puede recibir una comisión <strong>sin coste adicional</strong> para ti. Estos enlaces
          están marcados en el HTML con <code>rel=&quot;sponsored&quot;</code>.</p>
          <p>La presencia de enlaces de afiliación no influye en los datos, rankings ni recomendaciones
          informativas del sitio. Lista completa de proveedores en la <Link href="/cookies">política de cookies</Link>.</p>
        </Section>

        <Section title="7. Modificaciones">
          <p>El titular se reserva el derecho de modificar en cualquier momento el contenido del sitio,
          los términos de uso y el presente aviso legal, sin notificación previa. Las modificaciones
          entran en vigor desde su publicación.</p>
        </Section>

        <Section title="8. Legislación aplicable y jurisdicción">
          <p>Las relaciones entre el titular y el usuario se rigen por la <strong>legislación española</strong>.
          Para cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio
          del usuario cuando éste actúe como consumidor, conforme a la normativa vigente de protección
          al consumidor.</p>
        </Section>

        <Section title="9. Más información">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.5rem' }}>
            <Link href="/privacidad" style={{ display: 'inline-flex', padding: '.45rem .85rem', background: 'rgba(107,64,10,.14)', color: '#4a2c05', borderRadius: 100, fontSize: '.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(107,64,10,.3)' }}>Política de privacidad →</Link>
            <Link href="/cookies" style={{ display: 'inline-flex', padding: '.45rem .85rem', background: 'rgba(107,64,10,.14)', color: '#4a2c05', borderRadius: 100, fontSize: '.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(107,64,10,.3)' }}>Política de cookies →</Link>
          </div>
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
