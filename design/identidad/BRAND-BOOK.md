# Playas de España — Brand Book v1

*abril 2026*

---

## 01 · Identidad

### Logotipo

3 variantes:
- **Horizontal · primario** — `≈ playas DE ESPAÑA` (uso en nav desktop, footer, emails)
- **Apilado** — mismo con "DE ESPAÑA" centrada debajo (uso en OG images, redes sociales)
- **Sello · favicon** — `P` en caja cuadrada con ondita (tab, favicon, PWA icon)

### Aplicaciones
Sobre fondos: arena-100 (primario), tinta-800 (oscuro), terra-700 (marca), gradiente gris-verde (foto).

---

## 02 · Tipografía

### Familias

| Familia | Uso |
|---------|-----|
| **Playfair Display** | Titulares, nombres de playa, verdicts editoriales |
| **DM Sans** | Cuerpo, UI, navegación |
| **JetBrains Mono** | Datos técnicos, coordenadas, timestamps |

### Tokens

| Token | Familia · Peso · Tamaño | Uso |
|-------|-------------------------|-----|
| `t-display` | Playfair 700 · 68px | H1 hero home |
| `t-h1` | Playfair 700 + 500 italic · 48px | Nombre playa, hero hub |
| `t-h2` | Playfair 700 · 34px | Secciones |
| `t-verdict` | Playfair 400 italic · 26px | "excelente", "aviso" |
| `t-body-lg` | DM Sans 400 · 17px | Descripción playa |
| `t-body` | DM Sans 400 · 15px | Cuerpo estándar |
| `t-caption` | DM Sans 400 · 13px | Metadata, fuentes |
| `t-eyebrow` | DM Sans 500 · 11px · 0.14em · UPPERCASE | Antetítulos |
| `t-data` | JetBrains Mono 400 · 13px | Coordenadas, timestamps |

---

## 03 · Paleta

### Arena · superficies (light)

| Token | Hex |
|-------|-----|
| `--arena-50`  | `#faf4e6` |
| `--arena-100` | `#f5ecd5` ← fondo principal |
| `--arena-200` | `#f0e6d8` |
| `--arena-300` | `#e5d6b4` |
| `--arena-400` | `#d4c098` |
| `--arena-500` | `#b8a06a` |

### Tinta · texto (ink)

| Token | Hex |
|-------|-----|
| `--tinta-900` | `#1a0f04` |
| `--tinta-800` | `#2a1a08` ← texto principal |
| `--tinta-700` | `#3d2a14` |
| `--tinta-600` | `#524030` |
| `--tinta-500` | `#7a6858` ← muted |
| `--tinta-400` | `#a89880` |

### Acentos · marca (brand)

| Token | Hex |
|-------|-----|
| `--terra-900` | `#4a2a04` |
| `--terra-800` | `#6b400a` ← accent principal |
| `--terra-700` | `#8a5418` |
| `--ocre-500`  | `#d48a1a` |
| `--ocre-400`  | `#e8a638` ← accent2 |
| `--ocre-300`  | `#f0bc62` |

### Estados de puntuación (semantic)

| Token | Hex | Rango |
|-------|-----|-------|
| `--excelente` | `#3d6b1f` | 85-100 |
| `--muybueno`  | `#7a8a30` | 70-84 |
| `--aceptable` | `#c48a1e` | 50-69 |
| `--limitado`  | `#a04818` | 30-49 |
| `--noapto`    | `#7a2818` | 0-29 |
| `--mar`       | `#4a7a90` | apoyo (mapas, estados de surf) |

**Regla:** el azul SOLO aparece en contexto marino (mapas, surf). Nunca como color de marca.

---

## 04 · Estados del mar

6 iconos lineales unificados 48×48, trazo 1.5px, horizonte a y=30.

