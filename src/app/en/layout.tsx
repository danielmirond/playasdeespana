import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    languages: { 'es': 'https://playas-espana.com', 'en': 'https://playas-espana.com/en' },
  },
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
