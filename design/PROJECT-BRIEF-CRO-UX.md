# Playas de España — Brief de producto para auditoría CRO / UX

*Documento para agencia de diseño. Actualizado: junio 2026.*
URL: https://playas-espana.com · Idiomas: Español (`/`) e Inglés (`/en`).

---

## 1. Qué es

Plataforma web (no app nativa) que responde a una pregunta: **«¿A qué playa voy hoy?»**.
Combina datos oficiales en tiempo real (estado del mar, meteo, calidad del agua,
medusas) con una base de **5.098 playas** de toda España para recomendar, mediante
un **score 0–100 recalculado cada hora**, la mejor playa según las condiciones
actuales. Es **editorial + utilitario**, no un folleto turístico: el diferencial
es el dato y la honestidad (decimos también cuándo NO ir).

Modelo de negocio: **gratis para el usuario**, monetizado por **afiliación**
(alquiler de barcos y autocaravanas, hoteles, actividades, etc.) y publicidad.

### Cifras clave
- **5.098 playas** · **898 con Bandera Azul** · 20 comunidades · 49 provincias.
- **4.300 playas con foto real** (84%); resto, imagen genérica por estado del mar.
- **18 artículos** de Magazine (ES+EN) · contenido creciente (3/día automatizado).
- Bilingüe ES/EN.

---

## 2. Usuario y objetivo de negocio

**Audiencia:** turista nacional e internacional + residente que va a la playa.
Tráfico principal **SEO orgánico** (búsquedas tipo "playas para perros Málaga",
"mejor playa hoy Cádiz", "alquiler barco Ibiza", "snorkel Costa Brava").

**Objetivo CRO (lo que queremos optimizar):**
1. **Clics de afiliación** (la conversión principal): alquiler de barco (SamBoat),
   autocaravana (Camperdays), hoteles (Booking), actividades (GetYourGuide).
2. **Profundidad de sesión** (de la ficha de playa a hubs/servicios).
3. **Instalación de la PWA** y retorno.
4. Engagement con el contenido (Magazine).

> El reto CRO central: somos fuertes en tráfico SEO de cola larga (fichas de
> playa), pero la **conversión a afiliación** ocurre en páginas comerciales
> (barco/autocaravana/actividades). El embudo ficha → comercial es lo más
> importante a optimizar.

---

## 3. Stack y restricciones técnicas (importante para el diseño)

- **Next.js 16 (App Router) + React + TypeScript**, desplegado en **Vercel**.
- **Renderizado:** SSR + ISR (revalidación) + pre-render parcial. Muchas páginas
  se generan bajo demanda (5.000+ fichas).
- **Estilos:** **sistema de diseño propio con CSS variables + estilos inline**.
  **NO usa Tailwind** (clases Tailwind no funcionan). Cualquier propuesta visual
  debe expresarse en tokens CSS / estilos, no en utilidades.
- **Mobile-first**: la mayoría del tráfico es móvil.
- **Rendimiento (Core Web Vitals) es prioritario** por SEO: cuidado con scripts
  de terceros, imágenes pesadas y CLS. Hoy los embeds de terceros (widgets,
  analytics) se cargan diferidos (`lazyOnload`).
- **Sin diseño en Figma actualmente** — el sistema vive en el código (ver §5).
  Si la agencia entrega Figma, debe mapear a estos tokens.

---

## 4. Mapa de páginas (qué auditar)

**Núcleo de producto**
- `/` Home: hero "¿a qué playa voy hoy?", buscador, Top playas hoy, Evita hoy,
  cercanas, parking, actividades, carrusel de Magazine, hubs por tema.
- `/playas/[slug]` **Ficha de playa** (página estrella, 5.000+): score 0–100,
  temperatura del agua, oleaje, viento, mareas, sol/mejor hora, calidad del agua
  (EEA), riesgo de medusas, bandera de baño, servicios, fotos, opiniones/votos,
  hoteles/restaurantes/campings/buceo cercanos, CTA alquiler de barco, actividades
  (GetYourGuide), mapa.
- `/comparar` comparador de playas · `/mapa` mapa interactivo · `/playas-cerca-de-mi` GPS.

**Listados temáticos (nichos SEO):** perros, nudistas, accesibles, aguas
cristalinas, calas con encanto, secretas, paradisíacas, sin viento, atardeceres,
Bandera Azul, autocaravana, islas.

**Comercial / afiliación (foco CRO):**
- `/alquiler-barco` + jerarquía costas → provincias → localidades (SamBoat).
- `/alquiler-autocaravana` + ciudades, precios, tipos (Camperdays).
- `/buceo`, `/surf`, `/windsurf`, `/kitesurf`, `/clases-surf`, `/hoteles-playa`,
  `/campings` (+ widgets de actividades GetYourGuide).

