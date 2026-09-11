'use client'
// src/components/ui/CuentaAtras.tsx — «(dentro de 3 h 12 min)».
//
// «La próxima bajamar es a las 15:38» obliga a hacer la resta. «Dentro de
// 3 h 12 min» ya viene hecha, y es lo que la gente busca de un vistazo.
//
// POR QUÉ EN CLIENTE, y no una línea más en el servidor. La tabla de mareas
// es ISR de 30 minutos: una cuenta atrás horneada en el HTML llegaría con
// hasta media hora de error, y sería mentir con precisión de minuto. La HORA
// del extremo sí va en el servidor, porque es verdad se sirva cuando se
// sirva; lo relativo se calcula donde está el reloj del lector.
//
// Y renderiza NADA en el servidor y NADA en el primer render del cliente, y
// solo después del montaje escribe el texto. Así el HTML servido y el primer
// árbol del cliente son idénticos: sin error de hidratación #418, que en esta
// web ya ha congelado componentes enteros durante semanas.
import { useEffect, useState } from 'react'

export default function CuentaAtras({ iso, locale = 'es' }: { iso: string; locale?: 'es' | 'en' }) {
  const [texto, setTexto] = useState<string | null>(null)

  useEffect(() => {
    const objetivo = new Date(iso).getTime()
    const calcular = () => {
      const min = Math.round((objetivo - Date.now()) / 60000)
      // Si la página llega servida de caché y el extremo ya pasó, no se dice
      // «dentro de −12 min»: se calla.
      if (!Number.isFinite(min) || min <= 0) { setTexto(null); return }
      const h = Math.floor(min / 60), m = min % 60
      const dur = h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`
      setTexto(locale === 'en' ? ` (in ${dur})` : ` (dentro de ${dur})`)
    }
    calcular()
    const id = window.setInterval(calcular, 60_000)
    return () => window.clearInterval(id)
  }, [iso, locale])

  return texto ? <span>{texto}</span> : null
}
