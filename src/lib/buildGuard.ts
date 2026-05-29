// src/lib/buildGuard.ts
// IS_BUILD es true SOLO durante `next build` (fase de export SSG).
// Lo usamos para cortocircuitar todo I/O externo (fotos, Overpass, hoteles,
// restaurantes, campings, buceo, escuelas) durante el build de Vercel.
//
// Causa raíz de los timeouts: estos fetchers se ejecutaban durante el SSG con
// la caché KV vacía, golpeando hasta 7 APIs externas por playa. Una sola página
// (p.ej. /chiringuitos/barcelona) superaba los 60s, así que reducir el número de
// páginas pre-renderizadas (TOP 1 / TOP 5) nunca podía arreglarlo.
//
// Con este guard el build no hace ninguna red -> renderiza en milisegundos ->
// se puede restaurar el pre-render completo. En runtime (ISR / primera visita /
// cron de warm) los datos se piden normalmente y se cachean en KV.
export const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build'
