# 📝 TEMPLATE PARA CREAR GUÍAS SEO RÁPIDAMENTE

Copy-paste este template para cada guía. Reemplaza [PLACEHOLDERS].

---

## STEP 1: Metadata (Copiar en `page.tsx` header)

```typescript
export const metadata: Metadata = {
  title: '[TITLE - Max 60 chars] | Playas de España',
  description: '[DESCRIPTION - 150-160 chars] Reserva en SamBoat, Nautal, ClickBoat.',
  keywords: [
    '[KEYWORD-1]',
    '[KEYWORD-2]',
    '[KEYWORD-3]'
  ],
  openGraph: {
    title: '[TITLE]',
    description: '[SHORT DESCRIPTION]',
    url: 'https://playas-espana.com/guides/[slug]',
    type: 'article',
    images: [{ url: '[UNSPLASH-IMG]', width: 1200, height: 630 }]
  },
  alternates: {
    canonical: 'https://playas-espana.com/guides/[slug]'
  }
}
```

---

## STEP 2: Schema (Copiar después de `</MultiJsonLd>`)

```typescript
const schemas = [
  generateArticleSchema({
    headline: '[MAIN HEADLINE]',
    description: '[SHORT DESCRIPTION]',
    datePublished: '2026-05-27',
    imageUrl: '[UNSPLASH-IMG-URL]'
  }),
  generateBreadcrumbSchema([
    { name: 'Inicio', url: 'https://playas-espana.com' },
    { name: 'Guías', url: 'https://playas-espana.com/guides' },
    { name: '[GUIDE-NAME]', url: 'https://playas-espana.com/guides/[slug]' }
  ])
]
```

---

## STEP 3: Estructura HTML (Copy as-is, reemplaza [CONTENT])

```jsx
<article style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
  {/* HEADER */}
  <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }}>
    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>
      [CATEGORY LABEL]
    </div>
    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '1rem' }}>
      [MAIN HEADLINE]
    </h1>
    <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.6 }}>
      [SHORT DESCRIPTION]
    </p>
  </header>

  {/* TABLE OF CONTENTS - OPTIONAL */}
  <nav style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem', marginBottom: '3rem' }}>
    <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Índice</h3>
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {[
        { id: 'section-1', label: 'Section 1 Title' },
        { id: 'section-2', label: 'Section 2 Title' }
      ].map(item => (
        <li key={item.id}>
          <a href={`#${item.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            → {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>

  {/* CONTENT SECTIONS */}
  <section id="section-1" style={{ marginBottom: '3rem' }}>
    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
      Section 1 Title
    </h2>
    <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
      [CONTENT PARAGRAPH]
    </p>
    {/* Grid, lists, tables as needed */}
  </section>

  {/* CTA SECTION */}
  <section style={{
    background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.1) 0%, rgba(3, 105, 161, 0.05) 100%)',
    border: '1px solid rgba(3, 105, 161, 0.2)',
    borderRadius: 6,
    padding: '2.5rem',
    textAlign: 'center'
  }}>
    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
      [CTA HEADLINE]
    </h2>
    <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
      [CTA DESCRIPTION]
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
      [CTA TEXT] →
    </Link>
  </section>
</article>
```

---

## STEP 4: FAQ Schema (OPTIONAL - para guías con preguntas)

```typescript
const faqItems = [
  { question: '¿Pregunta 1?', answer: 'Respuesta 1...' },
  { question: '¿Pregunta 2?', answer: 'Respuesta 2...' }
]

// Add to schemas array:
generateFAQSchema(faqItems)

// Render in article:
<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
  {faqItems.map((item, idx) => (
    <details key={idx} style={{ border: '1px solid var(--line)', borderRadius: 6 }}>
      <summary style={{ padding: '1.25rem', fontWeight: 700, cursor: 'pointer' }}>
        {item.question}
      </summary>
      <div style={{ padding: '1.25rem', fontSize: '0.9rem', borderTop: '1px solid var(--line)' }}>
        {item.answer}
      </div>
    </details>
  ))}
</div>
```

---

## STYLING QUICK REFERENCE

```typescript
// Header
header = { marginBottom: '3rem', borderBottom: '1px solid var(--line)', paddingBottom: '2rem' }
h1 = { fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700 }
h2 = { fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }
h3 = { fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }

// Text
p = { fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7 }
small = { fontSize: '0.9rem', color: 'var(--muted)' }

// Cards
card = { background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '1.5rem' }

// CTA Button
button = { display: 'inline-block', padding: '1rem 2rem', background: '#0369a1', color: 'white', fontWeight: 700, borderRadius: 6, textDecoration: 'none' }
```

---

## KEYWORDS POR GUÍA (Para incluir naturalmente en contenido)

### Guía 3: Catamaranes
- alquiler catamaran españa, catamaran charter, catamaran vela, ventajas catamaran, catamaran familla

### Guía 4: Yates Lujo
- yate lujo españa, charter yate, yate privado, experiencia lujo mar, boda yate

### Guía 5: Veleros
- alquiler velero españa, navegación vela, ruta vela, escuela vela, velero charter

### Guía 6: Lanchas
- alquiler lancha, moto nautica, barco rápido, lancha alquiler españa

### Guía 7: Despedidas
- alquiler barco despedida, evento barco, charter grupo, fiesta barco

### Guía 8: Familias
- alquiler barco familia, playas niños barco, charter familiar, vacaciones barco

### Guía 9: Parejas
- fondeo romántico, luna de miel barco, calas privadas, pareja vacaciones

### Guía 10: Travesía
- travesia barco españa, ruta navegacion, charter semana, barco 7 dias

### Guía 11-14: Fondeos
- fondeos [costa], ancladeros [costa], donde fondear [region]

### Guía 15: Comparativa
- samboat vs nautal, mejor plataforma alquiler barco, plataforma charter

---

## WORD COUNT TARGETS

- Guía tipo corta: 1,500-1,800 palabras
- Guía tipo media: 2,000-2,500 palabras
- Guía tipo larga: 3,000+ palabras

**Multiplicador:** +15% si incluyes tablas, +10% si incluyes grid cards

---

## IMPORTS NECESARIOS

```typescript
import type { Metadata } from 'next'
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/boat-rental-schema'
import { MultiJsonLd } from '@/components/seo/JsonLd'
import Link from 'next/link'
```

---

## VERIFICATION CHECKLIST

- [ ] Metadata completa (title, desc, OG, canonical)
- [ ] Schema.org incluido (Article + Breadcrumb + FAQ si aplica)
- [ ] Mínimo 1.5K palabras
- [ ] Mínimo 3 secciones con h2
- [ ] CTA enlazando a `/alquiler-barco` o localidad específica
- [ ] Links internos a otras guías
- [ ] Mobile-friendly (inline styles, responsive)
- [ ] Imágenes con alt text (usar Unsplash)
- [ ] FAQs estructurado si aplica (guías informacionales)

---

## UNSPLASH IMAGES (Recomendadas por tema)

- Catamaranes: `https://images.unsplash.com/photo-1520034475321-cbe63696469a`
- Yates: `https://images.unsplash.com/photo-1544551763-46a013bb70d5`
- Veleros: `https://images.unsplash.com/photo-1544551763-46a013bb70d5`
- Familia: `https://images.unsplash.com/photo-1551632786-de41ec16fafb`
- Pareja: `https://images.unsplash.com/photo-1544551763-46a013bb70d5`

---

**Tiempo estimado por guía:** 2-4 horas (research + writing + schema)

