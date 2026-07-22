# Image Quality Performance Budget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing 90/75 image-quality tiers explicit and regression-tested, with no Lighthouse performance median regression.

**Architecture:** Preserve rendered output and request timing. Add explicit quality 75 props to navigational homepage/card imagery, retain quality 90 on project presentation imagery, and protect the split with a source-contract test. Compare five deployed-preview Lighthouse runs before and after the runtime-equivalent change.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node test runner, Lighthouse 13, pnpm

## Global Constraints

- Treat zero Lighthouse performance regression as a hard acceptance gate.
- Keep `images.qualities` exactly `[75, 90]`.
- Keep quality 90 on full-screen project heroes and full-width/detail project imagery.
- Keep quality 75 on homepage carousel images and project cards.
- Preserve homepage responsive `sizes` and first-image eager/high-priority behavior.
- Do not enable AVIF, globally raise quality, recompress assets, or change framing.
- Run `pnpm check` before handoff.

---

### Task 1: Capture the Rebased Preview Baseline

**Files:**
- Create: `.context/image-policy-baseline-run-{1..5}.json` (gitignored)
- Create: `.context/image-policy-baseline-summary.json` (gitignored)

**Interfaces:**
- Consumes: `https://kool-v2-bkd0aaxfs-j4ckus-projects.vercel.app/pl`
- Produces: five Lighthouse reports and a median baseline for Task 3

- [ ] **Step 1: Confirm the preview is deployed**

Run: `gh pr checks 17`

Expected: Vercel reports `pass`.

- [ ] **Step 2: Run five mobile Lighthouse baselines**

```bash
for run_number in 1 2 3 4 5; do
  pnpm dlx lighthouse 'https://kool-v2-bkd0aaxfs-j4ckus-projects.vercel.app/pl' \
    --output=json \
    --output-path=".context/image-policy-baseline-run-${run_number}.json" \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags='--headless --no-sandbox --disable-gpu' \
    --quiet
done
```

Expected: all commands exit 0 and five non-empty JSON files exist.

- [ ] **Step 3: Summarize the baseline**

```bash
node - <<'NODE'
const fs = require('node:fs');
const reports = [1, 2, 3, 4, 5].map((run) =>
  JSON.parse(fs.readFileSync(`.context/image-policy-baseline-run-${run}.json`, 'utf8'))
);
const median = (values) => [...values].sort((a, b) => a - b)[2];
const runs = reports.map((report) => ({
  performance: Math.round(report.categories.performance.score * 100),
  lcpMs: report.audits['largest-contentful-paint'].numericValue,
  transferBytes: report.audits['network-requests'].details.items.reduce(
    (sum, request) => sum + request.transferSize,
    0
  ),
}));
const summary = {
  runs,
  median: {
    performance: median(runs.map((run) => run.performance)),
    lcpMs: median(runs.map((run) => run.lcpMs)),
    transferBytes: median(runs.map((run) => run.transferBytes)),
  },
};
fs.writeFileSync('.context/image-policy-baseline-summary.json', `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
NODE
```

Expected: five runs plus median Performance, LCP, and transfer bytes.

---

### Task 2: Encode the Image-Quality Policy

**Files:**
- Create: `tests/image-quality-policy.test.ts`
- Modify: `components/ImageStrip.tsx`
- Modify: `components/ProjectCard.tsx`

**Interfaces:**
- Consumes: Next.js `quality` prop and `next.config.mjs` quality allowlist
- Produces: explicit quality 75 props and source-contract coverage for both tiers

- [ ] **Step 1: Write the failing source-contract test**

Create `tests/image-quality-policy.test.ts`:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readSource = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const nextConfigSource = readSource('next.config.mjs');
const imageStripSource = readSource('components/ImageStrip.tsx');
const projectCardSource = readSource('components/ProjectCard.tsx');
const projectHeroSource = readSource('components/ProjectHero.tsx');
const projectContentSource = readSource('components/ProjectContent.tsx');

test('image quality tiers preserve fidelity without inflating navigation imagery', () => {
  assert.match(nextConfigSource, /qualities:\s*\[75,\s*90\]/);
  assert.match(projectHeroSource, /sizes="100vw"\s+quality=\{90\}/);
  assert.match(
    projectContentSource,
    /function FullImage[\s\S]*?sizes="\(max-width: 768px\) 100vw, 50vw" quality=\{90\}/
  );
  assert.match(
    projectContentSource,
    /<ParallaxImage[\s\S]*?sizes="100vw" quality=\{90\}/
  );
  assert.match(
    imageStripSource,
    /sizes="\(max-width: 767px\) 100vw, \(max-width: 1279px\) 50vw, 33vw"\s+quality=\{75\}\s+loading=\{i === 0 \? 'eager' : 'lazy'\}/
  );
  assert.match(projectCardSource, /quality=\{75\}/);
  assert.doesNotMatch(imageStripSource, /quality=\{90\}/);
  assert.doesNotMatch(projectCardSource, /quality=\{90\}/);
});
```

