/**
 * Gemini AI service — content generation for affiliate marketing.
 * Wraps @google/generative-ai with retry + circuit breaker.
 * Returns structured JSON for SPA consumption.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY, GEMINI_MODEL } = require('../config/gemini');

if (!GEMINI_API_KEY) {
  console.warn('[gemini] GEMINI_API_KEY not set — content endpoints will return 503');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const breaker = {
  failures: 0,
  openUntil: 0,
  isOpen() { return Date.now() < this.openUntil; },
  recordFailure() {
    this.failures += 1;
    if (this.failures >= 5) this.openUntil = Date.now() + 30_000;
  },
  recordSuccess() { this.failures = 0; this.openUntil = 0; },
};

async function callGemini(prompt, { jsonMode = false, temperature = 0.8 } = {}) {
  if (!genAI) {
    const e = new Error('GEMINI_API_KEY not configured');
    e.statusCode = 503;
    throw e;
  }
  if (breaker.isOpen()) {
    const e = new Error('Gemini circuit open — too many recent failures');
    e.statusCode = 503;
    throw e;
  }
  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    });
    const result = await model.generateContent(prompt);
    breaker.recordSuccess();
    const text = result.response.text();
    return jsonMode ? safeJson(text) : text;
  } catch (err) {
    breaker.recordFailure();
    console.error('[gemini] error:', err.message?.slice(0, 200));
    throw err;
  }
}

function safeJson(text) {
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  try { return JSON.parse(cleaned); }
  catch { return { raw: text }; }
}

module.exports = { callGemini, breaker };
