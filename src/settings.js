export const DEFAULT_SETTINGS = {
  minutesPerTree: 15,
  repeatMinutes: 3,
  soundEnabled: true,
  soundType: 'default',
  repetitions: 2,
  volume: 70,
}

export const SOUND_TYPES = [
  { value: 'default', label: 'Default sound' },
  { value: 'chime', label: 'Chime' },
  { value: 'bell', label: 'Bell' },
  { value: 'soft', label: 'Soft notification' },
]

export const SOUND_REPEATS = { default: null, chime: 3, bell: 4, soft: 4 }

export const REPETITIONS_MIN = 1
export const REPETITIONS_MAX = 10

export const STORAGE_KEY = 'tree-watering-state'
export const SETTINGS_KEY = 'tree-watering-settings'

const MAX_TREES = 500
const MAX_NAME_LENGTH = 60

export function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

export function createId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    // fall back below
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function num(v, fallback) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function optionalTimestamp(v) {
  if (v == null) return null
  return Math.max(0, num(v, 0))
}

function sanitizeTree(t) {
  if (!t || typeof t !== 'object') return null
  return {
    id: typeof t.id === 'string' && t.id ? t.id : createId(),
    number: Math.max(1, Math.round(num(t.number, 1))),
    duration: Math.max(0, num(t.duration, 0)),
    startedAt: optionalTimestamp(t.startedAt),
    completedAt: optionalTimestamp(t.completedAt),
    name: typeof t.name === 'string' ? t.name.trim().slice(0, MAX_NAME_LENGTH) : '',
  }
}

function sanitizeState(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const trees = Array.isArray(source.trees)
    ? source.trees
        .slice(0, MAX_TREES)
        .map(sanitizeTree)
        .filter(Boolean)
    : []
  return {
    trees,
    watering: source.watering === true,
    paused: source.paused === true,
    accumulatedMs: Math.max(0, num(source.accumulatedMs, 0)),
    segmentStart: source.segmentStart == null ? null : Math.max(0, num(source.segmentStart, 0)),
    startedAt: source.startedAt == null ? null : Math.max(0, num(source.startedAt, 0)),
  }
}

// Safe parse + schema validation. Corrupt or partial localStorage
// falls back to sane defaults instead of crashing on load.
export function loadState(key = STORAGE_KEY) {
  return sanitizeState(loadJSON(key))
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

export function loadSettings() {
  const stored = loadJSON(SETTINGS_KEY) || {}
  const num = (v, fallback, min, max) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return fallback
    return clamp(n, min, max)
  }
  const soundType = SOUND_TYPES.some((t) => t.value === stored.soundType)
    ? stored.soundType
    : DEFAULT_SETTINGS.soundType
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    soundType,
    minutesPerTree: num(stored.minutesPerTree, DEFAULT_SETTINGS.minutesPerTree, 1, 120),
    repeatMinutes: num(stored.repeatMinutes, DEFAULT_SETTINGS.repeatMinutes, 1, 30),
    repetitions: num(stored.repetitions, DEFAULT_SETTINGS.repetitions, REPETITIONS_MIN, REPETITIONS_MAX),
    volume: num(stored.volume, DEFAULT_SETTINGS.volume, 0, 100),
  }
}
