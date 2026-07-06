# Agent Toolkit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Six additive pieces of agent tooling for kool-v2: permission allowlist, i18n parity check, design-language rules, and three project skills (verify-site, add-project, build-from-design).

**Architecture:** No site code changes. New files under `.claude/`, `scripts/`, plus targeted sections in `CLAUDE.md`, one `package.json` script change, and one `.gitignore` entry. Spec: `docs/superpowers/specs/2026-07-06-agent-toolkit-design.md`.

**Tech Stack:** Claude Code project skills (SKILL.md), plain Node ≥18 (`node:fs`, no new dependencies), poppler CLI (`pdftoppm`, `pdftotext`, `pdfimages`, `pdffonts`), macOS `sips`, browser MCP tools (Playwright / Chrome).

## Global Constraints

- No new npm dependencies.
- Site code, public navigation, and `app/sitemap.ts` are untouched.
- The design-system route stays dev-only and out of navigation/sitemap.
- Skill frontmatter: `name` + `description`; description starts with "Use when…", triggering conditions only, third person, no workflow summary.
- Theme tokens (exact values): beige `#E5DDD0`, coral `#FC3117`, dark `#1A1A1A`, muted `#888888`, white `#FFFFFF`, font Poppins, max-width 1400px.
- Final gate: `pnpm check` (typecheck + lint + i18n + build) passes.

---

### Task 1: Permission allowlist

**Files:**
- Create: `.claude/settings.json`

**Interfaces:**
- Produces: committed project settings; `.gitignore` already excludes `.claude/settings.local.json` only, so this file is tracked.

- [ ] **Step 1: Write `.claude/settings.json`**

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm typecheck)",
      "Bash(pnpm lint)",
      "Bash(pnpm check)",
      "Bash(pnpm check:i18n)",
      "Bash(pnpm build)",
      "Bash(pnpm install)",
      "Bash(pnpm dev:*)",
      "Bash(node scripts/check-i18n.mjs:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git show:*)",
      "Bash(git branch)",
      "Bash(pdftoppm:*)",
      "Bash(pdftotext:*)",
      "Bash(pdfimages:*)",
      "Bash(pdffonts:*)",
      "Bash(sips:*)"
    ]
  }
}
```

- [ ] **Step 2: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Confirm the file is tracked, then commit**

Run: `git check-ignore .claude/settings.json; echo "ignored=$?"`
Expected: `ignored=1` (not ignored)

```bash
git add .claude/settings.json
git commit -m "Add project permission allowlist for agents"
```

---

### Task 2: i18n parity check

**Files:**
- Create: `scripts/check-i18n.mjs`
- Modify: `package.json` (scripts block, lines 5-12)
- Modify: `CLAUDE.md` (Commands code block)

**Interfaces:**
- Produces: `pnpm check:i18n` (exit 0 on parity, exit 1 listing each missing key as `missing in <locale>.json: <dot.path>`); `node scripts/check-i18n.mjs [dir]` where `dir` defaults to `messages`.

- [ ] **Step 1: Write the failing test (broken fixture)**

```bash
mkdir -p /tmp/i18n-broken
python3 - <<'EOF'
import json
pl = json.load(open('messages/pl.json'))
en = json.load(open('messages/en.json'))
del en['nav'][list(en['nav'].keys())[0]]          # drop one key from en
pl['zzz_extra'] = 'tylko po polsku'                # add one key only to pl
json.dump(pl, open('/tmp/i18n-broken/pl.json','w'), ensure_ascii=False)
json.dump(en, open('/tmp/i18n-broken/en.json','w'), ensure_ascii=False)
EOF
node scripts/check-i18n.mjs /tmp/i18n-broken
```

Expected: FAIL — `Error: Cannot find module ... scripts/check-i18n.mjs` (script doesn't exist yet).

- [ ] **Step 2: Write `scripts/check-i18n.mjs`**

```js
#!/usr/bin/env node
// Compares the leaf-key trees of messages/pl.json and messages/en.json.
// Usage: node scripts/check-i18n.mjs [messagesDir]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'messages';
const locales = ['pl', 'en'];

