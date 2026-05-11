export const en: Record<string, string> = {
  'app.name': 'FlowBreak',

  // Settings window
  'settings.title': 'FlowBreak Settings',
  'settings.save.saving': 'Saving…',
  'settings.save.saved': 'Saved',
  'settings.section.language': 'Language',
  'settings.section.timing': 'Timing',
  'settings.section.graceSnooze': 'Grace & snooze',
  'settings.section.video': 'Custom break video',
  'settings.section.support': 'Support FlowBreak',
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

  'settings.video.label': 'Custom YouTube URL',
  'settings.video.help.valid': 'Plays instead of a movement from the library during breaks. Leave empty to use the bundled movements.',
  'settings.video.help.invalid': 'Not a recognizable YouTube URL — breaks will fall back to the movement library.',

  'settings.support.body': 'FlowBreak is free and open source. If it helps you, a small donation keeps it going.',
  'settings.support.donateBtn': 'Donate',

  'settings.library.count': '{{count}} movements bundled with FlowBreak.',

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
}
