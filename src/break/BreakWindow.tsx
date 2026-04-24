import { useEffect, useMemo, useState } from 'react'
import { MOVEMENTS, pickMovement, type Movement } from '../shared/movements'
import { translate } from '../shared/i18n'

const locale = window.flowbreak.i18n.locale
const t = (key: string, params?: Record<string, string | number>) => translate(locale, key, params)

type Settings = {
  intervalMinutes: number
  breakDurationSeconds: number
  idleThresholdMinutes: number
  proEnabled: boolean
  customVideoUrl: string
}

function formatMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60).toString().padStart(1, '0')
  const s = (total % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function toYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
    }
    if (u.hostname.endsWith('youtube.com')) {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
      }
      if (u.pathname.startsWith('/embed/')) return url
    }
    return null
  } catch {
    return null
  }
}

export function BreakWindow() {
  const [remainingMs, setRemainingMs] = useState<number>(0)
  const [settings, setSettings] = useState<Settings | null>(null)
  const movement: Movement = useMemo(() => pickMovement(), [])

  useEffect(() => {
    void window.flowbreak.settings.get().then(setSettings)
    void window.flowbreak.timer.getState().then((s) => {
      setRemainingMs(s.breakRemainingMs || s.breakDurationMs)
    })
    const offTick = window.flowbreak.timer.onTick((s) => {
      if (s.onBreak) setRemainingMs(s.breakRemainingMs)
    })
    return () => offTick()
  }, [])

  const videoEmbed = settings?.proEnabled && settings.customVideoUrl
    ? toYoutubeEmbed(settings.customVideoUrl)
    : null

  return (
    <div className="break-root">
      <div className="break-countdown">{formatMs(remainingMs)}</div>

      {videoEmbed ? (
        <>
          <p className="break-focus">{t('break.yourMovement')}<span className="break-pro-badge">{t('settings.pro.badge')}</span></p>
          <iframe
            className="break-video"
            src={videoEmbed}
            title={t('break.iframeTitle')}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </>
      ) : (
        <>
          <p className="break-focus">{t('break.focusWithCount', { focus: movement.focus.replace('-', ' '), count: MOVEMENTS.length })}</p>
          <h1 className="break-title">{movement.name}</h1>
          <div className="break-movement">
            {movement.videoUrl && (
              <video
                className="break-movement-video"
                src={movement.videoUrl}
                autoPlay
                loop
                muted
                playsInline
              />
            )}
            <ol className="break-steps">
              {movement.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </>
      )}

      <button
        className="break-skip"
        onClick={() => window.flowbreak.timer.endBreakNow()}
      >
        {t('break.skip')}
      </button>
    </div>
  )
}
