import {
  ClockIcon,
  CloseIcon,
  InfoIcon,
  MusicNoteIcon,
  PlayIcon,
  SpeakerIcon,
  VolumeIcon,
} from './icons'
import { SOUND_TYPES } from './settings'

function SettingsHeader({ onClose }) {
  return (
    <div className="settings-header">
      <div className="settings-header-text">
        <h2 id="settings-modal-title">Time &amp; Sound Settings</h2>
        <p>
          Control watering duration, reminder frequency, and alert sounds.
        </p>
      </div>
      <button
        type="button"
        className="settings-close"
        onClick={onClose}
        aria-label="Close settings"
      >
        <CloseIcon size={18} />
      </button>
    </div>
  )
}

function TimeCard({ settings, updateSetting }) {
  return (
    <section className="settings-card card-accent-red">
      <div className="settings-card-head">
        <span className="settings-card-icon icon-red">
          <ClockIcon size={18} />
        </span>
        <h3>Time</h3>
      </div>
      <p className="settings-card-desc">
        Set the watering duration and reminder interval.
      </p>
      <div className="settings-card-body">
        <div className="time-field">
          <label className="field-label" htmlFor="watering-duration">
            Watering Duration
          </label>
          <div className="time-input-row">
            <input
              id="watering-duration"
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              value={settings.minutesPerTree}
              onChange={(e) =>
                updateSetting(
                  'minutesPerTree',
                  e.target.value === '' ? 1 : Number(e.target.value),
                )
              }
            />
            <span className="time-input-unit">min</span>
          </div>
        </div>
        <div className="time-field">
          <label className="field-label" htmlFor="reminder-interval">
            Reminder
          </label>
          <div className="time-input-row">
            <input
              id="reminder-interval"
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              value={settings.repeatMinutes}
              onChange={(e) =>
                updateSetting(
                  'repeatMinutes',
                  e.target.value === '' ? 1 : Number(e.target.value),
                )
              }
            />
            <span className="time-input-unit">min</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function AlertSoundCard({ settings, updateSetting }) {
  return (
    <section className="settings-card card-accent-green">
      <div className="settings-card-head">
        <span className="settings-card-icon icon-green">
          <SpeakerIcon size={18} />
        </span>
        <h3>Alert Sound</h3>
      </div>
      <p className="settings-card-desc">
        Enable or disable sound alerts throughout the application.
      </p>
      <div className="settings-card-body">
        <div className="alert-toggle-row">
          <span
            className={`toggle-status ${
              settings.soundEnabled
                ? 'toggle-status-on'
                : 'toggle-status-off'
            }`}
          >
            {settings.soundEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <label className="switch">
            <input
              type="checkbox"
              role="switch"
              checked={settings.soundEnabled}
              aria-checked={settings.soundEnabled}
              onChange={(e) =>
                updateSetting('soundEnabled', e.target.checked)
              }
            />
            <span className="switch-track" aria-hidden="true">
              <span className="switch-thumb" />
            </span>
          </label>
        </div>
      </div>
    </section>
  )
}

function NotificationSoundCard({ settings, updateSetting, play }) {
  return (
    <section className="settings-card card-accent-blue">
      <div className="settings-card-head">
        <span className="settings-card-icon icon-blue">
          <MusicNoteIcon size={18} />
        </span>
        <h3>Notification Sound</h3>
      </div>
      <p className="settings-card-desc">
        Choose the sound used for application notifications.
      </p>
      <div className="settings-card-body">
        <label className="field" htmlFor="sound-type">
          <span className="field-label">Sound</span>
          <select
            id="sound-type"
            value={settings.soundType}
            onChange={(e) => updateSetting('soundType', e.target.value)}
          >
            {SOUND_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn-listen"
          onClick={() =>
            play(settings.soundType, settings.volume, settings.repetitions)
          }
        >
          <PlayIcon size={14} />
          Listen to sound
        </button>
      </div>
    </section>
  )
}

function VolumeCard({ settings, updateSetting }) {
  return (
    <section className="settings-card card-accent-orange">
      <div className="settings-card-head">
        <span className="settings-card-icon icon-orange">
          <VolumeIcon size={18} />
        </span>
        <h3>Volume</h3>
      </div>
      <p className="settings-card-desc">
        Adjust the global notification volume.
      </p>
      <div className="settings-card-body">
        <div className="volume-display" aria-hidden="true">
          {settings.volume}%
        </div>
        <label className="visually-hidden" htmlFor="settings-volume">
          Volume
        </label>
        <div className="volume-wrap">
          <input
            id="settings-volume"
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.volume}
            style={{ '--range-p': `${settings.volume}%` }}
            onChange={(e) =>
              updateSetting('volume', Number(e.target.value))
            }
          />
        </div>
        <div className="volume-scale" aria-hidden="true">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </section>
  )
}

function SettingsInfo() {
  return (
    <div className="settings-about">
      <InfoIcon size={16} />
      <div className="settings-about-text">
        <h3>About Sound Settings</h3>
        <p>
          These settings apply to all notification sounds and alerts
          throughout the application.
        </p>
      </div>
    </div>
  )
}

export default function SettingsModal({ settings, updateSetting, play, onClose }) {
  return (
    <div
      className="settings-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <SettingsHeader onClose={onClose} />
        <div className="settings-body">
          <div className="settings-grid">
            <TimeCard settings={settings} updateSetting={updateSetting} />
            <AlertSoundCard settings={settings} updateSetting={updateSetting} />
            <NotificationSoundCard
              settings={settings}
              updateSetting={updateSetting}
              play={play}
            />
            <VolumeCard settings={settings} updateSetting={updateSetting} />
          </div>
          <SettingsInfo />
        </div>
      </div>
    </div>
  )
}
