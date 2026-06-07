# Prosper1ai CLI (`p1ai`)

A command-line tool for managing a Prosper1ai tracking instance. Distributed as a single static binary with zero dependencies.

## Installation

### Download a prebuilt binary

Download the appropriate archive for your platform from the releases page. Each archive contains a single `p1ai` binary (or `p1ai.exe` on Windows). Extract it and place it in your `PATH`.

| Platform         | Archive directory  | Binary      |
|------------------|--------------------|-------------|
| Linux (x86_64)   | `linux-amd64/`     | `p1ai`      |
| Linux (ARM64)    | `linux-arm64/`     | `p1ai`      |
| macOS (Intel)    | `darwin-amd64/`    | `p1ai`      |
| macOS (Apple Si) | `darwin-arm64/`    | `p1ai`      |
| Windows (x86_64) | `windows-amd64/`   | `p1ai.exe`  |
| Windows (ARM64)  | `windows-arm64/`   | `p1ai.exe`  |

The binary is always named `p1ai` on every platform.

### Build from source

Requires Go 1.22+.

```bash
cd go-cli
make build          # Build for current platform
make all            # Cross-compile for all platforms
make install        # Install to $GOPATH/bin
```

## Quick start

```bash
# 1. Point the CLI at your Prosper1ai instance
p1ai config set-url https://your-Prosper1ai.example.com

# 2. Set your API key
p1ai config set-key YOUR_API_KEY

# 3. Verify the connection
p1ai config test

# 4. Start using it
p1ai campaign list
p1ai report summary --period today
```

## Global flags

| Flag       | Description                              |
|------------|------------------------------------------|
| `--json`   | Output raw JSON instead of formatted tables |
| `--csv`    | Output CSV instead of formatted tables   |
| `--profile` | Override active profile for this command |
| `--group`  | Select a profile tag group for multi-profile commands (`report summary`, `dashboard`, `exec`) |

`--json` and `--csv` are mutually exclusive.

## Configuration

The CLI stores its configuration in `~/.p1ai/config.json` with `0600` permissions.

```json
{
  "active_profile": "default",
  "profiles": {
    "default": {
      "url": "https://your-Prosper1ai.example.com",
      "api_key": "your_api_key_here",
      "defaults": {
        "report.period": "last30"
      },
      "tags": ["env:prod"]
    }
  }
}
```