**Contenido:** `/magazine` (+ artículo, + categoría).
**Taxonomía:** `/comunidad/[slug]`, `/provincia/[slug]`, `/municipio/[slug]`.
**Utilidad/legal:** `/metodologia`, `/calidad-agua`, `/medusas`, `/rutas`,
`/aviso-legal`, `/privacidad`, `/cookies`.
**Inglés:** equivalentes bajo `/en/**`.

---

## 5. Sistema de diseño actual (tokens reales en código)

Estética **editorial, cálida, "arena + tinta"** (no el típico azul turístico).

- **Tipografías:** Playfair Display (serif, titulares), DM Sans (sans, cuerpo),
  JetBrains Mono (datos/cifras).
- **Paleta (CSS vars):**
  - Superficies "arena": `#faf4e6 / #f5ecd5 / #f0e6d0` …
  - Texto "tinta": `#2a1a08` (principal), `#6a5840` (muted).
  - Acento "terracota/ocre": `#6b400a`, `#d48a1a / #e8a030`.
  - "Mar" (solo contexto marino): `#2d5266 / #4a7a90`.
  - Semáforo de score: excelente `#3d6b1f` · aceptable `#c48a1e` · no apto `#7a2818`.
- **Radios:** 2 / 4 / 6 / 10 / 16 px · **sombras** muy sutiles.
- Componentes clave: tarjetas de playa con score-pill, "estado del mar" animado
  (SVG cuando no hay foto), badges de bandera/medusas, CTAs de afiliación.

> Nota: la marca usa una **"P" serif** como icono (favicon/PWA). El logo es un
> wordmark "playas de España".

---

## 6. Flujos de usuario principales (para el análisis de embudo)

1. **"Playa para hoy"**: Home/SEO → ficha de playa → (mira score/condiciones) →
   ¿CTA a hotel/barco/actividad? **← punto de conversión a optimizar.**
2. **Nicho**: búsqueda ("playas para perros X") → listado temático → ficha.
3. **Comercial barco**: SEO → `/alquiler-barco/costas/...` → CTA SamBoat (afiliado).
4. **Comercial autocaravana**: → `/alquiler-autocaravana/[ciudad]` → CTA Camperdays.
5. **Actividades**: ficha/hub → widget GetYourGuide ("Cosas que hacer cerca").

---

## 7. Analítica y medición (ya instalada)

- **GA4** con eventos personalizados: `beach_click`, `hotel_click`,
  `activity_click`, `restaurant_click`, `parking_click`, `route_open`,
  `filter_click` (gated por consentimiento de cookies).
- **GetYourGuide Partner Analytics** + parámetro `data-gyg-cmp` por tipo de
  página (ficha, municipio, comunidad, magazine, hubs) → atribución de
  conversiones por origen.
- **UTMs** en CTAs; la PWA instalada abre con `?utm_source=pwa`.
- Afiliación: SamBoat/Camperdays vía **Awin**; Booking, GetYourGuide, etc.
- **Consentimiento de cookies** granular (técnicas / analíticas / marketing).

---

## 8. Estado actual y temas abiertos (contexto para la auditoría)

- **PWA instalable** recién añadida (manifest + iconos + banner "Instalar app").
- Recientes correcciones UX: logo vs hamburguesa en móvil, favicon de marca,
  imágenes de fallback rotas, repetición de playas en Home (ahora el score lo
  decide más el estado del mar).
- **Home**: el "Top playas hoy" tiende a mostrar las mejor equipadas; se ha
  rebalanceado hacia condiciones reales, pero la **selección/orden y la jerarquía
  visual de la Home** son candidatas claras a CRO.
- **Ficha de playa**: es muy densa (muchos módulos). Priorización visual,
  orden de bloques y ubicación de CTAs de afiliación = gran oportunidad.
- **Cobertura de foto**: 84% real; el 16% usa imagen genérica.

---

## 9. Qué necesitamos de la agencia (entregables CRO/UX)

1. **Auditoría heurística + CRO** de: Home, Ficha de playa, y una página comercial
   (alquiler de barco o autocaravana). Foco en el embudo a afiliación.
2. **Jerarquía y ubicación de CTAs** de afiliación/actividades sin dañar la
   credibilidad editorial ni los Core Web Vitals.
3. **Priorización de módulos** en la ficha (qué va above-the-fold en móvil).
4. **Recomendaciones accionables** expresables en nuestro sistema de tokens
   (no rediseño que rompa el stack ni meta dependencias pesadas).
5. (Opcional) Propuesta de **test A/B** priorizados por impacto/esfuerzo.

**Restricciones a respetar:** mobile-first, sin Tailwind, performance/SEO
crítico, estética editorial "arena + tinta", monetización por afiliación
(no intrusiva), cumplimiento RGPD (consentimiento).

---

*Contacto técnico / accesos de staging y analítica: a coordinar.*
