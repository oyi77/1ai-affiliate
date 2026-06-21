# Multi-Touch Attribution System

## Supported Models

| Model | Description |
|-------|-------------|
| **Last Touch** | 100% credit to final touchpoint (default) |
| **Time Decay** | More recent touchpoints receive more credit |
| **Position Based** | First and last touches get specified weights |
| **Assisted Conversions** | Shows all touchpoints that assisted |
| **Algorithmic** | ML-based attribution |

## Installation

Automatically installed as part of 1ai-Affiliate upgrade (v1.9.56+). No manual migration required.

Tables created: `1ai_attribution_models`, `1ai_attribution_snapshots`, `1ai_attribution_touchpoints`, `1ai_attribution_settings`, `1ai_attribution_audit`.

Verify: Setup section → "Attribution Models" tab should appear.

## Usage

1. **Setup > Attribution Models** → create a model (name, type, settings)
2. In campaign form, select an attribution model (or leave blank for default)
3. Edit/delete/set default via icons next to each model

## Technical Notes

- PHP 8+ with strict types, enums, readonly properties
- Repository pattern for data access
- Prepared statements throughout
- Permission: `access_to_setup_section`
