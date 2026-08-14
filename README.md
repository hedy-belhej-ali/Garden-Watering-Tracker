<img width="1320" height="870" alt="image" src="https://github.com/user-attachments/assets/e669743c-3fa3-45f1-a9a9-20297669dba6" /># Garden Watering Tracker

A small React + Vite timer app for tracking how long you spend watering each tree in your garden (for my father).
<img width="1320" height="870" alt="image" src="https://github.com/user-attachments/assets/1e3dae3b-61bf-410c-9da7-b81df741d592" />
## Features

- **Per-tree timer** — start, pause, resume, and finish each watering session. The countdown is based on your configured minutes-per-tree.
- **Reminder notifications** — a sound plays once when you start, and then repeats (per your settings) every reminder interval. Browser notifications remind you to move to the next tree.
- **Sound settings** — pick a notification sound (Default, Chime, Bell, Soft notification), enable/disable alerts, and set the volume.
- **Watered trees table** — every finished tree is recorded with its start time, time taken, and finish time. Delete any entry and the trees are renumbered.
- **Everything persists** — timer state and settings are saved to `localStorage` and restored on reload.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:1001` (set in `vite.config.js`).

## Scripts

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `npm run dev`    | Start the dev server           |
| `npm run build`  | Build for production (`dist/`) |
| `npm run preview`| Preview the production build   |
| `npm run lint`   | Run oxlint                     |

## Project structure

```
src/
  App.jsx            — app state, timer logic, navigation, table
  SettingsModal.jsx  — settings modal (Time, Alert Sound, Notification Sound, Volume)
  FieldBackdrop.jsx  — animated garden backdrop
  icons.jsx          — SVG icon components
  settings.js        — defaults, sound options, persistence helpers
  useAlarmSound.js   — Web Audio sound engine
  useNotification.js — browser notifications
  App.css            — styles
  index.css          — design tokens
```
