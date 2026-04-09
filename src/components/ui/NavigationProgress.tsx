'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Reset on route change complete
    setLoading(false)
    setProgress(0)
  }, [pathname])

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return
      if (href === pathname) return

      setLoading(true)
      setProgress(20)
      timer = setTimeout(() => setProgress(60), 150)
      setTimeout(() => setProgress(80), 400)
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      clearTimeout(timer)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      height: 3, background: 'transparent',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: 'var(--accent, #b06820)',
        transition: 'width 0.3s ease',
        borderRadius: '0 2px 2px 0',
      }}/>
    </div>
  )
}
