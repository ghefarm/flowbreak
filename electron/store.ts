import Store from 'electron-store'
import { isLicenseRecordValid, type LicenseRecord } from './license'
import type { LocaleSetting } from '../src/shared/i18n'

type StoredSettings = {
  intervalMinutes: number
  breakDurationSeconds: number
  idleThresholdMinutes: number
  graceSeconds: number
  snoozeMinutes: number
  customVideoUrl: string
  license: LicenseRecord | null
  locale: LocaleSetting
}

export type Settings = StoredSettings & {
  proEnabled: boolean
}

const defaults: StoredSettings = {
  intervalMinutes: 60,
  breakDurationSeconds: 60,
  idleThresholdMinutes: 10,
  graceSeconds: 5,
  snoozeMinutes: 5,
  customVideoUrl: '',
  license: null,
  locale: 'auto',
}

export const store = new Store<StoredSettings>({ defaults })

// Migrate legacy idleThresholdSeconds → idleThresholdMinutes (min 10 min).
{
  const raw = store.store as Record<string, unknown>
  if (typeof raw.idleThresholdSeconds === 'number') {
    const minutes = Math.max(10, Math.round(raw.idleThresholdSeconds / 60))
    store.set('idleThresholdMinutes', minutes)
    ;(store as unknown as { delete: (k: string) => void }).delete('idleThresholdSeconds')
  }
}

function readStored(): StoredSettings {
  return {
    intervalMinutes: store.get('intervalMinutes'),
    breakDurationSeconds: store.get('breakDurationSeconds'),
    idleThresholdMinutes: store.get('idleThresholdMinutes'),
    graceSeconds: store.get('graceSeconds'),
    snoozeMinutes: store.get('snoozeMinutes'),
    customVideoUrl: store.get('customVideoUrl'),
    license: store.get('license'),
    locale: store.get('locale'),
  }
}

export function getSettings(): Settings {
  const stored = readStored()
  return { ...stored, proEnabled: isLicenseRecordValid(stored.license) }
}

type WritableSettings = Omit<StoredSettings, 'license'>

export function updateSettings(patch: Partial<WritableSettings>): Settings {
  for (const [k, v] of Object.entries(patch) as [keyof WritableSettings, WritableSettings[keyof WritableSettings]][]) {
    if (v !== undefined) store.set(k, v as never)
  }
  return getSettings()
}

export function setLicense(record: LicenseRecord | null): Settings {
  store.set('license', record)
  return getSettings()
}
