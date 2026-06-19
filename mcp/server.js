#!/usr/bin/env node
'use strict';

/**
 * 1ai-Affiliate MCP Server
 * Exposes integration and tracking tools for AI agents.
 *
 * Usage:
 *   node mcp/server.js          # stdio mode (for Claude Desktop, etc.)
 *
 * Add to Claude Desktop config:
 *   {
 *     "mcpServers": {
 *       "1ai-affiliate": {
 *         "command": "node",
 *         "args": ["/path/to/1ai-affiliate/mcp/server.js"],
 *         "env": { "API_BASE": "http://localhost:3001", "ADMIN_TOKEN": "your-jwt" }
 *       }
 *     }
 *   }
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const TOKEN = process.env.ADMIN_TOKEN || '';

async function apiCall(method, path, body) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

// ── Tool Definitions ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'list_integrations',
    description: 'List all available ad platform integrations with their auth field schemas. Use this to discover what platforms can be connected.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'connect_integration',
    description: 'Connect an ad platform to a traffic source. Tests credentials before saving.',
    inputSchema: {
      type: 'object',
      properties: {
        traffic_source_id: { type: 'number', description: 'Traffic source ID to connect to' },
        platform_type: { type: 'string', description: 'Platform ID (e.g. meta, google, tiktok)' },
        credentials: { type: 'object', description: 'Auth credentials matching the platform auth_fields' },
      },
      required: ['traffic_source_id', 'platform_type', 'credentials'],
    },
  },
  {
    name: 'sync_traffic_source',
    description: 'Sync campaign stats from a connected ad platform. Fetches impressions, clicks, spend.',
    inputSchema: {
      type: 'object',
      properties: {
        traffic_source_id: { type: 'number', description: 'Traffic source ID to sync' },
        date_from: { type: 'string', description: 'Start date YYYY-MM-DD (default: 7 days ago)' },
        date_to: { type: 'string', description: 'End date YYYY-MM-DD (default: today)' },
      },
      required: ['traffic_source_id'],
    },
  },
  {
    name: 'list_traffic_sources',
    description: 'List all configured traffic sources with their connection status.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_fraud_dashboard',
    description: 'Get 24-hour fraud detection stats: blocked clicks, top fraud reasons, top fraud IPs.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_reports',
    description: 'Fetch reports by type.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['clicks', 'conversions', 'ads', 'daily', 'breakdown', 'attribution'], description: 'Report type' },
        date_from: { type: 'string' },
        date_to: { type: 'string' },
        dimension: { type: 'string', description: 'For breakdown: country, device, os, browser' },
        model: { type: 'string', description: 'For attribution: first, last, linear' },
        group_by: { type: 'string', description: 'For daily: hourly, daily, weekly, monthly' },
      },
      required: ['type'],
    },
  },
  {
    name: 'create_campaign',
    description: 'Create a new campaign linking a traffic source to an offer.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        offer_id: { type: 'number' },
        traffic_source_id: { type: 'number' },
        status: { type: 'string', enum: ['active', 'paused'] },
      },
      required: ['name', 'offer_id'],
    },
  },
  {
    name: 'list_templates',
    description: 'List all available templates grouped by entity type (traffic-sources, advertisers, offers, campaigns, smartlinks, landing-pages, shortlinks). Use this to discover pre-configured templates for creating entities.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_type: { type: 'string', description: 'Optional: filter by entity type (e.g. offers, campaigns)' },
      },
      required: [],
    },
  },
  {
    name: 'create_from_template',
    description: 'Create an entity from a template. Merges template defaults with provided values.',
    inputSchema: {
      type: 'object',
      properties: {
        entity_type: { type: 'string', description: 'Entity type (e.g. offers, campaigns, traffic-sources)' },
        template_id: { type: 'string', description: 'Template ID (e.g. cpa, meta, direct_link)' },
        values: { type: 'object', description: 'Field values to override template defaults' },
      },
      required: ['entity_type', 'template_id', 'values'],
    },
  },
  {
    name: 'create_offer',
    description: 'Create a new affiliate offer.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        url: { type: 'string', description: 'Offer landing page URL' },
        payout: { type: 'number', description: 'Payout amount' },
        status: { type: 'string', enum: ['active', 'paused'] },
      },
      required: ['name', 'url', 'payout'],
    },
  },
];

// ── Tool Execution ───────────────────────────────────────────────────────

async function executeTool(name, args) {
  switch (name) {
    case 'list_integrations':
      return apiCall('GET', '/api/admin/traffic-sources/integrations');
    case 'connect_integration':
      return apiCall('POST', `/api/admin/traffic-sources/${args.traffic_source_id}/connect`, {
        platform_type: args.platform_type,
        ...args.credentials,
      });
    case 'sync_traffic_source':
      return apiCall('POST', `/api/admin/traffic-sources/${args.traffic_source_id}/sync?date_from=${args.date_from || ''}&date_to=${args.date_to || ''}`);
    case 'list_traffic_sources':
      return apiCall('GET', '/api/admin/traffic-sources');
    case 'get_fraud_dashboard':
      return apiCall('GET', '/api/admin/fraud/dashboard');
    case 'get_reports': {
      const params = new URLSearchParams();
      if (args.date_from) params.set('date_from', args.date_from);
      if (args.date_to) params.set('date_to', args.date_to);
      if (args.dimension) params.set('dimension', args.dimension);
      if (args.model) params.set('model', args.model);
      if (args.group_by) params.set('group_by', args.group_by);
      const qs = params.toString() ? `?${params}` : '';
      if (args.type === 'breakdown') return apiCall('GET', `/api/admin/reports/breakdown${qs}`);
      if (args.type === 'attribution') return apiCall('GET', `/api/admin/reports/attribution${qs}`);
      return apiCall('GET', `/api/admin/reports/${args.type}${qs}`);
    }
    case 'create_campaign':
      return apiCall('POST', '/api/admin/campaigns', args);
    case 'create_offer':
      return apiCall('POST', '/api/admin/offers', args);
    case 'list_templates': {
      const path = args.entity_type ? `/api/templates/${args.entity_type}` : '/api/templates';
      return apiCall('GET', path);
    }
    case 'create_from_template': {
      // Apply template defaults, then create the entity
      const applyRes = await apiCall('POST', `/api/templates/${args.entity_type}/${args.template_id}/apply`, args.values || {});
      if (applyRes.validation && !applyRes.validation.valid) return applyRes;
      // Map entity_type to API endpoint
      const endpoints = { 'traffic-sources': '/api/admin/traffic-sources', 'advertisers': '/api/admin/advertisers', 'offers': '/api/admin/offers', 'campaigns': '/api/admin/campaigns' };
      const endpoint = endpoints[args.entity_type];
      if (!endpoint) return { error: `Cannot create ${args.entity_type} from template (no API endpoint mapped)` };
      return apiCall('POST', endpoint, applyRes.data);
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ── MCP Protocol (stdio) ─────────────────────────────────────────────────

const readline = require('readline');

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

async function handleMessage(msg) {
  if (msg.method === 'initialize') {
    send({ jsonrpc: '2.0', id: msg.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: '1ai-affiliate', version: '1.0.0' } } });
  } else if (msg.method === 'tools/list') {
    send({ jsonrpc: '2.0', id: msg.id, result: { tools: TOOLS } });
  } else if (msg.method === 'tools/call') {
    const { name, arguments: args } = msg.params;
    try {
      const result = await executeTool(name, args || {});
      send({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } });
    } catch (err) {
      send({ jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true } });
    }
  }
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', async (line) => {
  try {
    const msg = JSON.parse(line);
    await handleMessage(msg);
  } catch {}
});
