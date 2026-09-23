import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { parse as parseExif } from 'exifr';

export default function WatermarkPreview({
  files,
  enabled,
  type,
  text,
  watermarkFile,
  position,
  opacity,
  textSize,
  font,
  selectedIndex,
  setSelectedIndex,
  analysis,
}) {
  const [src, setSrc] = useState('');
  const [wmSrc, setWmSrc] = useState('');
  const [imageWidth, setImageWidth] = useState(0);
  const [imageSize, setImageSize] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metadataError, setMetadataError] = useState('');
  const imageRef = useRef(null);
  const file = files[selectedIndex] || null;

  useEffect(() => {
    if (!file) {
      setSrc('');
      setImageSize(null);
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setSrc(url);
    setImageWidth(0);
    setImageSize(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!watermarkFile) {
      setWmSrc('');
      return undefined;
    }

    const url = URL.createObjectURL(watermarkFile);
    setWmSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [watermarkFile]);

  useEffect(() => {
    const update = () => setImageWidth(imageRef.current?.getBoundingClientRect().width || 0);
    update();

    window.addEventListener('resize', update);
    const observer = imageRef.current ? new ResizeObserver(update) : null;
    if (observer) observer.observe(imageRef.current);

    return () => {
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [src]);

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      if (!file) {
        setMetadata(null);
        setMetadataError('');
        return;
      }

      try {
        setMetadataError('');
        const parsed = await parseExif(file, {
          tiff: true,
          exif: true,
          gps: true,
          iptc: true,
          xmp: true,
          icc: true,
        });

        if (!cancelled) setMetadata(parsed || {});
      } catch {
        if (!cancelled) {
          setMetadata({});
          setMetadataError('Could not read metadata for this image.');
        }
      }
    }

    loadMetadata();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const aiInfo = file ? analysis?.find(item => item.originalName === file.name) : null;

  const formatMetadataValue = value => {
    if (value === null || value === undefined || value === '') return '—';
    if (value instanceof Date) return value.toLocaleString();
    if (Array.isArray(value)) return value.map(formatMetadataValue).join(', ');
    if (typeof value === 'object') {
      return Object.entries(value)
        .map(([key, item]) => `${key}: ${formatMetadataValue(item)}`)
        .join(' · ');
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? String(Math.round(value * 10000) / 10000) : String(value);
    }
    return String(value);
  };

  const ignoredMetadataKeys = new Set(['thumbnail', 'Thumbnail', 'MakerNote', 'makernote']);
  const metadataEntries = metadata
    ? Object.entries(metadata).filter(
        ([key, value]) => !ignoredMetadataKeys.has(key) && value !== undefined && value !== null && value !== '',
      )
    : [];

  const visible = enabled && (type === 'text' ? text.trim().length > 0 : Boolean(wmSrc));
  const fontSize = Math.max(12, Math.round(imageWidth * (Number(textSize) / 100)));
  const selectedName = file?.name || 'No photograph selected';

  return (
    <div className="preview-wrap">
      <div className="preview-main">
        <div className="preview-stage">
          {src ? (
            <div className="preview-canvas">
              <img
                ref={imageRef}
                className="preview-photo"
                src={src}
                alt={`Preview of ${selectedName}`}
                onLoad={event =>
                  setImageSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                }
              />

              {visible && (
                <div
                  className={`watermark-layer ${position}`}
                  style={{ opacity: opacity / 100 }}
                >
                  {type === 'text' ? (
                    <span className="watermark-text" style={{ fontSize, fontFamily: `'${font}', sans-serif` }}>
                      {text}
                    </span>
                  ) : (
                    <img className="watermark-image" src={wmSrc} alt="Watermark preview" />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="preview-empty">
              <span aria-hidden="true" style={{ fontSize: 28 }}>🖼️</span>
              Select photographs to see the preview.
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="preview-selector">
            {files.map((item, index) => {
              const thumb = URL.createObjectURL(item);

              return (
                <button
                  type="button"
                  key={`${item.name}-${index}`}
                  className={index === selectedIndex ? 'preview-thumb selected' : 'preview-thumb'}
                  onClick={() => setSelectedIndex(index)}
                  title={item.name}
                  aria-label={`Preview photograph ${index + 1}: ${item.name}`}
                  aria-pressed={index === selectedIndex}
                >
                  <img src={thumb} alt="" onLoad={event => URL.revokeObjectURL(event.currentTarget.src)} />
                  <span>{index + 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="preview-meta">
        <strong>Preview {files.length > 1 ? `${selectedIndex + 1} of ${files.length}` : ''}</strong>
        <span>{selectedName}</span>
        <span>
          File: {(file?.size / 1024 / 1024 || 0).toFixed(2)} MB · {file?.type || 'unknown type'}
        </span>
        {imageSize && <span>Dimensions: {imageSize.width} × {imageSize.height} px</span>}
        {file?.lastModified && <span>Last modified: {new Date(file.lastModified).toLocaleString()}</span>}
        <span>Watermark: {enabled ? `Active · ${position} · ${opacity}%` : 'Disabled'}</span>
        {type === 'text' && <span>Text size: {Number(textSize).toFixed(1)}% of width</span>}

        {aiInfo && !aiInfo.error && (
          <div className="image-info-block">
            <strong>AI information</strong>
            <span>{aiInfo.description || 'No description.'}</span>

            {aiInfo.themes?.length > 0 && (
              <div className="info-row">
                <b>Themes</b>
                <div className="chips">
                  {aiInfo.themes.map((item, index) => (
                    <span className="chip theme" key={`preview-theme-${item}-${index}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {aiInfo.tags?.length > 0 && (
              <div className="info-row">
                <b>Tags</b>
                <div className="chips">
                  {aiInfo.tags.map((item, index) => (
                    <span className="chip" key={`preview-tag-${item}-${index}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="image-info-block">
          <strong>Image metadata</strong>
          {metadataError && <span className="analysis-error">{metadataError}</span>}

          {metadataEntries.length > 0 ? (
            <div className="metadata-grid">
              {metadataEntries.map(([key, value]) => (
                <div className="metadata-row" key={`meta-${key}`}>
                  <span>{key}</span>
                  <strong>{formatMetadataValue(value)}</strong>
                </div>
              ))}
            </div>
          ) : (
            !metadataError && <span>No embedded metadata found in this image.</span>
          )}
        </div>

        <small>
          Select a thumbnail to see all available information for that photograph. Final processing is still done by Sharp on the backend.
        </small>
      </div>
    </div>
  );
}