function leafKeys(node, prefix = '') {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === 'object'
      ? leafKeys(value, path)
      : [path];
  });
}

const keySets = new Map(
  locales.map((locale) => {
    const tree = JSON.parse(readFileSync(join(dir, `${locale}.json`), 'utf8'));
    return [locale, new Set(leafKeys(tree))];
  }),
);

let failed = false;
for (const locale of locales) {
  const own = keySets.get(locale);
  for (const [otherLocale, otherKeys] of keySets) {
    if (otherLocale === locale) continue;
    for (const key of otherKeys) {
      if (!own.has(key)) {
        console.error(`missing in ${locale}.json: ${key}`);
        failed = true;
      }
    }
  }
}

if (failed) process.exit(1);
console.log(`i18n OK: ${keySets.get('pl').size} keys match across ${locales.join(', ')}`);
```

- [ ] **Step 3: Run both directions of the test**

Run: `node scripts/check-i18n.mjs /tmp/i18n-broken; echo "exit=$?"`
Expected: two `missing in ...` lines (one per direction) and `exit=1`.

Run: `node scripts/check-i18n.mjs; echo "exit=$?"`
Expected: `i18n OK: 66 keys match across pl, en` and `exit=0`.

- [ ] **Step 4: Wire into `package.json`**

Replace the scripts block:

```json
  "scripts": {
    "dev": "next dev --port ${CONDUCTOR_PORT:-8080}",
    "build": "next build",
    "start": "next start --port ${PORT:-8080}",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "check:i18n": "node scripts/check-i18n.mjs",
    "check": "pnpm typecheck && pnpm lint && pnpm check:i18n && pnpm build"
  },
```

- [ ] **Step 5: Update the Commands block in `CLAUDE.md`**

Add after the `pnpm typecheck` line and update the `pnpm check` line:

```bash
pnpm check:i18n # Verify pl.json/en.json translation keys match
pnpm check     # Typecheck, lint, i18n parity, and build
```

- [ ] **Step 6: Verify wiring and commit**

Run: `pnpm check:i18n`
Expected: `i18n OK: 66 keys match across pl, en`

```bash
rm -rf /tmp/i18n-broken
git add scripts/check-i18n.mjs package.json CLAUDE.md
git commit -m "Add i18n key-parity check to pnpm check"
```

---

### Task 3: Design-language rules in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (insert new section directly after the existing `## Design System` section)

**Interfaces:**
- Produces: a `## Design Language` section referenced by Tasks 5 and 6 (skills say "read the Design Language section of CLAUDE.md").

- [ ] **Step 1: Insert the section**

Content is distilled from `docs/superpowers/specs/2026-04-11-design-system-design.md` (typography roles) and current usage:

```markdown
## Design Language

Rules for any UI work. Visual reference: `/pl/design-system` (dev only); primitives in `components/DesignSystem.tsx`.

- **Typography is dark and editorial.** Display headings and body copy use `dark` on `beige`. Display headings are uppercase Poppins.
- **Coral is an accent, used sparingly:** logo, dot, small labels, separator lines, text links, marquee/accent text, project-status accents. Never body copy, never large fills. Keep `#FC3117` exactly — do not resample reds from PDF exports.
- **Muted** (`#888888`) is for secondary text and metadata only.
- **Layout:** content constrained to `--max-width-content` (1400px), generous whitespace, image-led sections.
- **Images:** `next/image`, webp under `public/images/<slug>/`, aspect patterns from `ProjectGrid` (squares, portraits, full-width breaks).
- **Motion:** Framer Motion, subtle; marquee treatment for footer/accent text.
- **Never** introduce new colors, typefaces, or a component library without an explicit token discussion first.
```

- [ ] **Step 2: Verify placement and commit**

Run: `rg -n "^## Design (System|Language)" CLAUDE.md`
Expected: both headings, Design Language after Design System.

```bash
git add CLAUDE.md
git commit -m "Add design-language rules to CLAUDE.md"
```

---

### Task 4: verify-site skill

**Files:**
- Create: `.claude/skills/verify-site/SKILL.md`

**Interfaces:**
- Consumes: `data/projects.ts` slugs at run time; `$CONDUCTOR_PORT`.
- Produces: the QA gate other skills reference by name ("verify-site skill"); screenshots + report under `.context/verify-site/`.

- [ ] **Step 1: Write `.claude/skills/verify-site/SKILL.md`**

```markdown
---
name: verify-site
description: Use when changes need visual or functional verification before handoff, when pnpm check passes but rendering is unconfirmed, when checking for console errors or broken routes, or as the final QA step of the add-project and build-from-design skills.
---

