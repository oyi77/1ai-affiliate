'use strict';

/**
 * Template Registry
 * Auto-discovers JSON templates from server/templates/<entity-type>/
 * Each template defines fields, defaults, and validation for creating entities.
 *
 * Adding a template: drop a .json file in the right directory. Done.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

function loadTemplates() {
  const templates = {};
  if (!fs.existsSync(TEMPLATES_DIR)) return templates;

  for (const entityType of fs.readdirSync(TEMPLATES_DIR)) {
    const dir = path.join(TEMPLATES_DIR, entityType);
    if (!fs.statSync(dir).isDirectory()) continue;

    templates[entityType] = [];
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
      try {
        const tpl = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        tpl._file = file;
        templates[entityType].push(tpl);
      } catch (err) {
        console.error(`[Templates] Failed to load ${entityType}/${file}: ${err.message}`);
      }
    }
  }
  return templates;
}

// Cache templates, reload on file change (or on explicit call)
let cache = null;

function getAll() {
  if (!cache) cache = loadTemplates();
  return cache;
}

function reload() {
  cache = loadTemplates();
  return cache;
}

function list(entityType) {
  return getAll()[entityType] || [];
}

function get(entityType, templateId) {
  return (getAll()[entityType] || []).find(t => t.id === templateId) || null;
}

/**
 * Apply a template to fill in defaults for an entity body.
 * Returns the body with template defaults merged (user values take precedence).
 */
function apply(entityType, templateId, userValues = {}) {
  const tpl = get(entityType, templateId);
  if (!tpl) return userValues;

  const result = { ...userValues };
  for (const field of tpl.fields) {
    if (result[field.key] === undefined && field.default !== undefined) {
      result[field.key] = field.default;
    }
  }
  // Stamp template reference
  result._template = templateId;
  return result;
}

/**
 * Validate user values against template field definitions.
 * Returns { valid: boolean, errors: string[] }
 */
function validate(entityType, templateId, values) {
  const tpl = get(entityType, templateId);
  if (!tpl) return { valid: true, errors: [] };

  const errors = [];
  for (const field of tpl.fields) {
    if (field.required && (values[field.key] === undefined || values[field.key] === '')) {
      errors.push(`${field.label || field.key} is required`);
    }
    if (field.type === 'select' && field.options && values[field.key] !== undefined) {
      if (!field.options.includes(values[field.key])) {
        errors.push(`${field.label || field.key} must be one of: ${field.options.join(', ')}`);
      }
    }
    if (field.min !== undefined && typeof values[field.key] === 'number' && values[field.key] < field.min) {
      errors.push(`${field.label || field.key} must be >= ${field.min}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

module.exports = { getAll, list, get, apply, validate, reload };
