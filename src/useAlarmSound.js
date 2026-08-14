import { useCallback, useRef } from 'react'
import { SOUND_REPEATS } from './settings'

export function useAlarmSound() {
  const ctxRef = useRef(null)

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      ctxRef.current = new AudioCtx()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const tone = useCallback((ctx, { freq, start, dur, type, peak }) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur - 0.02)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + dur + 0.05)
  }, [])

  const play = useCallback(
    (soundType, volume, repetitions = 1, single = false) => {
      const ctx = ensureCtx()
      const now = ctx.currentTime
      const peak = Math.max(0.0001, (volume / 100) * 0.35)
      const count = single
        ? 1
        : SOUND_REPEATS[soundType] ?? Math.max(1, repetitions)

      const schedule = (build) => {
        for (let r = 0; r < count; r += 1) {
          build(now + r * 1.1)
        }
      }

      if (soundType === 'chime') {
        schedule((base) => {
          const notes = [523.25, 659.25, 783.99, 1046.5]
          notes.forEach((freq, i) =>
            tone(ctx, {
              freq,
              start: base + i * 0.18,
              dur: 0.6,
              type: 'sine',
              peak,
            }),
          )
        })
      } else if (soundType === 'bell') {
        schedule((base) => {
          tone(ctx, { freq: 987.77, start: base, dur: 1.2, type: 'sine', peak })
          tone(ctx, {
            freq: 1975.53,
            start: base,
            dur: 0.8,
            type: 'sine',
            peak: peak * 0.35,
          })
        })
      } else if (soundType === 'soft') {
        schedule((base) => {
          tone(ctx, { freq: 440, start: base, dur: 0.5, type: 'sine', peak })
          tone(ctx, {
            freq: 660,
            start: base + 0.22,
            dur: 0.5,
            type: 'sine',
            peak,
          })
        })
      } else {
        schedule((base) => {
          ;[0, 0.45, 0.9].forEach((offset) =>
            tone(ctx, {
              freq: 880,
              start: base + offset,
              dur: 0.4,
              type: 'sine',
              peak,
            }),
          )
        })
      }
    },
    [ensureCtx, tone],
  )

  return play
}
