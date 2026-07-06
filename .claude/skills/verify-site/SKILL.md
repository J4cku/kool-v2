---
name: verify-site
description: Use when changes need visual or functional verification before handoff, when pnpm check passes but rendering is unconfirmed, when checking for console errors or broken routes, or as the final QA step of the add-project and build-from-design skills.
---

# Verify Site

Walk every route and record HTTP status, console errors, and a screenshot. `pnpm check` cannot see rendering — this can.

## Route list

Build it fresh each run — never hardcode slugs:

1. Static: `/`, `/projekty`, `/studio`, `/oferta`, `/kontakt`
2. One `/projekty/<slug>` per entry in `data/projects.ts`
3. Prefix every route with both locales: `/pl`, `/en`
4. Dev-server runs only: add `/pl/design-system` and `/en/design-system` (they 404 in production builds **by design** — never report that as a failure)

## Steps

1. **Server:** reuse a running dev server if `curl -sf -o /dev/null http://localhost:${CONDUCTOR_PORT:-8080}/pl` succeeds. Otherwise start `pnpm dev` in the background and poll that curl every 1s, 60s timeout.
2. **Status pass (curl, all routes):** `curl -s -o /dev/null -w "%{http_code}" <url>` per route. Browser tools don't expose the document's HTTP status — this pass is the status source, and it doubles as a dev-compile warm-up so the browser pass isn't flaky on first paint.
3. **Browser pass (Playwright MCP or Chrome MCP), per route:**
   - read console messages; record errors and warnings separately, ignoring HMR/Fast Refresh noise
   - full-page screenshot, passing an **absolute** path (relative paths land in the MCP's own output dir): `<repo>/.context/verify-site/<name>.png`
   - naming: locale prefix once, path dashes after — `/pl` → `pl-home.png`, `/en/projekty/dom-dobrzykowice` → `en-projekty-dom-dobrzykowice.png`
4. **Report** one table: route | status | console errors | screenshot. Attribute session-wide resource errors (e.g. a `favicon.ico` 404, which browsers fetch once per session and attach to whichever route loaded first) to a separate "site-wide" row, not to the route that happened to load first.
5. **Verdict:** PASS requires every route 200, zero route console errors, and zero site-wide resource errors. Warnings (e.g. `next/image` sizing) don't gate but must be listed as observations — surfacing them is part of this skill's job.
6. **Stop the dev server only if this run started it:** `lsof -tiTCP:${CONDUCTOR_PORT:-8080} -sTCP:LISTEN | xargs kill`.

## This is a gate, not a fixer

A failing route gets reported with its screenshot and errors. Fixing is a separate decision for the caller — do not auto-fix and re-run silently.
