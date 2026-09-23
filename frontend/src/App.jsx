import React, { useEffect } from 'react';
import Header from './components/Header';
import Stepper from './components/Stepper';
import PhotoSelector from './components/PhotoSelector';
import PresetSelector from './components/PresetSelector';
import WatermarkControls from './components/WatermarkControls';
import WatermarkPreview from './components/WatermarkPreview';
import AIAnalysis from './components/AIAnalysis';
import { usePhotoFlow } from './hooks/usePhotoFlow';

export default function App() {
  const flow = usePhotoFlow();

  const hasFiles = flow.files.length > 0;

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let frame = 0;
    const updateParallax = () => {
      const y = Math.min(window.scrollY * -0.055, 0);
      root.style.setProperty('--retro-parallax-y', `${y}px`);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  const hasAnalysis = flow.analysis.length > 0;
  const hasDownload = Boolean(flow.download);
  const hasDownloaded = flow.downloaded;

  // Purely presentational progress state for <Stepper>; derived every render
  // from existing flow state, never stored, and never gates any control.
  const doneMap = {
    select: hasFiles,
    preset: hasFiles,
    author: hasFiles && Boolean(flow.author.trim()),
    watermark: hasFiles && flow.watermarkEnabled,
    preview: hasFiles,
    ai: hasAnalysis,
    process: hasDownloaded,
  };

  const warningMap = {
    author: hasFiles && !flow.author.trim(),
    watermark: hasFiles && !flow.watermarkEnabled,
  };
  const activeId = !hasFiles ? 'select' : hasDownload ? 'process' : hasAnalysis ? 'process' : 'preview';

  const statusClass = flow.status
    ? `status ${/error/i.test(flow.status) ? 'error' : hasDownload ? 'success' : ''}`.trim()
    : '';

  return (
    <>
    <a className="skip-link" href="#workflow-start">Skip to workflow</a>
    <main id="main-content" className="app" tabIndex="-1">
      <div className="retro-background" aria-hidden="true" />

      <Header theme={flow.theme} onToggleTheme={flow.switchTheme} />

      <Stepper doneMap={doneMap} warningMap={warningMap} />

      <PhotoSelector files={flow.files} onSelect={flow.selectFiles} />

      <PresetSelector value={flow.preset} onChange={flow.setPreset} />

      <section className="card author-card">
        <div className="step-head">
          <span className="step-badge" aria-hidden="true">3</span>
          <h2>Photograph author</h2>
        </div>
        <label className="grow">
          Author
          <input
            value={flow.author}
            onChange={event => flow.setAuthor(event.target.value)}
            placeholder="Photographer's name"
            maxLength={200}
          />
        </label>
        <small>Saved in the metadata of the processed photograph.</small>
      </section>

      <WatermarkControls
        enabled={flow.watermarkEnabled}
        setEnabled={flow.setWatermarkEnabled}
        type={flow.type}
        setType={flow.setType}
        text={flow.text}
        setText={flow.setText}
        watermarkFile={flow.watermarkFile}
        setWatermarkFile={flow.setWatermarkFile}
        position={flow.position}
        setPosition={flow.setPosition}
        opacity={flow.opacity}
        setOpacity={flow.setOpacity}
        textSize={flow.textSize}
        font={flow.font}
        setFont={flow.setFont}
        setTextSize={flow.setTextSize}
      />

      <section className="card">
        <div className="step-head">
          <span className="step-badge" aria-hidden="true">5</span>
          <h2>Preview before processing</h2>
        </div>
        <WatermarkPreview
          files={flow.files}
          enabled={flow.watermarkEnabled}
          type={flow.type}
          text={flow.text}
          watermarkFile={flow.watermarkFile}
          position={flow.position}
          opacity={flow.opacity}
          textSize={flow.textSize}
          font={flow.font}
          selectedIndex={flow.selectedIndex}
          setSelectedIndex={flow.setSelectedIndex}
          analysis={flow.analysis}
        />
      </section>

      <AIAnalysis
        files={flow.files}
        analyzing={flow.analyzing}
        ollamaState={flow.ollamaState}
        analysis={flow.analysis}
        onCheckOllama={flow.checkOllama}
        onAnalyze={flow.analyzePhotos}
      />

      <p className="metadata-note">
        When AI results are available, themes, tags and descriptions are written into the processed JPEG metadata (XMP/IPTC/EXIF).
      </p>

      <div className="cta-row">
        <button type="button" className="primary" disabled={!flow.files.length} onClick={flow.processPhotos}>
          🚀 Process photographs
        </button>
        {flow.download && (
          <a className="download" href={flow.download} download onClick={flow.markDownloaded}>
            ⬇ Download ZIP
          </a>
        )}
      </div>

      {flow.status && (
        <p className={statusClass} role="status" aria-live="polite">
          {flow.status}
        </p>
      )}
    </main>
    </>
  );
}
