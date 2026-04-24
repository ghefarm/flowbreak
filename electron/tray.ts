import { app, Menu, Tray, nativeImage } from 'electron'
import path from 'node:path'
import {
  formatRemaining,
  getState,
  pause,
  reset,
  resume,
  snooze,
  startBreakImmediately,
  takeBreakNow,
  timerEvents,
} from './timer'
import { store } from './store'
import { t } from './i18n'
import { createSettingsWindow } from './windows'

let tray: Tray | null = null

function iconPath(): string {
  const base = process.env.VITE_PUBLIC ?? ''
  return path.join(base, 'tray-icon.png')
}

function buildMenu(): Menu {
  const s = getState()

  let statusLabel: string
  if (s.onBreak) {
    statusLabel = t('tray.status.onBreak', { time: formatRemaining(s.breakRemainingMs) })
  } else if (s.onPreBreak) {
    statusLabel = t('tray.status.preBreak', { time: formatRemaining(s.preBreakRemainingMs) })
  } else if (s.paused) {
    statusLabel = t('tray.status.nextBreakPaused', { time: formatRemaining(s.remainingMs) })
  } else {
    statusLabel = t('tray.status.nextBreak', { time: formatRemaining(s.remainingMs) })
  }

  const items: Electron.MenuItemConstructorOptions[] = [
    { label: statusLabel, enabled: false },
    { type: 'separator' },
  ]

  if (s.onPreBreak) {
    items.push(
      { label: t('tray.menu.startNow'), click: () => startBreakImmediately() },
      { label: t('tray.menu.snooze', { minutes: store.get('snoozeMinutes') }), click: () => snooze() },
    )
  } else {
    items.push(
      { label: t('tray.menu.takeBreakNow'), click: () => takeBreakNow(), enabled: !s.onBreak },
      s.paused
        ? { label: t('tray.menu.resume'), click: () => resume() }
        : { label: t('tray.menu.pause'), click: () => pause(), enabled: !s.onBreak },
      { label: t('tray.menu.reset'), click: () => reset() },
    )
  }

  items.push(
    { type: 'separator' },
    { label: t('tray.menu.settings'), click: () => { createSettingsWindow() } },
    { type: 'separator' },
    { label: t('tray.menu.quit'), click: () => { app.quit() } },
  )

  return Menu.buildFromTemplate(items)
}

function updateTooltip(): void {
  if (!tray) return
  const s = getState()
  if (s.onBreak) {
    tray.setToolTip(t('tray.tooltip.onBreak', { time: formatRemaining(s.breakRemainingMs) }))
  } else if (s.onPreBreak) {
    tray.setToolTip(t('tray.tooltip.preBreak', { time: formatRemaining(s.preBreakRemainingMs) }))
  } else if (s.paused) {
    tray.setToolTip(t('tray.tooltip.countingPaused', { time: formatRemaining(s.remainingMs) }))
  } else {
    tray.setToolTip(t('tray.tooltip.counting', { time: formatRemaining(s.remainingMs) }))
  }
}

export function initTray(): void {
  const img = nativeImage.createFromPath(iconPath())
  tray = new Tray(img.isEmpty() ? nativeImage.createEmpty() : img)
  tray.setContextMenu(buildMenu())
  updateTooltip()

  tray.on('click', () => {
    tray?.popUpContextMenu()
  })

  const refresh = () => {
    updateTooltip()
    tray?.setContextMenu(buildMenu())
  }
  timerEvents.on('tick', refresh)
  timerEvents.on('pre-break-start', refresh)
  timerEvents.on('break-start', refresh)
  timerEvents.on('break-end', refresh)
  timerEvents.on('break-snoozed', refresh)
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
