import type { Metadata } from 'next'
import Script from 'next/script'
import CookieBanner from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  alternates: {
    languages: { 'es': 'https://playas-espana.com', 'en': 'https://playas-espana.com/en' },
  },
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieBanner locale="en" />
    </>
  )
}