On Windows, this path is typically `%USERPROFILE%\\.p1ai\\config.json` (that is, the current user's home directory under `.p1ai`).

Legacy single-profile files (`url`, `api_key`) are auto-migrated in memory to `profiles.default` and written back in profile format on the next config write.

### `p1ai config set-url <url>`

Set the Prosper1ai instance URL. Trailing slashes are stripped automatically.

### `p1ai config set-key <api-key>`

Set the API key used for authentication.

### `p1ai config show`

Display the current configuration. The API key is masked in output (first 4 + last 4 characters shown).

```
$ p1ai config show
Config file  ~/.p1ai/config.json
URL          https://prosper.example.com
API Key      abc1...xyz9
```

### `p1ai config test`

Test the connection by calling the system health endpoint.

### Multi-profile config commands

```bash
p1ai config add-profile prod --url https://prod.example.com --key PROD_KEY
p1ai config add-profile staging --url https://staging.example.com --key STAGING_KEY
p1ai config list-profiles
p1ai config use prod
p1ai --profile staging config show
p1ai config rename-profile staging stage
p1ai config remove-profile stage --force
```

| Command | Description |
|---------|-------------|
| `config add-profile <name> --url <url> --key <key>` | Create a named profile |
| `config remove-profile <name> [--force]` | Remove a profile (active profile removal is blocked) |
| `config use <name>` | Set active profile |
| `config list-profiles [--tag <tag>]` | List profiles and active marker |
| `config rename-profile <old> <new>` | Rename a profile |
| `config tag-profile <name> <tag> [<tag>...]` | Add profile tags (stored lowercase) |
| `config untag-profile <name> <tag> [<tag>...]` | Remove profile tags |

`config set-url`, `config set-key`, `config show`, and all `config *-default` commands operate on the resolved profile (`--profile` override or active profile).

### Config defaults

Set reusable defaults for high-frequency flags:

```bash
p1ai config set-default report.period last30
p1ai config get-default report.period
p1ai config get-default
p1ai config unset-default report.period
```

Supported default keys include:
- `report.period`, `report.time_from`, `report.time_to`
- `report.aff_campaign_id`, `report.ppc_account_id`, `report.aff_network_id`, `report.ppc_network_id`, `report.landing_page_id`, `report.country_id`
- `report.breakdown`, `report.sort`, `report.sort_dir`, `report.limit`, `report.offset`, `report.interval`
- `crud.aff_campaign_id`, `crud.ppc_account_id`, `crud.aff_network_id`, `crud.ppc_network_id`, `crud.landing_page_id`, `crud.text_ad_id`, `crud.rotator_id`, `crud.country_id`

### Feature flags

Optional environment flags for staged rollout:
- `CLI_ENABLE_RESOLVE_NAMES=0|1` controls `--resolve-names` list behavior.
- `CLI_ENABLE_ANALYTICS_SHORTHAND=0|1` controls `p1ai analytics`.

If unset, both features are enabled by default.

## Resource management (CRUD)

Seven resource types share identical CRUD commands:

| Resource       | Command          |
|----------------|------------------|
| Campaigns      | `p1ai campaign`  |
| Affiliate networks | `p1ai aff-network` |
| PPC networks   | `p1ai ppc-network` |
| PPC accounts   | `p1ai ppc-account` |
| Trackers       | `p1ai tracker`   |
| Landing pages  | `p1ai landing-page` |
| Text ads       | `p1ai text-ad`   |

### List resources

```bash
p1ai campaign list
p1ai campaign list --limit 10 --offset 20
p1ai campaign list --page 3
p1ai campaign list --aff_network_id 5
```

| Flag | Description |
|------|-------------|
| `-l, --limit <n>` | Maximum results |
| `-o, --offset <n>` | Pagination offset |
| `--page <n>` | Page number |
| `--all` | Fetch all rows across pages (overrides `--limit`) |
| `--resolve-names` | Resolve foreign key IDs to human-readable names |
| Entity-specific filter flags (for example `--aff_network_id`) | Filter by related entity |

When the response contains more rows than shown, a truncation warning appears on stderr: `Warning: Showing N of M results. Use --all to fetch all.` This warning is suppressed in `--json` mode.

`--resolve-names` adds companion fields (for example `campaign_name`) without removing original ID fields. If a lookup fails, the fallback value is `id:<n>`.

Legacy raw filter syntax (`--filter[aff_network_id]`) is still accepted where previously supported.

### Get a resource

```bash
p1ai campaign get 42
```

### Create a resource

```bash
p1ai campaign create \
  --aff_campaign_name "Q1 Offer" \
  --aff_campaign_url "https://example.com/offer"
```

Required and optional fields vary by resource type. The CLI validates required fields before making the API call.

### Update a resource

```bash
p1ai campaign update 42 --aff_campaign_name "Q1 Offer (Updated)"
```

At least one field flag must be provided.

### Delete a resource

```bash
p1ai campaign delete 42                    # Prompts for confirmation
p1ai campaign delete 42 --force            # Skips confirmation
p1ai campaign delete --ids 42,43,44 --force # Bulk delete
```

| Flag          | Description              |
|---------------|--------------------------|
| `-f, --force` | Skip confirmation prompt |
| `--ids <list>` | Comma-separated IDs for bulk delete |

Bulk delete (`--ids`) processes each ID individually and reports a summary. If any ID fails, the command exits with code 5 (partial failure) and the summary shows the count of succeeded/failed operations.

## Resource field reference

### Campaign (`p1ai campaign`)

| Flag | Required | Description |
|------|----------|-------------|
| `--aff_campaign_name` | Yes | Campaign name |
| `--aff_campaign_url` | Yes | Primary offer URL |
| `--aff_campaign_url_2` | No | Offer URL 2 |
| `--aff_campaign_url_3` | No | Offer URL 3 |
| `--aff_campaign_url_4` | No | Offer URL 4 |
| `--aff_campaign_url_5` | No | Offer URL 5 |
| `--aff_campaign_cpc` | No | Cost per click |
| `--aff_campaign_payout` | No | Default payout |
| `--aff_campaign_currency` | No | Currency code |
| `--aff_campaign_foreign_payout` | No | Foreign currency payout |
| `--aff_network_id` | No | Affiliate network ID |
| `--aff_campaign_cloaking` | No | Enable cloaking (0/1) |
| `--aff_campaign_rotate` | No | Enable rotation (0/1) |
| `--aff_campaign_postback_url` | No | Postback URL |
| `--aff_campaign_postback_append` | No | Postback append string |

Campaign utility subcommand:

```bash
p1ai campaign clone 42
p1ai campaign clone 42 --name "Q1 Offer (Copy)"
```

### Affiliate network (`p1ai aff-network`)

| Flag | Required | Description |
|------|----------|-------------|
| `--aff_network_name` | Yes | Network name |
| `--dni_network_id` | No | DNI network ID |
| `--aff_network_postback_url` | No | Postback URL |
| `--aff_network_postback_append` | No | Postback append string |

### PPC network (`p1ai ppc-network`)

| Flag                 | Required | Description  |
|----------------------|----------|--------------|
| `--ppc_network_name` | Yes      | Network name |

### PPC account (`p1ai ppc-account`)

| Flag | Required | Description |
|------|----------|-------------|
| `--ppc_account_name` | Yes | Account name |
| `--ppc_network_id` | Yes | PPC network ID |
| `--ppc_account_default` | No | Set as default account (0/1) |

### Tracker (`p1ai tracker`)

| Flag | Required | Description |
|------|----------|-------------|
| `--aff_campaign_id` | Yes | Campaign ID |
| `--ppc_account_id` | No | PPC account ID |
| `--text_ad_id` | No | Text ad ID |
| `--landing_page_id` | No | Landing page ID |
| `--rotator_id` | No | Rotator ID |
| `--click_cpc` | No | Cost per click |
| `--click_cpa` | No | Cost per action |
| `--click_cloaking` | No | Enable cloaking (0/1) |

Tracker utility subcommands:

```bash
p1ai tracker get-url 56
p1ai tracker create-with-url --aff_campaign_id 42
p1ai tracker bulk-urls --aff_campaign_id 42 --concurrency 5
p1ai tracker list --all --resolve-names
```

`tracker list` supports:
- `--all` fetches all pages.
- `--resolve-names` adds resolved FK labels (for example `campaign_name`) while preserving original ID fields.

### Landing page (`p1ai landing-page`)

| Flag | Required | Description |
|------|----------|-------------|
| `--landing_page_url` | Yes | Landing page URL |
| `--aff_campaign_id` | Yes | Campaign ID |
| `--landing_page_nickname` | No | Landing page nickname |
| `--leave_behind_page_url` | No | Leave-behind page URL |
| `--landing_page_type` | No | Landing page type |

### Text ad (`p1ai text-ad`)

| Flag | Required | Description |
|------|----------|-------------|
| `--text_ad_name` | Yes | Text ad name |
| `--text_ad_headline` | No | Headline |
| `--text_ad_description` | No | Description text |
| `--text_ad_display_url` | No | Display URL |
| `--aff_campaign_id` | No | Campaign ID |
| `--landing_page_id` | No | Landing page ID |
| `--text_ad_type` | No | Text ad type |

## Clicks

Clicks are read-only.

### List clicks

```bash
p1ai click list
p1ai click list --limit 100 --time_from 1700000000 --time_to 1700100000
p1ai click list --aff_campaign_id 5 --click_lead 1
p1ai click list --all
```

| Flag                | Default | Description                          |
|---------------------|---------|--------------------------------------|
| `-l, --limit`       | 50      | Maximum results                      |
| `-o, --offset`      | 0       | Pagination offset                    |
| `--page`            |         | Page number (maps to offset)         |
| `--time_from`       |         | Start timestamp (unix)               |
| `--time_to`         |         | End timestamp (unix)                 |
| `--aff_campaign_id` |         | Filter by campaign                   |
| `--ppc_account_id`  |         | Filter by PPC account                |
| `--landing_page_id` |         | Filter by landing page               |
| `--click_lead`      |         | 0 = clicks only, 1 = conversions only |
| `--click_bot`       |         | 0 = human, 1 = bot                   |
| `--all`             | false   | Fetch all rows across pages          |

### Get a click

```bash
p1ai click get 12345
```

## Conversions

### List conversions

```bash
p1ai conversion list
p1ai conversion list --campaign_id 3 --time_from 1700000000
p1ai conversion list --all
```

| Flag            | Default | Description            |
|-----------------|---------|------------------------|
| `-l, --limit`   | 50      | Maximum results        |
| `-o, --offset`  | 0       | Pagination offset      |
| `--campaign_id` |         | Filter by campaign     |
| `--time_from`   |         | Start timestamp (unix) |
| `--time_to`     |         | End timestamp (unix)   |
| `--all`         | false   | Fetch all rows across pages |

### Get a conversion

```bash
p1ai conversion get 789
```

### Create a conversion

```bash
p1ai conversion create --click_id 12345
p1ai conversion create --click_id 12345 --payout 4.50 --transaction_id "TXN-001"
```

| Flag               | Required | Description              |
|--------------------|----------|--------------------------|
| `--click_id`       | Yes      | Click ID to attribute    |
| `--payout`         | No       | Payout amount            |
| `--transaction_id` | No       | Transaction ID (dedup)   |

### Compatibility aliases

The CLI accepts the following legacy flags for backward compatibility:

| Legacy flag            | Preferred flag |
|------------------------|----------------|
| `--click_id_public`    | `--click_id`   |
| `--conversion_payout`  | `--payout`     |

### Delete a conversion

```bash
p1ai conversion delete 789
p1ai conversion delete 789 --force
p1ai conversion delete --ids 789,790,791 --force
```

`--ids` performs bulk delete in one CLI command and returns non-zero when any ID fails.

## Reports

All report commands share common time and entity filters.

### Common report flags

| Flag                | Description              |
|---------------------|--------------------------|
| `-p, --period`      | Preset: today, yesterday, last7, last30, last90 |
| `--time_from`       | Start timestamp (unix)   |
| `--time_to`         | End timestamp (unix)     |
| `--aff_campaign_id` | Filter by campaign       |
| `--ppc_account_id`  | Filter by PPC account    |
| `--aff_network_id`  | Filter by aff network    |
| `--ppc_network_id`  | Filter by PPC network    |
| `--landing_page_id` | Filter by landing page   |
| `--country_id`      | Filter by country        |

### Dashboard

Dashboard summary is a shortcut to `reports/summary`.

```bash
p1ai dashboard
p1ai dashboard --period last7 --aff_campaign_id 42
p1ai dashboard --all-profiles
p1ai dashboard --profiles prod,staging
p1ai dashboard --group env:prod
```

If `--period` is omitted, dashboard defaults to `today`.

### Summary

Aggregate totals for the selected time period and filters.

```bash
p1ai report summary --period today
p1ai report summary --time_from 1700000000 --time_to 1700100000
p1ai report summary --all-profiles --period today
p1ai report summary --profiles prod,staging --period today
p1ai report summary --group env:prod --period today
```

Summary/dashboard multi-profile selectors:

| Flag | Description |
|------|-------------|
| `--all-profiles` | Query all configured profiles |
| `--profiles <p1,p2,...>` | Query explicit profile list |
| `--group <tag>` | Query all profiles tagged with `tag` |

Multi-profile output includes per-profile rows, aggregated totals, and an `errors` list for partial failures.

### Breakdown

Performance broken down by a dimension.

```bash
p1ai report breakdown --breakdown campaign --period last7
p1ai report breakdown --breakdown country --sort total_net --sort_dir ASC --limit 10
```

| Flag               | Default       | Description                |
|--------------------|---------------|----------------------------|
| `-b, --breakdown`  | campaign      | Dimension (see below)      |
| `-s, --sort`       | total_clicks  | Sort column                |
| `--sort_dir`       | DESC          | Sort direction: ASC or DESC |
| `-l, --limit`      | 50            | Maximum results            |
| `-o, --offset`     | 0             | Pagination offset          |

**Breakdown dimensions:** campaign, aff_network, ppc_account, ppc_network, landing_page, keyword, country, city, browser, platform, device, isp, text_ad

**Sort columns:** total_clicks, total_leads, total_income, total_cost, total_net, roi, epc, conv_rate

### Analytics shorthand

```bash
p1ai analytics --group-by country --period last30 --sort conversions
p1ai analytics --group-by campaign --days 14 --sort roi --limit 10
```

`analytics` wraps `report breakdown` with friendly aliases:
- `--group-by lp` maps to `landing_page`
- `--sort conversions` maps to `total_leads`
- `--period` takes precedence over `--days`

### Timeseries

Performance data over time intervals.

```bash
p1ai report timeseries --period last30 --interval day
p1ai report timeseries --interval hour --time_from 1700000000
```

| Flag            | Default | Description                   |
|-----------------|---------|-------------------------------|
| `-i, --interval` | day    | Interval: hour, day, week, month |

Invalid `--interval` values now return a validation error from the API (`422`) instead of silently defaulting.

### Daypart

Performance aggregated by hour-of-day (`0`-`23`) across the selected date range.

```bash
p1ai report daypart --period last30
p1ai report daypart --sort roi --sort_dir DESC --country_id 223
```

| Flag            | Default      | Description |
|-----------------|--------------|-------------|
| `-s, --sort`    | hour_of_day  | Sort by: hour_of_day, total_clicks, total_click_throughs, total_leads, total_income, total_cost, total_net, epc, avg_cpc, conv_rate, roi, cpa |
| `--sort_dir`    | ASC          | Sort direction: ASC or DESC |

### Weekpart

Performance aggregated by day-of-week (`0` = Monday ... `6` = Sunday) across the selected date range.

```bash
p1ai report weekpart --period last30
p1ai report weekpart --sort roi --sort_dir DESC --country_id 223
```

| Flag            | Default      | Description |
|-----------------|--------------|-------------|
| `-s, --sort`    | day_of_week  | Sort by: day_of_week, total_clicks, total_click_throughs, total_leads, total_income, total_cost, total_net, epc, avg_cpc, conv_rate, roi, cpa |
| `--sort_dir`    | ASC          | Sort direction: ASC or DESC |

## Rotators

### List/get/create/update/delete rotators

```bash
p1ai rotator list
p1ai rotator list --all
p1ai rotator get 5
p1ai rotator create --name "Geo Split"
p1ai rotator update 5 --name "Geo Split v2" --default_url "https://fallback.example.com"
p1ai rotator delete 5
p1ai rotator delete --ids 5,6 --force
```

| Flag                 | Required (create) | Description             |
|----------------------|-------------------|-------------------------|
| `--name`             | Yes               | Rotator name            |
| `--default_url`      | No                | Default redirect URL    |
| `--default_campaign` | No                | Default campaign ID     |
| `--default_lp`       | No                | Default landing page ID |

### Create a rule

```bash
p1ai rotator rule-create 5 \
  --rule_name "US Traffic" \
  --criteria_json '[{"type":"country","statement":"is","value":"US"}]' \
  --redirects_json '[{"redirect_url":"https://us.example.com","weight":"100","name":"US Offer"}]'
```

| Flag               | Required | Description                |
|--------------------|----------|----------------------------|
| `--rule_name`      | Yes      | Rule name                  |
| `--splittest`      | No       | Enable split test (0 or 1) |
| `--criteria_json`  | No       | Criteria as JSON array     |
| `--redirects_json` | No       | Redirects as JSON array    |

Both JSON fields are validated before sending.

### Delete a rule

```bash
p1ai rotator rule-delete 5 12        # rotator_id rule_id
p1ai rotator rule-delete 5 12 --force
p1ai rotator rule-delete 5 --ids 12,13 --force
```

### Update a rule

```bash
p1ai rotator rule-update 5 12 --rule_name "US Traffic v2"
p1ai rotator rule-update 5 12 --status 0
p1ai rotator rule-update 5 12 \
  --criteria_json '[{"type":"country","statement":"is","value":"US"}]' \
  --redirects_json '[{"redirect_campaign":"4","weight":"100","name":"US Offer"}]'
```

| Flag               | Description                |
|--------------------|----------------------------|
| `--rule_name`      | Rule name                  |
| `--splittest`      | Enable split test (0 or 1) |
| `--status`         | Rule status (0 or 1)       |
| `--criteria_json`  | Criteria as JSON array     |
| `--redirects_json` | Redirects as JSON array    |

## Attribution

### Models

```bash
p1ai attribution model list
p1ai attribution model list --type time_decay
p1ai attribution model get 3
p1ai attribution model create \
  --model_name "30-Day Decay" \
  --model_type time_decay \
  --weighting_config '{"half_life_days": 7}'
p1ai attribution model update 3 --is_default 1
p1ai attribution model delete 3
```

| Flag                | Required (create) | Description                     |
|---------------------|-------------------|---------------------------------|
| `--model_name`      | Yes               | Model name                      |
| `--model_type`      | Yes               | first_touch, last_touch, linear, time_decay, position_based, algorithmic |
| `--weighting_config` | No               | Weighting config as JSON string |
| `--is_active`       | No                | 1 = active, 0 = inactive        |
| `--is_default`      | No                | 1 = default model                |

### Snapshots

```bash
p1ai attribution snapshot list 3
p1ai attribution snapshot list 3 --scope_type campaign --limit 500
```

| Flag            | Default | Description                       |
|-----------------|---------|-----------------------------------|
| `--scope_type`  |         | Filter: global, campaign, landing_page |
| `-l, --limit`   | 100     | Maximum results                   |
| `-o, --offset`  | 0       | Pagination offset                 |

### Exports

```bash
p1ai attribution export list 3
p1ai attribution export schedule 3 \
  --scope_type campaign \
  --format json \
  --webhook_url "https://hooks.example.com/receive"
```

| Flag            | Default | Description                   |
|-----------------|---------|-------------------------------|
| `--scope_type`  | global  | Scope: global, campaign, landing_page |
| `--scope_id`    | 0       | Scope entity ID               |
| `--start_hour`  |         | Start timestamp               |
| `--end_hour`    |         | End timestamp                 |
| `--format`      | csv     | Export format: csv or json    |
| `--webhook_url` |         | Webhook URL for delivery      |

## Users

### List and manage users

```bash
p1ai user list
p1ai user get 1
p1ai user create --user_name admin2 --user_email admin2@example.com
p1ai user update 1 --user_fname "Jane" --user_lname "Doe"
p1ai user delete 2
```

When creating or updating a user, if `--user_pass` is omitted, the CLI prompts for the password securely (input is hidden).

| Flag              | Required (create) | Description         |
|-------------------|-------------------|---------------------|
| `--user_name`     | Yes               | Username            |
| `--user_email`    | Yes               | Email address       |
| `--user_pass`     | Yes (prompted)    | Password            |
| `--user_fname`    | No                | First name          |
| `--user_lname`    | No                | Last name           |
| `--user_timezone` | No                | Timezone (default: UTC) |
| `--user_active`   | No                | 1 = active, 0 = inactive |

### Roles

```bash
p1ai user role list                    # List all available roles
p1ai user role assign 2 --role_id 1   # Assign role to user
p1ai user role remove 2 3             # Remove role 3 from user 2
```

### API keys

```bash
p1ai user apikey list 1               # List keys for user 1
p1ai user apikey create 1             # Generate new key (shown once)
p1ai user apikey delete 1 <key>       # Delete a specific key
p1ai user apikey rotate 1 <old-key> --force
p1ai user apikey rotate 1 <old-key> --keep-old --update-config
```

The full API key is displayed only once at creation time. Store it securely.

`rotate` creates a replacement key and can optionally delete the old key and update local CLI config.

### Preferences

```bash
p1ai user prefs get 1
p1ai user prefs update 1 \
  --user_tracking_domain "trk.example.com" \
  --user_account_currency "USD"
```

| Flag                             | Description                 |
|----------------------------------|-----------------------------|
| `--user_tracking_domain`         | Tracking domain             |
| `--user_account_currency`        | Currency (3-letter code)    |
| `--user_slack_incoming_webhook`  | Slack webhook URL           |
| `--user_daily_email`             | Daily email: on or off      |
| `--ipqs_api_key`                 | IPQS fraud detection key    |

## Export and import

```bash
p1ai export campaigns --output /tmp/campaigns.json
p1ai export all --output /tmp/full-export.json

p1ai import campaigns /tmp/campaigns.json --dry-run
p1ai import campaigns /tmp/campaigns.json --skip-errors
```

`export` supports: `campaigns`, `aff-networks`, `ppc-networks`, `ppc-accounts`, `rotators`, `trackers`, `landing-pages`, `text-ads`, `all`.

`import` currently supports one entity at a time and strips immutable fields before create requests.

## Multi-server workflows

### Diff

```bash
p1ai diff campaigns --from prod --to staging --json
p1ai diff all --from prod --to staging --json
```

`diff` reports per-entity `only_in_source`, `only_in_target`, `changed`, and `identical_count`.
When server capabilities expose `sync_plan`, the CLI uses `POST /api/v3/sync/plan` automatically and falls back to client-side diff when unavailable.

### Sync and re-sync

```bash
p1ai sync all --from prod --to staging --dry-run --json
p1ai sync campaigns --from prod --to staging --json
p1ai sync campaigns --from prod --to staging --force-update --json

p1ai sync status --from prod --to staging --json
p1ai sync history --from prod --to staging --json
p1ai re-sync --from prod --to staging --json
p1ai re-sync --from prod --to staging --force-update --json
```

| Flag | Description |
|------|-------------|
| `--dry-run` | Compute actions without writes |
| `--skip-errors` | Continue on record-level errors |
| `--force-update` | Update mismatched target records instead of skipping |

Sync state is stored in `~/.p1ai/sync/<source>-<target>.json`.
When server capabilities expose `async_jobs`, the CLI routes sync execution through server endpoints (`/sync/jobs`, `/sync/re-sync`, `/sync/status`, `/sync/history`) and falls back to local client-side sync when unavailable.
Server-side jobs are queue-driven; run the worker endpoint or cron worker (`1ai-cronjobs/sync-worker.php`) in environments where asynchronous processing is enabled.
Server-side rotator rule re-sync after updates can be controlled with the server environment variable `SYNC_ROTATOR_RULE_RESYNC_ENABLED=0|1` (enabled by default).

### Server-side sync capabilities not yet exposed in CLI

The backend API supports additional sync features that are not yet available as CLI flags:

| Feature | API parameter | Description |
|---------|---------------|-------------|
| Prune | `prune=true` | Delete records in target that don't exist in source |
| Prune preview | `prune_preview=true` | Preview what prune would delete without acting |
| Collision mode | `collision_mode=warn\|manual` | Control behavior on natural-key collisions |
| Max attempts | `max_attempts=1-10` | Max retry attempts per job (default: 3) |
| Idempotency | `Idempotency-Key` header | Prevent duplicate job creation on retries |

The backend also provides endpoints for direct job management (`/sync/jobs/{id}`, `/sync/jobs/{id}/cancel`, `/sync/jobs/{id}/events`) and audit logging (`/audit/sync-jobs`). These are accessible via direct API calls but have no CLI commands yet.

### Exec across profiles

```bash
p1ai exec --all-profiles -- campaign list --limit 5
p1ai exec --profiles prod,staging -- report summary --period today
p1ai exec --group env:prod -- dashboard --period last7
p1ai exec --profiles prod,staging --concurrency 2 -- campaign list --limit 5
p1ai --json exec --profiles prod,staging -- campaign list
```

`exec` table mode prints `=== profile ===` sections. JSON mode returns per-profile exit codes/output. The command exits non-zero if any profile run fails.
Use `--concurrency <n>` to limit parallel profile executions (default: `5`, minimum: `1`).

## System

```bash
p1ai system health       # Health check (unauthenticated)
p1ai system version      # Prosper1ai + PHP + MySQL versions
p1ai system db-stats     # Database table sizes
p1ai system cron         # Cron job status
p1ai system errors       # Recent system errors
p1ai system errors --limit 5
p1ai system dataengine   # Data engine job status
```

| Command              | Auth required |
|----------------------|---------------|
| `p1ai system health` | No            |
| All others           | Admin         |

## Output modes

### Table mode (default)

Human-readable tables. Lists show column headers with rows; single objects show key-value pairs.

```
$ p1ai campaign list --limit 3
aff_campaign_id  aff_campaign_name  aff_campaign_url
1                Q1 Offer           https://example.com/q1
2                Summer Sale        https://example.com/summer
3                Retarget US        https://example.com/retarget
```

Pagination metadata is displayed below the table when present.

### JSON mode (`--json`)

Raw API response, pretty-printed with 2-space indentation. Suitable for piping into `jq` or other tools.

```bash
p1ai campaign list --json | jq '.data[].aff_campaign_name'
p1ai report summary --period today --json > report.json
```

### CSV mode (`--csv`)

CSV output is available for list/object responses:

```bash
p1ai campaign list --csv
p1ai report daypart --period last30 --csv
```

## Exit codes

| Code | Category | Meaning |
|------|----------|---------|
| 0    |          | Success |
| 1    | validation | Bad input, missing flags, invalid arguments |
| 2    | auth     | Authentication or authorization failure |
| 3    | network  | Connection timeout, DNS failure, unreachable server |
| 4    | server   | API returned a 5xx error |
| 5    | partial_failure | Bulk operation completed with some failures |

Error messages are printed to stderr in the format `Error [category]: message` when a category is available. Scripts can use the exit code to differentiate failure types without parsing error text.

## Telemetry

Set `P1ai_METRICS=1` to enable structured JSON telemetry on stderr. Each operation emits a single-line JSON event:

```
[metrics] {"op":"diff","entity":"rotators","duration_ms":1234,"success":true,"fields":{"ts":"2026-02-16T12:00:00Z"}}
```

Telemetry is off by default and adds no overhead when disabled.