- [ ] **Step 2: Verify the test fails**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/image-quality-policy.test.ts`

Expected: FAIL because `ImageStrip` and `ProjectCard` do not contain explicit `quality={75}`.

- [ ] **Step 3: Make quality 75 explicit**

In `components/ImageStrip.tsx`:

```tsx
sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
quality={75}
loading={i === 0 ? 'eager' : 'lazy'}
fetchPriority={i === 0 ? 'high' : undefined}
```

In `components/ProjectCard.tsx`:

```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
quality={75}
```

- [ ] **Step 4: Verify the focused test passes**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/image-quality-policy.test.ts
```

Expected: 1 passes, 0 fails.

- [ ] **Step 5: Run the full project gate**

Run: `pnpm check`

Expected: tests, typecheck, ESLint, i18n parity, and production build exit 0.

- [ ] **Step 6: Commit**

```bash
git add tests/image-quality-policy.test.ts components/ImageStrip.tsx components/ProjectCard.tsx
git commit -m "Protect image quality performance tiers"
```

Expected: one commit containing only the test and two explicit quality props.

---

### Task 3: Verify and Document the Deployed Candidate

**Files:**
- Create: `.context/image-policy-candidate-run-{1..5}.json` (gitignored)
- Create: `.context/image-policy-gate-summary.json` (gitignored)
- Modify: `docs/superpowers/audits/2026-07-21-lighthouse-optimization-comparison.md`

**Interfaces:**
- Consumes: Task 1 baseline, Task 2 commit, Vercel preview
- Produces: candidate median, audit note, and updated PR #17

- [ ] **Step 1: Push and wait for deployment**

```bash
git push origin add-vercel-speed-insights
gh pr checks 17 --watch
```

Expected: push succeeds and Vercel finishes with `pass`.

- [ ] **Step 2: Run five candidate audits**

```bash
for run_number in 1 2 3 4 5; do
  pnpm dlx lighthouse 'https://kool-v2-bkd0aaxfs-j4ckus-projects.vercel.app/pl' \
    --output=json \
    --output-path=".context/image-policy-candidate-run-${run_number}.json" \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags='--headless --no-sandbox --disable-gpu' \
    --quiet
done
```

Expected: five non-empty candidate JSON reports.

- [ ] **Step 3: Compare medians**

```bash
node - <<'NODE'
const fs = require('node:fs');
const baseline = JSON.parse(fs.readFileSync('.context/image-policy-baseline-summary.json', 'utf8'));
const reports = [1, 2, 3, 4, 5].map((run) =>
  JSON.parse(fs.readFileSync(`.context/image-policy-candidate-run-${run}.json`, 'utf8'))
);
const median = (values) => [...values].sort((a, b) => a - b)[2];
const runs = reports.map((report) => ({
  performance: Math.round(report.categories.performance.score * 100),
  lcpMs: report.audits['largest-contentful-paint'].numericValue,
  transferBytes: report.audits['network-requests'].details.items.reduce(
    (sum, request) => sum + request.transferSize,
    0
  ),
}));
const candidate = {
  runs,
  median: {
    performance: median(runs.map((run) => run.performance)),
    lcpMs: median(runs.map((run) => run.lcpMs)),
    transferBytes: median(runs.map((run) => run.transferBytes)),
  },
};
const result = {
  baseline,
  candidate,
  performanceDelta: candidate.median.performance - baseline.median.performance,
};
fs.writeFileSync('.context/image-policy-gate-summary.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (result.performanceDelta < 0) process.exit(1);
NODE
```

Expected: exit 0 and `performanceDelta` is 0 or greater. If negative, rerun the five candidate audits once; if still negative, revert the explicit props and investigate.

- [ ] **Step 4: Verify rendered imagery**

Check mobile and desktop homepage, project cards, and a project detail page. Confirm matching framing/sharpness, captions, no blank slides, no layout shifts, and no broken requests.

- [ ] **Step 5: Document and publish the result**

Append `Post-rebase image-quality gate` to the tracked Lighthouse report with both five-run score sets, median Performance/LCP/bytes, delta, pass/fail, and the 75/90 policy. Then run:

```bash
pnpm check
git diff --check
git add docs/superpowers/audits/2026-07-21-lighthouse-optimization-comparison.md
git commit -m "Document image quality performance gate"
git push origin add-vercel-speed-insights
```

Expected: every command exits 0, the worktree is clean, and PR #17 contains the rebase, quality contract, and audit result.
