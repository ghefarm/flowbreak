import { useEffect, useState } from 'react'
import { MOVEMENTS } from '../shared/movements'
import { translate, SUPPORTED_LOCALES, isRTL, type Locale, type LocaleSetting } from '../shared/i18n'
import './settings.css'

type Settings = {
  intervalMinutes: number
  breakDurationSeconds: number
  idleThresholdMinutes: number
  graceSeconds: number
  snoozeMinutes: number
  customVideoUrl: string
  locale: LocaleSetting
}

type SaveState = 'idle' | 'saving' | 'saved'

function isValidYoutubeUrl(url: string): boolean {
  if (!url) return true
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be' && u.pathname.length > 1) return true
    if (u.hostname.endsWith('youtube.com')) {
      if (u.pathname === '/watch' && u.searchParams.get('v')) return true
      if (u.pathname.startsWith('/embed/')) return true
    }
    return false
  } catch {
    return false
  }
}

export function SettingsWindow() {
  const initialLocale = window.flowbreak.i18n.locale
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  useEffect(() => {
    void window.flowbreak.settings.get().then(setSettings)
  }, [])

  if (!settings) {
    const t = (k: string) => translate(initialLocale, k)
    return <div className="settings-root"><p>{t('settings.save.saving')}</p></div>
  }

  const activeLocale: Locale = settings.locale === 'auto' ? initialLocale : settings.locale
  const t = (key: string, params?: Record<string, string | number>) => translate(activeLocale, key, params)

  const urlValid = isValidYoutubeUrl(settings.customVideoUrl)

  async function save(patch: Partial<Settings>) {
    setSaveState('saving')
    const next = await window.flowbreak.settings.update(patch)
    setSettings(next)
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 1200)
  }

  async function changeLocale(next: LocaleSetting) {
    await window.flowbreak.settings.update({ locale: next })
    window.location.reload()
  }

  return (
    <div className="settings-root" data-rtl={isRTL(activeLocale) ? 'true' : undefined}>
      <header className="settings-header">
        <h1>{t('settings.title')}</h1>
        <span className={`save-indicator save-${saveState}`}>
          {saveState === 'saving' ? t('settings.save.saving') : saveState === 'saved' ? t('settings.save.saved') : ''}
        </span>
      </header>

      <section className="settings-section">
        <h2>{t('settings.section.language')}</h2>
        <label className="settings-field">
          <span>{t('settings.language.label')}</span>
          <div className="field-control">
            <select
              value={settings.locale}
              onChange={(e) => void changeLocale(e.target.value as LocaleSetting)}
            >
              <option value="auto">{t('settings.language.option.auto')}</option>
              {SUPPORTED_LOCALES.map((l) => (
                <option key={l} value={l}>{t(`settings.language.option.${l}`)}</option>
              ))}
            </select>
          </div>
          <small>{t('settings.language.help')}</small>
        </label>
      </section>

      <section className="settings-section">
        <h2>{t('settings.section.timing')}</h2>

        <label className="settings-field">
          <span>{t('settings.field.interval.label')}</span>
          <div className="field-control">
            <input
              type="number"
              min={1}
              max={240}
              value={settings.intervalMinutes}
              onChange={(e) => save({ intervalMinutes: Number(e.target.value) })}
            />
            <span className="unit">{t('settings.unit.minutes')}</span>
          </div>
          <small>{t('settings.field.interval.help')}</small>
        </label>

        <label className="settings-field">
          <span>{t('settings.field.breakDuration.label')}</span>
          <div className="field-control">
            <input
              type="number"
              min={10}
              max={600}
              value={settings.breakDurationSeconds}
              onChange={(e) => save({ breakDurationSeconds: Number(e.target.value) })}
            />
            <span className="unit">{t('settings.unit.seconds')}</span>
          </div>
          <small>{t('settings.field.breakDuration.help')}</small>
        </label>

        <label className="settings-field">
          <span>{t('settings.field.idleThreshold.label')}</span>
          <div className="field-control">
            <input
              type="number"
              min={10}
              max={60}
              value={settings.idleThresholdMinutes}
              onChange={(e) => save({ idleThresholdMinutes: Number(e.target.value) })}
            />
            <span className="unit">{t('settings.unit.minutes')}</span>
          </div>
          <small>{t('settings.field.idleThreshold.help')}</small>
        </label>
      </section>

      <section className="settings-section">
        <h2>{t('settings.section.graceSnooze')}</h2>

        <label className="settings-field">
          <span>{t('settings.field.grace.label')}</span>
          <div className="field-control">
            <input
              type="number"
              min={0}
              max={60}
              value={settings.graceSeconds}
              onChange={(e) => save({ graceSeconds: Number(e.target.value) })}
            />
            <span className="unit">{t('settings.unit.seconds')}</span>
          </div>
          <small>{t('settings.field.grace.help')}</small>
        </label>

        <label className="settings-field">
          <span>{t('settings.field.snooze.label')}</span>
          <div className="field-control">
            <input
              type="number"
              min={1}
              max={60}
              value={settings.snoozeMinutes}
              onChange={(e) => save({ snoozeMinutes: Number(e.target.value) })}
            />
            <span className="unit">{t('settings.unit.minutes')}</span>
          </div>
          <small>{t('settings.field.snooze.help')}</small>
        </label>
      </section>

      <section className="settings-section">
        <h2>{t('settings.section.video')}</h2>
        <label className="settings-field">
          <span>{t('settings.video.label')}</span>
          <div className="field-control">
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=…"
              value={settings.customVideoUrl}
              onChange={(e) => save({ customVideoUrl: e.target.value })}
              className={urlValid ? '' : 'invalid'}
            />
          </div>
          <small>{urlValid ? t('settings.video.help.valid') : t('settings.video.help.invalid')}</small>
        </label>
      </section>

      <section className="settings-section">
        <h2>{t('settings.section.support')}</h2>
        <p className="support-body">{t('settings.support.body')}</p>
        <button
          type="button"
          className="donate-btn"
          onClick={() => window.flowbreak.donate.open()}
        >
          {t('settings.support.donateBtn')}
        </button>
      </section>

      <section className="settings-section">
        <h2>{t('settings.section.library')}</h2>
        <p className="library-meta">{t('settings.library.count', { count: MOVEMENTS.length })}</p>
        <ul className="library-list">
          {MOVEMENTS.map((m) => (
            <li key={m.id}>
              <span className="library-name">{m.name}</span>
              <span className="library-focus">{m.focus.replace('-', ' ')}</span>
              <span className="library-duration">{m.durationSeconds}s</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
