import express from 'express';
import { analyzeImage, ollamaHealth, OLLAMA_MODEL, THEMES } from '../services/visionAnalyzer.js';

const router = express.Router();

router.get('/health', async (_req, res) => {
  const health = await ollamaHealth();
  res.status(health.ok ? 200 : 503).json({ ...health, model: OLLAMA_MODEL, themes: THEMES });
});

router.post('/', async (req, res) => {
  try {
    const { files = [] } = req.body;
    if (!files.length) return res.status(400).json({ error: 'No files supplied' });
    const results = [];
    for (const file of files) {
      try {
        const analysis = await analyzeImage(file.path);
        results.push({ id: file.id, originalName: file.originalName, ...analysis });
      } catch (error) {
        results.push({ id: file.id, originalName: file.originalName, error: error.message, themes: [], tags: [], description: '' });
      }
    }
    res.json({ model: OLLAMA_MODEL, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
