
// Generar src/lib/build-info.ts al cargar la config (inicio de CUALQUIER
// build o arranque). No dependemos del hook npm "prebuild": el build
// command de Vercel es `next build` a secas y se lo salta — eso tuvo los
// deploys rotos 24h con module-not-found (jul-2026). El try/catch cubre
// el filesystem de solo lectura de las lambdas en runtime.
try {
  require('fs').writeFileSync(
    require('path').join(__dirname, 'src/lib/build-info.ts'),
    `// GENERADO por next.config.js en cada build. No editar.\nexport const BUILD_ISO = '${new Date().toISOString()}'\n`,
  )
} catch { /* runtime lambda: solo lectura, el módulo ya va en el bundle */ }

const fs = require('node:fs')
const path = require('node:path')

// Redirects dinámicos generados por scripts/sync-playas-miteco.js:
// slugs OSM viejos → slugs MITECO canónicos (solo playas con Bandera Azul).
// Se cargan una vez al build; si el archivo no existe el array queda vacío.
function loadSlugRedirects() {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'slug-redirects.json')
    if (!fs.existsSync(file)) return []
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    const out = []
    for (const [oldSlug, newSlug] of Object.entries(data)) {
      out.push({ source: `/playas/${oldSlug}`, destination: `/playas/${newSlug}`, permanent: true })
      out.push({ source: `/en/beaches/${oldSlug}`, destination: `/en/beaches/${newSlug}`, permanent: true })
    }
    return out
  } catch (e) {
    console.warn('[next.config] Could not load slug-redirects.json:', e.message)
    return []
  }
}

