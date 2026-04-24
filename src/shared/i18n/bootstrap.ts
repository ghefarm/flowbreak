import { isRTL, translate, type Locale } from './index'

export function bootstrapLocale(titleKey?: string): Locale {
  const locale = window.flowbreak.i18n.locale as Locale
  document.documentElement.lang = locale
  document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr'
  if (titleKey) document.title = translate(locale, titleKey)
  return locale
}
