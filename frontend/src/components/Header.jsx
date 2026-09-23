import React from 'react';

export default function Header({ theme, onToggleTheme }) {
  return (
    <header>
      <span className="header-blob" aria-hidden="true" />
      <span className="header-blob two" aria-hidden="true" />

      <div className="header-top">
        <div>
          <p className="eyebrow">📸 AI-assisted photography workflow</p>
          <h1>PhotoFlow</h1>
          <p className="intro">
            Batch resize, watermark and locally AI-tag your photographs before export — all on
            your own machine.
          </p>
        </div>
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </div>
    </header>
  );
}
