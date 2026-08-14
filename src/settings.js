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

export function loadJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null
  } catch {
    return null
  }
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
