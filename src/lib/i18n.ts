// src/lib/i18n.ts
import en from '@/messages/en.json'

export type Locale = 'es' | 'en'
export type Messages = typeof en

const messages: Record<Locale, Messages> = { en, es: en } // es usa las cadenas directas en los componentes

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.en
}

// Helper para usar en componentes server
export function t(messages: Messages, key: string): string {
  const keys = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let val: any = messages
  for (const k of keys) {
    val = val?.[k]
    if (val === undefined) return key
  }
  return typeof val === 'string' ? val : key
}
