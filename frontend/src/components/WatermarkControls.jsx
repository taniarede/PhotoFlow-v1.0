import React from 'react';
import { POSITIONS, WATERMARK_FONTS } from '../constants';

export default function WatermarkControls({
  enabled,
  setEnabled,
  type,
  setType,
  text,
  setText,
  watermarkFile,
  setWatermarkFile,
  position,
  setPosition,
  opacity,
  setOpacity,
  textSize,
  setTextSize,
  font,
  setFont,
}) {
  return (
    <section className="card">
      <div className="step-head">
        <span className="step-badge" aria-hidden="true">4</span>
        <h2>Watermark</h2>
      </div>

      <label className="watermark-toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={event => setEnabled(event.target.checked)}
        />
        <span className="switch" aria-hidden="true" />
        Enable watermark
      </label>

      <div className="row">
        <label>
          Type
          <select disabled={!enabled} value={type} onChange={event => setType(event.target.value)}>
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
        </label>

        {type === 'text' ? (
          <label className="grow">
            Text
            <input disabled={!enabled} value={text} onChange={event => setText(event.target.value)} />
          </label>
        ) : (
          <label className="grow">
            Logo
            <input
              disabled={!enabled}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={event => setWatermarkFile(event.target.files?.[0] || null)}
            />
            {watermarkFile && <small>{watermarkFile.name}</small>}
          </label>
        )}
      </div>

      {type === 'text' && (
        <div className="row">
          <label className="grow">
            Font
            <select disabled={!enabled} value={font} onChange={event => setFont(event.target.value)}>
              {WATERMARK_FONTS.map(item => (
                <option key={item} value={item} style={{ fontFamily: item }}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="row">
        <label>
          Position
          <select disabled={!enabled} value={position} onChange={event => setPosition(event.target.value)}>
            {POSITIONS.map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="grow">
          Opacity: {opacity}%
          <input
            aria-label="Watermark opacity"
            disabled={!enabled}
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={event => setOpacity(Number(event.target.value))}
          />
        </label>
      </div>

      {type === 'text' && (
        <label className="size-control">
          Text size: {Number(textSize).toFixed(1)}% of photo width
          <input
            aria-label="Watermark text size"
            disabled={!enabled}
            type="range"
            min="1"
            max="8"
            step="0.1"
            value={textSize}
            onChange={event => setTextSize(Number(event.target.value))}
          />
          <span className="range-hint">1% small · 3.5% default · 8% large</span>
        </label>
      )}
    </section>
  );
}
