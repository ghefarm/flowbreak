import { useEffect, useState } from 'react'
import { translate } from '../shared/i18n'

const locale = window.flowbreak.i18n.locale
const t = (key: string, params?: Record<string, string | number>) => translate(locale, key, params)

function formatMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60).toString().padStart(1, '0')
  const s = (total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function PreBreakToast() {
  const [remainingMs, setRemainingMs] = useState<number>(0)
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(5)

  useEffect(() => {
    void window.flowbreak.settings.get().then((s) => setSnoozeMinutes(s.snoozeMinutes))
    void window.flowbreak.timer.getState().then((s) => {
      setRemainingMs(s.preBreakRemainingMs || s.preBreakDurationMs)
    })
    const offTick = window.flowbreak.timer.onTick((s) => {
      if (s.onPreBreak) setRemainingMs(s.preBreakRemainingMs)
    })
    return () => offTick()
  }, [])

  return (
    <div className="toast-root">
      <div className="toast-header">
        <span className="toast-dot" />
        <span className="toast-title">{t('prebreak.title')}</span>
        <span className="toast-countdown">{formatMs(remainingMs)}</span>
      </div>
      <p className="toast-body">{t('prebreak.body')}</p>
      <div className="toast-actions">
        <button
          className="toast-btn toast-btn-primary"
          onClick={() => window.flowbreak.timer.startBreakImmediately()}
        >
          {t('prebreak.startNow')}
        </button>
        <button
          className="toast-btn"
          onClick={() => window.flowbreak.timer.snooze()}
        >
          {t('prebreak.snooze', { minutes: snoozeMinutes })}
        </button>
      </div>
    </div>
  )
}
