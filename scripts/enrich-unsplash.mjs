#!/usr/bin/env node
// scripts/enrich-unsplash.mjs
//
// Resuelve una foto real de Unsplash para cada artículo del Magazine y la
// guarda en src/lib/magazine-images.json (mapa slug → {url, creditName,
// creditUrl}). Así el build de Next sigue SIN RED: las páginas solo leen el
// JSON ya resuelto.
//
// Uso:
//   UNSPLASH_ACCESS_KEY=xxxx node scripts/enrich-unsplash.mjs           # solo faltantes
//   UNSPLASH_ACCESS_KEY=xxxx node scripts/enrich-unsplash.mjs --force   # re-resuelve todo
//   UNSPLASH_ACCESS_KEY=xxxx node scripts/enrich-unsplash.mjs <slug>    # solo ese slug
//
// Requiere una Access Key gratuita de https://unsplash.com/developers
// (Authorization: Client-ID <key>). Cumple las normas de Unsplash:
//   - atribución (nombre + enlace con utm) → la pintan las fichas
//   - ping a download_location al usar una foto.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const MAGAZINE_TS = resolve(ROOT, 'src/lib/magazine.ts')
const IMAGES_JSON = resolve(ROOT, 'src/lib/magazine-images.json')

const KEY = process.env.UNSPLASH_ACCESS_KEY
if (!KEY) {
  console.error('✗ Falta UNSPLASH_ACCESS_KEY. Consíguela en https://unsplash.com/developers')
  process.exit(1)
}

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const ONLY_SLUG = args.find(a => !a.startsWith('--'))

const UTM = '?utm_source=playas_de_espana&utm_medium=referral'

// Extrae pares [slug, heroQuery] del array ARTICLES (slug precede a heroQuery
// dentro de cada objeto; el non-greedy empareja cada slug con su heroQuery).
async function readArticles() {
  const src = await readFile(MAGAZINE_TS, 'utf8')
  const from = src.indexOf('export const ARTICLES')
  const region = from >= 0 ? src.slice(from) : src
  const re = /slug:\s*'([^']+)'[\s\S]*?heroQuery:\s*'([^']+)'/g
  const out = []
  let m
  while ((m = re.exec(region)) !== null) out.push({ slug: m[1], heroQuery: m[2] })
  return out
}

async function unsplash(path) {
  const res = await fetch(`https://api.unsplash.com${path}`, {
    headers: { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' },
  })
  if (!res.ok) throw new Error(`Unsplash ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

async function resolvePhoto(heroQuery) {
  const q = encodeURIComponent(heroQuery.replace(/,/g, ' '))
  const data = await unsplash(`/search/photos?query=${q}&orientation=landscape&content_filter=high&per_page=1`)
  const p = data?.results?.[0]
  if (!p) return null
  // Norma Unsplash: registrar el "download" al usar la foto.
  if (p.links?.download_location) {
    try { await unsplash(p.links.download_location.replace('https://api.unsplash.com', '')) } catch {}
  }
  const url = `${p.urls.raw}&w=1200&h=630&fit=crop&crop=entropy&q=80&auto=format`
  return {
    url,
    creditName: p.user?.name ?? 'Unsplash',
    creditUrl: `${p.user?.links?.html ?? 'https://unsplash.com'}${UTM}`,
  }
}

async function main() {
  const articles = await readArticles()
  let map = {}
  try { map = JSON.parse(await readFile(IMAGES_JSON, 'utf8')) } catch {}

  const targets = articles.filter(a =>
    ONLY_SLUG ? a.slug === ONLY_SLUG : (FORCE || !map[a.slug]?.url))

  if (targets.length === 0) {
    console.log('✓ Nada que resolver (usa --force para re-resolver).')
    return
  }

  console.log(`Resolviendo ${targets.length} foto(s)…`)
  for (const a of targets) {
    try {
      const photo = await resolvePhoto(a.heroQuery)
      if (!photo) { console.warn(`  · ${a.slug}: sin resultados para "${a.heroQuery}"`); continue }
      map[a.slug] = photo
      console.log(`  ✓ ${a.slug} → ${photo.creditName}`)
    } catch (e) {
      console.warn(`  ✗ ${a.slug}: ${e.message}`)
    }
  }

  const sorted = Object.fromEntries(Object.keys(map).sort().map(k => [k, map[k]]))
  await writeFile(IMAGES_JSON, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`✓ Guardado en src/lib/magazine-images.json (${Object.keys(sorted).length} fotos).`)
}

main().catch(e => { console.error(e); process.exit(1) })
