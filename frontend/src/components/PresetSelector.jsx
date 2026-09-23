import React from 'react';
import { PRESETS } from '../constants';

// Bar heights are purely decorative (relative size cue per preset), not data.
const ICON_BARS = {
  thumbnail: [40, 55, 40],
  web: [55, 85, 65],
  full: [70, 100, 85],
};

export default function PresetSelector({ value, onChange }) {
  return (
    <section className="card">
      <div className="step-head">
        <span className="step-badge" aria-hidden="true">2</span>
        <h2>Export preset</h2>
      </div>

      <fieldset className="presets">
        <legend className="sr-only">Choose an export preset</legend>
        {PRESETS.map(preset => (
          <label className={value === preset.id ? 'preset selected' : 'preset'} key={preset.id}>
            <input
              type="radio"
              name="preset"
              checked={value === preset.id}
              value={preset.id}
              onChange={event => onChange(event.target.value)}
            />
            <span className="preset-icon" aria-hidden="true">
              {(ICON_BARS[preset.id] || [50, 70, 60]).map((height, index) => (
                <span className="bar" key={index} style={{ height: `${height}%` }} />
              ))}
            </span>
            <strong>{preset.name}</strong>
            <span>{preset.width}px · JPEG · {preset.quality}%</span>
          </label>
        ))}
      </fieldset>
    </section>
  );
}
