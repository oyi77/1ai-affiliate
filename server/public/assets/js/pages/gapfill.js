/**
 * Gap-fill page renderers — loader (split under the 800-line gate).
 * Renderer bodies live per-domain in ./gapfill/*.js; load order: actions
 * first (window.* handlers), then renderer domains. Order-independent at
 * runtime (all renderers resolve on navigation), actions-first keeps the
 * button-handler convention explicit.
 */
// Loaded via individual <script> tags in server/public/admin/index.html:
//   pages/gapfill/actions.js, tracking.js, campaigns.js, reports.js,
//   finance.js, risk.js, meta.js
// This stub keeps the legacy path meaningful if included directly.
window.PageRenderers = window.PageRenderers || {};
