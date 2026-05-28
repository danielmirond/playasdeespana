# ⚡ CHECKLIST DE ACCIÓN INMEDIATA

**Estado:** Fase 1 Completa | **Next:** Deploy + Content Blitz

---

## HOY (Próximas 2-3 horas)

### 1. Verificar Build
```bash
cd /Users/danielmd/playasdeespana
npm run build
```
- ✅ Si NO hay errores → Continuar
- ❌ Si hay errores → Fix y retry

### 2. Test Pages Localmente
```bash
npm run dev
# Ir a http://localhost:3000/alquiler-barco
# Ir a http://localhost:3000/guides/alquiler-barcos-guia-completa
# Ir a http://localhost:3000/guides/mejores-fondeos-españa
```
- ✅ Páginas cargan sin errores
- ✅ Metadata visible en <head>
- ✅ Estilos correctos (no Tailwind, todo inline)

### 3. Validar Schemas
Para cada página, abrir DevTools → Elements → <head>
- Buscar `<script type="application/ld+json">`
- Copiar el JSON
- Ir a: https://validator.schema.org/
- Pegar JSON y validar (sin errores)

**Páginas a validar:**
- `/alquiler-barco` → Organization + Breadcrumb
- `/guides/alquiler-barcos-guia-completa` → Article + FAQ + Breadcrumb
- `/guides/mejores-fondeos-españa` → Article + Breadcrumb

---

## MAÑANA (4-6 horas) - CREAR BLOQUE A

### Guía 3: Catamaranes (2-3 horas)
- [ ] Copiar template desde `TEMPLATE_GUIA_SEO.md`
- [ ] Crear archivo: `/src/app/guides/alquiler-catamaranes/page.tsx`
- [ ] Secciones clave:
  - Por qué elegir catamaran
  - Diferencias vs velero
  - Precios en 2026
  - Mejores destinos
  - Calas ideales
- [ ] Metadata con keywords: "alquiler catamaran españa", "catamaran charter"
- [ ] CTA: Link a `/alquiler-barco`
- [ ] Palabra min: 2,500

### Guía 4: Yates Lujo (1.5-2 horas)
- [ ] Crear: `/src/app/guides/yates-lujo-charter/page.tsx`
- [ ] Keywords: "yate lujo", "charter yate premium"
- [ ] Secciones: Definición, lujo, precios, regiones, eventos
- [ ] Palabra min: 2,000

### Guía 5: Veleros (1.5-2 horas)
- [ ] Crear: `/src/app/guides/veleros-navegacion/page.tsx`
- [ ] Keywords: "alquiler velero", "navegación vela"
- [ ] Secciones: Tipos, rutas, viento, escuelas
- [ ] Palabra min: 2,000

### Guía 6: Lanchas (1-1.5 horas)
- [ ] Crear: `/src/app/guides/lanchas-motos-nauticas/page.tsx`
- [ ] Keywords: "alquiler lancha", "moto nautica"
- [ ] Secciones: Diferencias, combustible, destinos, seguridad
- [ ] Palabra min: 1,500

**Status Cuando Termines:**
- [ ] 4 guías nuevas creadas
- [ ] Todas con schema.org + metadata
- [ ] Local testing passed
- [ ] Ready para merge a main

---

## SEMANA 2 (8-10 horas) - CREAR BLOQUE B + C

### Bloque B: Casos de Uso (4 guías, ~7 horas)

**Guía 7: Despedidas** (2 horas)
- [ ] Path: `/src/app/guides/barco-despedidas-eventos/page.tsx`
- [ ] Keywords: "despedida barco", "evento barco", "charter grupo"

**Guía 8: Familias** (2 horas)
- [ ] Path: `/src/app/guides/barco-familias-niños/page.tsx`
- [ ] Keywords: "barco familia", "charter familiar"

**Guía 9: Parejas** (1.5 horas)
- [ ] Path: `/src/app/guides/barco-pareja-luna-miel/page.tsx`
- [ ] Keywords: "fondeo romántico", "pareja barco"

**Guía 10: Travesía Multiday** (1.5 horas)
- [ ] Path: `/src/app/guides/travesia-multiday-rutas/page.tsx`
- [ ] Keywords: "travesia barco", "ruta navegacion"
- [ ] Incluir: 3 rutas ejemplo con mapas ASCII/descripciones

### Bloque C: Fondeos por Costa (3 guías, ~6 horas)

**Guía 11: Costa Vasca** (2 horas)
- [ ] Path: `/src/app/guides/fondeos-costa-vasca/page.tsx`
- [ ] 10-15 fondeos con profundidad, protección, servicios

**Guía 12: Mediterráneo** (2 horas)
- [ ] Path: `/src/app/guides/fondeos-mediterraneo/page.tsx`
- [ ] 15-20 fondeos Costa Brava a Almería

**Guía 13: Baleares** (2 horas)
- [ ] Path: `/src/app/guides/fondeos-baleares/page.tsx`
- [ ] 20+ fondeos Mallorca, Ibiza, Formentera
- [ ] Extra: Mapa mental de calas por islas

---

## SEMANA 3 (4-6 horas) - BLOQUE D + REFINAMIENTOS