# Verify Site

Walk every route in a real browser and record HTTP status, console errors, and a screenshot. `pnpm check` cannot see rendering — this can.

## Route list

Build it fresh each run — never hardcode slugs:

1. Static: `/`, `/projekty`, `/studio`, `/oferta`, `/kontakt`
2. One `/projekty/<slug>` per entry in `data/projects.ts`
3. Prefix every route with both locales: `/pl`, `/en`
4. Dev-server runs only: add `/pl/design-system` and `/en/design-system` (they 404 in production builds **by design** — never report that as a failure)

## Steps

1. Reuse a running dev server if one answers: `curl -sf -o /dev/null http://localhost:${CONDUCTOR_PORT:-8080}/pl`. Otherwise start `pnpm dev` in the background and poll that curl until it succeeds.
2. Visit each route with browser tools (Playwright MCP or Chrome MCP):
   - record HTTP status
   - read console messages; record errors, ignoring HMR/Fast Refresh noise
   - screenshot to `.context/verify-site/<locale>-<path-with-dashes>.png`
3. Report one table: route | status | console errors | screenshot.
4. PASS requires every route 200 with zero console errors. Anything else is FAIL.
5. Stop the dev server only if this run started it.

## This is a gate, not a fixer

A failing route gets reported with its screenshot and errors. Fixing is a separate decision for the caller — do not auto-fix and re-run silently.
```

- [ ] **Step 2: Application test — run the skill end-to-end**

Execute the skill's procedure exactly as written against this checkout (dev server, all 24 routes: 22 public + design-system in both locales).
Expected: report table produced; all routes 200; screenshots exist under `.context/verify-site/`.

- [ ] **Step 3: Fix any gaps the run exposed, re-run, commit**

```bash
git add .claude/skills/verify-site/SKILL.md
git commit -m "Add verify-site skill"
```

---

### Task 5: add-project skill

**Files:**
- Create: `.claude/skills/add-project/SKILL.md`

**Interfaces:**
- Consumes: `Project` type in `data/projects.ts`; `pnpm check:i18n` from Task 2; Design Language section from Task 3; verify-site skill from Task 4.

- [ ] **Step 1: Write `.claude/skills/add-project/SKILL.md`**

```markdown
---
name: add-project
description: Use when adding a new project to the portfolio, or when updating an existing project's images, copy, or layout hints in data/projects.ts.
---

# Add Project

## Checklist

1. **Images** into `public/images/<slug>/`:
   - webp, named like existing sets (`KOOL_dd_01.webp`, `kool_dehesa_01.webp`)
   - check dimensions: `sips -g pixelWidth -g pixelHeight public/images/<slug>/*.webp`
   - resize anything wider than 2560px: `sips --resampleWidth 2560 <file>`
