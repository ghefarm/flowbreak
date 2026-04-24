# FlowBreak

A gentle break reminder for developers with shoulder, neck, and back issues.

FlowBreak sits quietly in your system tray, nudges you every so often to stand up and move, and gets out of your way the rest of the time. It detects when you step away from the keyboard and doesn't count that time against your break interval (so you get reminded when you actually need it, not after a long lunch).

> **Status:** v0.1 (early and usable). Windows and Linux builds are available; macOS is not yet shipped.

> **Built with AI assistance:** FlowBreak was developed in collaboration with [Claude Code](https://claude.com/claude-code) (Anthropic's AI coding assistant). This is my first public release of an application produced primarily through AI-assisted development, shared as an open experiment in how this way of building software evolves.

---

## Features

### Core (free)

- **Tray-resident timer** with a live countdown in the tooltip.
- **Idle-aware:** if you're away from the keyboard longer than the idle threshold, the countdown pauses — you won't get a break reminder the moment you sit back down.
- **Grace period + snooze:** a corner toast precedes every break with *Start now* and *Snooze* buttons, so you're never yanked out of deep focus.
- **Break window:** fullscreen (taskbar stays accessible), dark, distraction-free. Shows one movement from the built-in library with step-by-step instructions.
- **10-movement library** covering shoulder, neck, upper-back, and chest stretches.
- **Localized UI:** English, Deutsch, العربية (auto-detected from your system).
- **Live settings:** change any value in Settings and it applies immediately — no restart.
- **Single-instance lock:** launching FlowBreak twice focuses the running instance instead of spawning a second tray icon.

### Pro — $4.99, one-time

- **Custom video playback:** paste a YouTube URL in Settings and FlowBreak plays it during the break instead of showing a movement from the library. Handy if you're following a specific physiotherapist's routine on YouTube.

Buy a license at **[mansourtech.org/flowbreak](https://mansourtech.org/flowbreak)** and activate it from the *FlowBreak Pro* section in Settings. One-time purchase, no subscription.

---

## Install

**Windows:** download the installer from the [latest release](https://github.com/ghefarm/flowbreak/releases) and run it. The NSIS installer lets you pick your install directory.

**Linux:** download the `.AppImage` from the [latest release](https://github.com/ghefarm/flowbreak/releases), mark it executable (`chmod +x FlowBreak-Linux-*.AppImage`), and run it — no installation required.

**macOS:** not yet published.

---

## Usage

1. Launch FlowBreak. A clock icon appears in your system tray.
2. Keep working. FlowBreak ticks down in the background and shows a corner toast when a break is due.
3. Accept, snooze, or let the toast run out → the break window takes over for the duration you set.
4. To tweak timings, change the language, or activate Pro, right-click the tray icon → *Settings…*.

### Settings at a glance

All values are applied live; no restart needed.

| Setting | Default | Range | What it does |
|---|---|---|---|
| Break interval | 60 min | 1–240 min | How often you're reminded to break. |
| Break duration | 60 s | 10–600 s | How long the break window stays up. |
| Idle threshold | 10 min | 10–60 min | Countdown pauses after you've been idle this long. |
| Grace period | 5 s | 0–60 s | Heads-up countdown shown before the break opens (0 = skip the toast). |
| Snooze duration | 5 min | 1–60 min | How long *Snooze* postpones the break. |
| Interface language | Auto | en · de · ar | *Auto* follows your OS; anything else overrides. |

### Tray menu

| Item | What it does |
|---|---|
| *Next break in mm:ss* | Status line (disabled). Also shows "Break starting in 0:05…" during the grace period. |
| *Take break now* | Skip the wait and go straight to a break (no grace period). |
| *Pause / Resume* | Stop/resume the countdown. |
| *Reset timer* | Reset to the full interval. |
| *Settings…* | Open the settings window. |
| *Quit FlowBreak* | Shut down the tray process. |

During the grace period the menu changes to offer *Start now* and *Snooze N min* directly, so you can act from the tray if the toast is covered.

---

## Support

- **Bug reports / feature requests:** [open an issue](https://github.com/ghefarm/flowbreak/issues).
- **Licensing, Pro access, or any other inquiry:** **support@mansourtech.org**

---

## License

Proprietary. Source is published for reference and evaluation only — you may not build, modify, redistribute, or reuse any part of this repository without written permission. See [LICENSE](LICENSE) for the full text.

Copyright © 2026 MansourTech. All rights reserved.