### Bloque D: Comparativas (2 guías, ~3 horas)

**Guía 15: Plataformas Comparativa** (2 horas)
- [ ] Path: `/src/app/guides/plataformas-comparativa/page.tsx`
- [ ] Keywords: "samboat vs nautal"
- [ ] Tabla comparativa: Precio, opciones, soporte, comisiones
- [ ] Casos de uso: "Si quieres X, elige Y"

**Guía 16: Patrón vs Sin Patrón** (1 hora - OPCIONAL)
- [ ] Path: `/src/app/guides/patron-vs-sin-patron/page.tsx`

### Refinamientos y Optimizaciones (3-4 horas)

- [ ] **Test ALL schemas** en validator.schema.org
- [ ] **Rich Results Test** (Google): Probar cada guía
- [ ] **Internal linking audit**: Verificar todos los CTAs funcionan
- [ ] **Lighthouse audit**: Verificar Performance >80, SEO >95
- [ ] **Mobile test**: Todas las guías responsive en celular
- [ ] **Alt text check**: Todas las imágenes tienen alt descriptivo

---

## AL TERMINAR SEMANA 3

### Deploy a Production
```bash
git add -A
git commit -m "feat: Add 13 SEO guides for boat rental - complete Phase 2"
git push origin main
```

### Submit to Google Search Console
```bash
# 1. Ir a https://search.google.com/search-console
# 2. Select property: playas-espana.com
# 3. Sitemaps → Submit new sitemap
#    URL: https://playas-espana.com/sitemap.xml
# 4. URL Inspection → Test new URLs
#    - /alquiler-barco
#    - /guides/alquiler-barcos-guia-completa
#    - /guides/mejores-fondeos-españa
#    - etc. (todas las guías)
```

### Monitor Rankings
```bash
# 1. Crear spreadsheet con keywords a trackear
# 2. Herramientas recomendadas:
#    - SE Ranking (free tier 5 keywords)
#    - Ahrefs (si presupuesto)
#    - Google Search Console (free)
# 3. Check weekly: Rankings para keywords principales
```

---

## FASE 3 (Semanas 3-4) - LINK BUILDING

### Guest Posts (2-3 posts)
- [ ] Research: Blogs de viaje/nautica con DA >30
- [ ] Escribir: 1,500-2,000 palabra posts con link back a `/alquiler-barco`
- [ ] Ejemplos de tópicos:
  - "Guía de fondeos seguros en Baleares" → Link a guía fondeos
  - "5 errores al alquilar barco" → Link a guía completa
  - "Viaje en familia: barco vs hotel" → Link a guía familias

### Directory Submissions
- [ ] TripAdvisor → Activity/Tours section
- [ ] Viator → Boat rental category
- [ ] GetYourGuide → Charter/Sailing section
- [ ] European Sailing Communities → Blog/Resources

### Affiliate Partnerships
- [ ] Email SamBoat: "Aumentar visibilidad affiliate"
- [ ] Email Nautal: "Guest partnership opportunity"
- [ ] Email ClickBoat: "Content collaboration"

### Forum Mentions (Natural)
- [ ] Reddit r/sailing: Share guides when relevant
- [ ] Sailing.eu forums: Link to fondeos guides
- [ ] FB sailing groups: Spanish coast discussion

---

## MÉTRICAS A TRACKEAR (Ongoing)

### Semana 1-2
- [ ] Indexation: Nuevas guías aparecen en GSC
- [ ] Schema validation: 100% sin errores
- [ ] Build time: <2 min

### Semana 3-4
- [ ] Keywords tracked: 50+ en Google Search Console
- [ ] Rankings: 5+ keywords en top 50
- [ ] Traffic: +5-10% vs baseline

### Semana 5-8
- [ ] Keywords top 20: 10+ keywords
- [ ] Organic traffic: +30-50%
- [ ] CTR improvement: +15-25%

---

## HERRAMIENTAS RECOMENDADAS (GRATIS)

| Herramienta | Uso | Link |
|-----------|-----|------|
| Google Search Console | Rankings, indexation, errors | search.google.com/search-console |
| Google Rich Results Test | Validate schema | search.google.com/test/rich-results |
| SE Ranking | Keyword tracking (free 5) | seranking.com |
| Lighthouse (Chrome) | Performance audit | DevTools → Lighthouse |
| Screaming Frog SEO Spider | Site crawl (free 500 URLs) | screamingfrog.co.uk |

---

## ¿PREGUNTAS O BLOCKERS?

Si algo no entiende o se queda bloqueado:
1. Revisar `TEMPLATE_GUIA_SEO.md` (copia literal)
2. Revisar `PLAN_CONTENIDO_BARCOS.md` (detalles por guía)
3. Revisar `FASE1_RESUMEN.md` (contexto general)

---

## TL;DR - LO CRÍTICO

**HOY:** Deploy + validar schemas
**MAÑANA:** 4 guías tipo barco
**SEMANA 2:** 8 guías casos + fondeos
**SEMANA 3:** Acabar + refinamientos
**RESULTADO:** +200% traffic barcos en 6-8 semanas

**Tiempo total:** 30-35 horas | **ROI:** 10x después