2. **Data entry** in `data/projects.ts` conforming to the `Project` type.
   - Required: `id` (next unused integer, as string), `slug`, `title` (lowercase), `location`, `category` (`'mieszkalne' | 'komercyjne'`), `status` (`'completed' | 'in_progress'`), `year`, `area` (`'NNN m²'`), `scope` (Polish phrases), `thumbnail`, `featured`, `images`, `description`
   - Optional layout/credit fields: copy the patterns from `dom-dobrzykowice` (`fullWidthIndices`, `descriptionBlocks`) and `mieszkanie-widmo` (`containedPairs`, `reverseLastRow`); `photoCredit` as in `delikatesy-dehesa`
3. **Copy rules:** project copy is Polish and lives in `data/projects.ts`, not in `messages/`. Only touch `messages/*.json` when page chrome needs a new label — then add the key to BOTH `pl.json` and `en.json`. Paste Polish text exactly; never retype diacritics from screenshots.
4. **Verify:** `pnpm check:i18n && pnpm typecheck`, confirm the project shows at `/pl/projekty` and `/pl/projekty/<slug>` (sitemap picks it up automatically from `data/projects.ts`), then finish with the verify-site skill.

## Gotchas

- `thumbnail` must also appear in `images`
- `description` is the 1-2 sentence listing/SEO teaser; `descriptionBlocks` are the long-form detail-page paragraphs
- Follow the Design Language section of CLAUDE.md for any layout deviation
```

- [ ] **Step 2: Application test — subagent walkthrough**

Dispatch a fresh subagent: "Follow .claude/skills/add-project/SKILL.md to add a test project 'test-projekt' (category komercyjne, year 2026, reuse `/images/prs.jpg` as its only image and thumbnail). Report the diff and your verification output. Do not commit."
Expected: valid `Project` entry; `pnpm check:i18n` + `pnpm typecheck` pass; project visible at `/pl/projekty/test-projekt`; no `messages/*.json` edits.

- [ ] **Step 3: Revert the test project, fix skill gaps the walkthrough exposed, commit**

```bash
git checkout data/projects.ts
git add .claude/skills/add-project/SKILL.md
git commit -m "Add add-project skill"
```

---

### Task 6: build-from-design skill + design inbox

**Files:**
- Create: `.claude/skills/build-from-design/SKILL.md`
- Modify: `.gitignore` (append entry)

**Interfaces:**
- Consumes: poppler tools, `sips`, Design Language section (Task 3), verify-site skill (Task 4).
- Produces: gitignored `design/` inbox convention.

- [ ] **Step 1: Append to `.gitignore`**

```
# designer-delivered mockups (PDF/.ai inbox for build-from-design skill)
/design/
```

- [ ] **Step 2: Write `.claude/skills/build-from-design/SKILL.md`**

```markdown
---
name: build-from-design
description: Use when implementing a page or view from a designer-delivered PDF or Adobe Illustrator (.ai) mockup, or when extracting copy, photos, colors, or typefaces from a design file.
---

# Build From Design

Design files are full page mockups to implement **faithfully** — layout, spacing, and type as designed, not inspiration. Incoming files go in `design/` (gitignored inbox); extractions go in `.context/design/<name>/`.

## Pipeline

1. **Rasterize** one PNG per page/artboard and read them:
   `pdftoppm -r 200 -png design/<file> .context/design/<name>/page`
   For fine detail on one page: `pdftoppm -r 300 -f 2 -l 2 -png design/<file> .context/design/<name>/detail`
2. **Extract copy exactly:**
   `pdftotext -layout design/<file> .context/design/<name>/copy.txt`
   Use this text verbatim for all Polish copy — never retype diacritics from a screenshot. Empty output means the text was outlined; flag that and transcribe from the raster with extra care.
3. **Extract photos:**
   `pdfimages -all design/<file> .context/design/<name>/img`
   Move keepers to `public/images/<slug>/`, converting/resizing per the add-project skill's image rules.
4. **Map every color and typeface to tokens.** Fonts: `pdffonts design/<file>`. Colors: sample from the raster. Targets are the `@theme` tokens in `app/globals.css` — beige `#E5DDD0`, coral `#FC3117`, dark `#1A1A1A`, muted `#888888`, white `#FFFFFF`, Poppins.
   **If the design uses a value outside the token set: STOP and ask** whether it's a new token or an export artifact.
   - "It's close enough to coral" → it IS coral: use the token.
   - "It's clearly intentional, I'll just hardcode it" → still stop and ask.
   - Never hardcode a one-off hex or font.
5. **Reuse before building.** Read the Design Language section of CLAUDE.md, then check `components/` (Navbar, FooterBanner, ImageStrip, ProjectCard, ProjectGrid, `components/oferta/` section patterns) before writing new components.
6. **Verify faithfully.** Run the verify-site skill, then compare your page's screenshot side-by-side with the rasterized mockup at the same viewport width. Iterate until layout, spacing, and type match the mockup.

## .ai files

Most .ai files embed a PDF stream, so the pipeline works unchanged. If poppler rejects the file:
`brew install ghostscript`
`gs -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -o .context/design/<name>/converted.pdf design/<file>.ai`
then run the pipeline on the converted PDF. If ghostscript also fails, ask for an export with "Create PDF Compatible File" enabled.
```

- [ ] **Step 3: Application test — pipeline smoke test**

Create a sample PDF from a repo image and run steps 1-4's commands on it:

```bash
mkdir -p design .context/design/smoke
sips -s format pdf public/images/prs.jpg --out design/smoke.pdf
pdftoppm -r 200 -png design/smoke.pdf .context/design/smoke/page
pdftotext -layout design/smoke.pdf .context/design/smoke/copy.txt
pdfimages -all design/smoke.pdf .context/design/smoke/img
pdffonts design/smoke.pdf
ls .context/design/smoke/
```

Expected: `page-1.png` and at least one `img-*` file exist; `copy.txt` empty (image-only PDF — the documented "outlined text" case); `pdffonts` lists no fonts; no command errors.

- [ ] **Step 4: Verify ignore rule, clean up, commit**

Run: `git check-ignore design/smoke.pdf && echo ignored`
Expected: `ignored`

```bash
rm -rf design/smoke.pdf .context/design/smoke
git add .gitignore .claude/skills/build-from-design/SKILL.md
git commit -m "Add build-from-design skill and design/ inbox"
```

---

### Task 7: Toolkit docs + final gate

**Files:**
- Modify: `CLAUDE.md` (add an "Agent Toolkit" section after "Design Language"; add `design/` + `.claude/` to the Project Structure tree)

**Interfaces:**
- Consumes: everything from Tasks 1-6.

- [ ] **Step 1: Add the Agent Toolkit section to `CLAUDE.md`**

```markdown
## Agent Toolkit

Project skills live in `.claude/skills/`; shared agent permissions in `.claude/settings.json`.

- **verify-site** — browser QA gate: every route × both locales, status + console + screenshots. Run before handoff of visual changes.
- **add-project** — the images → `data/projects.ts` → verification workflow for portfolio entries.
- **build-from-design** — implement a view faithfully from a PDF/.ai mockup in `design/` (gitignored inbox). Extract copy/photos with poppler, map colors to `@theme` tokens (stop and ask on off-token values).
- **check:i18n** — `pnpm check:i18n` enforces pl/en key parity (part of `pnpm check`).
```

- [ ] **Step 2: Update the Project Structure tree in `CLAUDE.md`**

Add these lines to the tree (alongside existing entries):

```
.claude/                   # Agent settings + project skills (verify-site, add-project, build-from-design)
design/                    # Gitignored inbox for designer PDF/.ai mockups
scripts/check-i18n.mjs     # pl/en translation key parity check
```

- [ ] **Step 3: Run the full gate**

Run: `pnpm check`
Expected: typecheck, lint, `i18n OK: 66 keys match across pl, en`, and build all pass.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "Document agent toolkit in CLAUDE.md"
```