| Estado | Condiciones | Verdict |
|--------|-------------|---------|
| **Calma** | Oleaje <0.3m · viento <10 km/h | Báñate tranquilo |
| **Buena** | Oleaje <0.8m · viento <20 km/h | Condiciones estándar |
| **Aviso** | Oleaje 0.8-1.5m o UV extremo | Precaución |
| **Surf** | Oleaje >1.5m con dirección útil | Perfecto para tabla |
| **Viento** | Viento >30 km/h sostenido | Arena volada |
| **Peligro** | Bandera roja o medusas masivas | No te bañes |

---

## 05 · Componentes

- **Score · editorial**: 87/100 en Playfair huge + verdict italic (uso hero ficha)
- **Score · compact**: círculo con 87 dentro (uso cards)
- **Score · oscuro**: fondo tinta-900 + score blanco + verdict ocre (uso OG, night mode)
- **Métricas card**: 2×2 grid con agua, oleaje, viento, UV — tabular nums
- **Botones**: primario (tinta-900), secundario (outline), terracota (terra-800), link con arrow
- **Badges**: verde con punto (bandera azul), outline (nudismo), sólido oscuro (contador), terra (nuevo), amber outline (aviso)
- **Input**: borde inferior solo, sin card
- **Tabs**: underline en activo
- **Beach card**: número editorial (n°1) arriba-izq + score circular arriba-der, imagen/gradiente 16:10, título Playfair, meta con pin

Filosofía: **piezas sin ruido, pensadas para densidad.** Cards con borde fino, radios 2-6px. Nada de neomorfismo ni sombras blandas. La jerarquía la pone la tipografía, no el relieve.

---

## 06 · Mapas

Estilo **editorial ilustrado**:
- Cuadrícula fina arena-300 sobre fondo arena-100
- Nombres de lugares en **Playfair italic**
- Pins circulares con score dentro, color por estado
- Pin activo con tooltip tinta-900 + texto arena-50
- Attribution abajo-derecha: `IGN · © OpenStreetMap · EEA`
- Rosa de los vientos discreta abajo-derecha

---

## 07 · OG images

Plantilla 1200×630, generada en Next.js con `@vercel/og`:

**Ficha de playa:**
- Logo `playas de España` arriba-izquierda
- Eyebrow: `MUNICIPIO · PROVINCIA`
- Título: nombre playa en Playfair
- Eyebrow: `ESTADO DEL MAR · HOY`
- Score gigante (80+px) + verdict italic
- Data inline abajo: `agua 22° · oleaje 0,4 m · viento 8 km/h`
- Miniatura de mapa a la derecha con pin
- Borde inferior terracota

**Hub temático:**
- Eyebrow: `LAS 50 MEJORES · ESPAÑA`
- Título: `Aguas cristalinas` etc.
- Score agregado (media del hub)

---

## 08 · Pantallas aplicadas

### Home
Hero editorial con h1 display "Hoy el mar está **para bañarse**". Buscador central + pills de exploración. Grid "Hoy están inmejorables" con 4 beach cards.

### Ficha · desktop
Breadcrumb + h1 + descripción. Lado derecho: score card con métricas. Abajo: galería 4×2.

### Ficha · móvil light
Hero compacto sin imagen destacada arriba. Ubicación con coord mono. Foto 4:3 con badge estado. Score + verdict. CTA sticky bottom "Cómo llegar".

### Ficha · móvil night (dark mode)
Fondo `tinta-900`. Acento cambia a **ocre-400** para jerarquía. Ideal para consulta nocturna antes de madrugón al surf.

### Hub temático
h1 editorial largo con italic ("Las 50 playas **de aguas más cristalinas** de España"). Pills metadata. Filtros por zona + ordenar. Grid 4 cols de beach cards numerados.

---

## Filosofía de marca

- **Útil antes que bonito** — el valor es la información accionable
- **Editorial, no turístico** — tono de guía, no de folleto
- **Con alma mediterránea** — arena y tinta, terracota para acentos
- **Datos como protagonistas** — JetBrains Mono respeta las cifras
- **Sin efectos** — sin neomorfismo, sin glassmorphism, sin hero fullscreen
- **El azul es del mar** — nunca color de marca

---

*Última actualización: abril 2026*
