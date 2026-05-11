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
import { getSettings, updateSettings, type Settings } from './store'
import { currentLocale } from './i18n'
import { isRTL } from '../src/shared/i18n'

const DONATE_URL = 'https://mansourtech.org/flowbreak'

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
  donateOpen: 'donate:open',
  i18nGetLocale: 'i18n:getLocale',
} as const

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
  ipcMain.handle(IPC.settingsUpdate, (_e, patch: Partial<Settings>) => {
    const next = updateSettings(patch)
    onSettingsChanged()
    return next
  })

  ipcMain.on(IPC.donateOpen, () => {
    void shell.openExternal(DONATE_URL)
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
