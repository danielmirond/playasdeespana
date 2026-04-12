// src/lib/faqsPlaya.ts
// Generador único de preguntas frecuentes por playa. Una sola fuente de
// verdad consumida por dos sitios:
//
//   1. FichaBody → FaqSection renderiza las preguntas como <details>/<summary>
//      visibles en el HTML.
//   2. SchemaPlaya emite FAQPage JSON-LD usando exactamente el mismo array.
//
// De esta forma el schema SIEMPRE refleja el HTML visible y Google deja de
// marcar "Duplicate FAQ" por mismatch entre ambas.
import type { Playa } from '@/types'
import type { BanderaPlaya, MedusasRiesgo } from './seguridad'
import type { MareasDia } from './mareas-lunar'

export interface FaqItem { q: string; a: string }

export interface FaqCtx {
  playa:        Playa
  aguaC:        number
  olasM:        number
  vientoKmh:    number
  vientoRacha?: number
  vientoDir?:   string
  banderaPlaya?: BanderaPlaya
  medusas?:     MedusasRiesgo
  mareasLunar?: MareasDia
  locale?:      'es' | 'en'
}

export function generarFaqsPlaya(ctx: FaqCtx): FaqItem[] {
  const { playa, aguaC, olasM, vientoKmh, vientoRacha, vientoDir, banderaPlaya, medusas, mareasLunar } = ctx
  const n = playa.nombre
  const es = (ctx.locale ?? 'es') === 'es'

  const out: (FaqItem | null)[] = []

  out.push({
    q: es ? `¿Cómo está el agua en ${n} hoy?` : `How is the water at ${n} today?`,
    a: es
      ? `La temperatura del agua en ${n} es de ${aguaC}°C con olas de ${olasM}m.`
      : `Water temperature at ${n} is ${aguaC}°C with ${olasM}m waves.`,
  })

  if (banderaPlaya) {
    out.push({
      q: es ? `¿Qué bandera tiene ${n} hoy?` : `What flag does ${n} have today?`,
      a: es
        ? `${banderaPlaya.label}. ${banderaPlaya.motivo}.`
        : `${banderaPlaya.labelEn}. ${banderaPlaya.motivoEn}.`,
    })
  }

  if (medusas) {
    out.push({
      q: es ? `¿Hay medusas en ${n}?` : `Are there jellyfish at ${n}?`,
      a: es
        ? `${medusas.label}. ${medusas.detalle}.`
        : `${medusas.labelEn}. ${medusas.detalleEn}.`,
    })
  }

  out.push({
    q: es ? `¿Cuánto viento hace en ${n}?` : `How windy is it at ${n}?`,
    a: es
      ? `El viento en ${n} es de ${vientoKmh} km/h${vientoRacha !== undefined ? ` con rachas de ${vientoRacha} km/h` : ''}${vientoDir ? ` (dirección ${vientoDir})` : ''}.`
      : `Wind at ${n} is ${vientoKmh} km/h${vientoRacha !== undefined ? ` with gusts of ${vientoRacha} km/h` : ''}${vientoDir ? ` (${vientoDir})` : ''}.`,
  })

  if (mareasLunar) {
    const pleas = mareasLunar.mareas.filter(m => m.tipo === 'pleamar')
    const tipoLabel = es
      ? (mareasLunar.tipo === 'vivas' ? 'mareas vivas' : mareasLunar.tipo === 'muertas' ? 'mareas muertas' : 'mareas medias')
      : (mareasLunar.tipo === 'vivas' ? 'spring tides' : mareasLunar.tipo === 'muertas' ? 'neap tides' : 'average tides')
    const answer = mareasLunar.zona === 'mediterraneo'
      ? (es
          ? `En el Mediterráneo las mareas son insignificantes (${mareasLunar.rango}m). El nivel del agua apenas varía.`
          : `Mediterranean tides are negligible (${mareasLunar.rango}m). Water level barely changes.`)
      : (es
          ? `Hoy las pleamares en ${n} son a las ${pleas.map(p => p.hora).join(' y ')} (${pleas[0]?.altura}m). Coeficiente ${mareasLunar.coeficiente}, ${tipoLabel}.`
          : `Today's high tides at ${n} are at ${pleas.map(p => p.hora).join(' and ')} (${pleas[0]?.altura}m). Coefficient ${mareasLunar.coeficiente}, ${tipoLabel}.`)
    out.push({
      q: es ? `¿A qué hora es la pleamar en ${n}?` : `What time is high tide at ${n}?`,
      a: answer,
    })
  }

  if (playa.parking !== undefined) {
    out.push({
      q: es ? `¿Hay parking cerca de ${n}?` : `Is there parking near ${n}?`,
      a: es
        ? (playa.parking ? `Sí, hay aparcamiento próximo a ${n}.` : `${n} no dispone de parking oficial.`)
        : (playa.parking ? `Yes, there is parking near ${n}.` : `${n} does not have official parking.`),
    })
  }

  if (playa.perros !== undefined) {
    out.push({
      q: es ? `¿Se permiten perros en ${n}?` : `Are dogs allowed at ${n}?`,
      a: es
        ? (playa.perros ? `Sí, ${n} permite perros.` : `No, en ${n} no se permiten perros.`)
        : (playa.perros ? `Yes, dogs are allowed at ${n}.` : `No, dogs are not allowed at ${n}.`),
    })
  }

  return out.filter((x): x is FaqItem => !!x)
}
