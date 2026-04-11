import type { Metadata } from 'next'
import HtmlLangSetter from '@/components/ui/HtmlLangSetter'

export const metadata: Metadata = {
  alternates: {
    languages: { 'es': 'https://playas-espana.com', 'en': 'https://playas-espana.com/en' },
  },
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLangSetter lang="en" />
      {children}
    </>
  )
}
