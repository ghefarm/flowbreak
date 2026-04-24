import { app } from 'electron'
import { store } from './store'
import {
  resolveLocale,
  translate,
  type Locale,
  type TranslationParams,
} from '../src/shared/i18n'

export function currentLocale(): Locale {
  return resolveLocale(store.get('locale'), app.getLocale())
}

export function t(key: string, params?: TranslationParams): string {
  return translate(currentLocale(), key, params)
}
