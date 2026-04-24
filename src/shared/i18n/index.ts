import { en } from './en'
import { de } from './de'
import { ar } from './ar'

export type Locale = 'en' | 'de' | 'ar'
export type LocaleSetting = 'auto' | Locale
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'de', 'ar']

const DICTS: Record<Locale, Record<string, string>> = { en, de, ar }

export type TranslationParams = Record<string, string | number>

export function translate(
  locale: Locale,
  key: string,
  params?: TranslationParams,
): string {
  const primary = DICTS[locale] ?? DICTS.en
  let value = primary[key] ?? DICTS.en[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
    }
  }
  return value
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar'
}

export function resolveLocale(override: LocaleSetting, osLocale: string): Locale {
  if (override !== 'auto') return override
  const primary = (osLocale || '').toLowerCase().split(/[-_]/)[0]
  const match = SUPPORTED_LOCALES.find((l) => l === primary)
  return match ?? 'en'
}
