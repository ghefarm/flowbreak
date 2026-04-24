import { app } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { initTray, destroyTray } from './tray'
import { initTimer, timerEvents } from './timer'
import { registerIpc } from './ipc'
import {
  closeBreakWindow,
  closePreBreakWindow,
  createBreakWindow,
  createPreBreakWindow,
  destroyAllWindows,
} from './windows'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.whenReady().then(() => {
  registerIpc()
  initTimer()
  initTray()

  timerEvents.on('pre-break-start', () => {
    createPreBreakWindow()
  })
  timerEvents.on('break-start', () => {
    closePreBreakWindow()
    createBreakWindow()
  })
  timerEvents.on('break-end', () => {
    closeBreakWindow()
  })
  timerEvents.on('break-snoozed', () => {
    closePreBreakWindow()
  })
})

// Tray app: keep the process alive when all windows close.
app.on('window-all-closed', (e: Electron.Event) => {
  e.preventDefault()
})

app.on('before-quit', () => {
  destroyAllWindows()
  destroyTray()
})
