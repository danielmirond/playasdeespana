# 📋 Auditoría UX - Ficha de Playa

## Estado Actual
**Servidor:** Compilando sin errores ✅  
**Viewport:** Responsive (móvil/desktop)  
**Navegación:** Sticky tabs con 14 secciones

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Sobrecarga de Navegación (14 tabs)**
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

### 2. **Orden de Secciones Subóptimo**
- **Problema:** Las fotos están al FINAL (línea 1114)
- **Flujo actual:**
  1. Seguridad → Calidad → Meteo → Cómo Llegar → Comer → Dormir → Campings → Buceo → Servicios → Info → **FOTOS** → Cercanas

- **Problema:** El usuario viene por fotos, pero están abajo del todo
  - No hay "hero gallery" arriba
  - El carousel de fotos debería estar above-the-fold como confirmación visual

**Recomendación:** Mover fotos a POSICIÓN 2 o 3 (después de estado/meteo, antes de decisiones)

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
