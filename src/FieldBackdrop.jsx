import { memo } from 'react'

const BLADES = Array.from({ length: 36 }, (_, i) => ({
  left: Math.round(i * (100 / 36) + (Math.random() * 3 - 1.5)),
  height: 36 + Math.round(Math.random() * 62),
  delay: Math.random() * 3,
  duration: 2.2 + Math.random() * 1.8,
  opacity: 0.5 + Math.random() * 0.45,
}))

const FLOWERS = [
  { left: 7, delay: 0, color: '#ff4d8b' },
  { left: 21, delay: 1.3, color: '#b8a4ed' },
  { left: 45, delay: 0.6, color: '#ffb084' },
  { left: 62, delay: 1.9, color: '#e8b94a' },
  { left: 84, delay: 0.2, color: '#ff4d8b' },
]

export const FieldBackdrop = memo(function FieldBackdrop() {
  return (
    <div className="field-bg" aria-hidden="true">
      <svg
        className="field-scene"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="clay-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfe8f7" />
            <stop offset="65%" stopColor="#fff3d6" />
            <stop offset="100%" stopColor="#fffaf0" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#clay-sky)" />
        <circle className="sun" cx="330" cy="46" r="20" fill="#e8b94a" opacity="0.92" />
        <g className="cloud cloud-a" fill="#ffffff" opacity="0.85">
          <ellipse cx="80" cy="52" rx="30" ry="11" />
          <ellipse cx="104" cy="46" rx="24" ry="9" />
          <ellipse cx="56" cy="47" rx="20" ry="8" />
        </g>
        <g className="cloud cloud-b" fill="#ffffff" opacity="0.7">
          <ellipse cx="300" cy="98" rx="34" ry="12" />
          <ellipse cx="328" cy="92" rx="26" ry="10" />
          <ellipse cx="272" cy="92" rx="22" ry="9" />
        </g>
        <path d="M0,215 Q95,180 195,210 T400,200 L400,300 L0,300 Z" fill="#a9cfa0" />
        <path d="M0,245 Q130,220 250,248 T400,238 L400,300 L0,300 Z" fill="#7cb57e" />
      </svg>

      {FLOWERS.map((f) => (
        <span
          key={f.left}
          className="flower"
          style={{ left: `${f.left}%`, animationDelay: `${f.delay}s` }}
        >
          <i className="flower-stem" />
          <b className="flower-bloom" style={{ backgroundColor: f.color }} />
        </span>
      ))}

      {BLADES.map((b, i) => (
        <svg
          key={i}
          className="blade"
          style={{
            left: `${b.left}%`,
            height: `${b.height}px`,
            opacity: b.opacity,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
          viewBox="0 0 20 100"
          preserveAspectRatio="none"
        >
          <path d="M6,100 C3,66 7,32 14,4 C11,32 14,66 14,100 Z" fill="#5d9e63" />
        </svg>
      ))}
    </div>
  )
})
