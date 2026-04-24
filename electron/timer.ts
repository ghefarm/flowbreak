import { EventEmitter } from 'node:events'
import { powerMonitor } from 'electron'
import { store } from './store'

export type TimerState = {
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

type TimerEvents = {
  tick: (state: TimerState) => void
  'pre-break-start': () => void
  'break-start': () => void
  'break-end': () => void
  'break-snoozed': () => void
}

class TypedEmitter extends EventEmitter {
  declare on: <K extends keyof TimerEvents>(event: K, listener: TimerEvents[K]) => this
  declare emit: <K extends keyof TimerEvents>(event: K, ...args: Parameters<TimerEvents[K]>) => boolean
}

export const timerEvents = new TypedEmitter()

const TICK_MS = 1000
// A gap between ticks longer than this means the system was asleep,
// hibernated, or the process was frozen. Treat it as an effective break.
const LONG_ABSENCE_MS = 60_000

let remainingMs = 0
let preBreakRemainingMs = 0
let breakRemainingMs = 0
let paused = false
let onPreBreak = false
let onBreak = false
let tickHandle: NodeJS.Timeout | null = null
let lastTickAt: number | null = null

function intervalMs(): number { return store.get('intervalMinutes') * 60 * 1000 }
function breakDurationMs(): number { return store.get('breakDurationSeconds') * 1000 }
function preBreakDurationMs(): number { return store.get('graceSeconds') * 1000 }
function snoozeMs(): number { return store.get('snoozeMinutes') * 60 * 1000 }

export function getState(): TimerState {
  return {
    remainingMs,
    intervalMs: intervalMs(),
    preBreakRemainingMs,
    preBreakDurationMs: preBreakDurationMs(),
    breakRemainingMs,
    breakDurationMs: breakDurationMs(),
    paused,
    onPreBreak,
    onBreak,
    idleSec: powerMonitor.getSystemIdleTime(),
  }
}

export function initTimer(): void {
  remainingMs = intervalMs()
  preBreakRemainingMs = 0
  breakRemainingMs = 0
  lastTickAt = Date.now()
  if (tickHandle) clearInterval(tickHandle)
  tickHandle = setInterval(tick, TICK_MS)
}

function tick(): void {
  const now = Date.now()
  const elapsed = lastTickAt !== null ? now - lastTickAt : TICK_MS
  lastTickAt = now

  if (elapsed > LONG_ABSENCE_MS) {
    if (onBreak) {
      endBreak()
    } else if (onPreBreak) {
      onPreBreak = false
      preBreakRemainingMs = 0
      remainingMs = intervalMs()
      timerEvents.emit('break-snoozed')
      timerEvents.emit('tick', getState())
    } else {
      reset()
    }
    return
  }

  if (onPreBreak) {
    preBreakRemainingMs -= elapsed
    if (preBreakRemainingMs <= 0) {
      startBreak()
      return
    }
    timerEvents.emit('tick', getState())
    return
  }

  if (onBreak) {
    breakRemainingMs -= elapsed
    if (breakRemainingMs <= 0) {
      endBreak()
      return
    }
    timerEvents.emit('tick', getState())
    return
  }

  if (paused) return

  const idleSec = powerMonitor.getSystemIdleTime()
  const thresholdSec = store.get('idleThresholdMinutes') * 60
  if (idleSec >= thresholdSec) {
    timerEvents.emit('tick', getState())
    return
  }

  remainingMs -= elapsed
  if (remainingMs <= 0) {
    remainingMs = 0
    startPreBreak()
    return
  }
  timerEvents.emit('tick', getState())
}

function startPreBreak(): void {
  const dur = preBreakDurationMs()
  if (dur <= 0) {
    startBreak()
    return
  }
  onPreBreak = true
  preBreakRemainingMs = dur
  timerEvents.emit('pre-break-start')
  timerEvents.emit('tick', getState())
}

function startBreak(): void {
  onPreBreak = false
  onBreak = true
  preBreakRemainingMs = 0
  breakRemainingMs = breakDurationMs()
  timerEvents.emit('break-start')
  timerEvents.emit('tick', getState())
}

function endBreak(): void {
  onBreak = false
  breakRemainingMs = 0
  remainingMs = intervalMs()
  timerEvents.emit('break-end')
  timerEvents.emit('tick', getState())
}

export function pause(): void {
  if (onPreBreak || onBreak) return
  paused = true
  timerEvents.emit('tick', getState())
}

export function resume(): void {
  paused = false
  timerEvents.emit('tick', getState())
}

export function reset(): void {
  remainingMs = intervalMs()
  preBreakRemainingMs = 0
  breakRemainingMs = 0
  onPreBreak = false
  onBreak = false
  timerEvents.emit('tick', getState())
}

export function takeBreakNow(): void {
  // User explicitly asked for a break — skip the grace period.
  if (!onBreak) startBreak()
}

export function startBreakImmediately(): void {
  // Called from the pre-break toast's "Start now" button.
  if (onPreBreak) startBreak()
}

export function snooze(): void {
  if (!onPreBreak) return
  onPreBreak = false
  preBreakRemainingMs = 0
  remainingMs = snoozeMs()
  timerEvents.emit('break-snoozed')
  timerEvents.emit('tick', getState())
}

export function endBreakNow(): void {
  if (onBreak) endBreak()
}

export function onSettingsChanged(): void {
  // Don't touch remainingMs — it may have been deliberately set by snooze.
  // Interval changes take effect on the next cycle; use "Reset timer" to apply immediately.
  timerEvents.emit('tick', getState())
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60).toString().padStart(2, '0')
  const s = (total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
