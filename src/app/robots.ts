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
    ],
    sitemap: `${BASE}/sitemap-index.xml`,
    host: BASE,
  }
}
