# 📋 Auditoría UX - Ficha de Playa

## Estado Actual
**Servidor:** Compilando sin errores ✅  
**Viewport:** Responsive (móvil/desktop)  
**Navegación:** Sticky tabs con 14 secciones

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

> **Nota:** La estrategia de PR #86 (fases narrativas) es excelente. Los problemas reales son la **implementación incompleta** de ese PR.

### 1. **Pendientes de PR #86 sin implementar**
**Crítico para completar la estrategia:**

- [ ] **7 CTAs afiliados dispersos** (TheFork, Booking, Civitatis, Rentalcars, Parclick, Pitchup)
  - **Problema:** Están sueltos en diferentes secciones = pollution visual
  - **Solución:** Bloque único con tabs (Comer | Dormir | Transporte | Campings)

- [ ] **Opiniones enterradas** en posición 31
  - **Problema:** Prueba social debería estar en Fase 1 (decisión)
  - **Solución:** Subir 3 opiniones destacadas inline después de Seguridad/Calidad
  - Mantener sección completa al final para los que quieren más

- [ ] **Emergencias sin acceso rápido**
  - **Problema:** No hay número de emergencias visible
  - **Solución:** Aside sticky con "Emergencias" + teléfono

- [ ] **'Servicios' + 'Info ficha' redundantes**
  - **Problema:** Duplicado de información
  - **Solución:** Fusionar en 'Datos de la playa'

### 2. **Sobrecarga de Navegación (14 tabs)**
- **Problema:** 14 tabs es excesivo. Causa:
  - Scroll horizontal en móvil
  - Difícil encontrar secciones
  - Navegación secundaria compite con primaria
  
- **Evidencia:** 
  - Fotos, Mar, Seguridad, Calidad, Llegar, Parking, Servicios, Comer, Dormir, Campings, Buceo, Datos, Opiniones, Cercanas
  - Algunos tabs como "Buceo" y "Campings" son niche (no todas las playas los tienen)

- **Impacto:** 
  - ❌ Mobile: scrolling horizontal constante
  - ❌ Cognitive load alto
  - ❌ CTA secundarias (Comer, Dormir) compiten con decisión de baño

**Recomendación:** Agrupar en 5-7 tabs máximo:
```
FOTOS | AHORA (Estado + Mar + Seguridad) | SERVICIOS (Parking + Facilities) | ALOJAMIENTO (Comer + Dormir) | MÁS INFO (Datos + Opiniones)
```

---

### 2. **Orden de Secciones: BIEN PENSADO (PR #86)** ✅
- **Estrategia:** Flujo narrativo de decisión en 5 fases
- **Fase 1 - DECISIÓN (above-the-fold):**
  - Estado hoy → Asistente → Seguridad → Calidad → Opiniones
  
- **Fase 2-3 - PLANNING:**
  - Oleaje/Viento → Cómo llegar → Parking → Comer → Dormir → Servicios
  
- **Fase 4 - CONFIRMACIÓN VISUAL:**
  - **FOTOS** → Vídeo → Cercanas
  
- **Fase 5 - ENRICHMENT:**
  - FAQs, Hubs temáticos

**Acierto:** Las fotos al final es INTENCIONAL. El usuario que ya decidió "voy aquí" ENTONCES quiere ver fotos. Psicología de decisión correcta.

**Pendiente de PR #87:**
- [ ] Agrupar 7 CTAs afiliados (TheFork, Booking, Civitatis, etc.) en bloque con tabs
- [ ] Fusionar 'Servicios' + 'Info ficha' en 'Datos de la playa'
- [ ] Subir 3 opiniones destacadas inline en Fase 1 (manteniendo sección completa)
- [ ] Emergencias a aside sticky

---

### 3. **Falta de "Estado Visual" Above-the-Fold**
- **Problema:** El hero de la ficha no tiene:
  - ❌ Foto grande (Hero image)
  - ❌ Score visual de la playa (0-100)
  - ❌ Decisión rápida: "Baño OK/NO/REVISAR"
  - ✅ Texto pequeño
  - ✅ Chips de estado

