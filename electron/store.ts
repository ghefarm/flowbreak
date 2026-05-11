import Store from 'electron-store'
import type { LocaleSetting } from '../src/shared/i18n'

export type Settings = {
  intervalMinutes: number
  breakDurationSeconds: number
  idleThresholdMinutes: number
  graceSeconds: number
  snoozeMinutes: number
  customVideoUrl: string
  locale: LocaleSetting
}

const defaults: Settings = {
  intervalMinutes: 60,
  breakDurationSeconds: 60,
  idleThresholdMinutes: 10,
  graceSeconds: 5,
  snoozeMinutes: 5,
  customVideoUrl: '',
  locale: 'auto',
}

export const store = new Store<Settings>({ defaults })

// Migrate legacy idleThresholdSeconds → idleThresholdMinutes (min 10 min).
{
  const raw = store.store as Record<string, unknown>
  if (typeof raw.idleThresholdSeconds === 'number') {
    const minutes = Math.max(10, Math.round(raw.idleThresholdSeconds / 60))
    store.set('idleThresholdMinutes', minutes)
    ;(store as unknown as { delete: (k: string) => void }).delete('idleThresholdSeconds')
  }
}

export function getSettings(): Settings {
  return {
    intervalMinutes: store.get('intervalMinutes'),
    breakDurationSeconds: store.get('breakDurationSeconds'),
    idleThresholdMinutes: store.get('idleThresholdMinutes'),
    graceSeconds: store.get('graceSeconds'),
    snoozeMinutes: store.get('snoozeMinutes'),
    customVideoUrl: store.get('customVideoUrl'),
    locale: store.get('locale'),
  }
}

export function updateSettings(patch: Partial<Settings>): Settings {
  for (const [k, v] of Object.entries(patch) as [keyof Settings, Settings[keyof Settings]][]) {
    if (v !== undefined) store.set(k, v as never)
  }
  return getSettings()
}
