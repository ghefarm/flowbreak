export const en: Record<string, string> = {
  'app.name': 'FlowBreak',

  // Settings window
  'settings.title': 'FlowBreak Settings',
  'settings.save.saving': 'Saving…',
  'settings.save.saved': 'Saved',
  'settings.section.language': 'Language',
  'settings.section.timing': 'Timing',
  'settings.section.graceSnooze': 'Grace & snooze',
  'settings.section.pro': 'FlowBreak Pro',
  'settings.section.library': 'Movement library',

  'settings.language.label': 'Interface language',
  'settings.language.help': 'Applied immediately. The break and toast windows pick up changes the next time they open.',
  'settings.language.option.auto': 'Auto (system)',
  'settings.language.option.en': 'English',
  'settings.language.option.de': 'Deutsch',
  'settings.language.option.ar': 'العربية',

  'settings.field.interval.label': 'Break interval',
  'settings.field.interval.help': 'How often you want a break reminder.',
  'settings.field.breakDuration.label': 'Break duration',
  'settings.field.breakDuration.help': 'How long the break window stays up.',
  'settings.field.idleThreshold.label': 'Idle threshold',
  'settings.field.idleThreshold.help': 'Stop counting down when you’ve been away from your keyboard this long — you’re probably already on a break.',
  'settings.field.grace.label': 'Grace period',
  'settings.field.grace.help': 'Heads-up countdown shown in a corner toast before the break opens. Set to 0 to jump straight into the break.',
  'settings.field.snooze.label': 'Snooze duration',
  'settings.field.snooze.help': 'How long “Snooze” delays the next break.',

  'settings.unit.minutes': 'minutes',
  'settings.unit.seconds': 'seconds',

  'settings.pro.badge': 'Pro',
  'settings.pro.statusActive': 'Active',
  'settings.pro.activatedOn': 'Activated {{date}}. Thanks for supporting FlowBreak.',
  'settings.pro.deactivate': 'Deactivate on this device',
  'settings.pro.intro': 'Unlock custom YouTube video playback during breaks — $4.99, one-time.',
  'settings.pro.buyBtn': 'Buy Pro — $4.99',
  'settings.pro.buyHelp': 'Opens mansourtech.org/flowbreak in your browser.',
  'settings.pro.alreadyHaveKey': 'Already have a license key?',
  'settings.pro.keyPlaceholder': 'Paste your license key here',
  'settings.pro.activate': 'Activate',
  'settings.pro.activating': 'Activating…',
  'settings.pro.youtubeLabel': 'Custom YouTube URL',
  'settings.pro.youtubeHelp.locked': 'Activate Pro to play your own YouTube video during breaks.',
  'settings.pro.youtubeHelp.valid': 'Plays instead of a movement from the library during breaks.',
  'settings.pro.youtubeHelp.invalid': 'Not a recognizable YouTube URL — breaks will fall back to the movement library.',

  'settings.library.count': '{{count}} movements bundled with the free version.',

  // Break window
  'break.yourMovement': 'Your movement',
  'break.iframeTitle': 'Break movement',
  'break.focusWithCount': '{{focus}} · {{count}} movements in library',
  'break.skip': 'Skip break',

  // Pre-break toast
  'prebreak.title': 'Break starting',
  'prebreak.body': 'Stand up and move. It’ll take a minute.',
  'prebreak.startNow': 'Start now',
  'prebreak.snooze': 'Snooze {{minutes}} min',

  // Tray menu + tooltip
  'tray.status.nextBreak': 'Next break in {{time}}',
  'tray.status.nextBreakPaused': 'Next break in {{time}} (paused)',
  'tray.status.onBreak': 'On break — {{time}} left',
  'tray.status.preBreak': 'Break starting in {{time}}…',
  'tray.menu.startNow': 'Start now',
  'tray.menu.snooze': 'Snooze {{minutes}} min',
  'tray.menu.takeBreakNow': 'Take break now',
  'tray.menu.pause': 'Pause',
  'tray.menu.resume': 'Resume',
  'tray.menu.reset': 'Reset timer',
  'tray.menu.settings': 'Settings…',
  'tray.menu.quit': 'Quit FlowBreak',
  'tray.tooltip.onBreak': 'FlowBreak — on break ({{time}} left)',
  'tray.tooltip.preBreak': 'FlowBreak — break starting in {{time}}',
  'tray.tooltip.counting': 'FlowBreak — {{time}} until next break',
  'tray.tooltip.countingPaused': 'FlowBreak — paused, {{time}} until next break',

  // License errors (returned from main process)
  'license.error.empty': 'Enter a license key.',
  'license.error.invalid': 'This license key is invalid or not for FlowBreak Pro.',
}
