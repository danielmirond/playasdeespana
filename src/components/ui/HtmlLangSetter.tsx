'use client'
// src/components/ui/HtmlLangSetter.tsx
// Updates the <html lang> attribute on the client so screen readers
// announce /en pages in English instead of inheriting lang="es" from the
// root layout. Also updates `dir` for future RTL languages.
//
// Why client-side: Next.js App Router renders <html> in the root layout.
// The /en pages use a nested layout that cannot override <html>. Making
// the root layout dynamic via headers() would disable SSG for the whole
// site, which is too expensive for this content site. A tiny client
// effect fixes the accessibility concern without any performance hit.

import { useEffect } from 'react'

type Props = { lang: string; dir?: 'ltr' | 'rtl' }

export default function HtmlLangSetter({ lang, dir = 'ltr' }: Props) {
  useEffect(() => {
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang
    }
    if (dir && document.documentElement.dir !== dir) {
      document.documentElement.dir = dir
    }
  }, [lang, dir])
  return null
}
