import { ipcRenderer, contextBridge } from 'electron'

// Legacy passthrough — kept so existing renderer code that uses `window.ipcRenderer`
// keeps working while we migrate to the typed `flowbreak` API below.
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...a) => listener(event, ...a))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Typed FlowBreak API. Keep channel strings in sync with electron/ipc.ts.
type Unsubscribe = () => void
type TimerState = {
  remainingMs: number
  intervalMs: number
  preBreakRemainingMs: number
  preBreakDurationMs: number
  breakRemainingMs: number
  breakDurationMs: number
  paused: boolean
  onPreBreak: boolean
  onBreak: boolean
  idleSec: number
}
type LicenseRecord = {
  key: string
  email: string
  activatedAt: number
}
type Locale = 'en' | 'de' | 'ar'
type LocaleSetting = 'auto' | Locale
type Settings = {
  intervalMinutes: number
  breakDurationSeconds: number
  idleThresholdMinutes: number
  graceSeconds: number
  snoozeMinutes: number
  customVideoUrl: string
  license: LicenseRecord | null
  locale: LocaleSetting
  proEnabled: boolean
}
type ActivationResult = { ok: true; settings: Settings } | { ok: false; error: string }
type WritableSettingsPatch = Partial<Omit<Settings, 'proEnabled' | 'license'>>

function subscribe(channel: string, cb: (...args: unknown[]) => void): Unsubscribe {
  const wrapped = (_e: Electron.IpcRendererEvent, ...a: unknown[]) => cb(...a)
  ipcRenderer.on(channel, wrapped)
  return () => ipcRenderer.off(channel, wrapped)
}

const flowbreak = {
  timer: {
    getState: (): Promise<TimerState> => ipcRenderer.invoke('timer:getState'),
    pause: () => ipcRenderer.send('timer:pause'),
    resume: () => ipcRenderer.send('timer:resume'),
    reset: () => ipcRenderer.send('timer:reset'),
    takeBreakNow: () => ipcRenderer.send('timer:takeBreakNow'),
    startBreakImmediately: () => ipcRenderer.send('timer:startBreakImmediately'),
    snooze: () => ipcRenderer.send('timer:snooze'),
    endBreakNow: () => ipcRenderer.send('timer:endBreakNow'),
    onTick: (cb: (state: TimerState) => void): Unsubscribe =>
      subscribe('timer:tick', (state) => cb(state as TimerState)),
    onPreBreakStart: (cb: () => void): Unsubscribe => subscribe('preBreak:start', () => cb()),
    onBreakStart: (cb: () => void): Unsubscribe => subscribe('break:start', () => cb()),
    onBreakEnd: (cb: () => void): Unsubscribe => subscribe('break:end', () => cb()),
    onBreakSnoozed: (cb: () => void): Unsubscribe => subscribe('break:snoozed', () => cb()),
  },
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
    update: (patch: WritableSettingsPatch): Promise<Settings> =>
      ipcRenderer.invoke('settings:update', patch),
  },
  license: {
    activate: (key: string): Promise<ActivationResult> =>
      ipcRenderer.invoke('license:activate', key),
    deactivate: (): Promise<Settings> => ipcRenderer.invoke('license:deactivate'),
    openPurchase: () => ipcRenderer.send('license:openPurchase'),
  },
  i18n: ipcRenderer.sendSync('i18n:getLocale') as { locale: Locale; dir: 'ltr' | 'rtl' },
}

contextBridge.exposeInMainWorld('flowbreak', flowbreak)

export type FlowBreakApi = typeof flowbreak
