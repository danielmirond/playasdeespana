// src/components/ui/IconInfo.tsx
// SVG inline para evitar @phosphor-icons/react/dist/ssr en server components.
// Importar desde Phosphor en server-rendered con Turbopack + optimizePackageImports
// causa 'createContext is not a function' al collect-page-data en build prod.

interface IconInfoProps {
  size?:      number
  className?: string
  color?:     string
}

export default function IconInfo({ size = 22, className, color = 'currentColor' }: IconInfoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill={color}
      className={className}
      aria-hidden="true"
    >
      <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm12,168a12,12,0,0,1-24,0V128a12,12,0,0,1,24,0Zm-12-92a16,16,0,1,1,16-16A16,16,0,0,1,128,100Z" />
    </svg>
  )
}
