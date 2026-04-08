# Playas de España

Ficha de playa en tiempo real para más de 3.500 playas españolas.  
Stack: Next.js 16 · ISR · Open-Meteo · MITECO/Esri · EEA · Overpass/OSM

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
# Editar .env.local — no se requiere ninguna API key obligatoria
```

### 3. Sincronizar datos de playas

```bash
# Descarga ~3.500 playas de MITECO
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

### Variables en Vercel

| Variable | Obligatoria | Dónde conseguirla |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | ✅ Sí | Tu dominio |
| `UNSPLASH_ACCESS_KEY` | ❌ No | unsplash.com/developers |
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
    ├─ Meteo:        Open-Meteo Forecast + Marine (caché 1h)
    ├─ Mareas:       Open-Meteo Marine (caché 1h)
    ├─ Sol:          Sunrise-Sunset API (caché 12h)
    ├─ Restaurantes: Overpass/OSM (caché 24h)
    └─ Hoteles:      Overpass/OSM (caché 24h)
```

## Coste estimado en producción

| Servicio | Coste |
|---|---|
| Vercel (free tier hasta escalar) | 0–20 €/mes |
| Open-Meteo | 0 € |
| EEA / MITECO | 0 € |
| Overpass/OSM | 0 € |
| Dominio .es | ~10 €/año |
| **Total** | **~0–20 €/mes** |
