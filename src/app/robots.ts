// src/app/robots.ts
//
// IMPORTANTE para SEO de imágenes:
//   - /api/og  está EXPLÍCITAMENTE permitido. El image sitemap apunta a
//     /api/og?slug=... y robots.txt debe permitirlo o Google lo ignora.
//   - El resto de /api/ (cron, votos, opiniones, etc.) está bloqueado.
//
// Tres user-agents distintos:
//   - * (default): allow / + disallow del API privado
//   - Googlebot-Image: explícito allow de /api/og y /sitemaps/* para
//     que Google Imágenes pueda rastrear las OG dinámicas.
//   - GPTBot / CCBot / ClaudeBot: bloqueados por defecto (decisión
//     de marca: no entrenar LLMs ajenos con nuestro contenido sin acuerdo).

import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og'],
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/api/og', '/sitemaps/'],
      },
      {
        // No entrenar LLMs ajenos con nuestro contenido (decisión editorial).
        // Si en el futuro hay acuerdo, eliminar esta regla.
        userAgent: ['GPTBot', 'CCBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended'],
        disallow: '/',
      },
      {
        // Rastreadores de auditoría y de bases de datos de enlaces.
        //
        // Motivo: coste, no SEO. La ficha /playas/[slug] tarda ~19,7 s de
        // p95 porque llama en petición a overpass, youtube, pexels y
        // wikimedia; con ISR, cada rastreo de una página caducada dispara
        // una regeneración que se paga en GB-hora. Una alerta de Vercel
        // atribuyó un pico de duración a tráfico mezclado de ISPs móviles
        // españoles y SiteAuditBot. Estos bots recorren las 4.427 fichas
        // sin aportar posicionamiento: no son buscadores.
        //
        // NO se bloquea nada que envíe usuarios. Google, Bing, Yandex y
        // los buscadores siguen con acceso completo.
        userAgent: [
          'SemrushBot', 'SiteAuditBot', 'SplitSignalBot',
          'AhrefsBot', 'AhrefsSiteAudit',
          'DotBot', 'rogerbot', 'MJ12bot', 'BLEXBot',
          'DataForSeoBot', 'Barkrowler', 'SeekportBot', 'serpstatbot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${BASE}/sitemap-index.xml`,
    host: BASE,
  }
}
