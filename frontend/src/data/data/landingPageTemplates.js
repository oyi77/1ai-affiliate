/**
 * Landing Page HTML Template Library
 *
 * 16 self-contained landing page templates organized by category.
 * Each template produces a full HTML document with inline CSS,
 * mobile-responsive layout, dark theme, and indigo/blue accents.
 *
 * Schema per template:
 *   id              – kebab-case unique identifier
 *   name            – display name
 *   icon            – emoji
 *   category        – 'sweepstakes' | 'vsl' | 'ecommerce' | 'crypto' |
 *                     'dating' | 'health' | 'finance' | 'mobile' | 'generic'
 *   description     – one-line summary
 *   conversionType  – 'lead_form' | 'cta_button' | 'countdown' | 'quiz' |
 *                     'review' | 'video_cta'
 *   htmlContent      – FULL self-contained HTML string
 *   variables        – [{ name, placeholder, description }]
 *   previewColor     – hex accent for UI preview
 */

/* ── Helper: common HTML wrapper ─────────────────────────────── */

const commonHead = (title, extraStyle = '') => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;-webkit-text-size-adjust:100%}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0a0a1a;color:#e2e8f0;line-height:1.6;min-height:100vh}
img{max-width:100%;height:auto;display:block}
a{color:#818cf8;text-decoration:none}
a:hover{text-decoration:underline}
.btn{display:inline-block;padding:14px 32px;border-radius:8px;font-size:1.05rem;font-weight:600;cursor:pointer;border:none;text-decoration:none;text-align:center;transition:all .2s}
.btn-primary{background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;box-shadow:0 4px 15px rgba(99,102,241,.4)}
.btn-primary:hover{background:linear-gradient(135deg,#818cf8,#6366f1);transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.5);text-decoration:none}
.btn-lg{padding:16px 40px;font-size:1.15rem}
.container{max-width:720px;margin:0 auto;padding:20px}
.card{background:#1a1a2e;border:1px solid #2d2d44;border-radius:12px;padding:24px;margin-bottom:16px}
.badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.badge-indigo{background:rgba(99,102,241,.15);color:#818cf8}
.badge-green{background:rgba(34,197,94,.15);color:#22c55e}
.text-center{text-align:center}
.text-sm{font-size:.875rem}
.text-muted{color:#94a3b8}
.mt-1{margin-top:8px}.mt-2{margin-top:16px}.mt-3{margin-top:24px}.mt-4{margin-top:32px}
.mb-1{margin-bottom:8px}.mb-2{margin-bottom:16px}.mb-3{margin-bottom:24px}
.pb-2{padding-bottom:16px}
input[type="text"],input[type="email"],input[type="tel"],select{width:100%;padding:12px 16px;border:1px solid #2d2d44;border-radius:8px;background:#12122a;color:#e2e8f0;font-size:1rem;outline:none;transition:border-color .2s}
input:focus,select:focus{border-color:#6366f1}
input::placeholder{color:#4a4a6a}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:480px){.grid-2{grid-template-columns:1fr}.btn-lg{width:100%;padding:14px 24px}.container{padding:16px}}
${extraStyle}
</style>
</head>`;

/* ═══════════════════════════════════════════════════════════════
   SWEEPSTAKES TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

const iphoneGiveaway = `
${commonHead('Claim Your FREE iPhone 16!')}
<style>
.hero{background:linear-gradient(135deg,#1a0a3e 0%,#0f0f2a 50%,#0a1628 100%);padding:40px 0 30px;text-align:center}
.hero-img{width:200px;margin:0 auto 20px;border-radius:20px;overflow:hidden}
.countdown{display:flex;justify-content:center;gap:12px;margin:24px 0}
.countdown-box{background:#1a1a2e;border:2px solid #6366f1;border-radius:10px;min-width:64px;padding:12px 8px}
.countdown-num{font-size:1.8rem;font-weight:700;color:#fff;line-height:1}
.countdown-label{font-size:.65rem;color:#818cf8;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}
.steps{display:flex;flex-direction:column;gap:14px;margin:24px 0}
.step{display:flex;align-items:flex-start;gap:14px;text-align:left}
.step-num{flex-shrink:0;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem}
.step-text h4{font-size:.95rem;color:#fff;margin-bottom:2px}
.step-text p{font-size:.82rem;color:#94a3b8}
.guarantee{display:flex;align-items:center;justify-content:center;gap:8px;color:#22c55e;font-size:.82rem;margin-top:16px}
.pulse{animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
.claimed-bar{background:#12122a;border-radius:20px;padding:10px 20px;display:inline-flex;align-items:center;gap:8px;font-size:.82rem;margin-bottom:20px;border:1px solid #2d2d44}
.claimed-bar .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite}
</style>
<body>
<div class="hero">
<div class="container">
<div class="claimed-bar"><span class="dot"></span> <span class="text-muted">3,847 people claimed today</span></div>
<div class="hero-img" style="background:linear-gradient(135deg,#6366f1,#818cf8);height:200px;display:flex;align-items:center;justify-content:center;font-size:80px">📱</div>
<h1 style="font-size:1.6rem;margin-bottom:8px;color:#fff">Congratulations!</h1>
<p style="color:#94a3b8;font-size:.95rem;margin-bottom:8px">You've been selected to receive a</p>
<h2 style="font-size:2rem;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800">FREE iPhone 16 Pro</h2>
<p class="text-sm text-muted mt-1">Limited quantity — claim yours before time runs out</p>
<div class="countdown">
<div class="countdown-box"><div class="countdown-num" id="h">02</div><div class="countdown-label">Hours</div></div>
<div class="countdown-box"><div class="countdown-num" id="m">47</div><div class="countdown-label">Min</div></div>
<div class="countdown-box"><div class="countdown-num" id="s">33</div><div class="countdown-label">Sec</div></div>
</div>
</div>
</div>
<div class="container">
<div class="card">
<h3 style="font-size:1rem;margin-bottom:16px;color:#fff">Complete these 3 steps to claim:</h3>
<div class="steps">
<div class="step"><div class="step-num">1</div><div class="step-text"><h4>Enter Your Details</h4><p>Name and email to reserve your unit</p></div></div>
<div class="step"><div class="step-num">2</div><div class="step-text"><h4>Confirm Your Identity</h4><p>Quick verification takes 30 seconds</p></div></div>
<div class="step"><div class="step-num">3</div><div class="step-text"><h4>Choose Shipping</h4><p>Select free express or standard delivery</p></div></div>
</div>
</div>
<form style="margin-top:24px">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<input type="tel" placeholder="{{phone}}" style="margin-bottom:16px">
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">CLAIM MY FREE iPHONE 16 →</button>
</form>
<div class="guarantee mt-2">🔒 100% Free · No Credit Card · Secure</div>
<p class="text-center text-sm text-muted mt-3" style="font-size:.72rem">By clicking above you agree to our Terms of Service. This is not an Apple Inc. promotion. Limited availability. Results may vary.</p>
</div>
<script>
(function(){
var t=2*3600+47*60+33;
setInterval(function(){
if(t<=0)return;t--;
var h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;
document.getElementById('h').textContent=String(h).padStart(2,'0');
document.getElementById('m').textContent=String(m).padStart(2,'0');
document.getElementById('s').textContent=String(s).padStart(2,'0');
},1000);
})();
</script>
</body></html>`;

const spinTheWheel = `
${commonHead('Spin to Win!')}
<style>
.wheel-wrap{position:relative;width:280px;height:280px;margin:0 auto 20px}
.wheel{width:280px;height:280px;border-radius:50%;border:4px solid #6366f1;transition:transform 4s cubic-bezier(.17,.67,.12,.99);overflow:hidden;position:relative}
.wheel-inner{width:100%;height:100%;background:conic-gradient(#6366f1 0deg 45deg,#4f46e5 45deg 90deg,#6366f1 90deg 135deg,#4338ca 135deg 180deg,#6366f1 180deg 225deg,#4f46e5 225deg 270deg,#6366f1 270deg 315deg,#4338ca 315deg 360deg);border-radius:50%;position:relative}
.wheel-inner::after{content:'';position:absolute;inset:40px;background:#0a0a1a;border-radius:50%}
.wheel-prize{position:absolute;font-size:.6rem;color:#fff;font-weight:700;transform-origin:center center;width:100%;text-align:center;top:30px;z-index:2;transform:rotate(var(--rot))}
.pointer{position:absolute;top:-14px;left:50%;transform:translateX(-50%);z-index:10;font-size:2rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))}
.spin-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);border:3px solid #fff;color:#fff;font-weight:800;font-size:.8rem;cursor:pointer;box-shadow:0 4px 15px rgba(245,158,11,.4)}
.spin-btn:disabled{opacity:.6;cursor:not-allowed}
.prizes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0}
.prize-item{background:#1a1a2e;border:1px solid #2d2d44;border-radius:8px;padding:10px 6px;text-align:center;font-size:.72rem;color:#94a3b8}
.prize-item .prize-icon{font-size:1.3rem;margin-bottom:4px;display:block}
.congrats{display:none;animation:fadeIn .5s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.results{margin-top:16px}
.results .result-line{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2d2d44;font-size:.85rem}
.results .result-line:last-child{border-bottom:none}
.results .result-name{color:#94a3b8}
.results .result-value{color:#fff;font-weight:600}
</style>
<body style="background:linear-gradient(180deg,#0a0a1a 0%,#0f0a2e 100%)">
<div class="container text-center" style="padding-top:30px">
<div class="badge badge-indigo mb-2">🎉 Special Event</div>
<h1 style="font-size:1.6rem;color:#fff;margin-bottom:4px">Spin to Win!</h1>
<p class="text-muted text-sm mb-3">Every spin wins — claim your prize now</p>

<div class="wheel-wrap">
<div class="pointer">▼</div>
<div class="wheel" id="wheel">
<div class="wheel-inner"></div>
<span class="wheel-prize" style="--rot:0deg">$500</span>
<span class="wheel-prize" style="--rot:45deg">iPHONE</span>
<span class="wheel-prize" style="--rot:90deg">$25</span>
<span class="wheel-prize" style="--rot:135deg">$100</span>
<span class="wheel-prize" style="--rot:180deg">$50</span>
<span class="wheel-prize" style="--rot:225deg">TV</span>
<span class="wheel-prize" style="--rot:270deg">$200</span>
<span class="wheel-prize" style="--rot:315deg">TRY</span>
</div>
<button class="spin-btn" id="spinBtn" onclick="spinWheel()">SPIN</button>
</div>

<div class="prizes" id="prizeList">
<div class="prize-item"><span class="prize-icon">📱</span>iPhone 16</div>
<div class="prize-item"><span class="prize-icon">💰</span>$500 Cash</div>
<div class="prize-item"><span class="prize-icon">📺</span>Smart TV</div>
<div class="prize-item"><span class="prize-icon">💵</span>$200 Cash</div>
<div class="prize-item"><span class="prize-icon">🎁</span>$100 Gift</div>
<div class="prize-item"><span class="prize-icon">✨</span>$50 Coupon</div>
</div>

<div id="congrats" class="congrats">
<div class="card" style="border-color:#22c55e">
<div style="font-size:3rem;margin-bottom:8px">🎉</div>
<h2 style="color:#22c55e;font-size:1.3rem">You Won <span id="wonPrize">$500</span>!</h2>
<p class="text-sm text-muted mt-1">Enter your email to claim your prize before it expires</p>
<form onsubmit="event.preventDefault()" style="margin-top:16px">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">CLAIM MY PRIZE →</button>
</form>
</div>
</div>

<div class="results mt-3">
<h3 class="text-sm text-muted mb-1">Recent Winners</h3>
<div class="result-line"><span class="result-name">Sarah M. — Texas</span><span class="result-value">iPhone 16</span></div>
<div class="result-line"><span class="result-name">James K. — Florida</span><span class="result-value">$200</span></div>
<div class="result-line"><span class="result-name">Lisa R. — Ohio</span><span class="result-value">$500</span></div>
</div>

<p class="text-sm text-muted mt-3" style="font-size:.72rem">No purchase necessary. See official rules. This promotion is not affiliated with Apple Inc.</p>
</div>
<script>
var prizes=['$500','iPhone 16','$25','$100','$50','Smart TV','$200','$500'];
var spinCount=0;
function spinWheel(){
var btn=document.getElementById('spinBtn');
btn.disabled=true;spinCount++;
var win=spinCount%3===0;
var seg=win?0:Math.floor(Math.random()*7)+1;
var deg=360*5+seg*45+22.5;
document.getElementById('wheel').style.transform='rotate('+deg+'deg)';
setTimeout(function(){
document.getElementById('prizeList').style.display='none';
document.getElementById('wonPrize').textContent=prizes[seg];
document.getElementById('congrats').style.display='block';
},4200);
}
</script>
</body></html>`;

const surveyComplete = `
${commonHead('Congratulations — You Qualify!')}
<style>
.hero-banner{background:linear-gradient(135deg,#1e1b4b,#0f172a);padding:40px 0 30px;text-align:center}
.checkmark{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:2.2rem;color:#fff;box-shadow:0 0 30px rgba(34,197,94,.3)}
.progress{background:#2d2d44;border-radius:20px;height:8px;margin:16px 0;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#6366f1,#818cf8);border-radius:20px;width:100%;transition:width 1s ease}
.gift-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}
.gift-card{background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:16px 10px;text-align:center;cursor:pointer;transition:all .2s}
.gift-card:hover,.gift-card.selected{border-color:#6366f1;background:#1e1b4b}
.gift-card .gift-emoji{font-size:2rem;margin-bottom:6px;display:block}
.gift-card .gift-label{font-size:.75rem;color:#94a3b8}
.gift-card .gift-val{font-size:.9rem;color:#fff;font-weight:700}
.timer-badge{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:8px 16px;display:inline-flex;align-items:center;gap:6px;font-size:.82rem;color:#f87171;margin:16px 0}
</style>
<body>
<div class="hero-banner">
<div class="container">
<div class="checkmark">✓</div>
<h1 style="font-size:1.5rem;color:#fff;margin-bottom:4px">Survey Complete!</h1>
<p class="text-muted text-sm">You've qualified for an exclusive reward</p>
<div class="progress"><div class="progress-fill"></div></div>
<p class="text-sm" style="color:#818cf8">Step 3 of 3 — Final Step</p>
</div>
</div>
<div class="container">
<div class="timer-badge">⏱️ Your reward expires in <strong id="timer" style="margin-left:4px">14:59</strong></div>

<h2 style="font-size:1.15rem;color:#fff;margin-bottom:16px;text-align:center">Choose Your Reward:</h2>
<div class="gift-grid">
<div class="gift-card selected" onclick="selectGift(this)"><span class="gift-emoji">📱</span><div class="gift-val">$500</div><div class="gift-label">Gift Card</div></div>
<div class="gift-card" onclick="selectGift(this)"><span class="gift-emoji">👟</span><div class="gift-val">$200</div><div class="gift-label">Nike Card</div></div>
<div class="gift-card" onclick="selectGift(this)"><span class="gift-emoji">☕</span><div class="gift-val">$100</div><div class="gift-label">Starbucks</div></div>
<div class="gift-card" onclick="selectGift(this)"><span class="gift-emoji">🛒</span><div class="gift-val">$500</div><div class="gift-label">Amazon</div></div>
<div class="gift-card" onclick="selectGift(this)"><span class="gift-emoji">🎮</span><div class="gift-val">$250</div><div class="gift-label">Best Buy</div></div>
<div class="gift-card" onclick="selectGift(this)"><span class="gift-emoji">✈️</span><div class="gift-val">$750</div><div class="gift-label">Travel</div></div>
</div>

<div class="card mt-3">
<h3 style="font-size:1rem;color:#fff;margin-bottom:14px">Claim Your Reward</h3>
<form onsubmit="event.preventDefault()">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<select style="margin-bottom:16px">
<option value="">How did you hear about us?</option>
<option>Social Media</option><option>Friend</option><option>Ad</option><option>Other</option>
</select>
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">CLAIM REWARD NOW →</button>
</form>
</div>

<p class="text-center text-sm text-muted mt-2">🔒 Your information is secure and will not be shared</p>
<p class="text-center text-sm text-muted mt-3" style="font-size:.72rem">Rewards are subject to availability. By submitting you agree to our Terms and Privacy Policy.</p>
</div>
<script>
function selectGift(el){document.querySelectorAll('.gift-card').forEach(function(c){c.classList.remove('selected')});el.classList.add('selected')}
var t=14*60+59;setInterval(function(){if(t<=0)return;t--;var m=Math.floor(t/60),s=t%60;document.getElementById('timer').textContent=m+':'+(s<10?'0':'')+s},1000);
</script>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   VSL TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

const healthSupplementVSL = `
${commonHead('Breakthrough Health Discovery')}
<style>
.vsl-hero{background:linear-gradient(135deg,#0a0a1a,#1a0a2e);padding:30px 0;text-align:center}
.video-container{position:relative;width:100%;max-width:560px;margin:0 auto;border-radius:12px;overflow:hidden;aspect-ratio:16/9;background:#12122a;border:2px solid #2d2d44;cursor:pointer}
.video-poster{width:100%;height:100%;object-fit:cover}
.play-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(99,102,241,.9);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.3);transition:all .2s}
.play-btn:hover{transform:translate(-50%,-50%) scale(1.1);background:rgba(129,140,248,.95)}
.play-btn::after{content:'';border-left:16px solid #fff;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px}
.video-duration{position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,.7);padding:4px 10px;border-radius:6px;font-size:.72rem;color:#fff}
.below-vid{position:absolute;bottom:10px;left:10px;display:flex;align-items:center;gap:6px;font-size:.72rem;color:#f87171;font-weight:600}
.below-vid .rec-dot{width:8px;height:8px;border-radius:50%;background:#f87171;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.testimonial{background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:18px;margin-bottom:14px}
.testimonial-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#818cf8);display:flex;align-items:center;justify-content:center;font-size:1rem;color:#fff;font-weight:700}
.testimonial-text{font-size:.85rem;color:#cbd5e1;font-style:italic;line-height:1.5}
.testimonial-meta{font-size:.72rem;color:#64748b;margin-top:6px}
.stars{color:#f59e0b;font-size:.85rem}
.after-video{display:none;animation:fadeIn .6s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
</style>
<body>
<div class="vsl-hero">
<div class="container">
<div class="badge badge-indigo mb-2">🔬 Breakthrough Discovery</div>
<h1 style="font-size:1.5rem;color:#fff;margin-bottom:4px">Doctors Don't Want You to Know This</h1>
<p class="text-muted text-sm mb-3">Watch the short video below to discover the natural compound changing lives</p>
<div class="video-container" id="videoBox" onclick="playVideo()">
<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a0a2e,#0f0f2a);display:flex;align-items:center;justify-content:center;font-size:4rem">🧬</div>
<div class="play-btn"></div>
<div class="below-vid"><span class="rec-dot"></span> 12,847 watching now</div>
<div class="video-duration">12:47</div>
</div>
<p class="text-sm text-muted mt-2">⚠️ This video may be removed soon — watch now while you still can</p>
</div>
</div>

<div class="container" id="afterVideo">
<div class="after-video" id="ctaSection">
<div class="card" style="border-color:#6366f1;text-align:center">
<div style="font-size:2rem;margin-bottom:8px">🧠</div>
<h2 style="font-size:1.2rem;color:#fff;margin-bottom:8px">The Science Is Clear</h2>
<p class="text-sm text-muted">Thousands are already experiencing the benefits. Don't miss your chance to try it risk-free.</p>
<button class="btn btn-primary btn-lg mt-3" style="width:100%">TRY IT RISK-FREE — CLAIM YOUR BOTTLE →</button>
<p class="text-sm text-muted mt-1">60-Day Money Back Guarantee</p>
</div>

<h3 style="font-size:1rem;color:#fff;margin:24px 0 14px">What People Are Saying:</h3>
<div class="testimonial">
<div class="testimonial-header"><div class="avatar">M</div><div><strong style="color:#fff;font-size:.9rem">Maria S.</strong><div class="stars">★★★★★</div></div></div>
<p class="testimonial-text">"I was skeptical, but after 2 weeks I noticed a dramatic difference in my energy levels. I feel 10 years younger!"</p>
<p class="testimonial-meta">Verified Purchase · 3 days ago</p>
</div>
<div class="testimonial">
<div class="testimonial-header"><div class="avatar">R</div><div><strong style="color:#fff;font-size:.9rem">Robert K.</strong><div class="stars">★★★★★</div></div></div>
<p class="testimonial-text">"My doctor couldn't believe my results at my last checkup. This stuff is the real deal."</p>
<p class="testimonial-meta">Verified Purchase · 1 week ago</p>
</div>
<div class="testimonial">
<div class="testimonial-header"><div class="avatar">J</div><div><strong style="color:#fff;font-size:.9rem">Jennifer L.</strong><div class="stars">★★★★☆</div></div></div>
<p class="testimonial-text">"Finally something that actually works. I've recommended it to all my friends."</p>
<p class="testimonial-meta">Verified Purchase · 2 weeks ago</p>
</div>
</div>
</div>
<p class="text-center text-sm text-muted mt-3 pb-2" style="font-size:.72rem;padding:0 20px 20px">These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Results may vary.</p>
<script>
function playVideo(){document.getElementById('ctaSection').style.display='block';document.getElementById('videoBox').querySelector('.play-btn').style.display='none'}
setTimeout(function(){document.getElementById('ctaSection').style.display='block'},30000);
</script>
</body></html>`;

const cryptoVSL = `
${commonHead('The Crypto That Could Change Everything')}
<style>
.hero-section{background:linear-gradient(135deg,#0a0a1a 0%,#0f0525 40%,#0a1628 100%);padding:36px 0 24px;text-align:center}
.ticker-bar{background:#12122a;border:1px solid #2d2d44;border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;margin:16px 0;font-size:.82rem}
.ticker-price{font-size:1.1rem;font-weight:700;color:#22c55e}
.ticker-change{color:#22c55e;font-weight:600}
.video-box{position:relative;width:100%;max-width:560px;margin:0 auto;border-radius:12px;overflow:hidden;aspect-ratio:16/9;background:linear-gradient(135deg,#1a0a2e,#0f0f2a);border:2px solid #6366f1;cursor:pointer}
.play-circle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:72px;height:72px;border-radius:50%;background:rgba(99,102,241,.9);display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(99,102,241,.5)}
.play-circle::after{content:'';border-left:20px solid #fff;border-top:12px solid transparent;border-bottom:12px solid transparent;margin-left:6px}
.urgency-bar{background:linear-gradient(90deg,#7c1d1d,#991b1b);padding:10px;text-align:center;font-size:.85rem;color:#fca5a5;font-weight:600;letter-spacing:.03em;margin:20px 0;border-radius:8px}
.urgency-bar strong{color:#fff}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}
.stat-box{background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:14px 8px;text-align:center}
.stat-val{font-size:1.2rem;font-weight:800;color:#fff}
.stat-label{font-size:.68rem;color:#64748b;margin-top:2px}
.cta-glow{box-shadow:0 0 30px rgba(99,102,241,.3),0 0 60px rgba(99,102,241,.1)}
.after-vid{display:none;animation:fadeIn .5s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
</style>
<body>
<div class="hero-section">
<div class="container">
<div class="badge badge-green mb-2">🚀 Trending Now</div>
<h1 style="font-size:1.5rem;color:#fff;margin-bottom:4px">This Crypto Could 100x in 2025</h1>
<p class="text-muted text-sm mb-3">Watch the video that Wall Street doesn't want you to see</p>

<div class="ticker-bar">
<div><strong style="color:#fff">{{token_symbol}}</strong> <span class="text-muted">{{token_name}}</span></div>
<div class="ticker-price">{{token_price}} <span class="ticker-change">+{{token_change}}%</span></div>
</div>

<div class="video-box" onclick="showContent()">
<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;background:linear-gradient(135deg,#1a0a2e,#0a1628)">🪙</div>
<div class="play-circle"></div>
</div>

<div class="urgency-bar" style="margin-top:16px">⏰ PRICE ALERT: This opportunity closes in <strong id="urgTimer">23:59:47</strong></div>
</div>
</div>

<div class="container" id="bottomContent">
<div class="after-vid" id="ctaArea">
<div class="stats-row">
<div class="stat-box"><div class="stat-val">{{stat_1}}</div><div class="stat-label">Early Investors</div></div>
<div class="stat-box"><div class="stat-val">{{stat_2}}</div><div class="stat-label">Avg. Return</div></div>
<div class="stat-box"><div class="stat-val">{{stat_3}}</div><div class="stat-label">Growth (30d)</div></div>
</div>

<div class="card text-center" style="border-color:#6366f1">
<h2 style="font-size:1.15rem;color:#fff;margin-bottom:8px">Start With Just $250</h2>
<p class="text-sm text-muted mb-3">Join thousands of early investors positioning for the next bull run</p>
<form onsubmit="event.preventDefault()">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:16px">
<button type="submit" class="btn btn-primary btn-lg cta-glow" style="width:100%">GET STARTED — INVEST NOW →</button>
</form>
<p class="text-sm text-muted mt-2">🔒 Bank-level encryption · Regulated broker</p>
</div>
</div>
</div>
<p class="text-center text-sm text-muted mt-3 pb-2" style="font-size:.72rem;padding:0 20px 20px">Trading cryptocurrencies involves significant risk. Past performance is not indicative of future results. Only invest what you can afford to lose.</p>
<script>
function showContent(){var c=document.getElementById('ctaArea');c.style.display='block';c.scrollIntoView({behavior:'smooth'})}
var t=23*3600+59*60+47;setInterval(function(){if(t<=0)return t=0;var h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;document.getElementById('urgTimer').textContent=h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;t--},1000);
setTimeout(function(){document.getElementById('ctaArea').style.display='block'},25000);
</script>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   ECOMMERCE TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

const flashSale = `
${commonHead('Flash Sale — Limited Time Only')}
<style>
.sale-banner{background:linear-gradient(135deg,#991b1b,#7f1d1d);padding:10px;text-align:center;font-size:.85rem;color:#fca5a5;font-weight:600;letter-spacing:.04em}
.product-hero{background:linear-gradient(135deg,#0a0a1a,#1a1a2e);padding:30px 0;text-align:center}
.product-image{width:220px;height:220px;margin:0 auto;background:linear-gradient(135deg,#1e1b4b,#0f172a);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:5rem;border:1px solid #2d2d44}
.price-wrap{display:flex;align-items:center;justify-content:center;gap:12px;margin:16px 0}
.price-old{font-size:1.1rem;color:#64748b;text-decoration:line-through}
.price-now{font-size:1.8rem;font-weight:800;color:#22c55e}
.price-save{background:rgba(239,68,68,.15);color:#f87171;padding:4px 10px;border-radius:6px;font-size:.75rem;font-weight:700}
.stock-bar{background:#12122a;border-radius:20px;height:8px;margin:12px 0;overflow:hidden;max-width:300px;margin-left:auto;margin-right:auto}
.stock-fill{height:100%;background:linear-gradient(90deg,#ef4444,#f59e0b);border-radius:20px;width:23%}
.feature-list{display:flex;flex-direction:column;gap:10px;margin:16px 0;text-align:left}
.feature-item{display:flex;align-items:center;gap:10px;font-size:.88rem;color:#cbd5e1}
.feature-icon{flex-shrink:0;width:28px;height:28px;border-radius:8px;background:rgba(99,102,241,.12);display:flex;align-items:center;justify-content:center;font-size:.85rem}
.countdown-strip{display:flex;justify-content:center;gap:10px;margin:16px 0}
.c-box{background:#1a1a2e;border:1px solid #ef4444;border-radius:8px;min-width:54px;padding:8px 6px;text-align:center}
.c-num{font-size:1.4rem;font-weight:700;color:#fff}
.c-lbl{font-size:.6rem;color:#f87171;text-transform:uppercase}
.reviews-mini{display:flex;align-items:center;justify-content:center;gap:6px;font-size:.82rem;color:#94a3b8;margin:12px 0}
.reviews-mini .stars{color:#f59e0b}
.guarantee-bar{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;background:#12122a;border-radius:10px;margin-top:16px;font-size:.82rem;color:#94a3b8}
</style>
<body>
<div class="sale-banner">⚡ FLASH SALE — <strong style="color:#fff">73% OFF</strong> — Ends Today!</div>
<div class="product-hero">
<div class="container">
<div class="product-image">🎧</div>
<h1 style="font-size:1.4rem;color:#fff;margin-top:16px">{{product_name}}</h1>
<p class="text-muted text-sm">{{product_tagline}}</p>
<div class="reviews-mini"><span class="stars">★★★★★</span> 4.9 (2,847 reviews)</div>
<div class="price-wrap">
<span class="price-old">\${{original_price}}</span>
<span class="price-now">\${{sale_price}}</span>
<span class="price-save">SAVE {{discount}}%</span>
</div>
<div class="countdown-strip">
<div class="c-box"><div class="c-num" id="dh">04</div><div class="c-lbl">Hours</div></div>
<div class="c-box"><div class="c-num" id="dm">23</div><div class="c-lbl">Min</div></div>
<div class="c-box"><div class="c-num" id="ds">51</div><div class="c-lbl">Sec</div></div>
</div>
<p class="text-sm text-muted">Only <strong style="color:#f87171">17</strong> left in stock</p>
<div class="stock-bar"><div class="stock-fill"></div></div>
</div>
</div>

<div class="container">
<div class="feature-list">
<div class="feature-item"><div class="feature-icon">✓</div>Active Noise Cancellation with 40dB reduction</div>
<div class="feature-item"><div class="feature-icon">✓</div>60-hour battery life with quick charge</div>
<div class="feature-item"><div class="feature-icon">✓</div>Premium memory foam ear cushions</div>
<div class="feature-item"><div class="feature-icon">✓</div>Bluetooth 5.3 with multi-device pairing</div>
<div class="feature-item"><div class="feature-icon">✓</div>Hi-Res Audio certified with LDAC codec</div>
</div>

<button class="btn btn-primary btn-lg mt-3" style="width:100%">ADD TO CART — \${{sale_price}} →</button>
<p class="text-center text-sm mt-1" style="color:#818cf8">Or 4 interest-free payments of \${{installment_price}}</p>

<div class="guarantee-bar">
<span>🔒</span><span>Secure Checkout</span><span style="color:#2d2d44">·</span>
<span>🚚</span><span>Free Shipping</span><span style="color:#2d2d44">·</span>
<span>↩️</span><span>30-Day Returns</span>
</div>

<p class="text-center text-sm text-muted mt-3" style="font-size:.72rem">Prices and availability subject to change. © {{brand_name}}</p>
</div>
<script>
var t=4*3600+23*60+51;setInterval(function(){if(t<=0)return;t--;var h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;document.getElementById('dh').textContent=String(h).padStart(2,'0');document.getElementById('dm').textContent=String(m).padStart(2,'0');document.getElementById('ds').textContent=String(s).padStart(2,'0')},1000);
</script>
</body></html>`;

const productReview = `
${commonHead('Top Picks — Compare & Choose')}
<style>
.header-bar{background:linear-gradient(135deg,#1e1b4b,#0f172a);padding:28px 0;text-align:center}
.product-grid{display:flex;flex-direction:column;gap:14px;margin:20px 0}
.product-card{background:#1a1a2e;border:1px solid #2d2d44;border-radius:12px;padding:20px;position:relative;transition:border-color .2s}
.product-card.best{border-color:#6366f1;box-shadow:0 0 20px rgba(99,102,241,.15)}
.product-card.best::before{content:'⭐ BEST VALUE';position:absolute;top:-10px;left:20px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;padding:3px 12px;border-radius:6px;font-size:.65rem;font-weight:700;letter-spacing:.06em}
.product-top{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.product-icon{width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#1e1b4b,#2d2d44);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0}
.product-info h3{font-size:1.05rem;color:#fff}
.product-info .stars{color:#f59e0b;font-size:.82rem}
.product-info .review-count{font-size:.72rem;color:#64748b}
.spec-table{width:100%;margin:10px 0;font-size:.82rem}
.spec-table td{padding:6px 0;border-bottom:1px solid #12122a}
.spec-table td:first-child{color:#64748b;width:45%}
.spec-table td:last-child{color:#e2e8f0;text-align:right;font-weight:600}
.price-tag{font-size:1.4rem;font-weight:800;color:#fff;margin:10px 0}
.price-tag small{font-size:.7rem;color:#64748b;font-weight:400}
.compare-table{width:100%;border-collapse:collapse;margin:20px 0;font-size:.82rem}
.compare-table th{background:#12122a;padding:10px;text-align:left;color:#818cf8;font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em}
.compare-table td{padding:10px;border-bottom:1px solid #1a1a2e;color:#cbd5e1}
.compare-table tr:nth-child(even) td{background:rgba(26,26,46,.5)}
.compare-table .winner{color:#22c55e;font-weight:700}
.compare-table .loser{color:#64748b}
</style>
<body>
<div class="header-bar">
<div class="container">
<div class="badge badge-indigo mb-2">📊 2025 Comparison Guide</div>
<h1 style="font-size:1.4rem;color:#fff">{{category_name}}: Top 3 Picks</h1>
<p class="text-muted text-sm">Tested and ranked by our expert team</p>
</div>
</div>
<div class="container">

<div class="product-grid">
<div class="product-card best">
<div class="product-top">
<div class="product-icon">{{product_1_emoji}}</div>
<div class="product-info">
<h3>{{product_1_name}}</h3>
<div class="stars">★★★★★</div>
<div class="review-count">4.9 · 12,400+ reviews</div>
</div>
</div>
<table class="spec-table">
<tr><td>Quality</td><td>★★★★★</td></tr>
<tr><td>Value</td><td>★★★★★</td></tr>
<tr><td>Features</td><td>★★★★★</td></tr>
<tr><td>Support</td><td>★★★★☆</td></tr>
</table>
<div class="price-tag">\${{product_1_price}} <small>was \${{product_1_orig_price}}</small></div>
<a href="{{product_1_url}}" class="btn btn-primary" style="width:100%">GET {{product_1_name}} — BEST VALUE →</a>
</div>

<div class="product-card">
<div class="product-top">
<div class="product-icon">{{product_2_emoji}}</div>
<div class="product-info">
<h3>{{product_2_name}}</h3>
<div class="stars">★★★★☆</div>
<div class="review-count">4.5 · 8,200+ reviews</div>
</div>
</div>
<table class="spec-table">
<tr><td>Quality</td><td>★★★★☆</td></tr>
<tr><td>Value</td><td>★★★★☆</td></tr>
<tr><td>Features</td><td>★★★★☆</td></tr>
<tr><td>Support</td><td>★★★★☆</td></tr>
</table>
<div class="price-tag">\${{product_2_price}}</div>
<a href="{{product_2_url}}" class="btn" style="width:100%;background:#1e1b4b;color:#818cf8;border:1px solid #4f46e5">CHECK {{product_2_name}} →</a>
</div>

<div class="product-card">
<div class="product-top">
<div class="product-icon">{{product_3_emoji}}</div>
<div class="product-info">
<h3>{{product_3_name}}</h3>
<div class="stars">★★★★☆</div>
<div class="review-count">4.3 · 5,100+ reviews</div>
</div>
</div>
<table class="spec-table">
<tr><td>Quality</td><td>★★★★☆</td></tr>
<tr><td>Value</td><td>★★★★☆</td></tr>
<tr><td>Features</td><td>★★★☆☆</td></tr>
<tr><td>Support</td><td>★★★☆☆</td></tr>
</table>
<div class="price-tag">\${{product_3_price}}</div>
<a href="{{product_3_url}}" class="btn" style="width:100%;background:#1e1b4b;color:#818cf8;border:1px solid #4f46e5">CHECK {{product_3_name}} →</a>
</div>
</div>

<h2 style="font-size:1.1rem;color:#fff;margin-bottom:12px;text-align:center">Side-by-Side Comparison</h2>
<div style="overflow-x:auto">
<table class="compare-table">
<thead><tr><th>Feature</th><th>{{product_1_short}}</th><th>{{product_2_short}}</th><th>{{product_3_short}}</th></tr></thead>
<tbody>
<tr><td>Price</td><td class="winner">\${{product_1_price}}</td><td>\${{product_2_price}}</td><td>\${{product_3_price}}</td></tr>
<tr><td>Rating</td><td class="winner">4.9/5</td><td>4.5/5</td><td>4.3/5</td></tr>
<tr><td>Quality Score</td><td class="winner">98/100</td><td>89/100</td><td>82/100</td></tr>
<tr><td>Warranty</td><td class="winner">Lifetime</td><td>2 Years</td><td>1 Year</td></tr>
<tr><td>Free Shipping</td><td class="winner">✓ Yes</td><td>✓ Yes</td><td>Orders $50+</td></tr>
<tr><td>Money-Back</td><td class="winner">60 Days</td><td>30 Days</td><td>14 Days</td></tr>
</tbody>
</table>
</div>

<div class="card text-center mt-3" style="border-color:#6366f1">
<p class="text-sm text-muted mb-2">Our #1 Recommendation for {{category_name}}</p>
<a href="{{product_1_url}}" class="btn btn-primary btn-lg" style="width:100%">GET THE WINNER — {{product_1_name}} →</a>
</div>

<p class="text-center text-sm text-muted mt-3" style="font-size:.72rem">Prices accurate as of today. We may earn a commission from qualifying purchases. This does not affect our editorial independence.</p>
</div>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   CRYPTO TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

const cryptoExchangeSignup = `
${commonHead('Join the Future of Trading')}
<style>
.hero{background:linear-gradient(135deg,#0a0a1a,#0f0525,#0a1628);padding:36px 0 28px;text-align:center}
.trust-badges{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin:16px 0}
.trust-item{display:flex;align-items:center;gap:6px;font-size:.75rem;color:#64748b}
.trust-item span{font-size:1.1rem}
.stats-bar{display:flex;justify-content:center;gap:24px;flex-wrap:wrap;margin:20px 0}
.stat{text-align:center}
.stat-val{font-size:1.3rem;font-weight:800;color:#fff}
.stat-lbl{font-size:.68rem;color:#64748b;margin-top:2px}
.form-card{background:#1a1a2e;border:1px solid #2d2d44;border-radius:16px;padding:28px 24px}
.form-card h2{font-size:1.15rem;color:#fff;margin-bottom:4px}
.form-card .sub{font-size:.82rem;color:#64748b;margin-bottom:18px}
.or-divider{display:flex;align-items:center;gap:12px;margin:16px 0;font-size:.75rem;color:#4a4a6a}
.or-divider::before,.or-divider::after{content:'';flex:1;height:1px;background:#2d2d44}
.social-login{display:flex;gap:10px;margin-bottom:16px}
.social-btn{flex:1;padding:10px;border-radius:8px;border:1px solid #2d2d44;background:#12122a;color:#e2e8f0;font-size:.82rem;cursor:pointer;text-align:center;transition:border-color .2s}
.social-btn:hover{border-color:#6366f1}
.features-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}
.feat{background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:16px 10px;text-align:center}
.feat-icon{font-size:1.5rem;margin-bottom:6px;display:block}
.feat h4{font-size:.82rem;color:#fff;margin-bottom:4px}
.feat p{font-size:.7rem;color:#64748b}
</style>
<body>
<div class="hero">
<div class="container">
<div style="font-size:2.2rem;margin-bottom:12px">🪙</div>
<h1 style="font-size:1.6rem;color:#fff;margin-bottom:4px">Trade Crypto with Confidence</h1>
<p class="text-muted text-sm mb-3">{{exchange_name}} — The #1 Platform for Beginners & Pros</p>
<div class="trust-badges">
<div class="trust-item"><span>🔒</span>Bank-Level Security</div>
<div class="trust-item"><span>✅</span>Fully Regulated</div>
<div class="trust-item"><span>🌍</span>150+ Countries</div>
<div class="trust-item"><span>💬</span>24/7 Support</div>
</div>
<div class="stats-bar">
<div class="stat"><div class="stat-val">{{user_count}}</div><div class="stat-lbl">Active Traders</div></div>
<div class="stat"><div class="stat-val">{{volume}}</div><div class="stat-lbl">Daily Volume</div></div>
<div class="stat"><div class="stat-val">200+</div><div class="stat-lbl">Coins Listed</div></div>
</div>
</div>
</div>

<div class="container">
<div class="form-card">
<h2>Create Your Free Account</h2>
<p class="sub">Start trading in under 2 minutes</p>
<div class="social-login">
<div class="social-btn" onclick="">📧 Google</div>
<div class="social-btn" onclick="">🍎 Apple</div>
</div>
<div class="or-divider">or sign up with email</div>
<form onsubmit="event.preventDefault()">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<input type="text" placeholder="{{password}}" style="margin-bottom:10px" typeattr="password">
<select style="margin-bottom:16px">
<option value="">Select your country</option>
<option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>Germany</option><option>Other</option>
</select>
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">CREATE FREE ACCOUNT →</button>
</form>
<p class="text-center text-sm text-muted mt-2">By signing up, you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a></p>
</div>

<div class="features-row">
<div class="feat"><span class="feat-icon">⚡</span><h4>Instant Trades</h4><p>Execute in milliseconds</p></div>
<div class="feat"><span class="feat-icon">📊</span><h4>Advanced Charts</h4><p>100+ indicators built in</p></div>
<div class="feat"><span class="feat-icon">💰</span><h4>Low Fees</h4><p>From 0.1% per trade</p></div>
</div>

<p class="text-center text-sm text-muted mt-3" style="font-size:.72rem">Cryptocurrency trading involves risk. Past performance is not a guarantee of future results. {{exchange_name}} is registered and compliant with applicable regulations.</p>
</div>
</body></html>`;

const cryptoWalletDownload = `
${commonHead('The Safest Crypto Wallet')}
<style>
.hero{background:linear-gradient(180deg,#0a0a1a 0%,#0f0525 100%);padding:40px 0 24px;text-align:center}
.wallet-phone{width:180px;height:320px;background:linear-gradient(180deg,#1a1a2e,#12122a);border-radius:28px;margin:0 auto 20px;border:2px solid #6366f1;display:flex;align-items:center;justify-content:center;font-size:4rem;position:relative;box-shadow:0 20px 60px rgba(99,102,241,.2)}
.wallet-phone::before{content:'';position:absolute;top:8px;left:50%;transform:translateX(-50%);width:60px;height:6px;background:#2d2d44;border-radius:3px}
.wallet-screen{position:absolute;top:40px;left:12px;right:12px;bottom:20px;background:linear-gradient(135deg,#1e1b4b,#0f172a);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px}
.wallet-screen .bal{font-size:.6rem;color:#64748b}
.wallet-screen .amt{font-size:1rem;color:#fff;font-weight:700}
.wallet-screen .coins{display:flex;gap:4px;font-size:1rem}
.download-btns{display:flex;flex-direction:column;gap:10px;max-width:280px;margin:0 auto}
.dl-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 20px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-weight:600;font-size:.9rem;text-decoration:none;transition:all .2s}
.dl-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.4);text-decoration:none}
.dl-btn.secondary{background:#1a1a2e;border:1px solid #2d2d44}
.dl-btn.secondary:hover{border-color:#6366f1;box-shadow:none}
.features-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0}
.feat-card{background:#1a1a2e;border:1px solid #2d2d44;border-radius:12px;padding:18px 14px}
.feat-card .feat-icon{font-size:1.5rem;margin-bottom:8px;display:block}
.feat-card h3{font-size:.88rem;color:#fff;margin-bottom:4px}
.feat-card p{font-size:.72rem;color:#64748b;line-height:1.4}
.coins-row{display:flex;justify-content:center;gap:12px;margin:20px 0;flex-wrap:wrap}
.coin-badge{background:#1a1a2e;border:1px solid #2d2d44;border-radius:20px;padding:6px 14px;font-size:.75rem;color:#cbd5e1;display:flex;align-items:center;gap:5px}
.security-bar{background:#12122a;border:1px solid #1e3a1e;border-radius:10px;padding:16px;display:flex;align-items:center;gap:12px;margin:20px 0}
.security-bar .s-icon{font-size:1.5rem;flex-shrink:0}
.security-bar .s-text{font-size:.82rem;color:#cbd5e1}
.security-bar .s-text strong{color:#22c55e}
</style>
<body>
<div class="hero">
<div class="container">
<div class="badge badge-indigo mb-2">🛡️ #1 Rated Crypto Wallet</div>
<h1 style="font-size:1.5rem;color:#fff;margin-bottom:4px">{{wallet_name}}</h1>
<p class="text-muted text-sm mb-3">Your keys, your crypto. Non-custodial & open-source.</p>
<div class="wallet-phone">
<div class="wallet-screen">
<div class="bal">Total Balance</div>
<div class="amt">$12,847.32</div>
<div class="coins">₿ Ξ ◆</div>
</div>
</div>
<div class="download-btns">
<a href="{{ios_url}}" class="dl-btn">🍎 Download for iOS</a>
<a href="{{android_url}}" class="dl-btn">🤖 Download for Android</a>
<a href="{{chrome_url}}" class="dl-btn secondary">🌐 Chrome Extension</a>
</div>
</div>
</div>

<div class="container">
<div class="coins-row">
<div class="coin-badge">₿ Bitcoin</div>
<div class="coin-badge">Ξ Ethereum</div>
<div class="coin-badge">◆ Solana</div>
<div class="coin-badge">● USDC</div>
<div class="coin-badge">◎ Polygon</div>
<div class="coin-badge">+ 10,000 more</div>
</div>

<div class="security-bar">
<div class="s-icon">🔐</div>
<div class="s-text">Protected by <strong>military-grade encryption</strong>. Open-source, audited by leading security firms. Your private keys never leave your device.</div>
</div>

<div class="features-grid">
<div class="feat-card"><span class="feat-icon">🔄</span><h3>Swap Instantly</h3><p>Exchange tokens across 15+ chains with the best rates</p></div>
<div class="feat-card"><span class="feat-icon">📈</span><h3>Track Portfolio</h3><p>Real-time price tracking and P&L analytics</p></div>
<div class="feat-card"><span class="feat-icon">🌐</span><h3>dApp Browser</h3><p>Access DeFi, NFTs, and Web3 apps seamlessly</p></div>
<div class="feat-card"><span class="feat-icon">💎</span><h3>Stake & Earn</h3><p>Earn passive income by staking your assets</p></div>
</div>

<div class="card text-center mt-3">
<p class="text-sm text-muted mb-2">Trusted by <strong style="color:#fff">{{download_count}}</strong> users worldwide</p>
<div style="display:flex;justify-content:center;gap:4px;font-size:1.3rem;margin-bottom:12px">
<span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
</div>
<p class="text-sm" style="color:#818cf8">4.9 rating on App Store & Google Play</p>
</div>

<p class="text-center text-sm text-muted mt-3" style="font-size:.72rem">{{wallet_name}} is a non-custodial wallet. Always back up your recovery phrase. Crypto assets are volatile — invest responsibly.</p>
</div>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   DATING TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

const datingProfile = `
${commonHead('Someone Wants to Meet You!')}
<style>
.hero{background:linear-gradient(135deg,#1a0a2e,#0f0525,#0a0a1a);padding:30px 0;text-align:center}
.match-notification{background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:14px 20px;display:inline-flex;align-items:center;gap:10px;font-size:.88rem;color:#fff;font-weight:600;margin-bottom:20px;animation:gentlePulse 3s infinite}
@keyframes gentlePulse{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4)}50%{box-shadow:0 0 20px 6px rgba(99,102,241,.15)}}
.profile-card{background:#1a1a2e;border:1px solid #2d2d44;border-radius:16px;overflow:hidden;max-width:360px;margin:0 auto}
.profile-img{height:280px;background:linear-gradient(135deg,#2d2d44,#1a1a2e);display:flex;align-items:center;justify-content:center;font-size:6rem}
.profile-body{padding:18px}
.profile-body h2{font-size:1.2rem;color:#fff;margin-bottom:2px}
.profile-body .age-loc{font-size:.85rem;color:#818cf8;margin-bottom:10px}
.profile-body .bio{font-size:.85rem;color:#94a3b8;margin-bottom:14px;line-height:1.5}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.tag{background:#12122a;border:1px solid #2d2d44;border-radius:20px;padding:4px 12px;font-size:.72rem;color:#94a3b8}
.profile-actions{display:flex;gap:10px;margin-top:14px}
.action-btn{flex:1;padding:12px;border-radius:10px;font-size:.85rem;font-weight:600;cursor:pointer;border:none;transition:all .2s}
.action-btn.pass{background:#12122a;border:1px solid #2d2d44;color:#64748b}
.action-btn.like{background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff}
.online-dot{width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block;margin-right:4px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.more-profiles{margin-top:24px}
.more-profiles h3{font-size:1rem;color:#fff;margin-bottom:14px;text-align:center}
.profile-preview{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none}
.profile-preview::-webkit-scrollbar{display:none}
.preview-card{flex-shrink:0;width:120px;background:#1a1a2e;border:1px solid #2d2d44;border-radius:12px;overflow:hidden}
.preview-card .preview-img{height:100px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;background:linear-gradient(135deg,#2d2d44,#1a1a2e)}
.preview-card .preview-name{padding:8px;text-align:center;font-size:.72rem;color:#e2e8f0;font-weight:600}
.preview-card .preview-dist{padding:0 8px 8px;text-align:center;font-size:.62rem;color:#64748b}
</style>
<body>
<div class="hero">
<div class="container">
<div class="match-notification">💕 <span class="online-dot"></span> New Match Found!</div>
<div class="profile-card">
<div class="profile-img">👩</div>
<div class="profile-body">
<h2>{{match_name}}</h2>
<div class="age-loc">{{match_age}} · {{match_city}} · <span style="color:#22c55e">Online Now</span></div>
<p class="bio">{{match_bio}}</p>
<div class="tags">
<div class="tag">🎵 Music</div><div class="tag">✈️ Travel</div><div class="tag">📷 Photography</div><div class="tag">🍷 Wine</div><div class="tag">🐕 Dogs</div>
</div>
<div class="profile-actions">
<button class="action-btn pass">✕ Pass</button>
<button class="action-btn like" onclick="showSignup()">♥ Like</button>
</div>
</div>
</div>
</div>
</div>

<div class="container" id="signupSection" style="display:none;animation:fadeIn .5s ease">
<div class="card text-center mt-3" style="border-color:#6366f1">
<div style="font-size:2rem;margin-bottom:8px">💬</div>
<h2 style="font-size:1.1rem;color:#fff;margin-bottom:8px">Want to Send a Message?</h2>
<p class="text-sm text-muted mb-3">Create a free account to connect with {{match_name}} and other singles nearby</p>
<form onsubmit="event.preventDefault()">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<select style="margin-bottom:16px">
<option value="">I am looking for...</option><option>Men</option><option>Women</option><option>Everyone</option>
</select>
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">CREATE FREE ACCOUNT →</button>
</form>
<p class="text-sm text-muted mt-2">🔒 Your privacy is protected</p>
</div>
</div>

<div class="container more-profiles">
<h3>More Singles Near {{match_city}}</h3>
<div class="profile-preview">
<div class="preview-card"><div class="preview-img">👩‍🦰</div><div class="preview-name">Emma, 26</div><div class="preview-dist">2 mi away</div></div>
<div class="preview-card"><div class="preview-img">👱‍♀️</div><div class="preview-name">Sophie, 24</div><div class="preview-dist">5 mi away</div></div>
<div class="preview-card"><div class="preview-img">👩‍🦱</div><div class="preview-name">Mia, 28</div><div class="preview-dist">3 mi away</div></div>
<div class="preview-card"><div class="preview-img">🧑‍🦰</div><div class="preview-name">Ava, 25</div><div class="preview-dist">7 mi away</div></div>
</div>
</div>

<p class="text-center text-sm text-muted mt-3 pb-2" style="font-size:.72rem">Profiles are representative. By signing up you agree to our Terms of Service and Privacy Policy. Must be 18+.</p>
<style>@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}</style>
<script>function showSignup(){document.getElementById('signupSection').style.display='block';document.getElementById('signupSection').scrollIntoView({behavior:'smooth'})}</script>
</body></html>`;

const matchQuiz = `
${commonHead('Find Your Perfect Match')}
<style>
.quiz-hero{background:linear-gradient(135deg,#1a0a2e,#0f0525);padding:36px 0 24px;text-align:center}
.quiz-container{max-width:480px;margin:0 auto}
.quiz-progress{display:flex;align-items:center;gap:8px;margin-bottom:20px}
.quiz-progress-bar{flex:1;height:6px;background:#2d2d44;border-radius:3px;overflow:hidden}
.quiz-progress-fill{height:100%;background:linear-gradient(90deg,#6366f1,#818cf8);border-radius:3px;transition:width .4s ease}
.quiz-step{display:none;animation:fadeIn .4s ease}
.quiz-step.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
.quiz-question{font-size:1.15rem;color:#fff;margin-bottom:20px;text-align:center}
.quiz-options{display:flex;flex-direction:column;gap:10px}
.quiz-option{background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:16px;cursor:pointer;font-size:.9rem;color:#e2e8f0;transition:all .2s;display:flex;align-items:center;gap:12px}
.quiz-option:hover{border-color:#6366f1;background:#1e1b4b}
.quiz-option.selected{border-color:#6366f1;background:#1e1b4b;box-shadow:0 0 10px rgba(99,102,241,.2)}
.quiz-option .opt-icon{font-size:1.3rem;width:32px;text-align:center;flex-shrink:0}
.quiz-next{margin-top:20px;opacity:.5;pointer-events:none;transition:all .2s}
.quiz-next.enabled{opacity:1;pointer-events:auto}
.result-card{display:none;animation:fadeIn .5s ease}
.result-match{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:3rem;box-shadow:0 0 40px rgba(99,102,241,.3)}
.match-score{font-size:2rem;font-weight:800;color:#818cf8;text-align:center;margin:8px 0}
.match-desc{text-align:center;font-size:.85rem;color:#94a3b8;margin-bottom:20px}
.traits-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}
.trait{background:#12122a;border:1px solid #2d2d44;border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:8px;font-size:.82rem;color:#cbd5e1}
.trait span{font-size:1rem}
</style>
<body>
<div class="quiz-hero">
<div class="container">
<div class="badge badge-indigo mb-2">💘 Compatibility Quiz</div>
<h1 style="font-size:1.5rem;color:#fff;margin-bottom:4px">Find Your Perfect Match</h1>
<p class="text-muted text-sm">Answer 5 quick questions and we'll find compatible singles</p>
</div>
</div>

<div class="container quiz-container">
<div class="quiz-progress">
<span class="text-sm text-muted" id="stepLabel">1 / 5</span>
<div class="quiz-progress-bar"><div class="quiz-progress-fill" id="progressFill" style="width:20%"></div></div>
</div>

<div class="quiz-step active" id="step1">
<div class="quiz-question">What's most important in a partner?</div>
<div class="quiz-options">
<div class="quiz-option" onclick="selectOpt(this,1)"><span class="opt-icon">😂</span> Sense of humor</div>
<div class="quiz-option" onclick="selectOpt(this,1)"><span class="opt-icon">🧠</span> Intelligence</div>
<div class="quiz-option" onclick="selectOpt(this,1)"><span class="opt-icon">💪</span> Ambition</div>
<div class="quiz-option" onclick="selectOpt(this,1)"><span class="opt-icon">❤️</span> Kindness</div>
</div>
</div>

<div class="quiz-step" id="step2">
<div class="quiz-question">How do you spend a perfect weekend?</div>
<div class="quiz-options">
<div class="quiz-option" onclick="selectOpt(this,2)"><span class="opt-icon">🏔️</span> Outdoor adventure</div>
<div class="quiz-option" onclick="selectOpt(this,2)"><span class="opt-icon">📚</span> Cozy night in</div>
<div class="quiz-option" onclick="selectOpt(this,2)"><span class="opt-icon">🎉</span> Social gathering</div>
<div class="quiz-option" onclick="selectOpt(this,2)"><span class="opt-icon">✈️</span> Spontaneous trip</div>
</div>
</div>

<div class="quiz-step" id="step3">
<div class="quiz-question">What's your love language?</div>
<div class="quiz-options">
<div class="quiz-option" onclick="selectOpt(this,3)"><span class="opt-icon">🗣️</span> Words of affirmation</div>
<div class="quiz-option" onclick="selectOpt(this,3)"><span class="opt-icon">🎁</span> Gift giving</div>
<div class="quiz-option" onclick="selectOpt(this,3)"><span class="opt-icon">🤝</span> Quality time</div>
<div class="quiz-option" onclick="selectOpt(this,3)"><span class="opt-icon">🤗</span> Physical touch</div>
</div>
</div>

<div class="quiz-step" id="step4">
<div class="quiz-question">Your ideal first date?</div>
<div class="quiz-options">
<div class="quiz-option" onclick="selectOpt(this,4)"><span class="opt-icon">☕</span> Coffee & a walk</div>
<div class="quiz-option" onclick="selectOpt(this,4)"><span class="opt-icon">🍽️</span> Nice dinner</div>
<div class="quiz-option" onclick="selectOpt(this,4)"><span class="opt-icon">🎬</span> Movie night</div>
<div class="quiz-option" onclick="selectOpt(this,4)"><span class="opt-icon">🎯</span> Activity or game</div>
</div>
</div>

<div class="quiz-step" id="step5">
<div class="quiz-question">What are you looking for?</div>
<div class="quiz-options">
<div class="quiz-option" onclick="selectOpt(this,5)"><span class="opt-icon">💍</span> Long-term relationship</div>
<div class="quiz-option" onclick="selectOpt(this,5)"><span class="opt-icon">🤝</span> See where it goes</div>
<div class="quiz-option" onclick="selectOpt(this,5)"><span class="opt-icon">😎</span> Casual dating</div>
<div class="quiz-option" onclick="selectOpt(this,5)"><span class="opt-icon">👋</span> New friends</div>
</div>
</div>

<div class="quiz-step" id="result">
<div class="result-card" style="display:block">
<div class="result-match">👩</div>
<div class="match-score">92% Match!</div>
<div class="match-desc">We found highly compatible singles near you</div>
<div class="traits-grid">
<div class="trait"><span>😂</span> Humor</div>
<div class="trait"><span>✈️</span> Adventure</div>
<div class="trait"><span>🤗</span> Affection</div>
<div class="trait"><span>💍</span> Commitment</div>
</div>
<div class="card text-center" style="border-color:#6366f1">
<form onsubmit="event.preventDefault()">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:16px">
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">SEE YOUR MATCHES →</button>
</form>
</div>
</div>
</div>

<button class="btn btn-primary btn-lg quiz-next" id="nextBtn" onclick="nextStep()" style="width:100%;margin-top:16px">CONTINUE →</button>
</div>

<p class="text-center text-sm text-muted mt-3 pb-2" style="font-size:.72rem">By continuing you agree to our Terms. Must be 18+. Profiles may be simulated for demonstration.</p>
<script>
var curStep=1;
function selectOpt(el,step){
document.querySelectorAll('#step'+step+' .quiz-option').forEach(function(o){o.classList.remove('selected')});
el.classList.add('selected');
document.getElementById('nextBtn').classList.add('enabled');
}
function nextStep(){
document.getElementById('nextBtn').classList.remove('enabled');
document.getElementById('step'+curStep).classList.remove('active');
curStep++;
if(curStep<=5){
document.getElementById('step'+curStep).classList.add('active');
document.getElementById('stepLabel').textContent=curStep+' / 5';
document.getElementById('progressFill').style.width=(curStep*20)+'%';
}else{
document.getElementById('stepLabel').textContent='Result';
document.getElementById('progressFill').style.width='100%';
document.getElementById('result').classList.add('active');
document.getElementById('nextBtn').style.display='none';
}
}
</script>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   HEALTH TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

const supplementTrial = `
${commonHead('Try It Free — Limited Offer')}
<style>
.hero{background:linear-gradient(135deg,#0a0a1a,#0a2e1a,#0a0a1a);padding:36px 0 24px;text-align:center}
.product-display{width:180px;height:220px;margin:0 auto;background:linear-gradient(135deg,#1a2e1a,#12221a);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:5rem;border:1px solid #1e3a1e}
.before-after{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin:24px 0}
.ba-card{background:#1a1a2e;border:1px solid #2d2d44;border-radius:12px;padding:16px;text-align:center}
.ba-card .ba-img{width:100%;height:120px;background:linear-gradient(135deg,#2d2d44,#1a1a2e);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:3rem;margin-bottom:8px}
.ba-card .ba-label{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.ba-card.before .ba-label{color:#f87171}
.ba-card.after .ba-label{color:#22c55e}
.ba-arrow{font-size:1.5rem;color:#6366f1;text-align:center}
.result-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}
.rs-box{background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:14px 8px;text-align:center}
.rs-val{font-size:1.3rem;font-weight:800;color:#22c55e}
.rs-label{font-size:.65rem;color:#64748b;margin-top:2px}
.ingredients{margin:20px 0}
.ingredient{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #1a1a2e}
.ingredient:last-child{border-bottom:none}
.ing-icon{width:36px;height:36px;border-radius:8px;background:rgba(99,102,241,.1);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.ing-text h4{font-size:.88rem;color:#fff;margin-bottom:2px}
.ing-text p{font-size:.72rem;color:#64748b}
.trial-box{background:#1a1a2e;border:2px solid #22c55e;border-radius:14px;padding:24px;text-align:center}
.trial-box h2{font-size:1.2rem;color:#fff;margin-bottom:4px}
.trial-box p{font-size:.85rem;color:#94a3b8;margin-bottom:16px}
.shipping-note{display:flex;align-items:center;justify-content:center;gap:6px;font-size:.82rem;color:#94a3b8;margin-top:10px}
</style>
<body>
<div class="hero">
<div class="container">
<div class="badge badge-green mb-2">🌿 Natural Formula</div>
<h1 style="font-size:1.4rem;color:#fff;margin-bottom:4px">{{product_name}}</h1>
<p class="text-muted text-sm mb-3">Clinically studied ingredients — feel the difference in days</p>
<div class="product-display">🌿</div>
</div>
</div>

<div class="container">
<div class="before-after">
<div class="ba-card before"><div class="ba-img">😟</div><div class="ba-label">Before</div></div>
<div class="ba-arrow">→</div>
<div class="ba-card after"><div class="ba-img">😊</div><div class="ba-label">After</div></div>
</div>

<div class="result-stats">
<div class="rs-box"><div class="rs-val">94%</div><div class="rs-label">Satisfaction</div></div>
<div class="rs-box"><div class="rs-val">2.5x</div><div class="rs-label">More Energy</div></div>
<div class="rs-box"><div class="rs-val">7 Days</div><div class="rs-label">To Feel It</div></div>
</div>

<div class="ingredients">
<h3 style="font-size:1rem;color:#fff;margin-bottom:12px">Key Ingredients:</h3>
<div class="ingredient"><div class="ing-icon">🧬</div><div class="ing-text"><h4>{{ingredient_1}}</h4><p>{{ingredient_1_desc}}</p></div></div>
<div class="ingredient"><div class="ing-icon">🍃</div><div class="ing-text"><h4>{{ingredient_2}}</h4><p>{{ingredient_2_desc}}</p></div></div>
<div class="ingredient"><div class="ing-icon">⚡</div><div class="ing-text"><h4>{{ingredient_3}}</h4><p>{{ingredient_3_desc}}</p></div></div>
<div class="ingredient"><div class="ing-icon">🔬</div><div class="ing-text"><h4>{{ingredient_4}}</h4><p>{{ingredient_4_desc}}</p></div></div>
</div>

<div class="trial-box">
<h2>🎁 Free 14-Day Trial</h2>
<p>Just pay \${{shipping_cost}} shipping. Cancel anytime.</p>
<form onsubmit="event.preventDefault()">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<input type="text" placeholder="{{address}}" style="margin-bottom:16px">
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">CLAIM FREE TRIAL →</button>
</form>
<div class="shipping-note">🚚 Free shipping on 3+ bottles · Ships in 24 hours</div>
</div>

<div class="card mt-3" style="border-color:#22c55e;text-align:center">
<p class="text-sm" style="color:#22c55e"><strong>60-Day Money Back Guarantee</strong></p>
<p class="text-sm text-muted mt-1">Not satisfied? Get a full refund, no questions asked.</p>
</div>

<p class="text-center text-sm text-muted mt-3" style="font-size:.72rem">These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary.</p>
</div>
</body></html>`;

const weightLossQuiz = `
${commonHead('Your Personalized Weight Loss Plan')}
<style>
.quiz-hero{background:linear-gradient(135deg,#0a0a1a,#1a0a2e);padding:36px 0 24px;text-align:center}
.quiz-box{max-width:480px;margin:0 auto}
.step{display:none;animation:fadeIn .4s ease}
.step.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.step-title{font-size:1.15rem;color:#fff;text-align:center;margin-bottom:18px}
.option-grid{display:flex;flex-direction:column;gap:10px}
.opt{background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:16px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px;font-size:.9rem;color:#e2e8f0}
.opt:hover{border-color:#6366f1;background:#1e1b4b}
.opt.selected{border-color:#22c55e;background:rgba(34,197,94,.08)}
.opt .opt-ico{font-size:1.3rem;width:32px;text-align:center;flex-shrink:0}
.opt-check{margin-left:auto;width:22px;height:22px;border-radius:50%;border:2px solid #2d2d44;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:transparent;flex-shrink:0}
.opt.selected .opt-check{border-color:#22c55e;background:#22c55e;color:#fff}
.range-slider{margin:20px 0}
.range-slider label{display:block;color:#94a3b8;font-size:.85rem;margin-bottom:8px}
.range-slider input[type="range"]{width:100%;-webkit-appearance:none;height:6px;background:#2d2d44;border-radius:3px;outline:none}
.range-slider input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#6366f1;cursor:pointer}
.range-val{text-align:center;font-size:1.5rem;font-weight:700;color:#818cf8;margin-top:8px}
.next-btn{margin-top:20px;width:100%}
.result-panel{display:none;animation:fadeIn .5s ease}
.result-header{text-align:center;margin-bottom:20px}
.result-icon{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;margin:0 auto 12px;box-shadow:0 0 30px rgba(34,197,94,.3)}
.plan-card{background:#1a1a2e;border:1px solid #2d2d44;border-radius:12px;padding:20px;margin-bottom:14px}
.plan-card h3{font-size:1rem;color:#fff;margin-bottom:10px}
.plan-item{display:flex;align-items:center;gap:8px;padding:8px 0;font-size:.85rem;color:#cbd5e1}
.plan-item span{flex-shrink:0;width:20px;text-align:center}
</style>
<body>
<div class="quiz-hero">
<div class="container">
<div class="badge badge-green mb-2">🏋️ Free Assessment</div>
<h1 style="font-size:1.5rem;color:#fff;margin-bottom:4px">Your Weight Loss Plan</h1>
<p class="text-muted text-sm">Answer a few questions and get a personalized plan</p>
</div>
</div>

<div class="container quiz-box">
<div class="quiz-progress" style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
<span class="text-sm text-muted" id="qLabel">1 / 5</span>
<div style="flex:1;height:6px;background:#2d2d44;border-radius:3px;overflow:hidden"><div id="qFill" style="height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:3px;width:20%;transition:width .4s"></div></div>
</div>

<div class="step active" id="q1">
<div class="step-title">What is your primary goal?</div>
<div class="option-grid">
<div class="opt" onclick="sel(this,1)"><span class="opt-ico">⚖️</span>Lose 10-20 lbs<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,1)"><span class="opt-ico">🎯</span>Lose 20-40 lbs<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,1)"><span class="opt-ico">🏋️</span>Lose 40+ lbs<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,1)"><span class="opt-ico">💪</span>Tone & maintain<div class="opt-check">✓</div></div>
</div>
</div>

<div class="step" id="q2">
<div class="step-title">What's your biggest challenge?</div>
<div class="option-grid">
<div class="opt" onclick="sel(this,2)"><span class="opt-ico">🍔</span>Cravings & appetite<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,2)"><span class="opt-ico">😴</span>Low energy<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,2)"><span class="opt-ico">⏰</span>No time to exercise<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,2)"><span class="opt-ico">😔</span>Lack of motivation<div class="opt-check">✓</div></div>
</div>
</div>

<div class="step" id="q3">
<div class="step-title">How active are you currently?</div>
<div class="option-grid">
<div class="opt" onclick="sel(this,3)"><span class="opt-ico">🛋️</span>Sedentary (little exercise)<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,3)"><span class="opt-ico">🚶</span>Lightly active (1-2x/week)<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,3)"><span class="opt-ico">🏃</span>Moderately active (3-4x/week)<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,3)"><span class="opt-ico">🏋️‍♂️</span>Very active (5+ x/week)<div class="opt-check">✓</div></div>
</div>
</div>

<div class="step" id="q4">
<div class="step-title">Have you tried weight loss supplements before?</div>
<div class="option-grid">
<div class="opt" onclick="sel(this,4)"><span class="opt-ico">❌</span>No, this would be my first<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,4)"><span class="opt-ico">🤷</span>Yes, but nothing worked<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,4)"><span class="opt-ico">✅</span>Yes, some helped<div class="opt-check">✓</div></div>
</div>
</div>

<div class="step" id="q5">
<div class="step-title">How quickly do you want results?</div>
<div class="option-grid">
<div class="opt" onclick="sel(this,5)"><span class="opt-ico">🐢</span>Slow & steady (3-6 months)<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,5)"><span class="opt-ico">⚡</span>Moderate (1-3 months)<div class="opt-check">✓</div></div>
<div class="opt" onclick="sel(this,5)"><span class="opt-ico">🚀</span>Fast results (ASAP)<div class="opt-check">✓</div></div>
</div>
</div>

<div class="step" id="qResult">
<div class="result-panel" style="display:block">
<div class="result-header">
<div class="result-icon">✓</div>
<h2 style="color:#fff;font-size:1.2rem">Your Plan Is Ready!</h2>
<p class="text-muted text-sm">Based on your answers, here's your personalized recommendation:</p>
</div>
<div class="plan-card">
<h3>📋 Your Custom Plan</h3>
<div class="plan-item"><span>☀️</span>Morning metabolism booster</div>
<div class="plan-item"><span>🥗</span>Customized meal guidelines</div>
<div class="plan-item"><span>💪</span>Activity recommendations</div>
<div class="plan-item"><span>🌙</span>Evening fat-burning support</div>
</div>
<div class="card" style="border-color:#22c55e">
<h3 style="font-size:1rem;color:#fff;margin-bottom:4px">🎁 Special Offer</h3>
<p class="text-sm text-muted mb-2">Get your personalized supplement — try it free for 14 days</p>
<form onsubmit="event.preventDefault()">
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<input type="text" placeholder="{{zip_code}}" style="margin-bottom:16px">
<button type="submit" class="btn btn-primary btn-lg" style="width:100%;background:linear-gradient(135deg,#22c55e,#16a34a)">GET MY FREE TRIAL →</button>
</form>
</div>
</div>
</div>

<button class="btn btn-primary next-btn" id="qNext" onclick="qNext()" style="opacity:.5;pointer-events:none">CONTINUE →</button>
</div>

<p class="text-center text-sm text-muted mt-3 pb-2" style="font-size:.72rem">This quiz is for informational purposes only and does not constitute medical advice. Consult your doctor before starting any supplement regimen.</p>
<script>
var qCur=1;
function sel(el,n){document.querySelectorAll('#q'+n+' .opt').forEach(function(o){o.classList.remove('selected')});el.classList.add('selected');document.getElementById('qNext').style.opacity='1';document.getElementById('qNext').style.pointerEvents='auto'}
function qNext(){document.getElementById('qNext').style.opacity='.5';document.getElementById('qNext').style.pointerEvents='none';document.getElementById('q'+qCur).classList.remove('active');qCur++;if(qCur<=5){document.getElementById('q'+qCur).classList.add('active');document.getElementById('qLabel').textContent=qCur+' / 5';document.getElementById('qFill').style.width=(qCur*20)+'%'}else{document.getElementById('qLabel').textContent='Result';document.getElementById('qFill').style.width='100%';document.getElementById('qResult').classList.add('active');document.getElementById('qNext').style.display='none'}}
</script>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   FINANCE TEMPLATE
   ═══════════════════════════════════════════════════════════════ */

const tradingPlatform = `
${commonHead('Start Trading Today')}
<style>
.hero{background:linear-gradient(135deg,#0a0a1a,#0a1628,#0f0525);padding:40px 0 28px;text-align:center}
.live-ticker{background:#12122a;border:1px solid #2d2d44;border-radius:10px;padding:14px;margin:16px 0;display:flex;justify-content:space-around;flex-wrap:wrap;gap:8px}
.ticker-item{text-align:center}
.ticker-symbol{font-size:.75rem;color:#64748b;font-weight:600}
.ticker-price{font-size:.95rem;color:#fff;font-weight:700}
.ticker-chg{font-size:.72rem;font-weight:600}
.ticker-chg.up{color:#22c55e}
.ticker-chg.down{color:#f87171}
.features-strip{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin:20px 0}
.feat{display:flex;align-items:center;gap:6px;font-size:.78rem;color:#94a3b8}
.feat span{font-size:1rem}
.reg-form{background:#1a1a2e;border:1px solid #2d2d44;border-radius:16px;padding:28px 24px}
.reg-form h2{font-size:1.15rem;color:#fff;text-align:center;margin-bottom:4px}
.reg-form .sub{text-align:center;font-size:.82rem;color:#64748b;margin-bottom:18px}
.amount-pills{display:flex;gap:8px;margin-bottom:16px}
.amount-pill{flex:1;padding:10px;border-radius:8px;border:1px solid #2d2d44;background:#12122a;color:#e2e8f0;font-size:.88rem;font-weight:600;cursor:pointer;text-align:center;transition:all .2s}
.amount-pill.active{border-color:#22c55e;background:rgba(34,197,94,.08);color:#22c55e}
.chart-preview{background:#12122a;border:1px solid #2d2d44;border-radius:10px;padding:16px;margin:20px 0}
.chart-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.chart-header .pair{font-size:.9rem;color:#fff;font-weight:600}
.chart-header .pair-price{font-size:1.1rem;color:#22c55e;font-weight:700}
.chart-line{height:120px;position:relative;overflow:hidden}
.chart-line svg{width:100%;height:100%}
.testimonials-row{display:flex;gap:10px;overflow-x:auto;padding:4px 0 8px;margin:20px 0;scrollbar-width:none}
.testimonials-row::-webkit-scrollbar{display:none}
.test-card{flex-shrink:0;background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:14px;width:200px}
.test-card .test-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.test-card .test-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#818cf8);display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#fff;font-weight:700}
.test-card .test-name{font-size:.8rem;color:#fff;font-weight:600}
.test-card .test-text{font-size:.75rem;color:#94a3b8;line-height:1.4;font-style:italic}
.test-card .test-profit{margin-top:6px;font-size:.78rem;color:#22c55e;font-weight:600}
.disclaimer-strip{background:#12122a;border:1px solid #2d2d44;border-radius:8px;padding:12px;margin:20px 0;font-size:.72rem;color:#64748b;line-height:1.5}
</style>
<body>
<div class="hero">
<div class="container">
<div style="font-size:2.2rem;margin-bottom:12px">📈</div>
<h1 style="font-size:1.6rem;color:#fff;margin-bottom:4px">Start Trading with Just $250</h1>
<p class="text-muted text-sm mb-3">Access 200+ markets — stocks, forex, crypto & commodities</p>
<div class="live-ticker">
<div class="ticker-item"><div class="ticker-symbol">BTC/USD</div><div class="ticker-price">$67,842</div><div class="ticker-chg up">+3.2%</div></div>
<div class="ticker-item"><div class="ticker-symbol">EUR/USD</div><div class="ticker-price">1.0847</div><div class="ticker-chg up">+0.15%</div></div>
<div class="ticker-item"><div class="ticker-symbol">GOLD</div><div class="ticker-price">$2,341</div><div class="ticker-chg up">+0.8%</div></div>
<div class="ticker-item"><div class="ticker-symbol">AAPL</div><div class="ticker-price">$198.52</div><div class="ticker-chg down">-0.4%</div></div>
</div>
<div class="features-strip">
<div class="feat"><span>🔒</span>Regulated</div>
<div class="feat"><span>⚡</span>Fast Execution</div>
<div class="feat"><span>📊</span>Free Tools</div>
<div class="feat"><span>💳</span>0% Commission</div>
</div>
</div>
</div>

<div class="container">
<div class="reg-form">
<h2>Open Your Free Account</h2>
<p class="sub">Start trading in minutes — no experience needed</p>
<form onsubmit="event.preventDefault()">
<div class="grid-2" style="margin-bottom:10px">
<input type="text" placeholder="{{first_name}}">
<input type="text" placeholder="{{last_name}}">
</div>
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<input type="tel" placeholder="{{phone}}" style="margin-bottom:10px">
<div style="margin-bottom:16px">
<label class="text-sm text-muted mb-1" style="display:block">Starting Deposit:</label>
<div class="amount-pills">
<div class="amount-pill" onclick="pickAmt(this)">$250</div>
<div class="amount-pill active" onclick="pickAmt(this)">$500</div>
<div class="amount-pill" onclick="pickAmt(this)">$1,000</div>
<div class="amount-pill" onclick="pickAmt(this)">$5,000</div>
</div>
</div>
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">CREATE TRADING ACCOUNT →</button>
</form>
</div>

<div class="chart-preview">
<div class="chart-header">
<div><span class="pair">BTC/USD</span></div>
<div class="pair-price">↑ +12.4% this month</div>
</div>
<div class="chart-line">
<svg viewBox="0 0 400 120" preserveAspectRatio="none">
<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22c55e" stop-opacity=".3"/><stop offset="100%" stop-color="#22c55e" stop-opacity="0"/></linearGradient></defs>
<path d="M0,100 Q40,90 80,85 T160,60 T240,40 T320,30 T400,20" stroke="#22c55e" stroke-width="2" fill="none"/>
<path d="M0,100 Q40,90 80,85 T160,60 T240,40 T320,30 T400,20 V120 H0 Z" fill="url(#cg)"/>
</svg>
</div>
</div>

<h3 style="font-size:1rem;color:#fff;margin-bottom:14px;text-align:center">What Traders Are Saying</h3>
<div class="testimonials-row">
<div class="test-card"><div class="test-head"><div class="test-avatar">D</div><div class="test-name">David R.</div></div><p class="test-text">"Made my first profitable trade within a week of signing up."</p><p class="test-profit">+$1,240 this month</p></div>
<div class="test-card"><div class="test-head"><div class="test-avatar">S</div><div class="test-name">Sarah M.</div></div><p class="test-text">"The platform is incredibly intuitive. Perfect for beginners."</p><p class="test-profit">+$890 this month</p></div>
<div class="test-card"><div class="test-head"><div class="test-avatar">A</div><div class="test-name">Alex T.</div></div><p class="test-text">"Best trading tools I've used. The charts are phenomenal."</p><p class="test-profit">+$2,100 this month</p></div>
</div>

<div class="disclaimer-strip">
<strong>Risk Warning:</strong> Trading involves significant risk of loss. Past performance is not indicative of future results. {{platform_name}} is a regulated platform. Only trade with funds you can afford to lose. This is not financial advice. Please ensure you understand the risks involved.
</div>
</div>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   MOBILE TEMPLATE
   ═══════════════════════════════════════════════════════════════ */

const appInstall = `
${commonHead('Download the App')}
<style>
.app-hero{background:linear-gradient(180deg,#1e1b4b 0%,#0a0a1a 100%);padding:40px 0 24px;text-align:center}
.app-icon-wrap{width:96px;height:96px;border-radius:22px;background:linear-gradient(135deg,#6366f1,#4f46e5);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:3rem;box-shadow:0 10px 40px rgba(99,102,241,.3)}
.app-rating{display:flex;align-items:center;justify-content:center;gap:4px;margin:8px 0}
.app-rating .stars{color:#f59e0b;font-size:.9rem}
.app-rating .count{font-size:.78rem;color:#64748b}
.download-btns{display:flex;flex-direction:column;gap:10px;max-width:280px;margin:16px auto}
.store-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 20px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-weight:600;font-size:.9rem;text-decoration:none;transition:all .2s}
.store-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(99,102,241,.4);text-decoration:none}
.screenshots{display:flex;gap:10px;justify-content:center;overflow-x:auto;padding:20px 0;scrollbar-width:none}
.screenshots::-webkit-scrollbar{display:none}
.screenshot{flex-shrink:0;width:150px;height:280px;background:linear-gradient(135deg,#1a1a2e,#12122a);border-radius:16px;border:2px solid #2d2d44;display:flex;align-items:center;justify-content:center;font-size:2rem;overflow:hidden}
.screenshot-inner{width:calc(100% - 16px);height:calc(100% - 16px);background:linear-gradient(135deg,#1e1b4b,#0f172a);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:3rem}
.features-showcase{display:flex;flex-direction:column;gap:16px;margin:24px 0}
.showcase-item{display:flex;align-items:flex-start;gap:14px;background:#1a1a2e;border:1px solid #2d2d44;border-radius:12px;padding:18px}
.showcase-icon{flex-shrink:0;width:44px;height:44px;border-radius:10px;background:rgba(99,102,241,.1);display:flex;align-items:center;justify-content:center;font-size:1.3rem}
.showcase-text h3{font-size:.92rem;color:#fff;margin-bottom:4px}
.showcase-text p{font-size:.78rem;color:#64748b;line-height:1.4}
.stats-strip{display:flex;justify-content:space-around;margin:24px 0;padding:20px 0;border-top:1px solid #2d2d44;border-bottom:1px solid #2d2d44}
.ss-item{text-align:center}
.ss-val{font-size:1.2rem;font-weight:800;color:#fff}
.ss-lbl{font-size:.65rem;color:#64748b;margin-top:2px}
.reviews-scroll{display:flex;gap:10px;overflow-x:auto;padding:4px 0 8px;scrollbar-width:none}
.reviews-scroll::-webkit-scrollbar{display:none}
.rev-card{flex-shrink:0;background:#1a1a2e;border:1px solid #2d2d44;border-radius:10px;padding:14px;width:220px}
.rev-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.rev-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#818cf8);display:flex;align-items:center;justify-content:center;font-size:.65rem;color:#fff;font-weight:700}
.rev-name{font-size:.78rem;color:#fff;font-weight:600}
.rev-stars{color:#f59e0b;font-size:.7rem}
.rev-text{font-size:.75rem;color:#94a3b8;line-height:1.4}
</style>
<body>
<div class="app-hero">
<div class="container">
<div class="app-icon-wrap">📲</div>
<h1 style="font-size:1.5rem;color:#fff">{{app_name}}</h1>
<p class="text-muted text-sm">{{app_tagline}}</p>
<div class="app-rating"><span class="stars">★★★★★</span><span class="count">4.9 · 50K+ ratings</span></div>
<div class="download-btns">
<a href="{{ios_url}}" class="store-btn">🍎 Download on App Store</a>
<a href="{{android_url}}" class="store-btn">🤖 Get it on Google Play</a>
</div>
</div>
</div>

<div class="container">
<div class="screenshots">
<div class="screenshot"><div class="screenshot-inner">📊</div></div>
<div class="screenshot"><div class="screenshot-inner">🔔</div></div>
<div class="screenshot"><div class="screenshot-inner">⚡</div></div>
</div>

<div class="features-showcase">
<div class="showcase-item"><div class="showcase-icon">⚡</div><div class="showcase-text"><h3>Lightning Fast</h3><p>{{feature_1_desc}}</p></div></div>
<div class="showcase-item"><div class="showcase-icon">🔒</div><div class="showcase-text"><h3>Secure & Private</h3><p>{{feature_2_desc}}</p></div></div>
<div class="showcase-item"><div class="showcase-icon">🎯</div><div class="showcase-text"><h3>Smart Features</h3><p>{{feature_3_desc}}</p></div></div>
<div class="showcase-item"><div class="showcase-icon">🌙</div><div class="showcase-text"><h3>Dark Mode</h3><p>{{feature_4_desc}}</p></div></div>
</div>

<div class="stats-strip">
<div class="ss-item"><div class="ss-val">10M+</div><div class="ss-lbl">Downloads</div></div>
<div class="ss-item"><div class="ss-val">4.9★</div><div class="ss-lbl">Rating</div></div>
<div class="ss-item"><div class="ss-val">150+</div><div class="ss-lbl">Countries</div></div>
</div>

<h3 style="font-size:1rem;color:#fff;margin-bottom:14px;text-align:center">What Users Say</h3>
<div class="reviews-scroll">
<div class="rev-card"><div class="rev-head"><div class="rev-avatar">J</div><div class="rev-name">Jake P.</div><div class="rev-stars">★★★★★</div></div><p class="rev-text">"Best app I've downloaded this year. Incredibly useful and well-designed."</p></div>
<div class="rev-card"><div class="rev-head"><div class="rev-avatar">L</div><div class="rev-name">Lisa M.</div><div class="rev-stars">★★★★★</div></div><p class="rev-text">"Changed my daily routine. The notifications feature is a game-changer."</p></div>
<div class="rev-card"><div class="rev-head"><div class="rev-avatar">K</div><div class="rev-name">Kevin R.</div><div class="rev-stars">★★★★★</div></div><p class="rev-text">"Sleek design, fast performance. Exactly what I was looking for."</p></div>
</div>

<div class="card text-center mt-3" style="border-color:#6366f1">
<p class="text-sm text-muted mb-2">Ready to get started?</p>
<a href="{{download_url}}" class="btn btn-primary btn-lg" style="width:100%">DOWNLOAD FREE →</a>
</div>

<p class="text-center text-sm text-muted mt-3" style="font-size:.72rem">{{app_name}} requires iOS 15+ or Android 10+. Free to download with optional in-app purchases.</p>
</div>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   GENERIC TEMPLATE
   ═══════════════════════════════════════════════════════════════ */

const genericLeadCapture = `
${commonHead('Get Your Free Guide')}
<style>
.split-layout{display:grid;grid-template-columns:1fr 1fr;min-height:100vh}
@media(max-width:768px){.split-layout{grid-template-columns:1fr}}
.split-left{background:linear-gradient(135deg,#1e1b4b,#0f172a);padding:40px 28px;display:flex;flex-direction:column;justify-content:center}
.split-right{padding:40px 28px;display:flex;flex-direction:column;justify-content:center;background:#0a0a1a}
.icon-circle{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#4f46e5);display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:20px;box-shadow:0 0 30px rgba(99,102,241,.3)}
.benefits{margin:24px 0}
.benefit{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px}
.benefit-icon{flex-shrink:0;width:32px;height:32px;border-radius:8px;background:rgba(99,102,241,.12);display:flex;align-items:center;justify-content:center;font-size:.9rem}
.benefit h4{font-size:.9rem;color:#fff;margin-bottom:2px}
.benefit p{font-size:.78rem;color:#64748b;line-height:1.4}
.form-wrap{background:#1a1a2e;border:1px solid #2d2d44;border-radius:16px;padding:28px 24px}
.form-wrap h2{font-size:1.2rem;color:#fff;margin-bottom:4px}
.form-wrap .sub{font-size:.85rem;color:#64748b;margin-bottom:18px}
.social-proof{display:flex;align-items:center;gap:12px;margin-top:20px}
.avatar-stack{display:flex}
.avatar-stack .a{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#818cf8);border:2px solid #0a0a1a;margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#fff;font-weight:700}
.avatar-stack .a:first-child{margin-left:0}
.social-proof .sp-text{font-size:.78rem;color:#64748b}
</style>
<body>
<div class="split-layout">
<div class="split-left">
<div class="icon-circle">{{icon}}</div>
<h1 style="font-size:1.5rem;color:#fff;margin-bottom:4px">{{headline}}</h1>
<p style="color:#94a3b8;font-size:.92rem;margin-bottom:8px">{{subheadline}}</p>
<div class="benefits">
<div class="benefit"><div class="benefit-icon">✓</div><div><h4>{{benefit_1_title}}</h4><p>{{benefit_1_desc}}</p></div></div>
<div class="benefit"><div class="benefit-icon">✓</div><div><h4>{{benefit_2_title}}</h4><p>{{benefit_2_desc}}</p></div></div>
<div class="benefit"><div class="benefit-icon">✓</div><div><h4>{{benefit_3_title}}</h4><p>{{benefit_3_desc}}</p></div></div>
<div class="benefit"><div class="benefit-icon">✓</div><div><h4>{{benefit_4_title}}</h4><p>{{benefit_4_desc}}</p></div></div>
</div>
</div>
<div class="split-right">
<div class="form-wrap">
<h2>{{form_title}}</h2>
<p class="sub">{{form_subtitle}}</p>
<form onsubmit="event.preventDefault()">
<input type="text" placeholder="{{name}}" style="margin-bottom:10px">
<input type="email" placeholder="{{email}}" style="margin-bottom:10px">
<input type="tel" placeholder="{{phone}}" style="margin-bottom:16px">
<button type="submit" class="btn btn-primary btn-lg" style="width:100%">{{cta_text}} →</button>
</form>
<p class="text-center text-sm text-muted mt-2">🔒 No spam. Unsubscribe anytime.</p>
</div>
<div class="social-proof">
<div class="avatar-stack"><div class="a">S</div><div class="a">J</div><div class="a">M</div><div class="a">A</div><div class="a">+</div></div>
<div class="sp-text"><strong style="color:#fff">{{social_count}}</strong> people already downloaded this</div>
</div>
</div>
</div>
</body></html>`;


/* ═══════════════════════════════════════════════════════════════
   TEMPLATE REGISTRY
   ═══════════════════════════════════════════════════════════════ */

const landingPageTemplates = [

  /* ── Sweepstakes ──────────────────────────────────────────── */
  {
    id: 'iphone-giveaway',
    name: 'iPhone 16 Giveaway',
    icon: '📱',
    category: 'sweepstakes',
    description: 'Countdown timer + CTA with "You\'ve been selected" urgency messaging',
    conversionType: 'countdown',
    htmlContent: iphoneGiveaway,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'User\'s full name' },
      { name: 'email', placeholder: '{{email}}', description: 'User\'s email address' },
      { name: 'phone', placeholder: '{{phone}}', description: 'User\'s phone number' },
    ],
    previewColor: '#6366f1',
  },
  {
    id: 'spin-the-wheel',
    name: 'Spin the Wheel',
    icon: '🎰',
    category: 'sweepstakes',
    description: 'Gamified wheel spin landing page with animated prizes and email capture',
    conversionType: 'cta_button',
    htmlContent: spinTheWheel,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'User\'s full name' },
      { name: 'email', placeholder: '{{email}}', description: 'User\'s email address' },
    ],
    previewColor: '#f59e0b',
  },
  {
    id: 'survey-complete',
    name: 'Survey Complete',
    icon: '✅',
    category: 'sweepstakes',
    description: 'Congratulations page with selectable reward cards and email submit form',
    conversionType: 'lead_form',
    htmlContent: surveyComplete,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'User\'s full name' },
      { name: 'email', placeholder: '{{email}}', description: 'User\'s email address' },
    ],
    previewColor: '#22c55e',
  },

  /* ── VSL ──────────────────────────────────────────────────── */
  {
    id: 'health-supplement-vsl',
    name: 'Health Supplement VSL',
    icon: '🧬',
    category: 'vsl',
    description: 'Video sales letter layout with play button, testimonial grid, and CTA reveal',
    conversionType: 'video_cta',
    htmlContent: healthSupplementVSL,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'Viewer\'s name' },
      { name: 'email', placeholder: '{{email}}', description: 'Viewer\'s email' },
    ],
    previewColor: '#8b5cf6',
  },
  {
    id: 'crypto-vsl',
    name: 'Crypto VSL',
    icon: '🪙',
    category: 'vsl',
    description: '"This crypto could 100x" urgency VSL with live ticker and countdown',
    conversionType: 'video_cta',
    htmlContent: cryptoVSL,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'Viewer\'s name' },
      { name: 'email', placeholder: '{{email}}', description: 'Viewer\'s email' },
      { name: 'token_symbol', placeholder: '{{token_symbol}}', description: 'Token ticker (e.g. BTC)' },
      { name: 'token_name', placeholder: '{{token_name}}', description: 'Full token name' },
      { name: 'token_price', placeholder: '{{token_price}}', description: 'Current token price' },
      { name: 'token_change', placeholder: '{{token_change}}', description: '24h change percentage' },
      { name: 'stat_1', placeholder: '{{stat_1}}', description: 'Early investors stat' },
      { name: 'stat_2', placeholder: '{{stat_2}}', description: 'Average return stat' },
      { name: 'stat_3', placeholder: '{{stat_3}}', description: '30-day growth stat' },
    ],
    previewColor: '#f59e0b',
  },

  /* ── Ecommerce ────────────────────────────────────────────── */
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    icon: '⚡',
    category: 'ecommerce',
    description: 'Product showcase with countdown timer, stock indicator, and add-to-cart CTA',
    conversionType: 'countdown',
    htmlContent: flashSale,
    variables: [
      { name: 'product_name', placeholder: '{{product_name}}', description: 'Product display name' },
      { name: 'product_tagline', placeholder: '{{product_tagline}}', description: 'Short product description' },
      { name: 'original_price', placeholder: '{{original_price}}', description: 'Original price' },
      { name: 'sale_price', placeholder: '{{sale_price}}', description: 'Sale price' },
      { name: 'discount', placeholder: '{{discount}}', description: 'Discount percentage' },
      { name: 'installment_price', placeholder: '{{installment_price}}', description: '4x installment amount' },
      { name: 'brand_name', placeholder: '{{brand_name}}', description: 'Brand or store name' },
    ],
    previewColor: '#ef4444',
  },
  {
    id: 'product-review',
    name: 'Product Review',
    icon: '📊',
    category: 'ecommerce',
    description: 'Comparison table style with star ratings, spec tables, and CTA buttons',
    conversionType: 'review',
    htmlContent: productReview,
    variables: [
      { name: 'category_name', placeholder: '{{category_name}}', description: 'Product category (e.g. Headphones)' },
      { name: 'product_1_name', placeholder: '{{product_1_name}}', description: 'Product 1 name' },
      { name: 'product_1_emoji', placeholder: '{{product_1_emoji}}', description: 'Product 1 emoji icon' },
      { name: 'product_1_price', placeholder: '{{product_1_price}}', description: 'Product 1 price' },
      { name: 'product_1_orig_price', placeholder: '{{product_1_orig_price}}', description: 'Product 1 original price' },
      { name: 'product_1_url', placeholder: '{{product_1_url}}', description: 'Product 1 affiliate link' },
      { name: 'product_1_short', placeholder: '{{product_1_short}}', description: 'Product 1 short name for table' },
      { name: 'product_2_name', placeholder: '{{product_2_name}}', description: 'Product 2 name' },
      { name: 'product_2_emoji', placeholder: '{{product_2_emoji}}', description: 'Product 2 emoji icon' },
      { name: 'product_2_price', placeholder: '{{product_2_price}}', description: 'Product 2 price' },
      { name: 'product_2_url', placeholder: '{{product_2_url}}', description: 'Product 2 affiliate link' },
      { name: 'product_2_short', placeholder: '{{product_2_short}}', description: 'Product 2 short name for table' },
      { name: 'product_3_name', placeholder: '{{product_3_name}}', description: 'Product 3 name' },
      { name: 'product_3_emoji', placeholder: '{{product_3_emoji}}', description: 'Product 3 emoji icon' },
      { name: 'product_3_price', placeholder: '{{product_3_price}}', description: 'Product 3 price' },
      { name: 'product_3_url', placeholder: '{{product_3_url}}', description: 'Product 3 affiliate link' },
      { name: 'product_3_short', placeholder: '{{product_3_short}}', description: 'Product 3 short name for table' },
    ],
    previewColor: '#6366f1',
  },

  /* ── Crypto ───────────────────────────────────────────────── */
  {
    id: 'crypto-exchange-signup',
    name: 'Exchange Sign Up',
    icon: '🪙',
    category: 'crypto',
    description: 'Crypto exchange registration landing with social login and trust badges',
    conversionType: 'lead_form',
    htmlContent: cryptoExchangeSignup,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'User\'s name' },
      { name: 'email', placeholder: '{{email}}', description: 'User\'s email' },
      { name: 'password', placeholder: '{{password}}', description: 'Password field placeholder' },
      { name: 'exchange_name', placeholder: '{{exchange_name}}', description: 'Exchange brand name' },
      { name: 'user_count', placeholder: '{{user_count}}', description: 'Number of active users' },
      { name: 'volume', placeholder: '{{volume}}', description: 'Daily trading volume' },
    ],
    previewColor: '#f59e0b',
  },
  {
    id: 'crypto-wallet-download',
    name: 'Wallet Download',
    icon: '🛡️',
    category: 'crypto',
    description: 'Non-custodial wallet app download page with feature showcase and coin badges',
    conversionType: 'cta_button',
    htmlContent: cryptoWalletDownload,
    variables: [
      { name: 'wallet_name', placeholder: '{{wallet_name}}', description: 'Wallet app name' },
      { name: 'download_count', placeholder: '{{download_count}}', description: 'Total download count' },
      { name: 'ios_url', placeholder: '{{ios_url}}', description: 'iOS App Store link' },
      { name: 'android_url', placeholder: '{{android_url}}', description: 'Google Play link' },
      { name: 'chrome_url', placeholder: '{{chrome_url}}', description: 'Chrome extension link' },
    ],
    previewColor: '#6366f1',
  },

  /* ── Dating ──────────────────────────────────────────────── */
  {
    id: 'dating-profile',
    name: 'Dating Profile',
    icon: '💕',
    category: 'dating',
    description: '"Someone wants to meet you!" style with profile cards and inline signup',
    conversionType: 'cta_button',
    htmlContent: datingProfile,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'User\'s name' },
      { name: 'email', placeholder: '{{email}}', description: 'User\'s email' },
      { name: 'match_name', placeholder: '{{match_name}}', description: 'Featured match name' },
      { name: 'match_age', placeholder: '{{match_age}}', description: 'Match age' },
      { name: 'match_city', placeholder: '{{match_city}}', description: 'Match city' },
      { name: 'match_bio', placeholder: '{{match_bio}}', description: 'Match bio text' },
    ],
    previewColor: '#ec4899',
  },
  {
    id: 'match-quiz',
    name: 'Match Quiz',
    icon: '💘',
    category: 'dating',
    description: 'Personality quiz with 5 questions leading to match score and dating offer',
    conversionType: 'quiz',
    htmlContent: matchQuiz,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'Quiz taker\'s name' },
      { name: 'email', placeholder: '{{email}}', description: 'Quiz taker\'s email' },
    ],
    previewColor: '#8b5cf6',
  },

  /* ── Health ───────────────────────────────────────────────── */
  {
    id: 'supplement-trial',
    name: 'Supplement Trial',
    icon: '🌿',
    category: 'health',
    description: 'Before/after layout with ingredients list and free trial form with shipping',
    conversionType: 'lead_form',
    htmlContent: supplementTrial,
    variables: [
      { name: 'name', placeholder: '{{name}}', description: 'User\'s name' },
      { name: 'email', placeholder: '{{email}}', description: 'User\'s email' },
      { name: 'address', placeholder: '{{address}}', description: 'Shipping address' },
      { name: 'product_name', placeholder: '{{product_name}}', description: 'Supplement name' },
      { name: 'shipping_cost', placeholder: '{{shipping_cost}}', description: 'Shipping cost (e.g. 4.95)' },
      { name: 'ingredient_1', placeholder: '{{ingredient_1}}', description: 'First ingredient name' },
      { name: 'ingredient_1_desc', placeholder: '{{ingredient_1_desc}}', description: 'First ingredient description' },
      { name: 'ingredient_2', placeholder: '{{ingredient_2}}', description: 'Second ingredient name' },
      { name: 'ingredient_2_desc', placeholder: '{{ingredient_2_desc}}', description: 'Second ingredient description' },
      { name: 'ingredient_3', placeholder: '{{ingredient_3}}', description: 'Third ingredient name' },
      { name: 'ingredient_3_desc', placeholder: '{{ingredient_3_desc}}', description: 'Third ingredient description' },
      { name: 'ingredient_4', placeholder: '{{ingredient_4}}', description: 'Fourth ingredient name' },
      { name: 'ingredient_4_desc', placeholder: '{{ingredient_4_desc}}', description: 'Fourth ingredient description' },
    ],
    previewColor: '#22c55e',
  },
  {
    id: 'weight-loss-quiz',
    name: 'Weight Loss Quiz',
    icon: '🏋️',
    category: 'health',
    description: '5-step quiz funnel with progress bar leading to personalized supplement offer',
    conversionType: 'quiz',
    htmlContent: weightLossQuiz,
    variables: [
      { name: 'email', placeholder: '{{email}}', description: 'User\'s email' },
      { name: 'zip_code', placeholder: '{{zip_code}}', description: 'User\'s zip/postal code' },
    ],
    previewColor: '#16a34a',
  },

  /* ── Finance ──────────────────────────────────────────────── */
  {
    id: 'trading-platform',
    name: 'Trading Platform',
    icon: '📈',
    category: 'finance',
    description: '"Start trading with $250" registration page with live tickers and testimonials',
    conversionType: 'lead_form',
    htmlContent: tradingPlatform,
    variables: [
      { name: 'first_name', placeholder: '{{first_name}}', description: 'User\'s first name' },
      { name: 'last_name', placeholder: '{{last_name}}', description: 'User\'s last name' },
      { name: 'email', placeholder: '{{email}}', description: 'User\'s email' },
      { name: 'phone', placeholder: '{{phone}}', description: 'User\'s phone' },
      { name: 'platform_name', placeholder: '{{platform_name}}', description: 'Trading platform name' },
    ],
    previewColor: '#22c55e',
  },

  /* ── Mobile ──────────────────────────────────────────────── */
  {
    id: 'app-install',
    name: 'App Install',
    icon: '📲',
    category: 'mobile',
    description: 'App store style page with screenshots, feature cards, and store download buttons',
    conversionType: 'cta_button',
    htmlContent: appInstall,
    variables: [
      { name: 'app_name', placeholder: '{{app_name}}', description: 'App name' },
      { name: 'app_tagline', placeholder: '{{app_tagline}}', description: 'App tagline' },
      { name: 'ios_url', placeholder: '{{ios_url}}', description: 'iOS App Store URL' },
      { name: 'android_url', placeholder: '{{android_url}}', description: 'Google Play URL' },
      { name: 'download_url', placeholder: '{{download_url}}', description: 'Primary download URL' },
      { name: 'feature_1_desc', placeholder: '{{feature_1_desc}}', description: 'Feature 1 description' },
      { name: 'feature_2_desc', placeholder: '{{feature_2_desc}}', description: 'Feature 2 description' },
      { name: 'feature_3_desc', placeholder: '{{feature_3_desc}}', description: 'Feature 3 description' },
      { name: 'feature_4_desc', placeholder: '{{feature_4_desc}}', description: 'Feature 4 description' },
    ],
    previewColor: '#6366f1',
  },

  /* ── Generic ─────────────────────────────────────────────── */
  {
    id: 'generic-lead-capture',
    name: 'Generic Lead Capture',
    icon: '📧',
    category: 'generic',
    description: 'Split-screen layout with benefits sidebar and fully customizable lead form',
    conversionType: 'lead_form',
    htmlContent: genericLeadCapture,
    variables: [
      { name: 'icon', placeholder: '{{icon}}', description: 'Hero emoji icon' },
      { name: 'headline', placeholder: '{{headline}}', description: 'Main headline' },
      { name: 'subheadline', placeholder: '{{subheadline}}', description: 'Subheadline text' },
      { name: 'benefit_1_title', placeholder: '{{benefit_1_title}}', description: 'Benefit 1 title' },
      { name: 'benefit_1_desc', placeholder: '{{benefit_1_desc}}', description: 'Benefit 1 description' },
      { name: 'benefit_2_title', placeholder: '{{benefit_2_title}}', description: 'Benefit 2 title' },
      { name: 'benefit_2_desc', placeholder: '{{benefit_2_desc}}', description: 'Benefit 2 description' },
      { name: 'benefit_3_title', placeholder: '{{benefit_3_title}}', description: 'Benefit 3 title' },
      { name: 'benefit_3_desc', placeholder: '{{benefit_3_desc}}', description: 'Benefit 3 description' },
      { name: 'benefit_4_title', placeholder: '{{benefit_4_title}}', description: 'Benefit 4 title' },
      { name: 'benefit_4_desc', placeholder: '{{benefit_4_desc}}', description: 'Benefit 4 description' },
      { name: 'form_title', placeholder: '{{form_title}}', description: 'Form section title' },
      { name: 'form_subtitle', placeholder: '{{form_subtitle}}', description: 'Form section subtitle' },
      { name: 'cta_text', placeholder: '{{cta_text}}', description: 'CTA button text' },
      { name: 'name', placeholder: '{{name}}', description: 'Name field placeholder' },
      { name: 'email', placeholder: '{{email}}', description: 'Email field placeholder' },
      { name: 'phone', placeholder: '{{phone}}', description: 'Phone field placeholder' },
      { name: 'social_count', placeholder: '{{social_count}}', description: 'Social proof count text' },
    ],
    previewColor: '#818cf8',
  },
];

export default landingPageTemplates;
