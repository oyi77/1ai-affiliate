#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const terser = require('terser');

const projectRoot = path.resolve(__dirname, '..');
const indexPath = path.join(projectRoot, 'index.html');
const distDir = path.join(projectRoot, 'dist');
const outputPath = path.join(distDir, '1affiliate-canvas.html');

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim();
}

async function minifyJs(code) {
  try {
    const result = await terser.minify(code, {
      compress: { drop_console: true, drop_debugger: true, passes: 2 },
      mangle: { safari10: true },
      format: { comments: false },
      toplevel: false
    });
    return result.code || code;
  } catch (err) {
    return code;
  }
}

async function build() {
  let html = safeRead(indexPath);
  if (!html) {
    console.error('[build] Failed: index.html not found.');
    process.exit(1);
  }

  // Minify inline CSS
  html = html.replace(/<style[\s\S]*?<\/style>/gi, match => {
    const cssContent = match.replace(/<style[^>]*>|<\/style>/gi, '');
    return `<style>${minifyCss(cssContent)}</style>`;
  });

  // Process local CSS
  html = html.replace(/<link\s+[^>]*href=["'](css\/[^"]+)["'][^>]*>/gi, (match, href) => {
    const cssPath = path.join(projectRoot, href);
    const css = minifyCss(safeRead(cssPath) || '');
    return `<style>${css}</style>`;
  });

  // Process local JS files
  html = html.replace(/<script\s+([^>]*?)src=["'](js\/[^"]+)["'][^>]*>\s*<\/script>/gi,
    async (match, attrs, src) => {
      const jsPath = path.join(projectRoot, src);
      let js = safeRead(jsPath);
      if (!js) return '';
      js = await minifyJs(js);
      let cleanedAttrs = attrs.replace(/\s*src=("[^"]*"|'[^']*')/i, '').trim();
      const attrString = cleanedAttrs.length ? ' ' + cleanedAttrs : '';
      return `<script${attrString}>${js}</script>`;
    }
  );

  // Inline HTML components
  const components = [
    { id: 'login-overlay-placeholder', path: 'components/login-overlay.html' },
    { id: 'user-badge-placeholder', path: 'components/user-badge.html' },
    { id: 'mobile-header-placeholder', path: 'components/mobile-header.html' },
    { id: 'sidebar-placeholder', path: 'components/sidebar.html' },
    { id: 'beranda-placeholder', path: 'components/beranda.html' },
    { id: 'mobile-nav-placeholder', path: 'components/mobile-nav.html' },
    { id: 'api-settings-placeholder', path: 'components/api-settings.html' },
    { id: 'buat-model-placeholder', path: 'components/buat-model.html' },
    { id: 'mockup-studio-placeholder', path: 'components/mockup-studio.html' },
    { id: 'miniature-placeholder', path: 'components/miniature.html' },
    { id: 'karikatur-placeholder', path: 'components/karikatur.html' },
    { id: 'photo-editor-placeholder', path: 'components/photo-editor.html' },
    { id: 'ai-beauty-placeholder', path: 'components/ai-beauty.html' },
    { id: 'halu-placeholder', path: 'components/halu.html' },
    { id: 'affiliate-placeholder', path: 'components/affiliate.html' },
    { id: 'virtual-tryon-placeholder', path: 'components/virtual-tryon.html' },
    { id: 'pose-fashion-placeholder', path: 'components/pose-fashion.html' }
  ];

  for (const comp of components) {
    const compHtml = safeRead(path.join(projectRoot, comp.path));
    if (compHtml) {
      const regex = new RegExp(`<div\\s+id=["']${comp.id}["']\\s*><\\/div>`, 'i');
      html = html.replace(regex, `<div id="${comp.id}">${compHtml}</div>`);
    }
  }

  // Process feature JS files
  const featuresDir = path.join(projectRoot, 'js/features');
  let featureScripts = '';
  try {
    const featureFiles = fs.readdirSync(featuresDir).filter(f => f.endsWith('.js'));
    for (const featureFile of featureFiles) {
      const featurePath = path.join(featuresDir, featureFile);
      let code = safeRead(featurePath);
      if (code) {
        code = await minifyJs(code);
        featureScripts += `<script>${code}</script>`;
      }
    }
  } catch (err) {}

  if (featureScripts) {
    html = html.replace('</body>', `${featureScripts}</body>`);
  }

  // Final minification
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');

  const size = fs.statSync(outputPath).size;
  console.log(`[build] Generated: ${outputPath}`);
  console.log(`[build] Size: ${(size / 1024).toFixed(1)} KB (minified)`);
}

build().catch(err => {
  console.error('[build] Error:', err);
  process.exit(1);
});