- **Causa:** Las fotos llegaron tarde (PR #86 las movió del top)

**Recomendación:** Hero section debe tener:
```
[Foto Grande: 1200×400px]
"Platja Estanys"
━━━━━━━━━━━━━━━━━━━━━━
Score: 86/100 | "Baño OK" | "Agua tranquila"
[Chips: Medusas • Oleaje • Parking • Acceso]
```

---

### 4. **Navegación Sticky Bugs Potenciales**
- **Problema:** FichaNav usa IntersectionObserver con rootMargin "-20% 0px -70% 0px"
  - Triggerpoint raros para marcar sección activa
  - En scroll rápido puede no actualizarse bien
  - El highlight de tabs puede "saltar"

**Recomendación:** Usar threshold más conservador:
```javascript
rootMargin: '0px 0px -50% 0px',  // Activa cuando sección toca 50% del viewport
threshold: [0, 0.25, 0.5, 0.75, 1]
```

---

### 5. **Tabs Secundarios Ocultos** 
- **Problema:** Algunos tabs no aparecen si no existen datos:
  - Buceo (solo playas con escuelas)
  - Campings (solo playas cercanas con campings)
  - Esto es bueno ✅ pero puede sorprender al usuario

- **Solución actual:** Filter dinámico en FichaNav.tsx ✅

---

## 🟡 PROBLEMAS MEDIANOS

### 6. **Spacing y Jerarquía Visual Inconsistente**
- Secciones críticas (Seguridad, Meteo) no destacan vs. secundarias
- Cards tienen mismo styling para contenido diferente
- No hay visual hierarchy clara: "¿Qué es lo más importante?"

**Recomendación:** 
```
ROJO: Seguridad, Alertas
AZUL: Meteo, Decisión de baño
GRIS: Info, Datos históricos
VERDE: Positivos (agua cristalina, acceso)
```

---

### 7. **CTA (Call-to-Action) Débiles**
- **Problema:** 
  - No hay "Reservar ahora" botón visible
  - Links a Booking/Airbnb están en secciones bajas
  - Affiliate links (TheFork, Civitatis) no destacan

- **Oportunidad:** 
  - ¿Dónde está el "Planificar viaje" CTA?
  - ¿Dónde está el "Compartir playa" botón?
  - ¿Dónde está el "Guardar para después"?

**Recomendación:** Barra flotante (sticky bottom en móvil):
```
[Guardar] [Compartir] [Reservar Ahora]
```

---

### 8. **Responsive Issues (Potencial)**
- No está testeado en:
  - ❓ iPhone SE (375px)
  - ❓ Tablets (768px, 1024px)  
  - ❓ Landscape
- NavBar sticky + FichaNav sticky = ¿cuánto espacio queda en móvil?

**Recomendación:** Test en múltiples breakpoints

---

## 🟢 COSAS BUENAS

### ✅ Aciertos en UX
1. **Estado actual arriba** ("¿Cómo está Aguamarina hoy?")
   - Rápido, visual, decisión clara
   
2. **Chips interactivos** (Medusas, Oleaje, Parking, etc.)
   - Scanning rápido de condiciones
   - Iconografía clara
   
3. **Tabs activos destacan** 
   - IntersectionObserver es elegante
   - Sigue scroll del usuario automáticamente
   
4. **Lazy loading de secciones**
   - Componentes dinámicos para below-the-fold
   - Bueno para performance
   
5. **Schema.org implementado**
   - SEO bien hecho
   - Rich snippets en SERP

6. **Video YouTube integrado**
   - Click-to-load (no ralentiza)
   - Contenido complementario visual

7. **Sección "Qué necesitas hoy"** (Asistente)
   - Personalización simple
   - Above-the-fold

---

## 📊 MÉTRICAS DE UX A REVISAR

| Métrica | Estatus | Acción |
|---------|---------|--------|
| LCP (Largest Contentful Paint) | ❓ | Medir con PageSpeed Insights |
| CLS (Cumulative Layout Shift) | ❓ | Revisar sticky nav jumps |
| INP (Interaction to Next Paint) | ❓ | Test scroll performance |
| Mobile usability | ❓ | Test en móvil real |
| Tap target size | ❓ | Chips deben ser ≥48px |

---

## 🎯 PRIORIDAD DE FIXES

### Priority 1 (CRÍTICO - Afecta decisión de usuario)
- [ ] **Reducir tabs de 14 a 5-7**
- [ ] **Mover fotos a arriba (hero image)**
- [ ] **Agregar foto hero 1200×400px**

### Priority 2 (ALTO - Conversión)
- [ ] **Agregar sticky CTA bar (Guardar/Compartir/Reservar)**
- [ ] **Fix navigation trigger points**
- [ ] **Color-code secciones por importancia**

### Priority 3 (MEDIO - Polish)
- [ ] **Test responsive en móvil**
- [ ] **Mejorar spacing y jerarquía visual**
- [ ] **Agregar breadcrumbs (provincia > municipio > playa)**

### Priority 4 (BAJO - Enhancement)
- [ ] **Dark mode?**
- [ ] **Modo offline?**
- [ ] **Comparar con otra playa?**

---

## 🏗️ PROPUESTA: Nuevo Flujo Visual

```
┌─────────────────────────────────────────┐
│ [Logo] PLAYAS DE ESPAÑA                 │  ← Main Nav
├─────────────────────────────────────────┤
│ [FOTOS] [AHORA] [SERVICIOS] [+MORE]    │  ← Sticky Nav (7 tabs)
├─────────────────────────────────────────┤
│                                         │
│   [Hero Image: 1200×400px]             │
│   ┌─────────────────────────────────┐  │
│   │ Platja Estanys                  │  │
│   │ Ses Salines, Baleares           │  │
│   │                                 │  │
│   │ 86/100 | "Baño OK" | "Tranquil"│  │
│   │                                 │  │
│   │ [Medusas] [Parking] [Acceso]   │  │
│   └─────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ AHORA                                   │  ← Above-the-fold
│ ├─ Baño OK · agua tranquila            │
│ ├─ Oleaje: 0.0m · Viento: 11 km/h    │
│ ├─ ⚠️ Hay medusas                      │
│ └─ Temp: 18°C                          │
│                                         │
│ PRÓXIMAS HORAS [Weather forecast]      │
├─────────────────────────────────────────┤
│ SERVICIOS                               │  ← Below-the-fold
│ ├─ Parking: ✅ Sí                      │
│ ├─ Socorrismo: ✅ Sí                   │
│ ├─ Duchas: ❌ No                       │
│ └─ Acceso: ♿ Sí                        │
├─────────────────────────────────────────┤
│ [Guardar para después] [Compartir]     │  ← Sticky Bottom CTA
│ [Reservar alojamiento]                 │
└─────────────────────────────────────────┘
```

---

## 📝 Next Steps

1. **Esta semana:** Reducir tabs a 5-7 (agrupar lógicamente)
2. **Esta semana:** Mover fotos a hero section
3. **Próxima semana:** Test responsive en móvil real
4. **Próxima semana:** Agregar sticky CTA bar
5. **Después:** Color-coding y jerarquía visual

---

**Autor:** UX Audit  
**Fecha:** 2026-05-25  
**Estado:** 🟡 EN REVISIÓN
