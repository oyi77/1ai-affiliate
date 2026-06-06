/**
 * AI Growth Tools — Interfaces for Gemini API endpoints
 */
window.PageRenderers = window.PageRenderers || {};

// Shared UI helper for AI tools
const AI_UI = {
  form: (title, desc, fields, btnText, submitFn) => `
    ${DOM.pageHeader(title, desc)}
    <div class="card" style="max-width:800px">
      <form onsubmit="event.preventDefault(); ${submitFn}()">
        ${fields.map(f => `
          <div class="form-group">
            <label>${f.label}</label>
            ${f.type === 'textarea' 
              ? `<textarea id="${f.id}" rows="${f.rows||3}" placeholder="${f.placeholder||''}" required></textarea>`
              : `<input type="${f.type||'text'}" id="${f.id}" placeholder="${f.placeholder||''}" required>`}
          </div>
        `).join('')}
        <button type="submit" class="btn btn-primary" id="ai-submit-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          ${btnText}
        </button>
      </form>
    </div>
    <div id="ai-results" style="max-width:800px;margin-top:24px"></div>
  `,
  setLoading: (isLoading) => {
    const btn = document.getElementById('ai-submit-btn');
    if (btn) {
      btn.disabled = isLoading;
      btn.style.opacity = isLoading ? '0.7' : '1';
      btn.innerHTML = isLoading 
        ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating...` 
        : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Generate`;
    }
  },
  renderJSON: (data) => {
    let html = '';
    
    // Attempt to parse text as markdown-ish or just display formatted
    if (data.text) {
      // Basic markdown parser
      let md = data.text
        .replace(/^### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^## (.*$)/gim, '<h3 style="margin:24px 0 12px">$1</h3>')
        .replace(/^# (.*$)/gim, '<h2 style="margin:24px 0 12px">$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>');
        
      html += `<div class="card" style="border-top:4px solid var(--purple)">
        <div style="line-height:1.6;font-size:14px;color:var(--text)">${md}</div>
      </div>`;
    } else {
      // Raw JSON fallback
      html += `<div class="card"><pre style="background:rgba(0,0,0,0.3);padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;color:var(--text2)">${JSON.stringify(data, null, 2)}</pre></div>`;
    }
    return html;
  }
};

// Tool: Banner Generator
PageRenderers['ai-banner'] = async function(el) {
  el.innerHTML = AI_UI.form(
    'Banner Generator', 
    'Generate engaging HTML5 banner concepts for your affiliate offers.',
    [
      { id: 'ai-b-product', label: 'Product / Offer Name', placeholder: 'e.g. Shopee Mega Sale 11.11' },
      { id: 'ai-b-audience', label: 'Target Audience', placeholder: 'e.g. Gen Z fashion lovers' }
    ],
    'Generate Concepts',
    'AITools.submitBanner'
  );
};

// Tool: IG Carousel
PageRenderers['ai-carousel'] = async function(el) {
  el.innerHTML = AI_UI.form(
    'IG Carousel Generator', 
    'Create an educational 5-slide Instagram carousel to drive affiliate clicks.',
    [
      { id: 'ai-c-topic', label: 'Topic or Hook', placeholder: 'e.g. 5 ways to save money on TikTok Shop' },
      { id: 'ai-c-slides', label: 'Number of Slides', type: 'number', placeholder: '5' }
    ],
    'Generate Carousel',
    'AITools.submitCarousel'
  );
};

// Tool: Social Captions
PageRenderers['ai-caption'] = async function(el) {
  el.innerHTML = AI_UI.form(
    'Social Captions', 
    'Write high-converting captions for TikTok, Instagram, or Facebook.',
    [
      { id: 'ai-cap-context', label: 'Product Context', type: 'textarea', placeholder: 'Describe the product and what makes it special...' }
    ],
    'Generate Captions',
    'AITools.submitCaption'
  );
};

// Tool: Brand Kit
PageRenderers['ai-brand-kit'] = async function(el) {
  el.innerHTML = AI_UI.form(
    'Brand Kit Generator', 
    'Generate a cohesive brand identity (colors, fonts, voice) for a niche site.',
    [
      { id: 'ai-bk-niche', label: 'Niche / Industry', placeholder: 'e.g. Tech gadgets, Beauty, Fitness' },
      { id: 'ai-bk-vibe', label: 'Vibe / Mood', placeholder: 'e.g. Minimalist and professional' }
    ],
    'Generate Brand Kit',
    'AITools.submitBrandKit'
  );
};

// Tool: A/B Test Ideas
PageRenderers['ai-ab-test'] = async function(el) {
  el.innerHTML = AI_UI.form(
    'A/B Test Ideas', 
    'Get 3 landing page variants with predicted CTR and rationale.',
    [
      { id: 'ai-ab-current', label: 'Current Landing Page / Offer', type: 'textarea', placeholder: 'Describe your current landing page headline and layout...' }
    ],
    'Generate Variants',
    'AITools.submitABTest'
  );
};

// Tool: BG Removal
PageRenderers['ai-bg-remove'] = async function(el) {
  el.innerHTML = AI_UI.form(
    'Background Removal Prompt', 
    'Generate an optimized prompt to feed into image AI models for clean product cutouts.',
    [
      { id: 'ai-bg-desc', label: 'Product Description', type: 'textarea', placeholder: 'e.g. A black leather jacket on a wooden hanger' }
    ],
    'Generate Prompt',
    'AITools.submitBgRemove'
  );
};

// Handlers namespace
window.AITools = {
  async runTool(endpoint, payload) {
    const resEl = document.getElementById('ai-results');
    resEl.innerHTML = DOM.skeleton();
    AI_UI.setLoading(true);
    try {
      const data = await API.post(endpoint, payload);
      resEl.innerHTML = AI_UI.renderJSON(data);
      AppUI.toast('Generation complete', 'success');
    } catch(e) {
      resEl.innerHTML = `<div class="card" style="border-left:4px solid var(--red)">
        <h3 style="color:var(--red);margin-bottom:8px">Error</h3>
        <p style="font-size:13px;color:var(--text2)">${e.message || 'The AI service is temporarily unavailable.'}</p>
      </div>`;
      AppUI.toast('Generation failed', 'error');
    } finally {
      AI_UI.setLoading(false);
    }
  },
  
  submitBanner() {
    this.runTool('/api/content/banner', { 
      product: document.getElementById('ai-b-product').value,
      audience: document.getElementById('ai-b-audience').value
    });
  },
  submitCarousel() {
    this.runTool('/api/content/carousel', { 
      topic: document.getElementById('ai-c-topic').value,
      slidesCount: document.getElementById('ai-c-slides').value || 5
    });
  },
  submitCaption() {
    this.runTool('/api/content/caption', { 
      context: document.getElementById('ai-cap-context').value
    });
  },
  submitBrandKit() {
    this.runTool('/api/content/brand-kit', { 
      niche: document.getElementById('ai-bk-niche').value,
      vibe: document.getElementById('ai-bk-vibe').value
    });
  },
  submitABTest() {
    this.runTool('/api/content/ab-test', { 
      currentDesign: document.getElementById('ai-ab-current').value
    });
  },
  submitBgRemove() {
    this.runTool('/api/content/bg-remove', { 
      imageDesc: document.getElementById('ai-bg-desc').value
    });
  }
};
