import { useEffect, useState } from 'react';
import { API, DEFAULTS, SERVER } from '../constants';
import { applyTheme, getThemeCookie, setThemeCookie, toggleTheme } from '../utils/theme';

export function usePhotoFlow() {
  const [theme, setTheme] = useState(getThemeCookie);
  const [files, setFiles] = useState([]);
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [watermarkEnabled, setWatermarkEnabled] = useState(DEFAULTS.watermarkEnabled);
  const [type, setType] = useState(DEFAULTS.watermarkType);
  const [text, setText] = useState(DEFAULTS.watermarkText);
  const [textSize, setTextSize] = useState(DEFAULTS.watermarkTextSize);
  const [font, setFont] = useState(DEFAULTS.watermarkFont);
  const [watermarkFile, setWatermarkFile] = useState(null);
  const [position, setPosition] = useState(DEFAULTS.watermarkPosition);
  const [opacity, setOpacity] = useState(DEFAULTS.watermarkOpacity);
  const [author, setAuthor] = useState(DEFAULTS.author);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [download, setDownload] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [analysis, setAnalysis] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [ollamaState, setOllamaState] = useState(null);

  useEffect(() => {
    applyTheme(theme);
    setThemeCookie(theme);
  }, [theme]);

  const switchTheme = () => setTheme(current => toggleTheme(current));

  const selectFiles = event => {
    setFiles([...event.target.files]);
    setSelectedIndex(0);
    setDownload('');
    setDownloaded(false);
    setStatus('');
    setAnalysis([]);
  };

  const uploadPhotos = async () => {
    const form = new FormData();
    files.forEach(file => form.append('photos', file));

    const response = await fetch(`${API}/upload`, { method: 'POST', body: form });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.files;
  };

  const analyzePhotos = async () => {
    if (!files.length) return;

    try {
      setAnalyzing(true);
      setStatus('A enviar fotografias para o analisador local...');

      const uploaded = await uploadPhotos();
      const response = await fetch(`${API}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: uploaded }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'AI analysis failed');

      setAnalysis(result.results || []);
      const errors = (result.results || []).filter(item => item.error).length;

      setStatus(
        errors
          ? `Análise concluída, mas ${errors} fotografia(s) tiveram erro.`
          : `Análise concluída com ${result.results?.length || 0} fotografia(s).`,
      );
    } catch (error) {
      setStatus(`AI error: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const checkOllama = async () => {
    try {
      const response = await fetch(`${API}/analyze/health`);
      const data = await response.json();
      setOllamaState(data);
    } catch {
      setOllamaState({ ok: false, error: 'Backend indisponível' });
    }
  };

  const processPhotos = async () => {
    if (!files.length) return;

    try {
      setStatus('Uploading photos...');
      const uploaded = await uploadPhotos();
      let watermarkPath = null;

      if (watermarkEnabled && type === 'image' && watermarkFile) {
        setStatus('Uploading watermark...');
        const form = new FormData();
        form.append('watermark', watermarkFile);

        const response = await fetch(`${API}/upload/watermark`, {
          method: 'POST',
          body: form,
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Watermark upload failed');
        watermarkPath = data.file.path;
      }

      setStatus('Processing...');
      // Keep the AI results attached to the original filename. The backend
      // resolves these results against the second upload used for processing.
      const analysisForProcessing = files.map((sourceFile, index) => {
        const result = analysis.find(item => item.originalName === sourceFile.name) || analysis[index];
        return result ? { ...result, originalName: sourceFile.name } : null;
      }).filter(Boolean);

      const body = {
        files: uploaded,
        preset,
        author: author.trim(),
        watermark: {
          enabled: watermarkEnabled,
          type,
          text,
          font,
          path: watermarkPath,
          position,
          opacity: opacity / 100,
          textSize: Number(textSize),
        },
        analysis: analysisForProcessing,
      };

      const response = await fetch(`${API}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Processing failed');

      const processed = result.processed || [];
      const saved = processed.filter(item => item.metadataSaved && item.metadataVerified).length;
      const metadataErrors = processed.filter(item => item.metadataError);
      const unmatched = processed.filter(item => item.metadataSkipped && !item.analysisMatched);

      setStatus(
        `${processed.length} photo(s) processed. Metadata saved and verified in ${saved} output image(s).` +
        (unmatched.length
          ? ` AI metadata was not matched for: ${unmatched.map(item => item.originalName).join(', ')}.`
          : '') +
          (metadataErrors.length
            ? ` Metadata errors: ${metadataErrors
                .map(item => `${item.originalName}: ${item.metadataError}`)
                .join(' | ')}`
            : ''),
      );
      setDownload(`${SERVER}${result.zip}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const markDownloaded = () => setDownloaded(true);

  return {
    theme,
    switchTheme,
    files,
    preset,
    setPreset,
    watermarkEnabled,
    setWatermarkEnabled,
    type,
    setType,
    text,
    setText,
    textSize,
    font,
    setFont,
    setTextSize,
    watermarkFile,
    setWatermarkFile,
    position,
    setPosition,
    opacity,
    setOpacity,
    author,
    setAuthor,
    selectedIndex,
    setSelectedIndex,
    status,
    download,
    downloaded,
    markDownloaded,
    analysis,
    analyzing,
    ollamaState,
    selectFiles,
    analyzePhotos,
    checkOllama,
    processPhotos,
  };
}
