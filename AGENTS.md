# AGENTS.md — 1ai-affiliate

## MANDATORY PROCESS (8 Steps — No Skipping)

Every task follows this sequence. No exceptions.

1. **AUDIT** — Read existing code. Understand current state.
2. **THINK** — Understand WHY. Intent vs literal.
3. **BRAINSTORM** — ≥3 approaches. Score options.
4. **PLAN** — Decompose. Risks. Rollback plan.
5. **EXECUTE** — Build. TDD when possible.
6. **TEST** — Run all tests. Break it first.
7. **VERIFY** — Prove with literal output.
8. **REVIEW** — Read your own diff before committing.

Full details: `~/.1ai/core/PROCESS.md` (auto-injected by hooks)

## This repo
Affiliate marketing platform — offer management, conversion tracking, payouts, real-time analytics, and API integrations.
Stack: Node.js, Express, MySQL, Socket.IO, React (admin dashboard)
Domain: affiliate network backend (routes, services, migrations, real-time events)

## Repo-specific conventions
- Routes mount under `/api` prefix via `app.js`
- Auth middleware: `authenticate` (any logged-in user), `requireAdmin` (admin-only)
- Async errors handled via `asyncHandler` utility
- DB queries use `pool.query()` (mysql2/promise)
- Response pattern: `res.json({ data: …, meta: … })` or `res.status(400).json({ error: … })`
- Migrations in `server/migrations/` with sequential naming (`NNN_description.sql`)
- Services in `server/services/`, controllers in `server/controllers/`, routes in `server/routes/`
- Tests in `server/tests/` using Jest + supertest; pool mocked via `jest.mock`

## Commands
- Dev:   `cd server && node app.js`
- Test:  `cd server && npm test`
- Build: `cd server && npm run build` (if applicable, else `npm run lint`)
- Lint:  `cd server && npm run lint`
- API docs: see inline route JSDoc in `server/routes/`

## Key URLs
- Admin dashboard: `/admin`
- API base: `/api`
- Socket.IO: `/socket/io` (real-time notifications)
## Rules — thin loader, no submodule
Rules are NOT vendored into this repo. This repo does NOT need a rules submodule.
`AGENTS.md` is only the repo-local loader: domain, commands, conventions, and pointers to `~/.1ai`.

Engineering rules are enforced by machine-level loaders when `setup-dev.sh` has been run:
- Claude Code: SessionStart hook injects `~/.1ai/core/RULES.md`
- OpenCode: plugin injects `~/.1ai/core/RULES.md`
- OMP: wrapper appends `~/.1ai/core/RULES.md` to launch sessions

Primary rules file:
```bash
cat ~/.1ai/core/RULES.md
```

Pre-ship gate:
```bash
cat ~/.1ai/core/GATE.md
```

If `~/.1ai` or auto-load is missing, run:
```bash
bash ~/.1ai/scripts/setup-dev.sh
```

Do NOT add the rules repo as a git submodule. Update rules centrally, then run/sync the thin `AGENTS.md` template.

## Hard rules
1. Read code before writing code.
2. No completion claim without literal receipt.
3. Compile/test/use like a real user before claiming work is ready.
4. Task must match this repo domain.
5. Run GATE.md before commit/PR.

