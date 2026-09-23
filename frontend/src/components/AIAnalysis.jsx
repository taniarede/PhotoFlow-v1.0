import React from 'react';

export default function AIAnalysis({
  files,
  analyzing,
  ollamaState,
  analysis,
  onCheckOllama,
  onAnalyze,
}) {
  const ollamaReady = ollamaState?.ok && ollamaState?.installed;

  return (
    <section className="card ai-card">
      <div className="ai-heading">
        <div>
          <div className="step-head">
            <span className="step-badge" aria-hidden="true">6</span>
            <h2>AI classification</h2>
          </div>
          <p>Analyzes each photograph locally with Ollama + Qwen2.5-VL. No image leaves this machine.</p>
        </div>
        <button className="secondary" type="button" onClick={onCheckOllama}>
          Check Ollama
        </button>
      </div>

      {ollamaState && (
        <div className={ollamaReady ? 'ai-status ok' : 'ai-status'} role="status" aria-live="polite">
          <span className="status-dot" aria-hidden="true" />
          {ollamaReady
            ? `Ollama online · model ${ollamaState.model} available.`
            : ollamaState.ok
              ? `Ollama online, but ${ollamaState.model} is not installed.`
              : ollamaState.error}
        </div>
      )}

      <button
        className="ai-button"
        type="button"
        disabled={!files.length || analyzing}
        onClick={onAnalyze}
        aria-busy={analyzing}
      >
        {analyzing && <span className="spinner" aria-hidden="true" />}
        {analyzing ? 'Analyzing…' : 'Analyze photos with AI'}
      </button>

      {analysis.length > 0 && (
        <div className="analysis-list">
          {analysis.map((item, index) => (
            <article className="analysis-item" key={`${item.id || item.originalName}-${index}`}>
              <div>
                <strong>{item.originalName}</strong>

                {item.error ? (
                  <p className="analysis-error">{item.error}</p>
                ) : (
                  <>
                    <p>{item.description || 'No description.'}</p>
                    <div className="chips">
                      {item.themes.map((theme, themeIndex) => (
                        <span className="chip theme" key={`theme-${theme}-${themeIndex}`}>
                          {theme}
                        </span>
                      ))}
                      {item.tags.map((tag, tagIndex) => (
                        <span className="chip" key={`tag-${tag}-${tagIndex}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
