export const SERVER = 'http://localhost:3001';
export const API = `${SERVER}/api`;

export const PRESETS = [
  { id: 'thumbnail', name: 'Thumbnail', width: 300, quality: 80 },
  { id: 'web', name: 'Web', width: 1200, quality: 85 },
  { id: 'full', name: 'Full', width: 2400, quality: 90 },
];

export const WATERMARK_FONTS = [
  'Arial',
  'Helvetica',
  'Verdana',
  'Trebuchet MS',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Impact',
];

export const POSITIONS = [
  'top-left',
  'top-right',
  'center',
  'bottom-left',
  'bottom-right',
];

// Ordered steps shown in the progress stepper. Purely presentational —
// `isDone` is derived from live flow state in App.jsx, never stored.
export const STEPS = [
  { id: 'select', label: 'Select' },
  { id: 'preset', label: 'Preset' },
  { id: 'author', label: 'Author' },
  { id: 'watermark', label: 'Watermark' },
  { id: 'preview', label: 'Preview' },
  { id: 'ai', label: 'AI tag' },
  { id: 'process', label: 'Export' },
];

export const DEFAULTS = {
  theme: 'light',
  preset: 'web',
  watermarkEnabled: false,
  watermarkType: 'text',
  watermarkText: '© Your Name Photography',
  watermarkTextSize: 3.5,
  watermarkFont: 'Arial',
  watermarkPosition: 'bottom-right',
  watermarkOpacity: 70,
  author: '',
  ollamaModel: 'qwen2.5vl:3b',
};
