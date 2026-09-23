import React, { useRef, useState } from 'react';

const MAX_CHIPS = 6;

export default function PhotoSelector({ files, onSelect }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Dropping files re-uses the exact same onSelect(event) contract as the
  // native <input type="file"> change handler expects (event.target.files),
  // so the drag-and-drop affordance is additive and doesn't touch app logic.
  const handleDrop = event => {
    event.preventDefault();
    setDragging(false);
    if (!event.dataTransfer?.files?.length) return;

    if (inputRef.current) {
      inputRef.current.files = event.dataTransfer.files;
      onSelect({ target: inputRef.current });
    }
  };

  return (
    <section id="workflow-start" className="card">
      <div className="step-head">
        <span className="step-badge" aria-hidden="true">1</span>
        <h2>Select photographs</h2>
      </div>

      <label
        className={dragging ? 'dropzone dragging' : 'dropzone'}
        onDragOver={event => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span className="dropzone-icon" aria-hidden="true">🖼️</span>
        <span className="dropzone-title">Drop photographs here, or click to browse</span>
        <span className="dropzone-hint">JPEG, PNG, WebP · multiple files supported</span>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={onSelect} />
      </label>

      <p className="file-summary">
        {files.length ? (
          <strong>{files.length} photo{files.length === 1 ? '' : 's'} selected</strong>
        ) : (
          'No photographs selected yet.'
        )}
      </p>

      {files.length > 0 && (
        <div className="file-chip-row">
          {files.slice(0, MAX_CHIPS).map((file, index) => (
            <span className="file-chip" key={`${file.name}-${index}`} title={file.name}>
              {file.name}
            </span>
          ))}
          {files.length > MAX_CHIPS && (
            <span className="file-chip more">+{files.length - MAX_CHIPS} more</span>
          )}
        </div>
      )}
    </section>
  );
}
