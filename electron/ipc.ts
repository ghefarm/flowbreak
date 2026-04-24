import { BrowserWindow, ipcMain, shell } from 'electron'
import {
  endBreakNow,
  getState,
  onSettingsChanged,
  pause,
  reset,
  resume,
  snooze,
  startBreakImmediately,
  takeBreakNow,
  timerEvents,
} from './timer'
import { getSettings, setLicense, updateSettings, type Settings } from './store'
import { verifyLicenseKey } from './license'
import { currentLocale, t } from './i18n'
import { isRTL } from '../src/shared/i18n'

const PURCHASE_URL = 'https://mansourtech.org/flowbreak'

export const IPC = {
  timerGetState: 'timer:getState',
  timerPause: 'timer:pause',
  timerResume: 'timer:resume',
  timerReset: 'timer:reset',
  timerTakeBreakNow: 'timer:takeBreakNow',
  timerStartBreakImmediately: 'timer:startBreakImmediately',
  timerSnooze: 'timer:snooze',
  timerEndBreakNow: 'timer:endBreakNow',
  timerTick: 'timer:tick',
  preBreakStart: 'preBreak:start',
  breakStart: 'break:start',
  breakEnd: 'break:end',
  breakSnoozed: 'break:snoozed',
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',
  licenseActivate: 'license:activate',
  licenseDeactivate: 'license:deactivate',
  licenseOpenPurchase: 'license:openPurchase',
  i18nGetLocale: 'i18n:getLocale',
} as const

type WritableSettingsPatch = Partial<Omit<Settings, 'proEnabled' | 'license'>>

export type ActivationResult =
  | { ok: true; settings: Settings }
  | { ok: false; error: string }

export function registerIpc(): void {
  ipcMain.handle(IPC.timerGetState, () => getState())
  ipcMain.on(IPC.timerPause, () => pause())
  ipcMain.on(IPC.timerResume, () => resume())
  ipcMain.on(IPC.timerReset, () => reset())
  ipcMain.on(IPC.timerTakeBreakNow, () => takeBreakNow())
  ipcMain.on(IPC.timerStartBreakImmediately, () => startBreakImmediately())
  ipcMain.on(IPC.timerSnooze, () => snooze())
  ipcMain.on(IPC.timerEndBreakNow, () => endBreakNow())

  ipcMain.handle(IPC.settingsGet, () => getSettings())
  ipcMain.handle(IPC.settingsUpdate, (_e, patch: WritableSettingsPatch) => {
    const next = updateSettings(patch)
    onSettingsChanged()
    return next
  })

  ipcMain.handle(IPC.licenseActivate, (_e, key: string): ActivationResult => {
    if (typeof key !== 'string' || !key.trim()) {
      return { ok: false, error: t('license.error.empty') }
    }
    const payload = verifyLicenseKey(key)
    if (!payload) {
      return { ok: false, error: t('license.error.invalid') }
    }
    const settings = setLicense({ key: key.trim(), email: payload.email, activatedAt: Date.now() })
    onSettingsChanged()
    return { ok: true, settings }
  })

  ipcMain.handle(IPC.licenseDeactivate, () => {
    setLicense(null)
    onSettingsChanged()
    return getSettings()
  })

  ipcMain.on(IPC.licenseOpenPurchase, () => {
    void shell.openExternal(PURCHASE_URL)
  })

  ipcMain.on(IPC.i18nGetLocale, (e) => {
    const locale = currentLocale()
    e.returnValue = { locale, dir: isRTL(locale) ? 'rtl' : 'ltr' }
  })

  const broadcast = (channel: string, ...args: unknown[]) => {
    for (const w of BrowserWindow.getAllWindows()) {
      if (!w.isDestroyed()) w.webContents.send(channel, ...args)
    }
  }
  timerEvents.on('tick', (state) => broadcast(IPC.timerTick, state))
  timerEvents.on('pre-break-start', () => broadcast(IPC.preBreakStart))
  timerEvents.on('break-start', () => broadcast(IPC.breakStart))
  timerEvents.on('break-end', () => broadcast(IPC.breakEnd))
  timerEvents.on('break-snoozed', () => broadcast(IPC.breakSnoozed))
}
