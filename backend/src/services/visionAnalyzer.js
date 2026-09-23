import fs from 'fs/promises';
import sharp from 'sharp';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5vl:3b';
const OLLAMA_NUM_CTX = Number(process.env.OLLAMA_NUM_CTX || 4096);
const OLLAMA_MAX_CTX = Number(process.env.OLLAMA_MAX_CTX || 16384);
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 180000);

const THEMES = [
  'street','nature','architecture','portrait','landscape','animals','transport','people',
  'urban','rural','abstract','documentary','night','interior','coast','industrial'
];

function cleanJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  return start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate;
}

async function prepareImage(filePath) {
  // Send the original photograph to the vision model. No resize, pixel cap or
  // JPEG recompression is applied here; the source upload remains untouched.
  const buffer = await fs.readFile(filePath);
  return buffer.toString('base64');
}

async function postToOllama(image, prompt, numCtx) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    return await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: 'json',
        keep_alive: '10m',
        messages: [{ role: 'user', content: prompt, images: [image] }],
        options: {
          temperature: 0.1,
          num_ctx: numCtx,
          num_predict: 160
        }
      })
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Ollama analysis timed out after ${Math.round(OLLAMA_TIMEOUT_MS / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function ollamaHealth() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) return { ok: false, error: `Ollama returned HTTP ${response.status}` };
    const data = await response.json();
    const models = (data.models || []).map(m => m.name);
    return {
      ok: true,
      model: OLLAMA_MODEL,
      installed: models.some(name => name === OLLAMA_MODEL || name.startsWith(`${OLLAMA_MODEL}:`)),
      models,
      numCtx: OLLAMA_NUM_CTX,
      timeoutMs: OLLAMA_TIMEOUT_MS,
      maxContext: OLLAMA_MAX_CTX
    };
  } catch (error) {
    return { ok: false, error: `Não foi possível contactar o Ollama em ${OLLAMA_URL}.` };
  }
}

export async function analyzeImage(filePath) {
  const image = await prepareImage(filePath);
  const prompt = `Analyze this photograph for a photography portfolio. Return ONLY valid JSON.
Allowed themes: ${THEMES.join(', ')}.
Choose 1-4 themes. Add 3-8 short English tags. Add one short English description.
Schema: {"themes":["street"],"tags":["person","building"],"description":"Short description."}`;

  let response = await postToOllama(image, prompt, OLLAMA_NUM_CTX);

  if (!response.ok) {
    const body = await response.text();
    const isContextError = response.status === 400 && /context size|exceed_context_size_error/i.test(body);
    if (isContextError && OLLAMA_NUM_CTX < OLLAMA_MAX_CTX) {
      const retryCtx = Math.min(OLLAMA_MAX_CTX, Math.max(OLLAMA_NUM_CTX * 2, OLLAMA_NUM_CTX + 1024));
      response = await postToOllama(image, prompt, retryCtx);
    } else {
      throw new Error(`Ollama error HTTP ${response.status}: ${body.slice(0, 500)}`);
    }
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama error HTTP ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data.message?.content || '';
  if (!content) throw new Error('Ollama returned an empty response.');

  let parsed;
  try {
    parsed = JSON.parse(cleanJson(content));
  } catch {
    throw new Error(`Ollama returned invalid JSON: ${content.slice(0, 300)}`);
  }

  const themes = Array.isArray(parsed.themes)
    ? parsed.themes
        .map(t => String(t).toLowerCase().trim())
        .filter(t => THEMES.includes(t))
    : [];
  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.map(t => String(t).trim()).filter(Boolean).slice(0, 8)
    : [];

  return {
    themes: [...new Set(themes)].slice(0, 4),
    tags,
    description: String(parsed.description || '').trim()
  };
}

export { OLLAMA_MODEL, OLLAMA_NUM_CTX, OLLAMA_MAX_CTX, OLLAMA_TIMEOUT_MS, THEMES };