const nextConfig = {
  // Tree-shake agresivo de librerías grandes
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  images: {
    remotePatterns: [
      // Unsplash
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },

      // Wikimedia (Commons, Wikipedia, etc.)
      { protocol: 'https', hostname: '**.wikimedia.org' },

      // Flickr
      { protocol: 'https', hostname: '**.staticflickr.com' },

      // Pexels
      { protocol: 'https', hostname: 'images.pexels.com' },

      // OpenVerse (agregador que puede servir de múltiples fuentes)
      { protocol: 'https', hostname: 'images.openverse.org' },

      // Museum sources (vía OpenVerse)
      { protocol: 'https', hostname: '**.metropolitanmuseum.org' },
      { protocol: 'https', hostname: '**.clevelandart.org' },
      { protocol: 'https', hostname: '**.si.edu' }, // Smithsonian
      { protocol: 'https', hostname: '**.yale.edu' },

      // Other sources
      { protocol: 'https', hostname: 'webratings.eu' },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75],
  },
  async headers() {
    return [
      {
        // Fichas de playa: browser 10min (era 5min), CDN 1h, stale 7d.
        // El SWR de 7d (era 24h) hace que cualquier visita a una ficha
        // dormida sirva el HTML cacheado instantáneo y revalide en
        // background — TTFB ms en lugar de invocar la lambda.
        source: '/playas/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=3600, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/en/beaches/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=3600, stale-while-revalidate=604800' },
        ],
      },
      {
        // Comunidad/provincia/municipio: CDN 6h, browser 10min, stale 24h
        source: '/comunidad/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=21600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/provincia/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=21600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/municipio/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=21600, stale-while-revalidate=86400' },
        ],
      },
      {
        // Páginas estáticas: CDN 24h, browser 1h, stale 7d
        source: '/banderas-azules',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/comunidades',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // API routes: cada una tiene su propio Cache-Control (no pisar)
        source: '/api/meteo/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=21600' },
        ],
      },
      {
        source: '/api/(restaurantes|hoteles|parkings|campings)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=172800' },
        ],
      },
      {
        // Assets estáticos: 1 año (inmutables)
        source: '/data/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Páginas /playas/[slug]/que-llevar antiguas (una por playa, thin
      // content) → ficha principal de la playa. Las nuevas guías están
      // en /que-llevar/[tipo] y se enlazan desde la ficha.
      // El dataset traía «Baleares» e «Islas Baleares» como si fueran dos
      // provincias, y cada una tenía su hub vivo y en el sitemap: 348
      // playas en uno y 66 en el otro, con el enlazado interno partido en
      // dos. Unificado el campo, este hub se queda a cero. Estaba
      // indexado, así que se manda con un 301 en vez de dejarlo servir
      // una página vacía con noindex.

      // Search Console, sep-2026: 404 que sí tenían destino.
      // 1) Municipios bilingües que venían con dos nombres y dos slugs
      //    («xabiajavea» y «javeaxabia»): unificados en scripts/
      //    fix-municipio-nombres.mjs; los slugs viejos, con subpáginas, → 301.
      // 2) Comunidades y provincias con tilde en la URL (enlaces externos
      //    viejos) → slug sin tilde. 3) Subpáginas en español colgadas de
      //    /en/towns, que nunca existieron en inglés.
      { source: '/municipio/alacantalicante/:rest*', destination: '/municipio/alicante/:rest*', permanent: true },
      { source: '/municipio/alacantalicante', destination: '/municipio/alicante', permanent: true },
      { source: '/en/towns/alacantalicante/:rest*', destination: '/en/towns/alicante/:rest*', permanent: true },
      { source: '/en/towns/alacantalicante', destination: '/en/towns/alicante', permanent: true },
      { source: '/municipio/peniscolapeniscola/:rest*', destination: '/municipio/peniscola/:rest*', permanent: true },
      { source: '/municipio/peniscolapeniscola', destination: '/municipio/peniscola', permanent: true },
      { source: '/en/towns/peniscolapeniscola/:rest*', destination: '/en/towns/peniscola/:rest*', permanent: true },
      { source: '/en/towns/peniscolapeniscola', destination: '/en/towns/peniscola', permanent: true },
      { source: '/municipio/xabiajavea/:rest*', destination: '/municipio/javea/:rest*', permanent: true },
      { source: '/municipio/xabiajavea', destination: '/municipio/javea', permanent: true },
      { source: '/en/towns/xabiajavea/:rest*', destination: '/en/towns/javea/:rest*', permanent: true },
      { source: '/en/towns/xabiajavea', destination: '/en/towns/javea', permanent: true },
      { source: '/municipio/javeaxabia/:rest*', destination: '/municipio/javea/:rest*', permanent: true },
      { source: '/municipio/javeaxabia', destination: '/municipio/javea', permanent: true },
      { source: '/en/towns/javeaxabia/:rest*', destination: '/en/towns/javea/:rest*', permanent: true },
      { source: '/en/towns/javeaxabia', destination: '/en/towns/javea', permanent: true },
      { source: '/municipio/la-vila-joiosavillajoyosa/:rest*', destination: '/municipio/villajoyosa/:rest*', permanent: true },
      { source: '/municipio/la-vila-joiosavillajoyosa', destination: '/municipio/villajoyosa', permanent: true },
      { source: '/en/towns/la-vila-joiosavillajoyosa/:rest*', destination: '/en/towns/villajoyosa/:rest*', permanent: true },
      { source: '/en/towns/la-vila-joiosavillajoyosa', destination: '/en/towns/villajoyosa', permanent: true },
      { source: '/municipio/villajoyosala-vila-joiosa/:rest*', destination: '/municipio/villajoyosa/:rest*', permanent: true },
      { source: '/municipio/villajoyosala-vila-joiosa', destination: '/municipio/villajoyosa', permanent: true },
      { source: '/en/towns/villajoyosala-vila-joiosa/:rest*', destination: '/en/towns/villajoyosa/:rest*', permanent: true },
      { source: '/en/towns/villajoyosala-vila-joiosa', destination: '/en/towns/villajoyosa', permanent: true },
      { source: '/municipio/donostiasan-sebastian/:rest*', destination: '/municipio/san-sebastian/:rest*', permanent: true },
      { source: '/municipio/donostiasan-sebastian', destination: '/municipio/san-sebastian', permanent: true },
      { source: '/en/towns/donostiasan-sebastian/:rest*', destination: '/en/towns/san-sebastian/:rest*', permanent: true },
      { source: '/en/towns/donostiasan-sebastian', destination: '/en/towns/san-sebastian', permanent: true },
      { source: '/municipio/orpesaoropesa-del-mar/:rest*', destination: '/municipio/oropesa-del-mar/:rest*', permanent: true },
      { source: '/municipio/orpesaoropesa-del-mar', destination: '/municipio/oropesa-del-mar', permanent: true },
      { source: '/en/towns/orpesaoropesa-del-mar/:rest*', destination: '/en/towns/oropesa-del-mar/:rest*', permanent: true },
      { source: '/en/towns/orpesaoropesa-del-mar', destination: '/en/towns/oropesa-del-mar', permanent: true },
      { source: '/municipio/oropesa-del-marorpesa/:rest*', destination: '/municipio/oropesa-del-mar/:rest*', permanent: true },
      { source: '/municipio/oropesa-del-marorpesa', destination: '/municipio/oropesa-del-mar', permanent: true },
      { source: '/en/towns/oropesa-del-marorpesa/:rest*', destination: '/en/towns/oropesa-del-mar/:rest*', permanent: true },
      { source: '/en/towns/oropesa-del-marorpesa', destination: '/en/towns/oropesa-del-mar', permanent: true },
      { source: '/municipio/benicasimbenicassim/:rest*', destination: '/municipio/benicassim/:rest*', permanent: true },
      { source: '/municipio/benicasimbenicassim', destination: '/municipio/benicassim', permanent: true },
      { source: '/en/towns/benicasimbenicassim/:rest*', destination: '/en/towns/benicassim/:rest*', permanent: true },
      { source: '/en/towns/benicasimbenicassim', destination: '/en/towns/benicassim', permanent: true },
      { source: '/municipio/saguntsagunto/:rest*', destination: '/municipio/sagunto/:rest*', permanent: true },
      { source: '/municipio/saguntsagunto', destination: '/municipio/sagunto', permanent: true },
      { source: '/en/towns/saguntsagunto/:rest*', destination: '/en/towns/sagunto/:rest*', permanent: true },
      { source: '/en/towns/saguntsagunto', destination: '/en/towns/sagunto', permanent: true },
      { source: '/municipio/elcheelx/:rest*', destination: '/municipio/elche/:rest*', permanent: true },
      { source: '/municipio/elcheelx', destination: '/municipio/elche', permanent: true },
      { source: '/en/towns/elcheelx/:rest*', destination: '/en/towns/elche/:rest*', permanent: true },
      { source: '/en/towns/elcheelx', destination: '/en/towns/elche', permanent: true },
      { source: '/municipio/elxelche/:rest*', destination: '/municipio/elche/:rest*', permanent: true },
      { source: '/municipio/elxelche', destination: '/municipio/elche', permanent: true },
      { source: '/en/towns/elxelche/:rest*', destination: '/en/towns/elche/:rest*', permanent: true },
      { source: '/en/towns/elxelche', destination: '/en/towns/elche', permanent: true },
      { source: '/municipio/borrianaburriana/:rest*', destination: '/municipio/burriana/:rest*', permanent: true },
      { source: '/municipio/borrianaburriana', destination: '/municipio/burriana', permanent: true },
      { source: '/en/towns/borrianaburriana/:rest*', destination: '/en/towns/burriana/:rest*', permanent: true },
      { source: '/en/towns/borrianaburriana', destination: '/en/towns/burriana', permanent: true },
      { source: '/municipio/castellon-de-la-planacastello-de-la-plana/:rest*', destination: '/municipio/castellon-de-la-plana/:rest*', permanent: true },
      { source: '/municipio/castellon-de-la-planacastello-de-la-plana', destination: '/municipio/castellon-de-la-plana', permanent: true },
      { source: '/en/towns/castellon-de-la-planacastello-de-la-plana/:rest*', destination: '/en/towns/castellon-de-la-plana/:rest*', permanent: true },
      { source: '/en/towns/castellon-de-la-planacastello-de-la-plana', destination: '/en/towns/castellon-de-la-plana', permanent: true },
      { source: '/municipio/castello-de-la-planacastellon-de-la-plana/:rest*', destination: '/municipio/castellon-de-la-plana/:rest*', permanent: true },
      { source: '/municipio/castello-de-la-planacastellon-de-la-plana', destination: '/municipio/castellon-de-la-plana', permanent: true },
      { source: '/en/towns/castello-de-la-planacastellon-de-la-plana/:rest*', destination: '/en/towns/castellon-de-la-plana/:rest*', permanent: true },
      { source: '/en/towns/castello-de-la-planacastellon-de-la-plana', destination: '/en/towns/castellon-de-la-plana', permanent: true },
      { source: '/municipio/benitachellel-poble-nou-de-benitatxell/:rest*', destination: '/municipio/benitachell/:rest*', permanent: true },
      { source: '/municipio/benitachellel-poble-nou-de-benitatxell', destination: '/municipio/benitachell', permanent: true },
      { source: '/en/towns/benitachellel-poble-nou-de-benitatxell/:rest*', destination: '/en/towns/benitachell/:rest*', permanent: true },
      { source: '/en/towns/benitachellel-poble-nou-de-benitatxell', destination: '/en/towns/benitachell', permanent: true },
      { source: '/municipio/el-poble-nou-de-benitatxellbenitachell/:rest*', destination: '/municipio/benitachell/:rest*', permanent: true },
      { source: '/municipio/el-poble-nou-de-benitatxellbenitachell', destination: '/municipio/benitachell', permanent: true },
      { source: '/en/towns/el-poble-nou-de-benitatxellbenitachell/:rest*', destination: '/en/towns/benitachell/:rest*', permanent: true },
      { source: '/en/towns/el-poble-nou-de-benitatxellbenitachell', destination: '/en/towns/benitachell', permanent: true },
      { source: '/municipio/chilchesxilxes/:rest*', destination: '/municipio/chilches/:rest*', permanent: true },
      { source: '/municipio/chilchesxilxes', destination: '/municipio/chilches', permanent: true },
      { source: '/en/towns/chilchesxilxes/:rest*', destination: '/en/towns/chilches/:rest*', permanent: true },
      { source: '/en/towns/chilchesxilxes', destination: '/en/towns/chilches', permanent: true },
      { source: '/municipio/arceartzi/:rest*', destination: '/municipio/arce/:rest*', permanent: true },
      { source: '/municipio/arceartzi', destination: '/municipio/arce', permanent: true },
      { source: '/en/towns/arceartzi/:rest*', destination: '/en/towns/arce/:rest*', permanent: true },
      { source: '/en/towns/arceartzi', destination: '/en/towns/arce', permanent: true },
      { source: '/municipio/alboraiaalboraya/:rest*', destination: '/municipio/alboraya/:rest*', permanent: true },
      { source: '/municipio/alboraiaalboraya', destination: '/municipio/alboraya', permanent: true },
      { source: '/en/towns/alboraiaalboraya/:rest*', destination: '/en/towns/alboraya/:rest*', permanent: true },
      { source: '/en/towns/alboraiaalboraya', destination: '/en/towns/alboraya', permanent: true },
      { source: '/municipio/guesalazgesalatz/:rest*', destination: '/municipio/guesalaz/:rest*', permanent: true },
      { source: '/municipio/guesalazgesalatz', destination: '/municipio/guesalaz', permanent: true },
      { source: '/en/towns/guesalazgesalatz/:rest*', destination: '/en/towns/guesalaz/:rest*', permanent: true },
      { source: '/en/towns/guesalazgesalatz', destination: '/en/towns/guesalaz', permanent: true },
      { source: '/municipio/la-coruna/:rest*', destination: '/municipio/a-coruna/:rest*', permanent: true },
      { source: '/municipio/la-coruna', destination: '/municipio/a-coruna', permanent: true },
      { source: '/en/towns/la-coruna/:rest*', destination: '/en/towns/a-coruna/:rest*', permanent: true },
      { source: '/en/towns/la-coruna', destination: '/en/towns/a-coruna', permanent: true },
      { source: '/municipio/palma-de-mallorca/:rest*', destination: '/municipio/palma/:rest*', permanent: true },
      { source: '/municipio/palma-de-mallorca', destination: '/municipio/palma', permanent: true },
      { source: '/en/towns/palma-de-mallorca/:rest*', destination: '/en/towns/palma/:rest*', permanent: true },
      { source: '/en/towns/palma-de-mallorca', destination: '/en/towns/palma', permanent: true },
      { source: '/municipio/port-dalcudia/:rest*', destination: '/municipio/alcudia/:rest*', permanent: true },
      { source: '/municipio/port-dalcudia', destination: '/municipio/alcudia', permanent: true },
      { source: '/en/towns/port-dalcudia/:rest*', destination: '/en/towns/alcudia/:rest*', permanent: true },
      { source: '/en/towns/port-dalcudia', destination: '/en/towns/alcudia', permanent: true },
      { source: '/municipio/eivissa/:rest*', destination: '/municipio/ibiza/:rest*', permanent: true },
      { source: '/municipio/eivissa', destination: '/municipio/ibiza', permanent: true },
      { source: '/en/towns/eivissa/:rest*', destination: '/en/towns/ibiza/:rest*', permanent: true },
      { source: '/en/towns/eivissa', destination: '/en/towns/ibiza', permanent: true },
      { source: '/municipio/area-metropolitana-de-ciutadella/:rest*', destination: '/municipio/ciutadella-de-menorca/:rest*', permanent: true },
      { source: '/municipio/area-metropolitana-de-ciutadella', destination: '/municipio/ciutadella-de-menorca', permanent: true },
      { source: '/en/towns/area-metropolitana-de-ciutadella/:rest*', destination: '/en/towns/ciutadella-de-menorca/:rest*', permanent: true },
      { source: '/en/towns/area-metropolitana-de-ciutadella', destination: '/en/towns/ciutadella-de-menorca', permanent: true },
      { source: '/comunidad/andaluc%C3%ADa', destination: '/comunidad/andalucia', permanent: true },
      { source: '/en/communities/andaluc%C3%ADa', destination: '/en/communities/andalucia', permanent: true },
      { source: '/comunidad/catalu%C3%B1a', destination: '/comunidad/cataluna', permanent: true },
      { source: '/en/communities/catalu%C3%B1a', destination: '/en/communities/cataluna', permanent: true },
      { source: '/comunidad/catalunacatalunya', destination: '/comunidad/cataluna', permanent: true },
      { source: '/en/communities/catalunacatalunya', destination: '/en/communities/cataluna', permanent: true },
      { source: '/comunidad/pa%C3%ADs-vasco', destination: '/comunidad/pais-vasco', permanent: true },
      { source: '/en/communities/pa%C3%ADs-vasco', destination: '/en/communities/pais-vasco', permanent: true },
      { source: '/comunidad/castilla-y-le%C3%B3n', destination: '/comunidad/castilla-y-leon', permanent: true },
      { source: '/en/communities/castilla-y-le%C3%B3n', destination: '/en/communities/castilla-y-leon', permanent: true },
      { source: '/comunidad/asturias,-principado-de', destination: '/comunidad/asturias', permanent: true },
      { source: '/en/communities/asturias,-principado-de', destination: '/en/communities/asturias', permanent: true },
      { source: '/comunidad/espa%C3%B1a', destination: '/comunidades', permanent: true },
      { source: '/en/communities/espa%C3%B1a', destination: '/en/communities', permanent: true },
      { source: '/comunidad/baleares', destination: '/comunidad/islas-baleares', permanent: true },
      { source: '/en/communities/baleares', destination: '/en/communities/islas-baleares', permanent: true },
      { source: '/comunidad/illes-balears', destination: '/comunidad/islas-baleares', permanent: true },
      { source: '/en/communities/illes-balears', destination: '/en/communities/islas-baleares', permanent: true },
      { source: '/provincia/castell%C3%B3n', destination: '/provincia/castellon', permanent: true },
      { source: '/en/provinces/castell%C3%B3n', destination: '/en/provinces/castellon', permanent: true },
      { source: '/provincia/m%C3%A1laga', destination: '/provincia/malaga', permanent: true },
      { source: '/en/provinces/m%C3%A1laga', destination: '/en/provinces/malaga', permanent: true },
      { source: '/provincia/c%C3%A1diz', destination: '/provincia/cadiz', permanent: true },
      { source: '/en/provinces/c%C3%A1diz', destination: '/en/provinces/cadiz', permanent: true },
      { source: '/provincia/a-coru%C3%B1a', destination: '/provincia/a-coruna', permanent: true },
      { source: '/en/provinces/a-coru%C3%B1a', destination: '/en/provinces/a-coruna', permanent: true },
      { source: '/provincia/almer%C3%ADa', destination: '/provincia/almeria', permanent: true },
      { source: '/en/provinces/almer%C3%ADa', destination: '/en/provinces/almeria', permanent: true },
      { source: '/en/towns/:slug/el-tiempo', destination: '/municipio/:slug/el-tiempo', permanent: true },
      { source: '/en/towns/:slug/tabla-de-mareas', destination: '/municipio/:slug/tabla-de-mareas', permanent: true },
      { source: '/provincia/islas-baleares', destination: '/provincia/baleares', permanent: true },
      { source: '/en/provinces/islas-baleares', destination: '/en/provinces/baleares', permanent: true },
      { source: '/playas/:slug/que-llevar', destination: '/playas/:slug', permanent: true },
      { source: '/en/beaches/:slug/que-llevar', destination: '/en/beaches/:slug', permanent: true },

      // Consolidación jul-2026 (auditoría): páginas que canibalizaban a su
      // equivalente canónico → 301. Las /guides/ duplicaban 1:1 la intención
      // de las URLs transaccionales; secretas/bonitas eran clústeres con
      // títulos intercambiables; barco-playa competía con el hub.
      { source: '/guides/alquiler-catamaranes', destination: '/alquiler-catamaran', permanent: true },
      { source: '/guides/yates-lujo-charter',   destination: '/alquiler-yate',      permanent: true },
      { source: '/guides/veleros-navegacion',   destination: '/alquiler-barco',     permanent: true },
      { source: '/alquiler-barco-playa',        destination: '/alquiler-barco',     permanent: true },
      { source: '/playas-secretas',             destination: '/calas-secretas',     permanent: true },
      { source: '/calas-con-encanto',           destination: '/playas-paradisiacas', permanent: true },

      // Barcos: Barcelona y Valencia estaban bajo costas que no les
      // corresponden (Costa Brava / Costa Blanca). Corregida la taxonomía,
      // las URLs canónicas cambian → 301 de las antiguas.
      { source: '/alquiler-barco/costas/costa-brava/provincias/barcelona/:rest*',  destination: '/alquiler-barco/costas/costa-de-barcelona/provincias/barcelona/:rest*',  permanent: true },
      { source: '/alquiler-barco/costas/costa-blanca/provincias/valencia/:rest*',  destination: '/alquiler-barco/costas/costa-de-valencia/provincias/valencia/:rest*',  permanent: true },
      { source: '/alquiler-barco/costas/costa-brava/provincias/barcelona',  destination: '/alquiler-barco/costas/costa-de-barcelona/provincias/barcelona',  permanent: true },
      { source: '/alquiler-barco/costas/costa-blanca/provincias/valencia',  destination: '/alquiler-barco/costas/costa-de-valencia/provincias/valencia',  permanent: true },
      { source: '/en/boat-rental/coasts/costa-brava/provinces/barcelona/:rest*', destination: '/en/boat-rental/coasts/costa-de-barcelona/provinces/barcelona/:rest*', permanent: true },
      { source: '/en/boat-rental/coasts/costa-blanca/provinces/valencia/:rest*', destination: '/en/boat-rental/coasts/costa-de-valencia/provinces/valencia/:rest*', permanent: true },

      // Slugs OSM → MITECO canónicos para Bandera Azul (dinámicos, generados
      // por scripts/sync-playas-miteco.js).
      ...loadSlugRedirects(),

      // Provincias con acentos eliminados → slug correcto
      { source: '/provincia/mlaga',     destination: '/provincia/malaga',     permanent: true },
      { source: '/provincia/crdoba',    destination: '/provincia/cordoba',    permanent: true },
      { source: '/provincia/almera',    destination: '/provincia/almeria',    permanent: true },
      { source: '/provincia/castelln',  destination: '/provincia/castellon',  permanent: true },
      { source: '/provincia/cceres',    destination: '/provincia/caceres',    permanent: true },
      { source: '/provincia/len',       destination: '/provincia/leon',       permanent: true },
      { source: '/provincia/vila',      destination: '/provincia/avila',      permanent: true },
      { source: '/provincia/a-corua',   destination: '/provincia/a-coruna',   permanent: true },
      { source: '/provincia/jan',       destination: '/provincia/jaen',       permanent: true },
      { source: '/provincia/cdiz',      destination: '/provincia/cadiz',      permanent: true },
      { source: '/provincia/lava',      destination: '/provincia/alava',      permanent: true },

      // Comunidades con acentos eliminados → slug correcto
      { source: '/comunidad/andaluca',          destination: '/comunidad/andalucia',          permanent: true },
      { source: '/comunidad/catalua',           destination: '/comunidad/cataluna',           permanent: true },
      { source: '/comunidad/castilla-y-len',    destination: '/comunidad/castilla-y-leon',    permanent: true },
      { source: '/comunidad/aragn',             destination: '/comunidad/aragon',             permanent: true },
      { source: '/comunidad/pas-vasco',         destination: '/comunidad/pais-vasco',         permanent: true },

      // España no es una comunidad autónoma. El hub existía porque 148 playas
      // de Castellón, Valencia, Alicante y Ourense traían «España» en el campo
      // `comunidad` —sin dato, rellenado con el país—. Corregido el dataset con
      // scripts/fix-comunidad-por-provincia.mjs, la página se queda sin playas;
      // el 301 va al índice porque mezclaba dos comunidades y mandarla a una
      // sola sería mentirle a quien llegue desde la SERP.
      { source: '/comunidad/espana',            destination: '/comunidades',                  permanent: true },

      // Versión EN
      { source: '/en/provinces/mlaga',     destination: '/en/provinces/malaga',     permanent: true },
      { source: '/en/provinces/crdoba',    destination: '/en/provinces/cordoba',    permanent: true },
      { source: '/en/provinces/almera',    destination: '/en/provinces/almeria',    permanent: true },
      { source: '/en/provinces/castelln',  destination: '/en/provinces/castellon',  permanent: true },
      { source: '/en/provinces/cceres',    destination: '/en/provinces/caceres',    permanent: true },
      { source: '/en/provinces/len',       destination: '/en/provinces/leon',       permanent: true },
      { source: '/en/provinces/vila',      destination: '/en/provinces/avila',      permanent: true },
      { source: '/en/provinces/a-corua',   destination: '/en/provinces/a-coruna',   permanent: true },
      { source: '/en/communities/andaluca',       destination: '/en/communities/andalucia',       permanent: true },
      { source: '/en/communities/catalua',        destination: '/en/communities/cataluna',        permanent: true },
      { source: '/en/communities/castilla-y-len', destination: '/en/communities/castilla-y-leon', permanent: true },
    ]
  },
}

module.exports = nextConfig
