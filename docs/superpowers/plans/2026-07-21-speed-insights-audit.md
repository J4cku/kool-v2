# Speed Insights and Lighthouse Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable Vercel Speed Insights across every localized route and capture a production Lighthouse baseline without making performance fixes.

**Architecture:** Mount Vercel's Next.js Speed Insights component in the existing locale root layout beside Web Analytics. Validate the complete application, serve the production build locally, save the raw Polish-homepage Lighthouse report under the gitignored `.context/` coordination directory, and commit a concise Markdown baseline.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, pnpm, `@vercel/speed-insights`, Lighthouse

## Global Constraints

- Use pnpm for dependency management.
- Render Speed Insights once in `app/[locale]/layout.tsx` so both locales and all routes are covered.
- Do not change page content, translations, visual components, or performance behavior.
- Run `pnpm check` before handoff.
- Audit the Polish homepage from a local production build.
- Do not make Lighthouse performance fixes in this change.

---

### Task 1: Integrate Vercel Speed Insights

**Files:**
- Modify: `app/[locale]/layout.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Next.js App Router root layout and the `SpeedInsights` React component exported by `@vercel/speed-insights/next`
- Produces: one global `<SpeedInsights />` mount for every localized page

- [ ] **Step 1: Add the unresolved import and component mount**

Add the import beside the existing Vercel Analytics import:

```tsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
```

Render the component after Analytics:

```tsx
<Analytics />
<SpeedInsights />
```

- [ ] **Step 2: Verify the dependency is required**

Run: `pnpm typecheck`

Expected: FAIL with a TypeScript module-resolution error for `@vercel/speed-insights/next`.

- [ ] **Step 3: Install the production dependency**

Run: `pnpm add @vercel/speed-insights`

Expected: `package.json` and `pnpm-lock.yaml` include `@vercel/speed-insights`.

- [ ] **Step 4: Verify the integration compiles**

Run: `pnpm typecheck`

Expected: exit code 0.

- [ ] **Step 5: Review the focused diff**

Run: `git diff --check && git diff -- package.json pnpm-lock.yaml 'app/[locale]/layout.tsx'`

Expected: no whitespace errors; only the dependency, lockfile resolution, import, and component mount are changed.

- [ ] **Step 6: Commit the integration and implementation plan**

```bash
git add package.json pnpm-lock.yaml 'app/[locale]/layout.tsx' docs/superpowers/plans/2026-07-21-speed-insights-audit.md
git commit -m "Add Vercel Speed Insights"
```

Expected: the dependency, root-layout integration, and implementation plan are committed together.

### Task 2: Verify the Application and Capture the Lighthouse Baseline

**Files:**
- Create: `.context/lighthouse-speed-insights-baseline.json` (gitignored audit artifact)
- Create: `docs/superpowers/audits/2026-07-21-lighthouse-baseline.md` (tracked readable summary)

**Interfaces:**
- Consumes: the verified production build and local production server
- Produces: Lighthouse category scores and core performance metrics for `/pl`

- [ ] **Step 1: Run the required project gate**

Run: `pnpm check`

Expected: typecheck, ESLint, i18n key parity, and production build all exit successfully.

- [ ] **Step 2: Start the production server on an isolated port**

Run: `PORT=4173 pnpm start`

Expected: Next.js reports a ready server at `http://localhost:4173`.

- [ ] **Step 3: Run Lighthouse and save the JSON report**

Run:

```bash
pnpm dlx lighthouse http://localhost:4173/pl \
  --output=json \
  --output-path=.context/lighthouse-speed-insights-baseline.json \
  --chrome-flags='--headless --no-sandbox' \
  --quiet
```

Expected: exit code 0 and a JSON report at `.context/lighthouse-speed-insights-baseline.json`.

- [ ] **Step 4: Extract a readable baseline summary**

Run:

```bash
node --input-type=module -e "
  import fs from 'node:fs';
  const report = JSON.parse(fs.readFileSync('.context/lighthouse-speed-insights-baseline.json', 'utf8'));
  const score = (category) => Math.round(report.categories[category].score * 100);
  const metric = (audit) => report.audits[audit].displayValue;
  const lines = [
    '# Lighthouse Baseline',
    '',
    '- URL: http://localhost:4173/pl',
    '- Mode: local production build, Lighthouse mobile defaults',
    '- Performance: ' + score('performance'),
    '- Accessibility: ' + score('accessibility'),
    '- Best Practices: ' + score('best-practices'),
    '- SEO: ' + score('seo'),
    '- First Contentful Paint: ' + metric('first-contentful-paint'),
    '- Largest Contentful Paint: ' + metric('largest-contentful-paint'),
    '- Total Blocking Time: ' + metric('total-blocking-time'),
    '- Cumulative Layout Shift: ' + metric('cumulative-layout-shift'),
    '- Speed Index: ' + metric('speed-index'),
    '',
  ];
  fs.mkdirSync('docs/superpowers/audits', { recursive: true });
  fs.writeFileSync('docs/superpowers/audits/2026-07-21-lighthouse-baseline.md', lines.join('\\n'));
"
```

Expected: `docs/superpowers/audits/2026-07-21-lighthouse-baseline.md` contains all four category scores and five measured performance metrics.

- [ ] **Step 5: Stop the production server and inspect repository state**

Run: `git status --short && git diff --check`

Expected: only `docs/superpowers/audits/2026-07-21-lighthouse-baseline.md` is uncommitted; the raw `.context/` audit artifact remains ignored.

- [ ] **Step 6: Commit the implementation**

Run: `git add docs/superpowers/audits/2026-07-21-lighthouse-baseline.md && git commit -m "Record Lighthouse performance baseline"`

Expected: the readable baseline is committed, while the raw Lighthouse artifact remains local in `.context/`.
