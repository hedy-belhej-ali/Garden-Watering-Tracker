# Garden Watering Tracker

A small React + Vite app for tracking how long you water each tree in your garden — built for my father, who waters dozens of trees by hand.

Instead of guessing whether each tree got its fair share, start the timer when you reach a tree and the app reminds you to move on. Every finished tree is saved to a history you can browse, name, and export.

## Screenshot

<img width="1036" height="837" alt="image" src="https://github.com/user-attachments/assets/e7293f57-fec9-416b-afd6-d6c463453a62" />

## How it works

1. Press **Start watering Tree N** when you reach a tree.
2. The timer runs while you water; the progress bar fills toward your configured minutes-per-tree.
3. A sound and browser notification remind you when the target time is up (any repeats follow your reminder interval).
4. Press **Watering the next tree now** — the tree is recorded, and the timer restarts for the next one.
5. Pause/Resume any time (water pressure drops, phone rings, …). Everything is saved to `localStorage`, so reloading the page never loses your session.

## Features

- **Per-tree timer** — start, pause, resume, and finish each watering session; the countdown is based on your configured minutes-per-tree.
- **Reminder notifications** — a sound plays when you start, then repeats every reminder interval. Browser notifications remind you to move to the next tree.
- **Sound settings** — pick a notification sound (Default, Chime, Bell, Soft notification), toggle alerts on/off, and set the volume.
- **Tree names** — rename each tree in the table inline ("Olive 1", "Lemon tree") instead of the default "Tree N".
- **Watered trees table** — every finished tree is recorded with its name, start time, time taken, and finish time. Delete any entry and the trees are renumbered.
- **Session summary** — live count of trees watered, total session time, and average time per tree.
- **CSV export** — one click to download the watered-trees history as a spreadsheet-ready CSV (opens cleanly in Excel).
- **Installable PWA / offline** — add it to your phone's home screen and use it offline once loaded.
- **Resilient persistence** — timer state and settings are saved to `localStorage` and restored on reload. Corrupt or partial data is safely sanitized on load instead of crashing.

## Tech stack

- **React 19** with hooks — timer math, reminders, and persistence are all custom hooks and pure functions.
- **Vite 8** — instant dev server and optimized production builds.
- **vite-plugin-pwa** — auto-generated manifest + service worker for installability and offline use.
- **Web Audio API** — synthesized alarm sounds (no audio files required).
- **Browser Notifications API** — reminder alerts.
- **Zero runtime dependencies** — only React and React DOM ship to the browser.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:1001` (set in `vite.config.js`).

To try the installable/offline version (service worker, manifest):

```bash
npm run build
npm run preview
```

Installability requires HTTPS (or `localhost`); on a phone, use the deployed GitHub Pages URL.

## Scripts

| Command                        | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `npm run dev`                  | Start the dev server                         |
| `npm run build`                | Build for production (`dist/`)               |
| `npm run preview`              | Preview the production build                 |
| `npm run lint`                 | Run oxlint                                   |
| `node scripts/generate-icons.mjs` | Regenerate the PWA/app PNG icons          |

## Project structure

```
src/
  App.jsx               — app state, timer logic, navigation, table, CSV export
  SettingsModal.jsx     — settings modal (Time, Alert Sound, Notification Sound, Volume)
  FieldBackdrop.jsx     — animated garden backdrop
  icons.jsx             — SVG icon components
  settings.js           — defaults, sound options, persistence + sanitization helpers
  useAlarmSound.js      — Web Audio sound engine
  useNotification.js    — browser notifications
  App.css               — styles
  index.css             — design tokens
scripts/
  generate-icons.mjs    — regenerates the PWA PNG icons (no image dependencies)
public/
  pwa-192.png           — app icon (192px)
  pwa-512.png           — app icon (512px)
  pwa-maskable-512.png  — maskable icon (512px)
  apple-touch-icon.png  — iOS home-screen icon
```

The PWA manifest and service worker are generated at build time by `vite-plugin-pwa`.
