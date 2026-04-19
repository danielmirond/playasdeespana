// src/app/privacidad/page.tsx — Política de privacidad LOPDGDD + RGPD
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export const metadata: Metadata = {
  title: 'Política de privacidad — Playas de España',
  description: 'Información sobre el tratamiento de datos personales en playas-espana.com conforme al RGPD y la LOPDGDD.',
  alternates: { canonical: '/privacidad' },
  robots: { index: true, follow: true },
}

export default function PrivacidadPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 750, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Política de privacidad</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '1rem' }}>
          Política de privacidad
        </h1>
        <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '.5rem' }}>
          <strong>Última actualización:</strong> abril 2026
        </p>
        <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Esta política explica cómo <strong>playas-espana.com</strong> trata los datos de los visitantes,
          conforme al <strong>Reglamento (UE) 2016/679</strong> (RGPD) y la <strong>Ley Orgánica 3/2018, de 5 de
          diciembre, de Protección de Datos Personales y garantía de los derechos digitales</strong> (LOPDGDD).
        </p>

        <Section title="1. Responsable del tratamiento">
          <p>El responsable del tratamiento de datos es el titular del sitio web
          <strong> playas-espana.com</strong>. Para contactar con el responsable puedes usar el formulario de
          contacto del sitio o la dirección de email publicada a continuación.</p>
          <p>No existe Delegado de Protección de Datos (DPO) designado, al no ser obligatorio por
          la naturaleza y volumen del tratamiento (art. 37 RGPD).</p>
        </Section>

        <Section title="2. Datos que tratamos">
          <p>La web <strong>no requiere registro</strong>. La inmensa mayoría de usuarios navega sin que se
          trate ningún dato personal identificable. Los datos que se tratan son:</p>
          <ul>
            <li><strong>Datos de navegación</strong> (logs de servidor): IP, user agent, páginas visitadas,
            fecha. Se conservan 30 días para seguridad y prevención de abusos.</li>
            <li><strong>Cookies técnicas</strong> (localStorage): preferencias, favoritos, reportes, votos.
            Se almacenan en tu navegador, no se envían al servidor.</li>
            <li><strong>Cookies analíticas</strong> (si aceptas): Google Analytics 4. Datos anónimos agregados
            sobre tráfico. Google actúa como encargado del tratamiento.</li>
            <li><strong>Cookies de marketing</strong> (si aceptas): AdSense y afiliados. Ver
            <Link href="/cookies"> política de cookies</Link>.</li>
          </ul>
          <p><strong>No tratamos datos de categorías especiales</strong> (salud, ideología, religión, etc.).</p>
        </Section>

        <Section title="3. Base legal del tratamiento">
          <ul>
            <li><strong>Logs de servidor</strong>: interés legítimo del responsable (art. 6.1.f RGPD) —
            seguridad del sistema y prevención de fraude.</li>
            <li><strong>Cookies técnicas</strong>: exención del art. 22.2 LSSI-CE.</li>
            <li><strong>Cookies analíticas y marketing</strong>: consentimiento del usuario (art. 6.1.a RGPD).
            Puedes retirarlo en cualquier momento.</li>
          </ul>
        </Section>

        <Section title="4. Finalidad">
          <ul>
            <li>Proporcionar la información sobre playas solicitada</li>
            <li>Guardar preferencias del usuario (favoritos, idioma, consentimiento)</li>
            <li>Obtener estadísticas de uso agregadas y anónimas (si hay consentimiento)</li>
            <li>Mostrar publicidad relevante y enlaces de afiliación (si hay consentimiento)</li>
          </ul>
        </Section>

        <Section title="5. Destinatarios y transferencias internacionales">
          <p>Los datos pueden ser comunicados a los siguientes encargados del tratamiento:</p>
          <ul>
            <li><strong>Vercel Inc.</strong> (EE.UU.) — hosting del sitio web. Vercel está certificado bajo el
            Data Privacy Framework UE-EE.UU.</li>
            <li><strong>Google LLC</strong> (EE.UU.) — Google Analytics 4 y AdSense (solo con consentimiento).
            Google está certificado bajo el Data Privacy Framework.</li>
            <li><strong>Partners de afiliación</strong> (Booking, Amazon, Civitatis, etc.) — solo si haces clic
            en un enlace de afiliación, y según sus propias políticas.</li>
          </ul>
          <p>Las transferencias a EE.UU. se basan en el <strong>EU-US Data Privacy Framework</strong>
          (Decisión de Adecuación de la Comisión Europea 2023/1795).</p>
        </Section>

        <Section title="6. Conservación de los datos">
          <ul>
            <li>Logs de servidor: 30 días</li>
            <li>Cookies técnicas: hasta 1 año (o hasta que las borres)</li>
            <li>Cookies analíticas (_ga): 2 años (borrables desde ajustes del navegador)</li>
            <li>Reportes y votos anónimos: 24 horas los reportes, indefinido los votos (sin asociar a tu identidad)</li>
          </ul>
        </Section>

        <Section title="7. Tus derechos (ARSUPOL)">
          <p>Como interesado, tienes derecho a:</p>
          <ul>
            <li><strong>Acceder</strong> a tus datos personales</li>
            <li><strong>Rectificar</strong> los datos inexactos</li>
            <li><strong>Suprimir</strong> (derecho al olvido) los datos que ya no sean necesarios</li>
            <li><strong>Oponerte</strong> a determinados tratamientos</li>
            <li><strong>Limitar</strong> el tratamiento en determinadas circunstancias</li>
            <li><strong>Portabilidad</strong>: recibir tus datos en formato estructurado</li>
            <li><strong>Retirar el consentimiento</strong> en cualquier momento (para cookies, borrando
            <code> cookie_consent_v2</code> del navegador)</li>
          </ul>
          <p>Para ejercer estos derechos, puedes contactarnos vía email. Recibirás respuesta en un plazo
          máximo de 30 días.</p>
          <p>Si consideras que no hemos atendido adecuadamente tus derechos, puedes presentar una reclamación
          ante la <strong>Agencia Española de Protección de Datos</strong>:
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer"> aepd.es</a>.</p>
        </Section>

        <Section title="8. Menores de edad">
          <p>Este sitio web no está dirigido a menores de 14 años. Conforme al art. 7 de la LOPDGDD,
          los menores de 14 años necesitan el consentimiento de sus padres o tutores para el tratamiento
          de datos personales. No solicitamos ni recogemos voluntariamente datos de menores.</p>
        </Section>

        <Section title="9. Seguridad">
          <p>Aplicamos medidas técnicas y organizativas razonables para proteger los datos frente a
          pérdida, uso indebido o acceso no autorizado:</p>
          <ul>
            <li>HTTPS obligatorio en todo el sitio (HSTS)</li>
            <li>Cabeceras de seguridad (CSP, X-Frame-Options, etc.)</li>
            <li>Actualizaciones de seguridad del software</li>
            <li>Principio de minimización de datos (no recogemos lo que no necesitamos)</li>
          </ul>
        </Section>

        <Section title="10. Cambios en la política">
          <p>Esta política puede actualizarse. Los cambios se publican en esta misma página con la
          fecha de última actualización.</p>
        </Section>

        <Section title="Más información">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.5rem' }}>
            <Link href="/aviso-legal" style={{ display: 'inline-flex', padding: '.45rem .85rem', background: 'rgba(107,64,10,.14)', color: '#4a2c05', borderRadius: 100, fontSize: '.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(107,64,10,.3)' }}>Aviso legal →</Link>
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
