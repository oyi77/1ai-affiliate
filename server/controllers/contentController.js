/**
 * Content generation controller — 6 Gemini-powered tools for affiliate marketing.
 * Each handler crafts a focused prompt with affiliate-marketing context and returns
 * a structured JSON payload for SPA consumption.
 */
const { callGemini } = require('../services/gemini');

function badRequest(res, msg) { return res.status(400).json({ error: msg }); }
function unavailable(res, err) { return res.status(err.statusCode || 500).json({ error: err.message }); }

/**
 * POST /api/content/banner
 * body: { product, audience, platform, style, variations? }
 * returns: { banners: [{ headline, subtext, palette, layout }] }
 */
async function generateBanner(req, res) {
  const { product, audience, platform = 'instagram', style = 'bold', variations = 3 } = req.body || {};
  if (!product) return badRequest(res, 'product required');
  const prompt = `You are an affiliate marketing banner designer. Generate ${variations} distinct banner concepts for promoting "${product}" to "${audience || 'general audience'}" on ${platform}.
Style: ${style}.

For each variation return JSON with: { headline, subtext, palette: [hex,hex,hex], layout: "portrait|landscape|square", cta: "call to action text", font_mood: "description" }.

Return a JSON object: { banners: [ ...variations ] }`;
  try {
    const data = await callGemini(prompt, { jsonMode: true, temperature: 0.9 });
    res.json(data);
  } catch (e) { unavailable(res, e); }
}

/**
 * POST /api/content/carousel
 * body: { topic, slides?, platform }
 * returns: { slides: [{ number, title, body, visual }] }
 */
async function generateCarousel(req, res) {
  const { topic, slides = 7, platform = 'instagram' } = req.body || {};
  if (!topic) return badRequest(res, 'topic required');
  const prompt = `You are an Instagram carousel copywriter for affiliate marketers. Create a ${slides}-slide carousel on "${topic}" optimized for ${platform}.
Slide 1: hook (scroll-stopper)
Slides 2-${slides - 1}: value (one idea per slide)
Last slide: CTA

For each slide return: { number, title: "<= 8 words", body: "<= 30 words", visual: "image suggestion" }.

Return JSON: { slides: [ ... ], caption: "post caption with hashtags" }`;
  try {
    const data = await callGemini(prompt, { jsonMode: true, temperature: 0.85 });
    res.json(data);
  } catch (e) { unavailable(res, e); }
}

/**
 * POST /api/content/caption
 * body: { product, platform, tone, length? }
 * returns: { caption, hashtags: [], alt: [] }
 */
async function generateCaption(req, res) {
  const { product, platform = 'instagram', tone = 'casual', length = 'medium' } = req.body || {};
  if (!product) return badRequest(res, 'product required');
  const prompt = `You are a social media copywriter. Write a ${length}-length ${tone} ${platform} caption promoting "${product}".
Use 1-2 short paragraphs, a hook in line 1, and a soft CTA.

Return JSON: { caption, hashtags: ["max 15"], alt_versions: ["3 alternative captions with different hooks"] }`;
  try {
    const data = await callGemini(prompt, { jsonMode: true, temperature: 0.9 });
    res.json(data);
  } catch (e) { unavailable(res, e); }
}

/**
 * POST /api/content/brand-kit
 * body: { brand_name, industry, vibe }
 * returns: { palette, fonts, voice, logo_concept }
 */
async function generateBrandKit(req, res) {
  const { brand_name, industry, vibe = 'modern' } = req.body || {};
  if (!brand_name) return badRequest(res, 'brand_name required');
  const prompt = `You are a brand strategist. Design a starter brand kit for "${brand_name}" (industry: ${industry || 'unspecified'}, vibe: ${vibe}).
Include:
- palette: 5 hex colors (primary, secondary, accent, light, dark)
- fonts: 1 heading font + 1 body font (Google Fonts names)
- voice: 3 adjectives + 2 phrases TO USE + 2 phrases TO AVOID
- logo_concept: 2-3 sentence description of logo direction
- tagline: 3 candidate taglines

Return JSON object with those keys.`;
  try {
    const data = await callGemini(prompt, { jsonMode: true, temperature: 0.7 });
    res.json(data);
  } catch (e) { unavailable(res, e); }
}

/**
 * POST /api/content/ab-test
 * body: { product, audience, hypothesis? }
 * returns: { variants: [{ name, headline, body, predicted_ctr }] }
 */
async function generateABTest(req, res) {
  const { product, audience, hypothesis } = req.body || {};
  if (!product) return badRequest(res, 'product required');
  const prompt = `You are a conversion-rate-optimization specialist. Create 3 distinct A/B test variants for a landing page selling "${product}" to "${audience || 'general audience'}".
${hypothesis ? `Hypothesis to test: ${hypothesis}` : ''}

Each variant should change ONE element (headline, CTA, hero image description, or social proof framing).

For each variant return: { name, headline, subheadline, cta, body_excerpt, predicted_ctr: "low|medium|high", reasoning: "why this might win" }.

Return JSON: { variants: [ ... ] }`;
  try {
    const data = await callGemini(prompt, { jsonMode: true, temperature: 0.85 });
    res.json(data);
  } catch (e) { unavailable(res, e); }
}

/**
 * POST /api/content/bg-remove-prompt
 * body: { image_subject, intent }
 * returns: { prompt, negative_prompt, settings }
 *
 * NOTE: actual background removal happens client-side (model size constraint).
 * This endpoint returns the optimized prompt to feed into a bg-removal model.
 */
async function generateBgRemovePrompt(req, res) {
  const { image_subject, intent = 'product photo clean white background' } = req.body || {};
  if (!image_subject) return badRequest(res, 'image_subject required');
  const prompt = `You are an image-prompt engineer for AI background-removal workflows.
Subject: "${image_subject}"
Intent: ${intent}

Return JSON: { prompt: "optimized prompt", negative_prompt: "what to avoid", settings: { padding: 0.05, alpha_matting: true, edge_refine: "feather 2px" } }`;
  try {
    const data = await callGemini(prompt, { jsonMode: true, temperature: 0.5 });
    res.json(data);
  } catch (e) { unavailable(res, e); }
}

module.exports = {
  generateBanner,
  generateCarousel,
  generateCaption,
  generateBrandKit,
  generateABTest,
  generateBgRemovePrompt,
};
