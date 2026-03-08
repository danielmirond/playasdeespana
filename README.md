# Playas de España

Ficha de playa en tiempo real para más de 3.500 playas españolas.  
Stack: Next.js 14 · ISR · AEMET · Open-Meteo · MITECO/Esri · EEA · Google Places / Overpass

---

## Primeros pasos

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/playasdeespana
cd playasdeespana
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local y añadir AEMET_API_KEY mínimo
```

Conseguir API key de AEMET (gratuita, 2 minutos):
→ https://opendata.aemet.es/centrodedescargas/altaUsuario

### 3. Sincronizar datos de playas

```bash
# Descarga ~3.500 playas de MITECO y cruza con AEMET por coordenadas
npm run sync:playas

# Enriquece con calidad del agua EEA (opcional)
npm run sync:calidad
```

Esto genera `public/data/playas-index.json` (~3MB).  
Solo necesitas ejecutarlo una vez, o semanalmente en CI.

### 4. Arrancar en local

```bash
npm run dev
# http://localhost:3000
```

---

## Deploy en Vercel

### Opción A — CLI (recomendado)

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Opción B — GitHub

1. Push a GitHub
2. Ir a vercel.com → New Project → Import tu repo
3. Añadir variables de entorno en Settings → Environment Variables
4. Deploy automático en cada push a `main`

### Variables requeridas en Vercel

| Variable | Obligatoria | Dónde conseguirla |
|---|---|---|
| `AEMET_API_KEY` | ✅ Sí | opendata.aemet.es |
| `GOOGLE_PLACES_KEY` | ❌ No | console.cloud.google.com |
| `NEXT_PUBLIC_BASE_URL` | ✅ Sí | Tu dominio |
| `GOOGLE_SITE_VERIFICATION` | ❌ No | Search Console |

---

## Dominio

Tras el deploy, conectar dominio en Vercel:

```
Vercel Dashboard → tu proyecto → Settings → Domains
→ Añadir: playasdeespana.es
```

Vercel te dará los registros DNS a añadir en Nominalia:
```
Tipo A     @    76.76.21.21
Tipo CNAME www  cname.vercel-dns.com
```

---

## Arquitectura de datos

```
BUILD TIME (una vez/semana)
  sync:playas  →  MITECO/Esri  →  playas-index.json
  sync:calidad →  EEA CSV      →  enriquece playas-index.json

PER REQUEST (con ISR)
  /playas/[slug]  →  SSG + revalidate 1h
    ├─ Base:         playas-index.json (estático)
    ├─ Meteo:        /api/meteo/[id]  →  AEMET (caché 3h)
    ├─ Mareas:       Open-Meteo Marine (caché 1h)
    ├─ Sol:          Sunrise-Sunset API (caché 12h)
    └─ Restaurantes: /api/restaurantes  →  Google Places / OSM (caché 24h)
```

## Coste estimado en producción

| Servicio | Coste |
|---|---|
| Vercel (free tier hasta escalar) | 0–20 €/mes |
| Google Places (con caché 24h) | 5–15 €/mes |
| AEMET | 0 € |
| Open-Meteo | 0 € |
| EEA / MITECO | 0 € |
| Dominio .es | ~10 €/año |
| **Total** | **~15–35 €/mes** |
