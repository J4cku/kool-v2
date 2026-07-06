# Agent Toolkit for kool-v2 — Design

**Date:** 2026-07-06
**Status:** Approved

## Motivation

The site is iterated on page-by-page by coding agents (Conductor workspaces, Codex,
Claude Code). Friction is spread across several small pains rather than one big one:
design drift on new pages, tedious project-content workflow, no visual verification
(`pnpm check` is blind to rendering), permission prompts for routine commands, and —
newly — the desire to implement views faithfully from designer-delivered PDF / Adobe
Illustrator files.

This design adds a lightweight agent toolkit: six additive pieces, no changes to
existing site code. Heavier alternatives (extracting shared UI primitives, visual
regression suites, custom reviewer agents) were considered and deliberately deferred
until drift actually costs more than the refactor.

## Components

### 1. Permissions — `.claude/settings.json`

Checked-in project settings with a permission allowlist so agents stop prompting for
routine work:

- `pnpm typecheck` / `lint` / `check` / `build` / `dev` / `install`
- Read-only git (`status`, `diff`, `log`, `show`, `branch`)
- Poppler tools: `pdftoppm`, `pdftotext`, `pdfimages`, `pdffonts`
- `sips` (macOS image resizing)

### 2. `/verify-site` skill — `.claude/skills/verify-site/`

The standard QA gate other skills invoke as their final step.

- Boot dev server on `$CONDUCTOR_PORT` (fallback 8080); wait for ready.
- Build the route list: static pages (`/`, `/projekty`, `/studio`, `/oferta`,
  `/kontakt`) plus one `/projekty/<slug>` per entry in `data/projects.ts`, times both
  locales (`pl`, `en`).
- Visit each route in a browser: record HTTP status, console errors, screenshot.
- Output a pass/fail table plus screenshots (saved under `.context/`).
- The dev-only `/design-system` route is checked in dev mode only; it 404s in
  production builds by design.

### 3. i18n parity check — `scripts/check-i18n.mjs`

Node script (no new dependencies) that recursively compares the key trees of
`messages/pl.json` and `messages/en.json` and exits non-zero listing missing/extra
keys per locale. Wired into `package.json` as `check:i18n` and included in
`pnpm check` so it is enforced, not advisory.

### 4. `/add-project` skill — `.claude/skills/add-project/`

Encodes the add-a-project workflow end to end:

1. Verify images exist in `public/images/<slug>/`; resize/optimize oversized images
   with `sips`.
2. Add the entry to `data/projects.ts` conforming to the `Project` type.
3. Add translation keys to both `messages/pl.json` and `messages/en.json`.
4. Run `pnpm check:i18n` and `pnpm typecheck`.
5. Confirm the project appears in the listing page and `sitemap.ts` output.

### 5. Design-language rules — new section in `CLAUDE.md`

Distilled from `docs/superpowers/specs/2026-04-11-design-system-design.md`: type
scale, spacing rhythm, color-usage rules (coral is an accent, used sparingly), image
treatment, interaction patterns, plus a pointer to `/pl/design-system` as the visual
reference. Skills 4 and 6 reference this section; any agent doing UI work reads it
before touching components.

### 6. `/build-from-design` skill — `.claude/skills/build-from-design/`

Input: a PDF or `.ai` file plus a target route. Design files land in a gitignored
`design/` inbox folder. The files are full page mockups to implement **faithfully**
(layout, spacing, type as designed) — not mood boards.

Pipeline:

1. **Rasterize** each page/artboard at high DPI with `pdftoppm` for detailed visual
   inspection. Most `.ai` files embed a PDF stream ("PDF compatible"), so poppler
   reads them directly; if not, instruct the user to `brew install ghostscript` and
   convert.
2. **Extract copy** exactly with `pdftotext` — never retype Polish diacritics from
   screenshots.
3. **Extract embedded photos** with `pdfimages` into `public/images/<slug>/`.
4. **Map to tokens**: every color and typeface in the design is mapped to existing
   `@theme` tokens in `app/globals.css`; the skill stops and asks the user when the
   design uses a value outside the token set (new token vs. designer error).
5. **Reuse components**: check existing `components/` for matches before building
   new ones; follow the design-language rules (component 5).
6. **Verify**: run `/verify-site`, then compare the built page's screenshot
   side-by-side against the rasterized mockup and iterate on mismatches.

## Build order

1 (permissions) → 3 (i18n check) → 5 (design language) → 2 (verify-site) →
4 (add-project) → 6 (build-from-design). Skills 4 and 6 depend on 5's rules and 2's
QA gate existing first.

## Error handling

- `verify-site`: a route returning non-200 or logging console errors fails the table;
  the skill reports rather than auto-fixes.
- `check-i18n`: any asymmetric key fails `pnpm check` with an explicit key list.
- `build-from-design`: unreadable `.ai` file → ghostscript fallback instructions;
  off-token design values → stop and ask, never hardcode.

## Testing

- `scripts/check-i18n.mjs`: run against current messages (should pass), then against
  a deliberately broken copy (should fail listing the key).
- Skills: exercise each once end-to-end (verify-site against the running site;
  add-project and build-from-design validated by dry-run walkthrough of their steps).
- Final gate: `pnpm check` (typecheck + lint + i18n + build) passes.

## Out of scope

- Extracting shared UI primitives (Section/Heading/Prose) — revisit when drift bites.
- Visual regression snapshots, post-edit hooks, custom reviewer agents.
- Publishing the design-system route or adding it to navigation/sitemap.
