-- 027_seed_landing_templates.sql
-- Seeds 8 high-CTR built-in landing page templates for the template marketplace.

SET NAMES utf8mb4;

INSERT INTO landing_page_templates
  (user_id, name, slug, category, description, thumbnail_url, html_template, fields, tags, ctr_score, is_public, status, created_at, updated_at)
VALUES

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Sweepstakes Classic
-- ═══════════════════════════════════════════════════════════════════════════════
(
  0,
  'Sweepstakes Classic',
  'sweepstakes-classic',
  'sweepstakes',
  'High-converting sweepstakes page with countdown timer, social proof, and sticky CTA. Green/teal gradient design optimized for mobile.',
  NULL,
'<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{headline}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#f0fdfa;color:#1a1a2e;line-height:1.6}
.hero{background:linear-gradient(135deg,#0d9488,#06b6d4,#0891b2);padding:48px 20px 40px;text-align:center;color:#fff;position:relative;overflow:hidden}
.hero::after{content:"";position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b)}
.hero h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:800;margin-bottom:12px;text-shadow:0 2px 8px rgba(0,0,0,.25)}
.hero p{font-size:1.1rem;opacity:.92;max-width:560px;margin:0 auto 24px}
.badge-row{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:16px 0}
.badge{background:rgba(255,255,255,.18);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:6px 16px;font-size:.82rem;display:flex;align-items:center;gap:6px}
.badge svg{width:14px;height:14px;fill:currentColor}
.product-img{max-width:280px;margin:24px auto;border-radius:16px;background:rgba(255,255,255,.15);border:2px dashed rgba(255,255,255,.3);padding:40px 20px;font-size:.9rem;opacity:.85}
.countdown{display:flex;justify-content:center;gap:12px;margin:20px 0}
.countdown .unit{background:rgba(0,0,0,.25);border-radius:12px;min-width:64px;padding:12px 8px}
.countdown .num{font-size:1.8rem;font-weight:800;display:block;line-height:1}
.countdown .label{font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;opacity:.8}
.container{max-width:580px;margin:0 auto;padding:0 16px}
.form-section{background:#fff;border-radius:20px;padding:32px 24px;margin:-30px 20px 24px;position:relative;z-index:2;box-shadow:0 8px 32px rgba(0,0,0,.1)}
.form-section h2{text-align:center;font-size:1.3rem;margin-bottom:4px;color:#0d9488}
.form-section .sub{text-align:center;color:#666;font-size:.9rem;margin-bottom:20px}
.field{margin-bottom:14px}
.field input{width:100%;padding:14px 16px;border:2px solid #e2e8f0;border-radius:12px;font-size:1rem;transition:border-color .2s;outline:none}
.field input:focus{border-color:#0d9488}
.cta-btn{width:100%;padding:16px;background:linear-gradient(135deg,#0d9488,#06b6d4);color:#fff;font-size:1.15rem;font-weight:700;border:none;border-radius:12px;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 16px rgba(13,148,136,.35)}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(13,148,136,.45)}
.cta-btn:active{transform:translateY(0)}
.social-proof{text-align:center;padding:20px;font-size:.9rem;color:#666}
.social-proof strong{color:#0d9488;font-size:1.1rem}
.trust{display:flex;justify-content:center;gap:20px;padding:16px 20px 32px;flex-wrap:wrap}
.trust-item{display:flex;align-items:center;gap:6px;font-size:.82rem;color:#64748b}
.trust-item svg{width:18px;height:18px;fill:#0d9488}
.sticky-cta{position:fixed;bottom:0;left:0;right:0;padding:12px 16px;background:#fff;border-top:1px solid #e2e8f0;z-index:100;transform:translateY(100%);transition:transform .3s}
.sticky-cta.visible{transform:translateY(0)}
.sticky-cta button{width:100%;padding:14px;background:linear-gradient(135deg,#0d9488,#06b6d4);color:#fff;font-size:1.05rem;font-weight:700;border:none;border-radius:12px;cursor:pointer}
@media(min-width:640px){.form-section{margin:-30px auto 24px;padding:40px 32px}.hero{padding:64px 24px 48px}}
</style>
</head>
<body>
<div class="hero">
  <div class="badge-row">
    <span class="badge"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg> {{rating_count}} Winners</span>
    <span class="badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Verified &amp; Secure</span>
  </div>
  <h1>{{headline}}</h1>
  <p>{{subheadline}}</p>
  <div class="product-img">[Product Image Area]</div>
  <div class="countdown">
    <div class="unit"><span class="num">04</span><span class="label">Hours</span></div>
    <div class="unit"><span class="num">32</span><span class="label">Minutes</span></div>
    <div class="unit"><span class="num">17</span><span class="label">Seconds</span></div>
  </div>
</div>
<div class="container">
  <div class="form-section">
    <h2>Enter Now — It''s Free!</h2>
    <p class="sub">{{form_subheadline}}</p>
    <form action="{{form_action}}" method="POST">
      <div class="field"><input type="text" name="name" placeholder="Your Full Name" required></div>
      <div class="field"><input type="email" name="email" placeholder="Your Email Address" required></div>
      <button type="submit" class="cta-btn">{{cta_text}}</button>
    </form>
  </div>
  <div class="social-proof"><strong>{{social_count}} people</strong> have already entered today!</div>
</div>
<div class="trust">
  <span class="trust-item"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg> SSL Encrypted</span>
  <span class="trust-item"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Verified Sponsors</span>
  <span class="trust-item"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg> Privacy Protected</span>
</div>
<div class="sticky-cta" id="sticky"><button onclick="document.querySelector(''.form-section'').scrollIntoView({behavior:''smooth''})">{{cta_text}}</button></div>
<script>window.addEventListener(''scroll'',()=>{document.getElementById(''sticky'').classList.toggle(''visible'',window.scrollY>400)})</script>
</body>
</html>',
  '[{"key":"headline","label":"Headline","type":"text","default":"Win a $500 Gift Card!"},{"key":"subheadline","label":"Subheadline","type":"text","default":"Enter your details below for a chance to win. No purchase necessary."},{"key":"cta_text","label":"CTA Button Text","type":"text","default":"CLAIM YOUR ENTRY NOW"},{"key":"form_action","label":"Form Submit URL","type":"url","default":"#"},{"key":"form_subheadline","label":"Form Subtitle","type":"text","default":"Only takes 10 seconds — no credit card needed."},{"key":"social_count","label":"Social Proof Count","type":"text","default":"12,847"},{"key":"rating_count","label":"Rating/Review Count","type":"text","default":"4,921"},{"key":"primary_color","label":"Primary Color","type":"color","default":"#0d9488"}]',
  '["sweepstakes","contest","giveaway","high-ctr","mobile"]',
  95, 1, 'active', NOW(), NOW()
),

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. VSL Video Sales Letter
-- ═══════════════════════════════════════════════════════════════════════════════
(
  0,
  'VSL Video Sales Letter',
  'vsl-video-sales-letter',
  'vsl',
  'Dark-themed video sales letter page with authority bar, value stack, FAQ accordion, and single CTA. Optimized for long-form sales.',
  NULL,
'<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{headline}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#0f172a;color:#e2e8f0;line-height:1.7}
.authority{background:#1e293b;border-bottom:1px solid #334155;padding:14px 20px;text-align:center}
.authority p{font-size:.85rem;color:#94a3b8;letter-spacing:.04em}
.authority strong{color:#f8fafc}
.authority .logos{display:flex;justify-content:center;gap:24px;margin-top:8px;flex-wrap:wrap}
.authority .logo{font-size:.9rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.1em}
.container{max-width:720px;margin:0 auto;padding:0 20px}
.video-section{padding:40px 0 32px;text-align:center}
.video-wrap{position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;background:#1e293b;border:2px solid #334155;max-width:720px;margin:0 auto}
.video-wrap .placeholder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#64748b}
.video-section .under-text{margin-top:16px;font-size:1rem;color:#94a3b8}
.headline-block{text-align:center;padding:16px 0 32px}
.headline-block h1{font-size:clamp(1.6rem,4.5vw,2.4rem);font-weight:800;color:#f8fafc;margin-bottom:8px}
.headline-block p{font-size:1.05rem;color:#94a3b8}
.value-stack{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px 24px;margin-bottom:32px}
.value-stack h2{font-size:1.3rem;color:#38bdf8;margin-bottom:20px;text-align:center}
.value-item{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #334155}
.value-item:last-child{border-bottom:none}
.value-item .name{font-size:.95rem;color:#e2e8f0}
.value-item .val{font-weight:700;color:#38bdf8;white-space:nowrap}
.value-total{display:flex;justify-content:space-between;padding-top:16px;margin-top:8px;border-top:2px solid #38bdf8}
.value-total .name{font-weight:700;color:#f8fafc;font-size:1.05rem}
.value-total .val{font-weight:800;color:#22c55e;font-size:1.3rem}
.cta-section{text-align:center;padding:8px 0 40px}
.cta-btn{display:inline-block;padding:18px 48px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:1.15rem;font-weight:700;border:none;border-radius:12px;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 24px rgba(37,99,235,.4);text-decoration:none}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(37,99,235,.5)}
.cta-sub{margin-top:10px;font-size:.85rem;color:#64748b}
.faq{padding:20px 0 48px}
.faq h2{font-size:1.3rem;color:#f8fafc;margin-bottom:20px;text-align:center}
details{background:#1e293b;border:1px solid #334155;border-radius:12px;margin-bottom:10px;overflow:hidden}
summary{padding:16px 20px;cursor:pointer;font-weight:600;color:#e2e8f0;list-style:none;display:flex;justify-content:space-between;align-items:center}
summary::after{content:"+";font-size:1.2rem;color:#64748b;transition:transform .2s}
details[open] summary::after{content:"-"}
details[open] summary{border-bottom:1px solid #334155}
details .answer{padding:16px 20px;color:#94a3b8;font-size:.92rem}
@media(min-width:640px){.video-section{padding:48px 0 40px}.headline-block{padding:24px 0 40px}.value-stack{padding:40px 32px}}
</style>
</head>
<body>
<div class="authority">
  <p>As Featured In</p>
  <div class="logos">
    <span class="logo">Forbes</span>
    <span class="logo">CNN</span>
    <span class="logo">Bloomberg</span>
    <span class="logo">TechCrunch</span>
  </div>
</div>
<div class="container">
  <div class="headline-block">
    <h1>{{headline}}</h1>
    <p>{{subheadline}}</p>
  </div>
  <div class="video-section">
    <div class="video-wrap">
      <div class="placeholder">{{video_embed_url}}</div>
    </div>
    <p class="under-text">Watch the full video to learn how {{value_proposition}}</p>
  </div>
  <div class="value-stack">
    <h2>Here''s Everything You Get</h2>
    <div class="value-item"><span class="name">{{item_1_name}}</span><span class="val">{{item_1_value}}</span></div>
    <div class="value-item"><span class="name">{{item_2_name}}</span><span class="val">{{item_2_value}}</span></div>
    <div class="value-item"><span class="name">{{item_3_name}}</span><span class="val">{{item_3_value}}</span></div>
    <div class="value-item"><span class="name">{{item_4_name}}</span><span class="val">{{item_4_value}}</span></div>
    <div class="value-total"><span class="name">Total Value</span><span class="val">{{total_value}}</span></div>
  </div>
  <div class="cta-section">
    <a href="{{cta_url}}" class="cta-btn">{{cta_text}}</a>
    <p class="cta-sub">{{cta_subtext}}</p>
  </div>
  <div class="faq">
    <h2>Frequently Asked Questions</h2>
    <details><summary>{{faq_1_q}}</summary><div class="answer">{{faq_1_a}}</div></details>
    <details><summary>{{faq_2_q}}</summary><div class="answer">{{faq_2_a}}</div></details>
    <details><summary>{{faq_3_q}}</summary><div class="answer">{{faq_3_a}}</div></details>
    <details><summary>{{faq_4_q}}</summary><div class="answer">{{faq_4_a}}</div></details>
  </div>
</div>
</body>
</html>',
  '[{"key":"headline","label":"Main Headline","type":"text","default":"Discover the Secret to Financial Freedom"},{"key":"subheadline","label":"Subheadline","type":"text","default":"Watch this short video to learn the #1 strategy used by top earners."},{"key":"video_embed_url","label":"Video Embed URL / Code","type":"textarea","default":"[Paste your video embed code here]"},{"key":"value_proposition","label":"Value Proposition","type":"text","default":"this simple method changed everything for over 10,000 people."},{"key":"item_1_name","label":"Value Item 1 Name","type":"text","default":"Premium Training Module"},{"key":"item_1_value","label":"Value Item 1 Price","type":"text","default":"$497"},{"key":"item_2_name","label":"Value Item 2 Name","type":"text","default":"Private Community Access"},{"key":"item_2_value","label":"Value Item 2 Price","type":"text","default":"$297"},{"key":"item_3_name","label":"Value Item 3 Name","type":"text","default":"Weekly Coaching Calls"},{"key":"item_3_value","label":"Value Item 3 Price","type":"text","default":"$997"},{"key":"item_4_name","label":"Value Item 4 Name","type":"text","default":"Bonus Templates Pack"},{"key":"item_4_value","label":"Value Item 4 Price","type":"text","default":"$197"},{"key":"total_value","label":"Total Value","type":"text","default":"$1,988"},{"key":"cta_text","label":"CTA Button Text","type":"text","default":"GET INSTANT ACCESS NOW"},{"key":"cta_url","label":"CTA Button URL","type":"url","default":"#"},{"key":"cta_subtext","label":"CTA Subtext","type":"text","default":"One-time payment • Lifetime access • 30-day money-back guarantee"},{"key":"faq_1_q","label":"FAQ 1 Question","type":"text","default":"How quickly will I see results?"},{"key":"faq_1_a","label":"FAQ 1 Answer","type":"textarea","default":"Most students see their first results within 7 days of implementing the strategies."},{"key":"faq_2_q","label":"FAQ 2 Question","type":"text","default":"Is this beginner-friendly?"},{"key":"faq_2_a","label":"FAQ 2 Answer","type":"textarea","default":"Absolutely. The step-by-step system is designed for complete beginners with zero experience."},{"key":"faq_3_q","label":"FAQ 3 Question","type":"text","default":"What if it doesn''t work for me?"},{"key":"faq_3_a","label":"FAQ 3 Answer","type":"textarea","default":"We offer a full 30-day money-back guarantee. No questions asked."},{"key":"faq_4_q","label":"FAQ 4 Question","type":"text","default":"How long do I have access?"},{"key":"faq_4_a","label":"FAQ 4 Answer","type":"textarea","default":"You get lifetime access including all future updates at no extra cost."}]',
  '["vsl","video","sales-letter","high-ticket","info-product"]',
  88, 1, 'active', NOW(), NOW()
),

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. E-commerce Product
-- ═══════════════════════════════════════════════════════════════════════════════
(
  0,
  'E-commerce Product',
  'ecommerce-product',
  'ecommerce',
  'Conversion-optimized product page with hero image, benefit bullets, crossed-out pricing, testimonials, guarantee badge, and urgency elements.',
  NULL,
'<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{product_name}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#fff;color:#1a1a2e;line-height:1.6}
.top-bar{background:#fee2e2;color:#dc2626;text-align:center;padding:10px 16px;font-size:.85rem;font-weight:600}
.top-bar strong{font-weight:800}
.container{max-width:720px;margin:0 auto;padding:0 16px}
.product-hero{display:flex;flex-direction:column;gap:24px;padding:24px 0}
@media(min-width:640px){.product-hero{flex-direction:row;padding:32px 0}}
.product-image{flex:1;min-height:280px;background:#f1f5f9;border-radius:16px;display:flex;align-items:center;justify-content:center;border:2px dashed #cbd5e1;font-size:.95rem;color:#94a3b8}
.product-info{flex:1;display:flex;flex-direction:column;gap:12px}
.product-info h1{font-size:clamp(1.4rem,4vw,1.9rem);font-weight:800;color:#0f172a}
.stars{color:#f59e0b;font-size:1.1rem;letter-spacing:2px}
.stars span{color:#64748b;font-size:.85rem;margin-left:6px}
.price-block{display:flex;align-items:baseline;gap:10px}
.price-now{font-size:2rem;font-weight:800;color:#dc2626}
.price-old{font-size:1.2rem;color:#94a3b8;text-decoration:line-through}
.qty-row{display:flex;align-items:center;gap:10px}
.qty-row label{font-weight:600;font-size:.9rem}
.qty-row select{padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:.95rem}
.cta-btn{padding:16px 32px;background:#dc2626;color:#fff;font-size:1.1rem;font-weight:700;border:none;border-radius:12px;cursor:pointer;transition:background .15s;box-shadow:0 4px 16px rgba(220,38,38,.3)}
.cta-btn:hover{background:#b91c1c}
.benefits{padding:24px 0}
.benefits h2{font-size:1.3rem;margin-bottom:16px;color:#0f172a}
.benefit{display:flex;gap:12px;margin-bottom:14px}
.benefit .icon{width:40px;height:40px;border-radius:10px;background:#ecfdf5;color:#059669;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
.benefit .text h3{font-size:.95rem;font-weight:700;color:#0f172a;margin-bottom:2px}
.benefit .text p{font-size:.85rem;color:#64748b}
.testimonials{padding:24px 0}
.testimonials h2{font-size:1.3rem;margin-bottom:16px;color:#0f172a;text-align:center}
.testimonial-grid{display:grid;gap:14px}
@media(min-width:640px){.testimonial-grid{grid-template-columns:1fr 1fr}}
.testimonial{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px}
.testimonial .stars-sm{color:#f59e0b;font-size:.85rem;margin-bottom:6px}
.testimonial p{font-size:.88rem;color:#475569;font-style:italic;margin-bottom:8px}
.testimonial .author{font-size:.82rem;font-weight:600;color:#0f172a}
.guarantee{text-align:center;padding:32px 20px;margin:24px 0;background:#f0fdf4;border-radius:16px;border:2px solid #86efac}
.guarantee .badge{font-size:2.5rem;margin-bottom:8px}
.guarantee h3{font-size:1.15rem;font-weight:700;color:#15803d;margin-bottom:6px}
.guarantee p{font-size:.9rem;color:#166534;max-width:400px;margin:0 auto}
.stock-bar{background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:14px 20px;text-align:center;margin:16px 0;font-weight:700;color:#c2410c}
</style>
</head>
<body>
<div class="top-bar">⚠️ <strong>{{urgency_message}}</strong> — {{discount_percent}}% OFF today only!</div>
<div class="container">
  <div class="product-hero">
    <div class="product-image">[Product Image Area]</div>
    <div class="product-info">
      <h1>{{product_name}}</h1>
      <div class="stars">★★★★★ <span>({{review_count}} verified reviews)</span></div>
      <p>{{product_tagline}}</p>
      <div class="price-block">
        <span class="price-now">{{sale_price}}</span>
        <span class="price-old">{{original_price}}</span>
      </div>
      <div class="qty-row">
        <label for="qty">Qty:</label>
        <select id="qty"><option>1</option><option>2</option><option>3</option><option>5</option></select>
      </div>
      <button class="cta-btn">{{cta_text}}</button>
    </div>
  </div>
  <div class="stock-bar">🔥 Only {{stock_count}} left in stock — order now!</div>
  <div class="benefits">
    <h2>Why You''ll Love It</h2>
    <div class="benefit"><div class="icon">✓</div><div class="text"><h3>{{benefit_1_title}}</h3><p>{{benefit_1_desc}}</p></div></div>
    <div class="benefit"><div class="icon">✓</div><div class="text"><h3>{{benefit_2_title}}</h3><p>{{benefit_2_desc}}</p></div></div>
    <div class="benefit"><div class="icon">✓</div><div class="text"><h3>{{benefit_3_title}}</h3><p>{{benefit_3_desc}}</p></div></div>
    <div class="benefit"><div class="icon">✓</div><div class="text"><h3>{{benefit_4_title}}</h3><p>{{benefit_4_desc}}</p></div></div>
  </div>
  <div class="testimonials">
    <h2>What Our Customers Say</h2>
    <div class="testimonial-grid">
      <div class="testimonial"><div class="stars-sm">★★★★★</div><p>{{testimonial_1_text}}</p><div class="author">— {{testimonial_1_name}}</div></div>
      <div class="testimonial"><div class="stars-sm">★★★★★</div><p>{{testimonial_2_text}}</p><div class="author">— {{testimonial_2_name}}</div></div>
    </div>
  </div>
  <div class="guarantee">
    <div class="badge">🛡️</div>
    <h3>{{guarantee_title}}</h3>
    <p>{{guarantee_text}}</p>
  </div>
</div>
</body>
</html>',
  '[{"key":"product_name","label":"Product Name","type":"text","default":"Premium Comfort Headphones Pro"},{"key":"product_tagline","label":"Product Tagline","type":"text","default":"Experience crystal-clear sound with all-day comfort."},{"key":"sale_price","label":"Sale Price","type":"text","default":"$49.99"},{"key":"original_price","label":"Original Price","type":"text","default":"$129.99"},{"key":"discount_percent","label":"Discount %","type":"text","default":"61"},{"key":"cta_text","label":"CTA Button Text","type":"text","default":"ADD TO CART — BUY NOW"},{"key":"review_count","label":"Review Count","type":"text","default":"2,847"},{"key":"stock_count","label":"Stock Remaining","type":"text","default":"23"},{"key":"urgency_message","label":"Urgency Message","type":"text","default":"Flash Sale Ending Soon"},{"key":"benefit_1_title","label":"Benefit 1 Title","type":"text","default":"Premium Sound Quality"},{"key":"benefit_1_desc","label":"Benefit 1 Description","type":"text","default":"40mm drivers deliver deep bass and crystal highs."},{"key":"benefit_2_title","label":"Benefit 2 Title","type":"text","default":"All-Day Comfort"},{"key":"benefit_2_desc","label":"Benefit 2 Description","type":"text","default":"Memory foam cushions for hours of fatigue-free listening."},{"key":"benefit_3_title","label":"Benefit 3 Title","type":"text","default":"30-Hour Battery"},{"key":"benefit_3_desc","label":"Benefit 3 Description","type":"text","default":"Fast charging — 10 min charge gives 3 hours of playback."},{"key":"benefit_4_title","label":"Benefit 4 Title","type":"text","default":"Active Noise Cancellation"},{"key":"benefit_4_desc","label":"Benefit 4 Description","type":"text","default":"Block out distractions and immerse yourself in sound."},{"key":"testimonial_1_text","label":"Testimonial 1 Text","type":"textarea","default":"Best headphones I''ve ever owned. The sound quality is incredible for the price!"},{"key":"testimonial_1_name","label":"Testimonial 1 Name","type":"text","default":"Sarah M., Verified Buyer"},{"key":"testimonial_2_text","label":"Testimonial 2 Text","type":"textarea","default":"Super comfortable and the battery lasts forever. Highly recommend!"},{"key":"testimonial_2_name","label":"Testimonial 2 Name","type":"text","default":"James T., Verified Buyer"},{"key":"guarantee_title","label":"Guarantee Title","type":"text","default":"30-Day Money-Back Guarantee"},{"key":"guarantee_text","label":"Guarantee Text","type":"textarea","default":"Not satisfied? Return it within 30 days for a full refund. No questions asked."}]',
  '["ecommerce","product","shop","conversion","retail"]',
  90, 1, 'active', NOW(), NOW()
),

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Crypto / Finance
-- ═══════════════════════════════════════════════════════════════════════════════
(
  0,
  'Crypto Finance',
  'crypto-finance',
  'crypto',
  'Dark-themed crypto landing page with data-driven hero, feature grid, security badges, ROI calculator section, and registration form.',
  NULL,
'<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{headline}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#0a0e1a;color:#e2e8f0;line-height:1.6}
.hero{background:linear-gradient(180deg,#0f172a 0%,#0a0e1a 100%);padding:48px 20px;text-align:center;border-bottom:1px solid #1e293b}
.hero .ticker{display:flex;justify-content:center;gap:24px;margin-bottom:24px;flex-wrap:wrap;font-size:.85rem}
.ticker-item{background:#1e293b;padding:6px 14px;border-radius:8px;border:1px solid #334155}
.ticker-item .sym{color:#38bdf8;font-weight:700}
.ticker-item .val{color:#f8fafc}
.ticker-item .chg{color:#22c55e;margin-left:4px}
.hero h1{font-size:clamp(1.6rem,4.5vw,2.5rem);font-weight:800;color:#f8fafc;margin-bottom:10px}
.hero h1 span{color:#38bdf8}
.hero p{color:#94a3b8;max-width:560px;margin:0 auto 28px;font-size:1.05rem}
.cta-row{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
.cta-btn{padding:14px 32px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:1rem;font-weight:700;border:none;border-radius:10px;cursor:pointer;transition:transform .15s;box-shadow:0 4px 20px rgba(37,99,235,.35);text-decoration:none}
.cta-btn:hover{transform:translateY(-2px)}
.cta-btn-alt{padding:14px 32px;background:transparent;color:#38bdf8;font-size:1rem;font-weight:700;border:2px solid #334155;border-radius:10px;cursor:pointer;text-decoration:none}
.container{max-width:720px;margin:0 auto;padding:0 16px}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:32px 0}
.stat{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px 12px;text-align:center}
.stat .num{font-size:1.6rem;font-weight:800;color:#38bdf8}
.stat .lbl{font-size:.78rem;color:#64748b;margin-top:4px}
.features{padding:24px 0}
.features h2{font-size:1.3rem;color:#f8fafc;text-align:center;margin-bottom:24px}
.feature-grid{display:grid;gap:14px}
@media(min-width:640px){.feature-grid{grid-template-columns:1fr 1fr}}
.feature{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px}
.feature .icon{font-size:1.6rem;margin-bottom:10px}
.feature h3{font-size:1rem;font-weight:700;color:#f8fafc;margin-bottom:4px}
.feature p{font-size:.85rem;color:#94a3b8}
.roi-section{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px 24px;margin:32px 0;text-align:center}
.roi-section h2{font-size:1.3rem;color:#f8fafc;margin-bottom:8px}
.roi-section p{color:#94a3b8;margin-bottom:20px;font-size:.92rem}
.roi-calc{display:flex;justify-content:center;gap:20px;flex-wrap:wrap}
.roi-item{text-align:center}
.roi-item .big{font-size:2rem;font-weight:800;color:#22c55e}
.roi-item .lbl{font-size:.82rem;color:#64748b}
.register{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px 24px;margin:32px 0;text-align:center}
.register h2{font-size:1.3rem;color:#f8fafc;margin-bottom:6px}
.register p{color:#94a3b8;margin-bottom:20px;font-size:.92rem}
.field{margin-bottom:12px}
.field input{width:100%;padding:13px 16px;background:#0f172a;border:2px solid #334155;border-radius:10px;color:#f8fafc;font-size:.95rem;outline:none;transition:border-color .2s}
.field input:focus{border-color:#38bdf8}
.register .cta-btn{width:100%}
.security{display:flex;justify-content:center;gap:24px;padding:24px 0 40px;flex-wrap:wrap}
.sec-badge{display:flex;align-items:center;gap:6px;font-size:.82rem;color:#64748b}
.sec-badge svg{width:16px;height:16px;fill:#38bdf8}
</style>
</head>
<body>
<div class="hero">
  <div class="ticker">
    <span class="ticker-item"><span class="sym">BTC</span> <span class="val">$67,842</span> <span class="chg">+2.4%</span></span>
    <span class="ticker-item"><span class="sym">ETH</span> <span class="val">$3,521</span> <span class="chg">+3.1%</span></span>
    <span class="ticker-item"><span class="sym">SOL</span> <span class="val">$178</span> <span class="chg">+5.7%</span></span>
  </div>
  <h1>{{headline}}</h1>
  <p>{{subheadline}}</p>
  <div class="cta-row">
    <a href="{{cta_url}}" class="cta-btn">{{cta_text}}</a>
    <a href="#features" class="cta-btn-alt">Learn More</a>
  </div>
</div>
<div class="container">
  <div class="stats-row">
    <div class="stat"><div class="num">{{stat_1_value}}</div><div class="lbl">{{stat_1_label}}</div></div>
    <div class="stat"><div class="num">{{stat_2_value}}</div><div class="lbl">{{stat_2_label}}</div></div>
    <div class="stat"><div class="num">{{stat_3_value}}</div><div class="lbl">{{stat_3_label}}</div></div>
  </div>
  <div class="features" id="features">
    <h2>Why Choose {{brand_name}}</h2>
    <div class="feature-grid">
      <div class="feature"><div class="icon">🔒</div><h3>Bank-Grade Security</h3><p>Multi-signature wallets, cold storage, and 24/7 monitoring.</p></div>
      <div class="feature"><div class="icon">⚡</div><h3>Instant Execution</h3><p>Trade with sub-millisecond latency on institutional-grade infrastructure.</p></div>
      <div class="feature"><div class="icon">📊</div><h3>Advanced Analytics</h3><p>Real-time charts, AI predictions, and portfolio tracking tools.</p></div>
      <div class="feature"><div class="icon">🌍</div><h3>Global Access</h3><p>Trade 200+ assets from anywhere. 24/7 markets, no restrictions.</p></div>
    </div>
  </div>
  <div class="roi-section">
    <h2>Potential Returns</h2>
    <p>See what your investment could grow to with {{brand_name}}</p>
    <div class="roi-calc">
      <div class="roi-item"><div class="big">{{roi_1_amount}}</div><div class="lbl">{{roi_1_period}}</div></div>
      <div class="roi-item"><div class="big">{{roi_2_amount}}</div><div class="lbl">{{roi_2_period}}</div></div>
      <div class="roi-item"><div class="big">{{roi_3_amount}}</div><div class="lbl">{{roi_3_period}}</div></div>
    </div>
  </div>
  <div class="register">
    <h2>Create Your Free Account</h2>
    <p>Start trading in under 2 minutes. No minimum deposit.</p>
    <form action="{{form_action}}" method="POST">
      <div class="field"><input type="text" name="name" placeholder="Full Name" required></div>
      <div class="field"><input type="email" name="email" placeholder="Email Address" required></div>
      <button type="submit" class="cta-btn" style="margin-top:8px">{{form_cta_text}}</button>
    </form>
  </div>
  <div class="security">
    <span class="sec-badge"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg> 256-bit SSL</span>
    <span class="sec-badge"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg> GDPR Compliant</span>
    <span class="sec-badge"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg> SOC 2 Certified</span>
  </div>
</div>
</body>
</html>',
  '[{"key":"headline","label":"Headline","type":"text","default":"Smarter Crypto Trading Starts Here"},{"key":"subheadline","label":"Subheadline","type":"text","default":"Join 500,000+ traders using AI-powered tools to maximize returns."},{"key":"brand_name","label":"Brand Name","type":"text","default":"CryptoVault"},{"key":"cta_text","label":"Hero CTA Text","type":"text","default":"START TRADING FREE"},{"key":"cta_url","label":"Hero CTA URL","type":"url","default":"#"},{"key":"stat_1_value","label":"Stat 1 Value","type":"text","default":"$12B+"},{"key":"stat_1_label","label":"Stat 1 Label","type":"text","default":"Trading Volume"},{"key":"stat_2_value","label":"Stat 2 Value","type":"text","default":"500K+"},{"key":"stat_2_label","label":"Stat 2 Label","type":"text","default":"Active Traders"},{"key":"stat_3_value","label":"Stat 3 Value","type":"text","default":"99.99%"},{"key":"stat_3_label","label":"Stat 3 Label","type":"text","default":"Uptime"},{"key":"roi_1_amount","label":"ROI 1 Amount","type":"text","default":"$1,250"},{"key":"roi_1_period","label":"ROI 1 Period","type":"text","default":"In 30 Days"},{"key":"roi_2_amount","label":"ROI 2 Amount","type":"text","default":"$5,800"},{"key":"roi_2_period","label":"ROI 2 Period","type":"text","default":"In 90 Days"},{"key":"roi_3_amount","label":"ROI 3 Amount","type":"text","default":"$24,500"},{"key":"roi_3_period","label":"ROI 3 Period","type":"text","default":"In 1 Year"},{"key":"form_action","label":"Form Action URL","type":"url","default":"#"},{"key":"form_cta_text","label":"Form CTA Text","type":"text","default":"CREATE FREE ACCOUNT"}]',
  '["crypto","finance","trading","bitcoin","investment"]',
  85, 1, 'active', NOW(), NOW()
),

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Dating / Social
-- ═══════════════════════════════════════════════════════════════════════════════
(
  0,
  'Dating Social',
  'dating-social',
  'dating',
  'Warm, inviting dating page with profile-style hero, photo gallery, match percentage, location-based CTA, and testimonials.',
  NULL,
'<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{headline}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#fff5f5;color:#1a1a2e;line-height:1.6}
.hero{background:linear-gradient(135deg,#ec4899,#f43f5e,#fb7185);padding:48px 20px;text-align:center;color:#fff}
.hero h1{font-size:clamp(1.6rem,4.5vw,2.5rem);font-weight:800;margin-bottom:10px}
.hero p{font-size:1.05rem;opacity:.93;max-width:480px;margin:0 auto}
.profile-card{max-width:340px;margin:-40px auto 24px;background:#fff;border-radius:20px;box-shadow:0 8px 32px rgba(244,63,94,.15);overflow:hidden;position:relative;z-index:2}
.profile-avatar{height:200px;background:linear-gradient(135deg,#fce7f3,#fbcfe8);display:flex;align-items:center;justify-content:center;font-size:4rem}
.profile-body{padding:20px;text-align:center}
.profile-body h2{font-size:1.2rem;color:#0f172a}
.profile-body .loc{font-size:.85rem;color:#94a3b8;margin-bottom:8px}
.match-bar{background:#fce7f3;border-radius:999px;height:10px;margin:12px 0 4px;overflow:hidden}
.match-fill{height:100%;background:linear-gradient(90deg,#ec4899,#f43f5e);border-radius:999px}
.match-text{font-size:.82rem;color:#ec4899;font-weight:700}
.container{max-width:580px;margin:0 auto;padding:0 16px}
.gallery{padding:24px 0}
.gallery h2{text-align:center;font-size:1.2rem;margin-bottom:16px;color:#0f172a}
.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.gallery-item{aspect-ratio:1;background:#fce7f3;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:2rem;border:1px solid #fbcfe8}
.features{padding:16px 0 24px;text-align:center}
.features h2{font-size:1.2rem;margin-bottom:16px;color:#0f172a}
.feature-list{display:flex;flex-direction:column;gap:10px}
.feature-item{background:#fff;border-radius:12px;padding:14px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,.04);text-align:left}
.feature-item .icon{font-size:1.5rem;flex-shrink:0}
.feature-item h3{font-size:.9rem;font-weight:700;color:#0f172a}
.feature-item p{font-size:.82rem;color:#64748b}
.cta-section{text-align:center;padding:24px 0}
.cta-btn{display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#ec4899,#f43f5e);color:#fff;font-size:1.1rem;font-weight:700;border:none;border-radius:999px;cursor:pointer;transition:transform .15s;box-shadow:0 4px 20px rgba(244,63,94,.35);text-decoration:none}
.cta-btn:hover{transform:translateY(-2px)}
.cta-sub{margin-top:10px;font-size:.85rem;color:#94a3b8}
.location{background:#fff;border-radius:16px;padding:20px;margin:16px 0;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.05)}
.location .pin{font-size:2rem;margin-bottom:4px}
.location h3{font-size:1rem;color:#0f172a;margin-bottom:4px}
.location p{font-size:.88rem;color:#64748b}
.location .count{font-size:1.1rem;font-weight:800;color:#ec4899}
.testimonials{padding:24px 0 40px;text-align:center}
.testimonials h2{font-size:1.2rem;margin-bottom:16px;color:#0f172a}
.testimonials-grid{display:grid;gap:12px}
@media(min-width:640px){.testimonials-grid{grid-template-columns:1fr 1fr}}
.testi{background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.04);text-align:left}
.testi p{font-size:.88rem;color:#475569;font-style:italic;margin-bottom:6px}
.testi .author{font-size:.82rem;font-weight:600;color:#ec4899}
</style>
</head>
<body>
<div class="hero">
  <h1>{{headline}}</h1>
  <p>{{subheadline}}</p>
</div>
<div class="container">
  <div class="profile-card">
    <div class="profile-avatar">👤</div>
    <div class="profile-body">
      <h2>{{featured_name}}, {{featured_age}}</h2>
      <div class="loc">📍 {{featured_location}}</div>
      <div class="match-bar"><div class="match-fill" style="width:{{match_percent}}%"></div></div>
      <div class="match-text">{{match_percent}}% Match</div>
    </div>
  </div>
  <div class="gallery">
    <h2>People Near You</h2>
    <div class="gallery-grid">
      <div class="gallery-item">👤</div>
      <div class="gallery-item">👤</div>
      <div class="gallery-item">👤</div>
      <div class="gallery-item">👤</div>
      <div class="gallery-item">👤</div>
      <div class="gallery-item">👤</div>
    </div>
  </div>
  <div class="features">
    <h2>How It Works</h2>
    <div class="feature-list">
      <div class="feature-item"><div class="icon">📱</div><div><h3>Create Your Profile</h3><p>Sign up in 30 seconds. Add your photos and interests.</p></div></div>
      <div class="feature-item"><div class="icon">💕</div><div><h3>Discover Matches</h3><p>Our algorithm finds compatible people in your area.</p></div></div>
      <div class="feature-item"><div class="icon">💬</div><div><h3>Start Chatting</h3><p>Send messages and connect with your matches instantly.</p></div></div>
    </div>
  </div>
  <div class="location">
    <div class="pin">📍</div>
    <h3>Singles in {{location_city}}</h3>
    <p><span class="count">{{local_count}} singles</span> are online right now</p>
  </div>
  <div class="cta-section">
    <a href="{{cta_url}}" class="cta-btn">{{cta_text}}</a>
    <p class="cta-sub">Free to join • Verified profiles • 100% private</p>
  </div>
  <div class="testimonials">
    <h2>Success Stories</h2>
    <div class="testimonials-grid">
      <div class="testi"><p>{{testimonial_1_text}}</p><div class="author">— {{testimonial_1_name}}</div></div>
      <div class="testi"><p>{{testimonial_2_text}}</p><div class="author">— {{testimonial_2_name}}</div></div>
    </div>
  </div>
</div>
</body>
</html>',
  '[{"key":"headline","label":"Headline","type":"text","default":"Find Your Perfect Match Today"},{"key":"subheadline","label":"Subheadline","type":"text","default":"Join thousands of singles looking for meaningful connections."},{"key":"featured_name","label":"Featured Profile Name","type":"text","default":"Alex"},{"key":"featured_age","label":"Featured Profile Age","type":"text","default":"28"},{"key":"featured_location","label":"Featured Location","type":"text","default":"New York, NY"},{"key":"match_percent","label":"Match Percentage","type":"text","default":"94"},{"key":"location_city","label":"User City","type":"text","default":"New York"},{"key":"local_count","label":"Local Singles Count","type":"text","default":"3,247"},{"key":"cta_text","label":"CTA Button Text","type":"text","default":"JOIN FREE NOW"},{"key":"cta_url","label":"CTA URL","type":"url","default":"#"},{"key":"testimonial_1_text","label":"Testimonial 1","type":"textarea","default":"I met my partner here 6 months ago. Best decision I ever made!"},{"key":"testimonial_1_name","label":"Testimonial 1 Name","type":"text","default":"Maria & Carlos"},{"key":"testimonial_2_text","label":"Testimonial 2","type":"textarea","default":"The matches were spot-on. Found someone special within the first week!"},{"key":"testimonial_2_name","label":"Testimonial 2 Name","type":"text","default":"David R."}]',
  '["dating","social","match","love","singles"]',
  82, 1, 'active', NOW(), NOW()
),

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Gaming / Casino
-- ═══════════════════════════════════════════════════════════════════════════════
(
  0,
  'Gaming Casino',
  'gaming-casino',
  'gaming',
  'Neon-dark gaming page with prize showcase, spin wheel placeholder, leaderboard, bonus offers, and fast-action CTA. High-energy design.',
  NULL,
'<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{headline}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#0a0a1a;color:#e2e8f0;line-height:1.6}
.hero{background:linear-gradient(180deg,#1a0533 0%,#0a0a1a 100%);padding:40px 20px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 50% 50%,rgba(168,85,247,.08) 0%,transparent 60%)}
.hero h1{font-size:clamp(1.6rem,4.5vw,2.5rem);font-weight:800;background:linear-gradient(135deg,#a855f7,#ec4899,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;position:relative}
.hero p{color:#a1a1aa;max-width:480px;margin:0 auto 20px;font-size:1.05rem}
.hero .bonus-badge{display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;padding:10px 28px;border-radius:999px;font-weight:800;font-size:1.2rem;margin-bottom:16px;box-shadow:0 0 24px rgba(168,85,247,.4)}
.container{max-width:600px;margin:0 auto;padding:0 16px}
.spin-section{padding:24px 0;text-align:center}
.spin-wheel{width:240px;height:240px;margin:0 auto 16px;border-radius:50%;background:conic-gradient(#a855f7,#ec4899,#f59e0b,#22c55e,#3b82f6,#a855f7);border:4px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 0 40px rgba(168,85,247,.3)}
.spin-wheel .center{width:80px;height:80px;background:#0a0a1a;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.9rem;color:#f59e0b;border:3px solid #334155}
.spin-btn{padding:14px 40px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;font-size:1.1rem;font-weight:800;border:none;border-radius:999px;cursor:pointer;box-shadow:0 0 20px rgba(245,158,11,.4);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(245,158,11,.4)}50%{box-shadow:0 0 36px rgba(245,158,11,.6)}}
.prizes{padding:24px 0}
.prizes h2{text-align:center;font-size:1.2rem;color:#f8fafc;margin-bottom:16px}
.prize-grid{display:grid;gap:10px}
@media(min-width:640px){.prize-grid{grid-template-columns:1fr 1fr}}
.prize{background:linear-gradient(135deg,rgba(168,85,247,.15),rgba(236,72,153,.15));border:1px solid rgba(168,85,247,.3);border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px}
.prize .icon{font-size:2rem}
.prize h3{font-size:.9rem;font-weight:700;color:#f8fafc}
.prize p{font-size:.82rem;color:#a1a1aa}
.leaderboard{padding:24px 0}
.leaderboard h2{text-align:center;font-size:1.2rem;color:#f8fafc;margin-bottom:16px}
.lb-list{background:#1a1a2e;border:1px solid #334155;border-radius:12px;overflow:hidden}
.lb-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #1e293b}
.lb-row:last-child{border-bottom:none}
.lb-row .rank{font-weight:800;color:#f59e0b;width:24px;text-align:center}
.lb-row .name{flex:1;font-size:.9rem;color:#e2e8f0}
.lb-row .pts{font-weight:700;color:#a855f7;font-size:.88rem}
.cta-section{text-align:center;padding:24px 0 40px}
.cta-btn{display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;font-size:1.15rem;font-weight:800;border:none;border-radius:999px;cursor:pointer;box-shadow:0 4px 24px rgba(168,85,247,.4);text-decoration:none;animation:pulse 2s infinite}
.cta-btn:hover{transform:scale(1.04)}
.cta-sub{margin-top:10px;font-size:.85rem;color:#a1a1aa}
</style>
</head>
<body>
<div class="hero">
  <div class="bonus-badge">{{bonus_badge}}</div>
  <h1>{{headline}}</h1>
  <p>{{subheadline}}</p>
</div>
<div class="container">
  <div class="spin-section">
    <div class="spin-wheel"><div class="center">SPIN TO<br>WIN</div></div>
    <button class="spin-btn">🎡 Spin the Wheel!</button>
  </div>
  <div class="prizes">
    <h2>Today''s Prizes</h2>
    <div class="prize-grid">
      <div class="prize"><div class="icon">💰</div><div><h3>{{prize_1_name}}</h3><p>{{prize_1_desc}}</p></div></div>
      <div class="prize"><div class="icon">🎁</div><div><h3>{{prize_2_name}}</h3><p>{{prize_2_desc}}</p></div></div>
      <div class="prize"><div class="icon">⭐</div><div><h3>{{prize_3_name}}</h3><p>{{prize_3_desc}}</p></div></div>
      <div class="prize"><div class="icon">🏆</div><div><h3>{{prize_4_name}}</h3><p>{{prize_4_desc}}</p></div></div>
    </div>
  </div>
  <div class="leaderboard">
    <h2>🏆 Top Players This Week</h2>
    <div class="lb-list">
      <div class="lb-row"><span class="rank">1</span><span class="name">Player***847</span><span class="pts">24,500 pts</span></div>
      <div class="lb-row"><span class="rank">2</span><span class="name">Lucky***291</span><span class="pts">19,800 pts</span></div>
      <div class="lb-row"><span class="rank">3</span><span class="name">Winner***553</span><span class="pts">15,200 pts</span></div>
      <div class="lb-row"><span class="rank">4</span><span class="name">Pro***116</span><span class="pts">12,100 pts</span></div>
      <div class="lb-row"><span class="rank">5</span><span class="name">Star***702</span><span class="pts">9,800 pts</span></div>
    </div>
  </div>
  <div class="cta-section">
    <a href="{{cta_url}}" class="cta-btn">{{cta_text}}</a>
    <p class="cta-sub">No deposit required • Instant withdrawals • 18+</p>
  </div>
</div>
</body>
</html>',
  '[{"key":"headline","label":"Headline","type":"text","default":"Spin, Play & Win Big Today!"},{"key":"subheadline","label":"Subheadline","type":"text","default":"Join thousands of winners. Your luck starts here!"},{"key":"bonus_badge","label":"Bonus Badge Text","type":"text","default":"🎁 UP TO $1,000 BONUS"},{"key":"prize_1_name","label":"Prize 1 Name","type":"text","default":"$500 Cash Prize"},{"key":"prize_1_desc","label":"Prize 1 Description","type":"text","default":"Direct to your account"},{"key":"prize_2_name","label":"Prize 2 Name","type":"text","default":"Free Spins Pack"},{"key":"prize_2_desc","label":"Prize 2 Description","type":"text","default":"100 premium spins"},{"key":"prize_3_name","label":"Prize 3 Name","type":"text","default":"VIP Status"},{"key":"prize_3_desc","label":"Prize 3 Description","type":"text","default":"Exclusive perks & bonuses"},{"key":"prize_4_name","label":"Prize 4 Name","type":"text","default":"Mystery Jackpot"},{"key":"prize_4_desc","label":"Prize 4 Description","type":"text","default":"Up to $10,000 prize"},{"key":"cta_text","label":"CTA Button Text","type":"text","default":"CLAIM YOUR BONUS NOW"},{"key":"cta_url","label":"CTA URL","type":"url","default":"#"}]',
  '["gaming","casino","slots","bonus","neon"]',
  84, 1, 'active', NOW(), NOW()
),

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Lead Generation
-- ═══════════════════════════════════════════════════════════════════════════════
(
  0,
  'Lead Generation',
  'lead-generation',
  'leadgen',
  'Professional B2B lead generation page with problem-agitate-solve structure, multi-step form with progress bar, case studies, trust logos, and corporate aesthetic.',
  NULL,
'<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{headline}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.7}
.hero{background:#0f172a;padding:48px 20px;text-align:center;color:#f8fafc}
.hero h1{font-size:clamp(1.5rem,4vw,2.3rem);font-weight:800;margin-bottom:10px}
.hero h1 span{color:#38bdf8}
.hero p{font-size:1.05rem;color:#94a3b8;max-width:540px;margin:0 auto}
.container{max-width:680px;margin:0 auto;padding:0 16px}
.problem-section{padding:40px 0 24px;text-align:center}
.problem-section h2{font-size:1.3rem;color:#0f172a;margin-bottom:16px}
.problem-list{display:flex;flex-direction:column;gap:10px;text-align:left;max-width:480px;margin:0 auto}
.problem-item{display:flex;gap:10px;align-items:flex-start;padding:10px 14px;background:#fee2e2;border-radius:10px;font-size:.92rem;color:#991b1b}
.problem-item .icon{font-size:1.1rem;flex-shrink:0;margin-top:2px}
.form-section{background:#fff;border-radius:16px;padding:28px 24px;margin:24px 0;box-shadow:0 4px 24px rgba(0,0,0,.06);border:1px solid #e2e8f0}
.form-section h2{text-align:center;font-size:1.2rem;color:#0f172a;margin-bottom:6px}
.form-section .sub{text-align:center;color:#64748b;font-size:.9rem;margin-bottom:20px}
.progress{display:flex;gap:6px;margin-bottom:20px}
.progress .step{flex:1;height:4px;background:#e2e8f0;border-radius:2px;transition:background .3s}
.progress .step.active{background:#38bdf8}
.form-step{display:none}
.form-step.active{display:block}
.field{margin-bottom:14px}
.field label{display:block;font-size:.82rem;font-weight:600;color:#475569;margin-bottom:4px}
.field input,.field select,.field textarea{width:100%;padding:12px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:.95rem;outline:none;transition:border-color .2s;font-family:inherit}
.field input:focus,.field select:focus,.field textarea:focus{border-color:#38bdf8}
.field textarea{resize:vertical;min-height:80px}
.step-nav{display:flex;justify-content:space-between;gap:10px;margin-top:16px}
.btn-next,.btn-submit{padding:12px 28px;border:none;border-radius:10px;font-size:.95rem;font-weight:700;cursor:pointer;transition:background .15s}
.btn-next{background:#0f172a;color:#fff}
.btn-next:hover{background:#1e293b}
.btn-submit{background:#2563eb;color:#fff;flex:1}
.btn-submit:hover{background:#1d4ed8}
.case-studies{padding:24px 0}
.case-studies h2{text-align:center;font-size:1.2rem;color:#0f172a;margin-bottom:20px}
.case-grid{display:grid;gap:14px}
@media(min-width:640px){.case-grid{grid-template-columns:1fr 1fr}}
.case{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px}
.case .metric{font-size:2rem;font-weight:800;color:#2563eb;margin-bottom:4px}
.case h3{font-size:.92rem;font-weight:700;color:#0f172a;margin-bottom:4px}
.case p{font-size:.85rem;color:#64748b}
.trust-logos{padding:24px 0;text-align:center}
.trust-logos h3{font-size:.82rem;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px}
.logo-row{display:flex;justify-content:center;gap:24px;flex-wrap:wrap}
.logo-item{font-size:.95rem;font-weight:700;color:#94a3b8;padding:8px 16px;background:#f1f5f9;border-radius:8px}
</style>
</head>
<body>
<div class="hero">
  <h1>{{headline}}</h1>
  <p>{{subheadline}}</p>
</div>
<div class="container">
  <div class="problem-section">
    <h2>Sound Familiar?</h2>
    <div class="problem-list">
      <div class="problem-item"><span class="icon">❌</span> {{problem_1}}</div>
      <div class="problem-item"><span class="icon">❌</span> {{problem_2}}</div>
      <div class="problem-item"><span class="icon">❌</span> {{problem_3}}</div>
    </div>
  </div>
  <div class="form-section">
    <h2>Get Your Free {{offer_name}}</h2>
    <p class="sub">{{form_subheadline}}</p>
    <div class="progress"><div class="step active" id="s1"></div><div class="step" id="s2"></div><div class="step" id="s3"></div></div>
    <form action="{{form_action}}" method="POST">
      <div class="form-step active" data-step="1">
        <div class="field"><label>First Name</label><input type="text" name="first_name" required></div>
        <div class="field"><label>Last Name</label><input type="text" name="last_name" required></div>
        <div class="step-nav"><span></span><button type="button" class="btn-next" onclick="goStep(2)">Next →</button></div>
      </div>
      <div class="form-step" data-step="2">
        <div class="field"><label>Work Email</label><input type="email" name="email" required></div>
        <div class="field"><label>Company Name</label><input type="text" name="company"></div>
        <div class="step-nav"><button type="button" class="btn-next" onclick="goStep(1)">← Back</button><button type="button" class="btn-next" onclick="goStep(3)">Next →</button></div>
      </div>
      <div class="form-step" data-step="3">
        <div class="field"><label>Company Size</label><select name="size"><option value="">Select...</option><option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option></select></div>
        <div class="field"><label>What''s your biggest challenge?</label><textarea name="challenge" rows="3"></textarea></div>
        <div class="step-nav"><button type="button" class="btn-next" onclick="goStep(2)">← Back</button><button type="submit" class="btn-submit">{{form_cta}}</button></div>
      </div>
    </form>
  </div>
  <div class="case-studies">
    <h2>Results Our Clients See</h2>
    <div class="case-grid">
      <div class="case"><div class="metric">{{case_1_metric}}</div><h3>{{case_1_title}}</h3><p>{{case_1_desc}}</p></div>
      <div class="case"><div class="metric">{{case_2_metric}}</div><h3>{{case_2_title}}</h3><p>{{case_2_desc}}</p></div>
    </div>
  </div>
  <div class="trust-logos">
    <h3>Trusted by Industry Leaders</h3>
    <div class="logo-row">
      <span class="logo-item">{{logo_1}}</span>
      <span class="logo-item">{{logo_2}}</span>
      <span class="logo-item">{{logo_3}}</span>
      <span class="logo-item">{{logo_4}}</span>
    </div>
  </div>
</div>
<script>
function goStep(n){document.querySelectorAll(''.form-step'').forEach(s=>s.classList.remove(''active''));document.querySelector(''[data-step=""+n+"'']'').classList.add(''active'');document.querySelectorAll(''.progress .step'').forEach((s,i)=>s.classList.toggle(''active'',i<n))}
</script>
</body>
</html>',
  '[{"key":"headline","label":"Headline","type":"text","default":"Generate 3X More Qualified Leads — Starting Today"},{"key":"subheadline","label":"Subheadline","type":"text","default":"The proven system used by 500+ B2B companies to fill their sales pipeline."},{"key":"offer_name","label":"Offer Name","type":"text","default":"Growth Assessment"},{"key":"form_subheadline","label":"Form Subtitle","type":"text","default":"Takes 60 seconds. Get your custom report within 24 hours."},{"key":"form_action","label":"Form Action URL","type":"url","default":"#"},{"key":"form_cta","label":"Form Submit Text","type":"text","default":"GET MY FREE ASSESSMENT →"},{"key":"problem_1","label":"Problem 1","type":"text","default":"Low-quality leads that never convert into paying customers"},{"key":"problem_2","label":"Problem 2","type":"text","default":"Wasting budget on ads that bring tire-kickers, not decision-makers"},{"key":"problem_3","label":"Problem 3","type":"text","default":"Sales team spending hours chasing leads that go nowhere"},{"key":"case_1_metric","label":"Case Study 1 Metric","type":"text","default":"+347%"},{"key":"case_1_title","label":"Case Study 1 Title","type":"text","default":"Lead Volume Increase"},{"key":"case_1_desc","label":"Case Study 1 Description","type":"text","default":"SaaS company tripled qualified leads in 90 days."},{"key":"case_2_metric","label":"Case Study 2 Metric","type":"text","default":"-62%"},{"key":"case_2_title","label":"Case Study 2 Title","type":"text","default":"Cost Per Lead Reduction"},{"key":"case_2_desc","label":"Case Study 2 Description","type":"text","default":"E-commerce brand cut CPL while improving lead quality."},{"key":"logo_1","label":"Trust Logo 1","type":"text","default":"Microsoft"},{"key":"logo_2","label":"Trust Logo 2","type":"text","default":"Salesforce"},{"key":"logo_3","label":"Trust Logo 3","type":"text","default":"HubSpot"},{"key":"logo_4","label":"Trust Logo 4","type":"text","default":"Stripe"}]',
  '["leadgen","b2b","lead-generation","saas","enterprise"]',
  87, 1, 'active', NOW(), NOW()
),

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. App Install
-- ═══════════════════════════════════════════════════════════════════════════════
(
  0,
  'App Install',
  'app-install',
  'custom',
  'Modern app download page with mockup hero, feature screenshots, star ratings, iOS & Android download buttons, and user count. Minimal, fast-loading.',
  NULL,
'<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{app_name}}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#fff;color:#1a1a2e;line-height:1.6}
.hero{background:linear-gradient(180deg,#eff6ff 0%,#fff 100%);padding:48px 20px 32px;text-align:center}
.hero .app-icon{width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:#fff;box-shadow:0 4px 16px rgba(59,130,246,.3)}
.hero h1{font-size:clamp(1.5rem,4vw,2.2rem);font-weight:800;color:#0f172a;margin-bottom:8px}
.hero p{font-size:1.05rem;color:#64748b;max-width:480px;margin:0 auto 20px}
.hero .rating{display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:6px}
.hero .stars{color:#f59e0b;font-size:1.1rem}
.hero .rating-text{font-size:.88rem;color:#64748b}
.hero .user-count{font-size:.88rem;color:#3b82f6;font-weight:600}
.container{max-width:580px;margin:0 auto;padding:0 16px}
.download-btns{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;padding:0 0 32px}
.dl-btn{display:flex;align-items:center;gap:10px;padding:14px 24px;background:#0f172a;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:.95rem;transition:background .15s}
.dl-btn:hover{background:#1e293b}
.dl-btn .icon{font-size:1.6rem}
.dl-btn .text{line-height:1.2}
.dl-btn .text small{font-size:.7rem;font-weight:400;opacity:.8}
.mockup{padding:16px 0 32px;text-align:center}
.phone{width:220px;height:400px;margin:0 auto;background:#f1f5f9;border-radius:28px;border:4px solid #cbd5e1;display:flex;align-items:center;justify-content:center;font-size:.9rem;color:#94a3b8;position:relative;overflow:hidden}
.phone::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:80px;height:20px;background:#cbd5e1;border-radius:0 0 12px 12px}
.features{padding:24px 0}
.features h2{text-align:center;font-size:1.2rem;color:#0f172a;margin-bottom:20px}
.feature-list{display:grid;gap:14px}
@media(min-width:640px){.feature-list{grid-template-columns:1fr 1fr}}
.feature{background:#f8fafc;border-radius:14px;padding:20px;border:1px solid #e2e8f0}
.feature .screenshot{height:120px;background:#eff6ff;border-radius:10px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:#93c5fd;font-size:.85rem}
.feature h3{font-size:.95rem;font-weight:700;color:#0f172a;margin-bottom:4px}
.feature p{font-size:.85rem;color:#64748b}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:24px 0;text-align:center}
.stat .num{font-size:1.5rem;font-weight:800;color:#3b82f6}
.stat .lbl{font-size:.78rem;color:#94a3b8;margin-top:2px}
.cta-bottom{text-align:center;padding:24px 0 40px}
.cta-bottom h2{font-size:1.2rem;color:#0f172a;margin-bottom:16px}
</style>
</head>
<body>
<div class="hero">
  <div class="app-icon">📱</div>
  <h1>{{app_name}}</h1>
  <p>{{app_tagline}}</p>
  <div class="rating">
    <span class="stars">★★★★★</span>
    <span class="rating-text">{{rating}} out of 5</span>
  </div>
  <div class="user-count">{{user_count}} downloads and counting</div>
</div>
<div class="container">
  <div class="download-btns">
    <a href="{{ios_url}}" class="dl-btn"><span class="icon">🍎</span><span class="text"><small>Download on the</small>App Store</span></a>
    <a href="{{android_url}}" class="dl-btn"><span class="icon">▶</span><span class="text"><small>Get it on</small>Google Play</span></a>
  </div>
  <div class="mockup"><div class="phone">[App Screenshot]</div></div>
  <div class="features">
    <h2>Why You''ll Love {{app_name}}</h2>
    <div class="feature-list">
      <div class="feature"><div class="screenshot">[Feature 1 Screenshot]</div><h3>{{feature_1_title}}</h3><p>{{feature_1_desc}}</p></div>
      <div class="feature"><div class="screenshot">[Feature 2 Screenshot]</div><h3>{{feature_2_title}}</h3><p>{{feature_2_desc}}</p></div>
      <div class="feature"><div class="screenshot">[Feature 3 Screenshot]</div><h3>{{feature_3_title}}</h3><p>{{feature_3_desc}}</p></div>
      <div class="feature"><div class="screenshot">[Feature 4 Screenshot]</div><h3>{{feature_4_title}}</h3><p>{{feature_4_desc}}</p></div>
    </div>
  </div>
  <div class="stats-row">
    <div class="stat"><div class="num">{{stat_1_val}}</div><div class="lbl">{{stat_1_lbl}}</div></div>
    <div class="stat"><div class="num">{{stat_2_val}}</div><div class="lbl">{{stat_2_lbl}}</div></div>
    <div class="stat"><div class="num">{{stat_3_val}}</div><div class="lbl">{{stat_3_lbl}}</div></div>
  </div>
  <div class="cta-bottom">
    <h2>Ready to Get Started?</h2>
    <div class="download-btns">
      <a href="{{ios_url}}" class="dl-btn"><span class="icon">🍎</span><span class="text"><small>Download on the</small>App Store</span></a>
      <a href="{{android_url}}" class="dl-btn"><span class="icon">▶</span><span class="text"><small>Get it on</small>Google Play</span></a>
    </div>
  </div>
</div>
</body>
</html>',
  '[{"key":"app_name","label":"App Name","type":"text","default":"FlowApp"},{"key":"app_tagline","label":"App Tagline","type":"text","default":"The smarter way to manage your day. Simple, fast, beautiful."},{"key":"rating","label":"Star Rating","type":"text","default":"4.8"},{"key":"user_count","label":"Download Count","type":"text","default":"1M+"},{"key":"ios_url","label":"iOS App Store URL","type":"url","default":"#"},{"key":"android_url","label":"Google Play URL","type":"url","default":"#"},{"key":"feature_1_title","label":"Feature 1 Title","type":"text","default":"Smart Scheduling"},{"key":"feature_1_desc","label":"Feature 1 Description","type":"text","default":"AI-powered calendar that learns your habits and suggests optimal times."},{"key":"feature_2_title","label":"Feature 2 Title","type":"text","default":"Team Collaboration"},{"key":"feature_2_desc","label":"Feature 2 Description","type":"text","default":"Share tasks, files, and updates with your team in real-time."},{"key":"feature_3_title","label":"Feature 3 Title","type":"text","default":"Progress Tracking"},{"key":"feature_3_desc","label":"Feature 3 Description","type":"text","default":"Visual dashboards to track goals and celebrate milestones."},{"key":"feature_4_title","label":"Feature 4 Title","type":"text","default":"Offline Mode"},{"key":"feature_4_desc","label":"Feature 4 Description","type":"text","default":"Works without internet. Syncs automatically when back online."},{"key":"stat_1_val","label":"Stat 1 Value","type":"text","default":"4.8★"},{"key":"stat_1_lbl","label":"Stat 1 Label","type":"text","default":"App Rating"},{"key":"stat_2_val","label":"Stat 2 Value","type":"text","default":"1M+"},{"key":"stat_2_lbl","label":"Stat 2 Label","type":"text","default":"Downloads"},{"key":"stat_3_val","label":"Stat 3 Value","type":"text","default":"150+"},{"key":"stat_3_lbl","label":"Stat 3 Label","type":"text","default":"Countries"}]',
  '["app","mobile","install","download","ios","android"]',
  83, 1, 'active', NOW(), NOW()
);
