import { BrowserWindow, screen } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(process.env.APP_ROOT ?? '', 'dist')

function preloadPath(): string {
  return path.join(__dirname, 'preload.js')
}

function loadPage(win: BrowserWindow, page: 'index' | 'break' | 'prebreak'): void {
  const file = page === 'index' ? 'index.html' : page === 'break' ? 'break.html' : 'prebreak.html'
  if (VITE_DEV_SERVER_URL) {
    const url = new URL(file, VITE_DEV_SERVER_URL.endsWith('/') ? VITE_DEV_SERVER_URL : `${VITE_DEV_SERVER_URL}/`).href
    void win.loadURL(url)
  } else {
    void win.loadFile(path.join(RENDERER_DIST, file))
  }
}

let breakWin: BrowserWindow | null = null
let preBreakWin: BrowserWindow | null = null

const TOAST_WIDTH = 380
const TOAST_HEIGHT = 170
const TOAST_MARGIN = 20

export function createPreBreakWindow(): BrowserWindow {
  if (preBreakWin && !preBreakWin.isDestroyed()) {
    preBreakWin.showInactive()
    return preBreakWin
  }

  const display = screen.getPrimaryDisplay()
  const { x, y, width, height } = display.workArea

  preBreakWin = new BrowserWindow({
    width: TOAST_WIDTH,
    height: TOAST_HEIGHT,
    x: x + width - TOAST_WIDTH - TOAST_MARGIN,
    y: y + height - TOAST_HEIGHT - TOAST_MARGIN,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    backgroundColor: '#0b1220',
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  preBreakWin.setAlwaysOnTop(true, 'screen-saver')
  preBreakWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  preBreakWin.once('ready-to-show', () => preBreakWin?.showInactive())
  preBreakWin.on('closed', () => { preBreakWin = null })

  loadPage(preBreakWin, 'prebreak')
  return preBreakWin
}

export function closePreBreakWindow(): void {
  if (preBreakWin && !preBreakWin.isDestroyed()) {
    preBreakWin.close()
    preBreakWin = null
  }
}
let settingsWin: BrowserWindow | null = null

export function createSettingsWindow(): BrowserWindow {
  if (settingsWin && !settingsWin.isDestroyed()) {
    if (settingsWin.isMinimized()) settingsWin.restore()
    settingsWin.focus()
    return settingsWin
  }

  settingsWin = new BrowserWindow({
    width: 720,
    height: 720,
    minWidth: 560,
    minHeight: 520,
    title: 'FlowBreak Settings',
    show: false,
    backgroundColor: '#141923',
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  settingsWin.setMenuBarVisibility(false)
  settingsWin.once('ready-to-show', () => settingsWin?.show())
  settingsWin.on('closed', () => { settingsWin = null })

  loadPage(settingsWin, 'index')
  return settingsWin
}

export function createBreakWindow(): BrowserWindow {
  if (breakWin && !breakWin.isDestroyed()) {
    breakWin.focus()
    return breakWin
  }

  const display = screen.getPrimaryDisplay()
  const { width, height } = display.workAreaSize

  breakWin = new BrowserWindow({
    width,
    height,
    x: display.workArea.x,
    y: display.workArea.y,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    closable: false,
    show: false,
    backgroundColor: '#0b1220',
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  breakWin.setAlwaysOnTop(true, 'screen-saver')
  breakWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  breakWin.once('ready-to-show', () => breakWin?.show())
  breakWin.on('closed', () => { breakWin = null })

  loadPage(breakWin, 'break')
  return breakWin
}

export function closeBreakWindow(): void {
  if (breakWin && !breakWin.isDestroyed()) {
    breakWin.setClosable(true)
    breakWin.close()
    breakWin = null
  }
}

export function destroyAllWindows(): void {
  closeBreakWindow()
  closePreBreakWindow()
  if (settingsWin && !settingsWin.isDestroyed()) settingsWin.destroy()
  settingsWin = null
}
