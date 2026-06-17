<!-- Parent: ../AGENTS.md -->

# PROJECT KNOWLEDGE BASE

**Generated:** 2025-02-06
**Repository:** Static front-end Gemini Canvas app for "1affiliate"

## OVERVIEW
Gemini Canvas AI image generation app. Static HTML + Tailwind CDN, custom CSS, vanilla JS (no bundlers, no frameworks). Authentication via Google Apps Script endpoint, localStorage for state.

## STRUCTURE
```
./
├── index.html              # Main entry point, contains placeholder divs for components
├── css/
│   └── style.css          # Custom styles (inlined in build)
├── js/
│   ├── main.js            # Main app logic, dynamic component loading, Gemini API calls
│   └── auth.js           # Authentication: Google Apps Script integration, session management
├── components/            # HTML partials injected into placeholders
│   ├── login-overlay.html
│   ├── user-badge.html
│   ├── mobile-header.html
│   ├── sidebar.html
│   ├── beranda.html
│   ├── mobile-nav.html
│   └── api-settings.html
├── scripts/
│   └── build-canvas-single-html.js  # Bundles index.html + assets into single file
├── .cursor/rules/         # AI assistant guidelines
└── .github/workflows/    # CI: Build canvas HTML artifact
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Authentication flow | js/auth.js | Google Apps Script SCRIPT_URL endpoint |
| Dynamic component loading | js/main.js (loadAllComponents) | Fetches HTML from components/, injects into placeholders |
| Gemini API integration | js/main.js | Uses gemini-2.5-flash-preview models, API key from localStorage |
| Build process | scripts/build-canvas-single-html.js | Inlines CSS/JS/components into single HTML |
| Component placeholders | index.html | IDs: *-placeholder (e.g., login-overlay-placeholder) |

## CONVENTIONS
- **No frameworks:** Plain HTML/CSS/JS, Tailwind via CDN only. No Node.js backends, no bundlers.
- **Language:** All UI text in Indonesian unless user explicitly requests otherwise.
- **Component injection:** HTML partials in `components/` loaded via fetch() and injected into `<div id="*-placeholder">` in index.html. Never change placeholder IDs without updating js/main.js.
- **LocalStorage keys:** Prefix with "1affiliate_" (email, token, nama) or "gemini_" (api_key).
- **Firebase:** Imported from gstatic CDN: firebase-app.js, firebase-auth.js, firebase-firestore.js.
- **External dependencies:** FontAwesome (icons), FileSaver.js, heic2any (HEIC conversion) - all via CDN.
- **Build output:** Single HTML file in `dist/1affiliate-canvas.html` for Gemini Canvas deployment.

## ANTI-PATTERNS (THIS PROJECT)
- NEVER introduce bundlers, SPA frameworks, or Node.js backends without explicit user request.
- NEVER change placeholder IDs (`*-placeholder`) in index.html without updating all references in js/main.js.
- NEVER hard-code API keys or secrets into client code.
- NEVER remove Firebase imports or Tailwind CDN scripts.
- NEVER add import/export, CommonJS, or any bundler-specific syntax in JS files.

## UNIQUE STYLES
- **Dynamic component loading:** `loadComponent(placeholderId, url)` pattern fetches HTML and injects into DOM.
- **API key validation:** `window.checkApiKey()` validates localStorage key, shows modal if missing.
- **HEIC conversion:** Automatically converts HEIC files to JPEG using heic2any library before upload.
- **Firebase modules:** Imported as ES modules from gstatic CDN (not npm).
- **Build inlining:** Custom build script replaces `<link href="css/*">` and `<script src="js/*">` with inline content.

## COMMANDS
```bash
# Build single HTML for Gemini Canvas
node scripts/build-canvas-single-html.js

# Output
dist/1affiliate-canvas.html
```

## NOTES
- **Authentication:** Uses Google Apps Script endpoint (`SCRIPT_URL`). Returns: `status` ("SUKSES"/"VALID"/"INVALID"), `nama`. Token generated client-side.
- **Session management:** Auto-logout on duplicate login (session checked every 10s via `jagaSesi()`).
- **Gemini Canvas deployment:** The generated `dist/1affiliate-canvas.html` is meant to run inside Gemini Canvas environment (provides API key automatically). Outside that, user must provide API key via Settings UI.
- **Error handling:** Generic error messages in Indonesian. Security-sensitive changes (SCRIPT_URL, tokens, localStorage) should be explained briefly.
- **Responsive:** Mobile-first design using Tailwind utilities. Sidebar collapse state persisted in localStorage.
- **Cursor rules:** See `.cursor/rules/global.mdc` and `.cursor/rules/frontend.mdc` for additional AI assistant guidelines.
