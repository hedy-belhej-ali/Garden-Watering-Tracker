import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { FieldBackdrop } from './FieldBackdrop'
import { CloseIcon, GearIcon, TreeIcon } from './icons'
import SettingsModal from './SettingsModal'
import {
  clamp,
  DEFAULT_SETTINGS,
  loadJSON,
  loadSettings,
  REPETITIONS_MAX,
  REPETITIONS_MIN,
  SETTINGS_KEY,
  STORAGE_KEY,
} from './settings'
import { useAlarmSound } from './useAlarmSound'
import { useNotification } from './useNotification'

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return hours > 0
    ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
    : `${minutes}m ${pad(seconds)}s`
}

function formatRemaining(ms) {
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.ceil(seconds / 60)} min`
}

function formatTimeOfDay(ts) {
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function App() {
  const saved = loadJSON(STORAGE_KEY)
  const [trees, setTrees] = useState(() =>
    [...(saved?.trees || [])].sort(
      (a, b) => (b.completedAt || 0) - (a.completedAt || 0),
    ),
  )
  const [watering, setWatering] = useState(saved?.watering || false)
  const [paused, setPaused] = useState(saved?.paused || false)
  const [accumulatedMs, setAccumulatedMs] = useState(saved?.accumulatedMs || 0)
  const [segmentStart, setSegmentStart] = useState(saved?.segmentStart ?? null)
  const [startedAt, setStartedAt] = useState(saved?.startedAt ?? null)
  const [settings, setSettings] = useState(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (!settingsOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settingsOpen])
  const [now, setNow] = useState(() => Date.now())
  const [alarmCount, setAlarmCount] = useState(0)
  const alarmCountRef = useRef(0)

  const play = useAlarmSound()
  const { requestPermission, notify } = useNotification()

  const playAlarm = useCallback(() => {
    if (!settings.soundEnabled) return
    play(settings.soundType, settings.volume, settings.repetitions)
  }, [settings.soundEnabled, settings.soundType, settings.volume, settings.repetitions, play])

  const currentTreeNumber =
    trees.length > 0 ? Math.max(...trees.map((t) => t.number)) + 1 : 1

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        trees,
        watering,
        paused,
        accumulatedMs,
        segmentStart,
        startedAt,
      }),
    )
  }, [trees, watering, paused, accumulatedMs, segmentStart, startedAt])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  const elapsed = watering
    ? accumulatedMs + (paused || !segmentStart ? 0 : now - segmentStart)
    : 0

  const alarmAfter = settings.minutesPerTree * 60 * 1000
  const alarmRepeat = settings.repeatMinutes * 60 * 1000

  useEffect(() => {
    if (!watering || paused || elapsed < alarmAfter) return
    const nth = Math.floor((elapsed - alarmAfter) / alarmRepeat)
    if (nth >= alarmCountRef.current) {
      alarmCountRef.current = nth + 1
      setAlarmCount(alarmCountRef.current)
      playAlarm()
      notify()
    }
  }, [now, elapsed, watering, paused, alarmAfter, alarmRepeat, playAlarm, notify])

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      let next = value
      if (key === 'minutesPerTree' || key === 'repeatMinutes') {
        const n = Number(value)
        const max = key === 'minutesPerTree' ? 120 : 30
        next = clamp(
          Number.isFinite(n) ? Math.round(n) : DEFAULT_SETTINGS[key],
          1,
          max,
        )
      } else if (key === 'repetitions') {
        const n = Number(value)
        next = clamp(
          Number.isFinite(n) ? Math.round(n) : REPETITIONS_MIN,
          REPETITIONS_MIN,
          REPETITIONS_MAX,
        )
      } else if (key === 'volume') {
        const n = Number(value)
        next = clamp(Number.isFinite(n) ? n : DEFAULT_SETTINGS.volume, 0, 100)
      }
      return { ...prev, [key]: next }
    })
  }

  const startWatering = () => {
    requestPermission()
    play(settings.soundType, settings.volume, settings.repetitions, true)
    alarmCountRef.current = 0
    setAlarmCount(0)
    setAccumulatedMs(0)
    setSegmentStart(Date.now())
    setStartedAt(Date.now())
    setPaused(false)
    setWatering(true)
  }

  const pauseWatering = () => {
    if (!watering || paused) return
    setAccumulatedMs((a) => a + (Date.now() - segmentStart))
    setSegmentStart(null)
    setPaused(true)
  }

  const resumeWatering = () => {
    if (!watering || !paused) return
    setSegmentStart(Date.now())
    setPaused(false)
  }

  const finishWatering = () => {
    if (!watering) return
    const duration =
      accumulatedMs + (paused || !segmentStart ? 0 : Date.now() - segmentStart)
    setTrees((prev) => [
      {
        id: Date.now(),
        number: currentTreeNumber,
        duration,
        startedAt,
        completedAt: Date.now(),
      },
      ...prev,
    ])
    setWatering(false)
    setPaused(false)
    setSegmentStart(null)
    setAccumulatedMs(0)
    setStartedAt(null)
    setAlarmCount(0)
    alarmCountRef.current = 0
  }

  const deleteTree = (id) => {
    setTrees((prev) => {
      const next = prev.filter((t) => t.id !== id)
      return next.map((t, i) => ({ ...t, number: next.length - i }))
    })
  }

  const resetAll = () => {
    setTrees([])
    setWatering(false)
    setPaused(false)
    setSegmentStart(null)
    setAccumulatedMs(0)
    setStartedAt(null)
    setAlarmCount(0)
    alarmCountRef.current = 0
  }

  const minutesIn = Math.floor(elapsed / 60000)
  const remaining = Math.max(0, alarmAfter - elapsed)
  const overdue = Math.max(0, elapsed - alarmAfter)

  return (
    <div className="app">
      <nav className="top-nav">
        <span className="nav-brand">
          <TreeIcon size={28} className="nav-logo" />
          <span className="nav-title">Garden Watering Tracker</span>
        </span>
        <button
          type="button"
          className={`nav-settings-btn ${settingsOpen ? 'nav-settings-active' : ''}`}
          onClick={() => setSettingsOpen((o) => !o)}
          aria-expanded={settingsOpen}
        >
          <GearIcon size={16} />
          <span>Settings</span>
        </button>
      </nav>

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          updateSetting={updateSetting}
          play={play}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <section
        className={`card clock-card ${alarmCount > 0 ? 'card-alert' : ''}`}
      >
        <FieldBackdrop />

        <div className="clock-inner">
          <div className="clock-panel">
            <div
              className={`tree-icon-wrap ${watering ? 'tree-icon-active' : ''}`}
            >
              <TreeIcon size={76} />
            </div>

            <div className="tree-label">
              {watering ? (
                <>
                  Watering <strong>Tree {currentTreeNumber}</strong>
                </>
              ) : (
                <>
                  Ready for <strong>Tree {currentTreeNumber}</strong>
                </>
              )}
            </div>

            <div className={`clock ${alarmCount > 0 ? 'clock-alert' : ''}`}>
              {formatClock(elapsed)}
            </div>

            <div className="progress" aria-hidden="true">
              <div
                className={`progress-fill ${elapsed >= alarmAfter ? 'progress-overdue' : ''}`}
                style={{
                  width: `${Math.min(100, (elapsed / alarmAfter) * 100)}%`,
                }}
              />
            </div>

            <div className="status-line">
              {!watering && (
                <span className="status status-idle">
                  Timer ready · {settings.minutesPerTree} min per tree
                </span>
              )}
              {watering && paused && (
                <span className="status status-paused">Paused</span>
              )}
              {watering && !paused && elapsed < alarmAfter && (
                <span className="status status-watering">
                  {minutesIn} min in — reminder in{' '}
                  {formatRemaining(remaining)}
                </span>
              )}
              {watering && !paused && elapsed >= alarmAfter && (
                <span className="status status-overdue">
                  {formatTime(overdue)} overdue — move to the next tree!
                </span>
              )}
            </div>
          </div>

          <div className="controls">
            {!watering ? (
              <button className="btn btn-start" onClick={startWatering}>
                Start watering Tree {currentTreeNumber}
              </button>
            ) : (
              <>
                {paused ? (
                  <button className="btn btn-resume" onClick={resumeWatering}>
                    Resume
                  </button>
                ) : (
                  <button className="btn btn-pause" onClick={pauseWatering}>
                    Pause
                  </button>
                )}
                <button className="btn btn-done" onClick={finishWatering}>
                  Watering the next tree now
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="table-head">
          <h2>Watered trees</h2>
          <div className="table-tools">
            {trees.length > 0 && (
              <span className="count-badge">
                {trees.length} {trees.length === 1 ? 'tree' : 'trees'} watered
              </span>
            )}
            {trees.length > 0 && (
              <button className="btn btn-ghost btn-reset" onClick={resetAll}>
                Reset all
              </button>
            )}
          </div>
        </div>

        {trees.length === 0 ? (
          <p className="empty">
            No trees watered yet. The ones you finish will show up here.
          </p>
        ) : (
          <table className="tree-table">
            <thead>
              <tr>
                <th>Tree</th>
                <th>Started at</th>
                <th>Time taken</th>
                <th>Finished at</th>
                <th className="col-actions">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {trees.map((tree) => (
                <tr key={tree.id}>
                  <td className="tree-cell">
                    <TreeIcon size={20} />
                    <span className="tree-name">Tree {tree.number}</span>
                  </td>
                  <td>{tree.startedAt ? formatTimeOfDay(tree.startedAt) : '—'}</td>
                  <td>{formatTime(tree.duration)}</td>
                  <td>{formatTimeOfDay(tree.completedAt)}</td>
                  <td className="tree-actions">
                    <button
                      type="button"
                      className="tree-delete"
                      onClick={() => deleteTree(tree.id)}
                      aria-label={`Delete tree ${tree.number}`}
                    >
                      <CloseIcon size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="footer">
        <TreeIcon size={20} />
        <span>
          <strong>{trees.length}</strong>{' '}
          {trees.length === 1 ? 'tree' : 'trees'} watered · every sip counts
        </span>
      </footer>
    </div>
  )
}

export default App
