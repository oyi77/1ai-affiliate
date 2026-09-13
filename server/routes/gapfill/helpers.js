/**
 * Gapfill Routes - Helper Functions
 * Shared helper functions for gapfill routes.
 */

/**
 * Substitute postback macros in a template URL with provided data.
 * @param {string} template - The URL template with {macro} placeholders
 * @param {Object} data - Key-value pairs to substitute
 * @returns {string} - The URL with macros substituted
 */
function substitutePostbackMacros(template, data) {
  let url = template;
  for (const [key, value] of Object.entries(data)) {
    url = url.replace(new RegExp(`\\{${key}\\}`, 'g'), value ?? '');
  }
  return url;
}

module.exports = {
  substitutePostbackMacros,
};