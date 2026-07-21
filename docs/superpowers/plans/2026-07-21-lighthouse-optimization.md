# Lighthouse Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the measured homepage performance and accessibility bottlenecks, then compare five fresh mobile Lighthouse runs with the 73/91/96/92 baseline.

**Architecture:** Preserve the existing visual system and Swiper interaction while making the initial document stable and limiting the critical path to visible assets. Reuse one IntersectionObserver-backed video component, repair accessibility with existing color tokens, and treat deployed SEO as authoritative while making local Best Practices deterministic.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Swiper 14, Framer Motion 12, Vercel Analytics/Speed Insights, Lighthouse 13

## Global Constraints

- Keep coral exactly `#FC3117`.
- Keep Swiper, autoplay, mousewheel, touch behavior, navigation, locale switching, and page transitions functional.
- Do not change localized content or introduce new colors, typefaces, or component libraries.
- Use `@/i18n/navigation` for internal links.
- Mount Vercel telemetry on Vercel deployments and omit it from ordinary local production builds.
- Run `pnpm check` before handoff.
- Use the project `verify-site` workflow for route, console, and screenshot QA.
- Compare five Lighthouse mobile runs from one local production server; do not claim localhost SEO represents production canonical behavior.

Primary API references:

- [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image): `loading` defaults to lazy; Next.js 16 deprecates `priority` in favor of `preload`.
- [Next.js Link](https://nextjs.org/docs/app/api-reference/components/link): `prefetch={false}` disables viewport and hover prefetch.
- [Next.js Font](https://nextjs.org/docs/app/api-reference/components/font): `style` defaults to normal and each requested style adds font resources.
- [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables): Vercel sets `VERCEL=1` at build and runtime.

---

### Task 1: Stabilize and Reduce the Homepage Critical Path

**Files:**
- Modify: `components/ImageStrip.tsx`
- Modify: `components/Navbar.tsx`
- Modify: `app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `projects`, localized `Link`, Next.js `Image`, `process.env.VERCEL`
- Produces: stable carousel markup, one preloaded hero image, lazy offscreen slides, no carousel route prefetch, eager nav dot, normal-only font files, deployment-scoped telemetry

- [x] **Step 1: Preserve the failing baseline evidence**

Run:

```bash
jq '{scores: [.categories.performance.score, .categories.accessibility.score, .categories["best-practices"].score, .categories.seo.score], imageRequests: ([.audits["network-requests"].details.items[] | select(.resourceType == "Image")] | length), fontRequests: ([.audits["network-requests"].details.items[] | select(.resourceType == "Font")] | length), routePrefetches: ([.audits["network-requests"].details.items[] | select(.mimeType == "text/x-component")] | length)}' .context/lighthouse-speed-insights-baseline.json
```

Expected: scores `[0.73,0.91,0.96,0.92]`, 19 image requests, 28 font requests, and 14 route-prefetch requests.

- [x] **Step 2: Make carousel rendering stable and demand-driven**

In `components/ImageStrip.tsx`, remove `useSyncExternalStore`, `shuffle`, `shuffledSlides`, `emptySubscribe`, `getShuffledSlides`, and `getServerSlides`. Use the stable array directly:

```tsx
export default function ImageStrip() {
  const slides = baseSlides;
```

Remove the Swiper `key` prop. Update each project link and image:

```tsx
<Link
  href={`/projekty/${slide.slug}`}
  draggable={false}
  prefetch={false}
  className="relative block w-full aspect-[3/4] md:aspect-square overflow-hidden"
>
  <Image
    src={slide.src}
    alt={slideAlt(slide.slug, locale)}
    draggable={false}
    fill
    className="object-cover transition-transform duration-[600ms] hover:scale-[1.04]"
    sizes="(max-width: 768px) 100vw, 33vw"
    preload={i === 0}
  />
</Link>
```

- [x] **Step 3: Make the nav dot immediately discoverable**

In `components/Navbar.tsx`, update the visible dot image:

```tsx
<Image
  src="/dot.svg"
  alt=""
  width={36}
  height={35}
  loading="eager"
  fetchPriority="high"
/>
```

- [x] **Step 4: Remove unused font styles and scope telemetry to Vercel**

In `app/[locale]/layout.tsx`, set the font style and deployment flag:

```tsx
const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: 'normal',
  variable: '--font-poppins',
});

const isVercelDeployment = process.env.VERCEL === '1';
```

Replace unconditional telemetry mounts with:

```tsx
{isVercelDeployment && (
  <>
    <Analytics />
    <SpeedInsights />
  </>
)}
```

- [x] **Step 5: Verify and commit**

Run: `pnpm typecheck && pnpm lint && git diff --check`

Expected: exit code 0 with no TypeScript, ESLint, or whitespace errors.

```bash
git add 'app/[locale]/layout.tsx' components/ImageStrip.tsx components/Navbar.tsx docs/superpowers/plans/2026-07-21-lighthouse-optimization.md
git commit -m "Reduce homepage critical-path work"
```

### Task 2: Defer the Showreel Until It Approaches the Viewport

**Files:**
- Create: `components/LazyAutoplayVideo.tsx`
- Modify: `components/FooterBanner.tsx`
- Modify: `app/[locale]/kontakt/KontaktPage.tsx`

**Interfaces:**
- Consumes: `src: string`, `label: string`, `className: string`
- Produces: `LazyAutoplayVideo`, a stable video frame whose source is absent until IntersectionObserver reports proximity

- [ ] **Step 1: Confirm the baseline eagerly transfers the reel**

Run:

```bash
jq -r '.audits["network-requests"].details.items[] | select(.url | endswith("/videos/reel.mp4")) | [.resourceType, .transferSize, .url] | @tsv' .context/lighthouse-speed-insights-baseline.json
```

Expected: one Media request transferring 1,512,897 bytes.

- [ ] **Step 2: Create the reusable deferred video component**

Create `components/LazyAutoplayVideo.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyAutoplayVideoProps {
  src: string;
  label: string;
  className: string;
}

export default function LazyAutoplayVideo({
  src,
  label,
  className,
}: LazyAutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !videoRef.current) return;
    videoRef.current.load();
    void videoRef.current.play().catch(() => undefined);
  }, [shouldLoad]);

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      autoPlay={shouldLoad}
      muted
      loop
      playsInline
      preload={shouldLoad ? 'metadata' : 'none'}
      aria-label={label}
      className={className}
    />
  );
}
```

- [ ] **Step 3: Replace both direct showreel elements**

Import `LazyAutoplayVideo` in `components/FooterBanner.tsx` and `app/[locale]/kontakt/KontaktPage.tsx`. Replace each `<video>` with:

```tsx
<LazyAutoplayVideo
  src="/videos/reel.mp4"
  label="Kool Studio showreel"
  className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] object-cover"
/>
```

Use the existing contact-page dimensions (`w-[160px] h-[160px] md:w-[220px] md:h-[220px]`) in `KontaktPage.tsx`.

- [ ] **Step 4: Verify and commit**

Run: `pnpm typecheck && pnpm lint && git diff --check`

Expected: exit code 0.

```bash
git add components/LazyAutoplayVideo.tsx components/FooterBanner.tsx 'app/[locale]/kontakt/KontaktPage.tsx'
git commit -m "Defer below-fold showreel loading"
```

### Task 3: Repair the Measured Accessibility Failures

**Files:**
- Modify: `components/ManifestoSection.tsx`
- Modify: `components/FooterBanner.tsx`
- Modify: `app/[locale]/studio/StudioPage.tsx`
- Modify: `components/LanguageToggle.tsx`
- Modify: `components/FooterBar.tsx`
- Modify: `components/AddressBlock.tsx`

**Interfaces:**
- Consumes: existing `white`, `coral`, `dark`, and `beige` tokens
- Produces: passing contrast pairs, 44-pixel interactive hit areas, and accessible address/email names without changing `#FC3117`

- [ ] **Step 1: Put coral marquee text on white**

Add `bg-white` to the outer marquee container in `components/ManifestoSection.tsx`:

```tsx
<div className="overflow-hidden whitespace-nowrap py-16 md:py-24 bg-white">
```

Use the equivalent existing spacing plus `bg-white` in `components/FooterBanner.tsx`:

```tsx
<div className="overflow-hidden whitespace-nowrap pt-8 md:pt-12 pb-2 bg-white">
```

And in `app/[locale]/studio/StudioPage.tsx`:

```tsx
<section className="overflow-hidden whitespace-nowrap pt-16 pb-8 md:pt-24 md:pb-12 bg-white">
```

Keep every `text-coral` class unchanged.

- [ ] **Step 2: Preserve 26-pixel visuals inside 44-pixel language targets**

In `components/LanguageToggle.tsx`, replace the existing return value with:

```tsx
return (
  <div className="flex items-center gap-1 text-xs font-semibold">
    <button
      onClick={() => switchTo('pl')}
      aria-pressed={locale === 'pl'}
      className="w-11 h-11 flex items-center justify-center"
    >
      <span
        className={`w-[26px] h-[26px] flex items-center justify-center rounded-full transition-colors ${
          locale === 'pl'
            ? 'bg-coral text-dark'
            : 'bg-transparent text-dark hover:opacity-70'
        }`}
      >
        pl
      </span>
    </button>
    <button
      onClick={() => switchTo('en')}
      aria-pressed={locale === 'en'}
      className="w-11 h-11 flex items-center justify-center"
    >
      <span
        className={`w-[26px] h-[26px] flex items-center justify-center rounded-full transition-colors ${
          locale === 'en'
            ? 'bg-coral text-dark'
            : 'bg-transparent text-dark hover:opacity-70'
        }`}
      >
        en
      </span>
    </button>
  </div>
);
```

- [ ] **Step 3: Preserve the Instagram circle inside a 44-pixel target**

In `components/FooterBar.tsx`, change the fixed bar's inner wrapper from `py-2` to `py-0` so the larger hit areas keep the controls at their current visual height. Replace the Instagram link with:

```tsx
<a
  href={INSTAGRAM_URL}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Instagram"
  className="w-11 h-11 flex items-center justify-center"
>
  <span className="w-[26px] h-[26px] flex items-center justify-center rounded-full bg-coral text-dark transition-opacity hover:opacity-70">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  </span>
</a>
```

- [ ] **Step 4: Make address content semantic and targets large enough**

In `components/AddressBlock.tsx`, render each character without hiding it:

```tsx
<span key={i}>{ch === ' ' ? ' ' : ch}</span>
```

Remove both redundant link `aria-label` props. Use these complete link class names:

```tsx
className="flex min-h-11 items-center justify-between w-full font-[400] uppercase text-dark hover:opacity-70 transition-opacity text-[clamp(15px,1.5vw,20px)]"

className="flex min-h-11 items-center justify-between w-full font-[700] uppercase text-dark hover:opacity-70 transition-opacity text-[clamp(18px,6.2vw,55px)] md:block md:whitespace-nowrap md:text-right md:text-[clamp(32px,4.2vw,55px)]"
```

- [ ] **Step 5: Verify coral and focused code checks, then commit**

Run:

```bash
rg -n --fixed-strings '#FC3117' app/globals.css public/dot.svg
pnpm typecheck
pnpm lint
git diff --check
```

Expected: coral remains `#FC3117`; all checks exit 0.

```bash
git add components/ManifestoSection.tsx components/FooterBanner.tsx 'app/[locale]/studio/StudioPage.tsx' components/LanguageToggle.tsx components/FooterBar.tsx components/AddressBlock.tsx
git commit -m "Fix homepage accessibility audit failures"
```

### Task 4: Verify Rendering and Capture the Five-Run Comparison

**Files:**
- Create: `scripts/compare-lighthouse.mjs`
- Create: `.context/verify-site/` screenshots and route report (gitignored)
- Create: `.context/lighthouse-optimized-run-1.json` through `.context/lighthouse-optimized-run-5.json` (gitignored)
- Create: `docs/superpowers/audits/2026-07-21-lighthouse-optimization-comparison.md`

**Interfaces:**
- Consumes: verified production build, local server at `http://localhost:4173`, baseline JSON, five optimized JSON reports
- Produces: complete route/browser QA evidence and a tracked before/after median comparison

- [ ] **Step 1: Run the full project gate**

Run: `pnpm check`

Expected: typecheck, lint, 98-key i18n parity, and the 48-page production build exit 0.

- [ ] **Step 2: Run project browser QA**

Follow `.claude/skills/verify-site/SKILL.md` completely. Verify every generated route in both locales and the development-only design-system routes. Additionally inspect `/pl`, `/en`, `/pl/kontakt`, and `/en/kontakt` at 412px and 1440px widths for carousel operation, stable video frames, playback near the viewport, language controls, address links, and marquee treatment.

Expected: all routes return 200, console errors are zero, screenshots exist under `.context/verify-site/`, and the targeted interactions remain functional.

- [ ] **Step 3: Start one production server**

Run: `PORT=4173 pnpm start`

Expected: the server is ready at `http://localhost:4173` and remains running for all five audits.

- [ ] **Step 4: Run five Lighthouse mobile audits**

Run:

```bash
for run_number in 1 2 3 4 5; do
  pnpm dlx lighthouse@13.4.1 http://localhost:4173/pl \
    --output=json \
    --output-path=".context/lighthouse-optimized-run-${run_number}.json" \
    --chrome-flags='--headless --no-sandbox' \
    --quiet
done
```

Expected: five JSON reports produced by the same Lighthouse version and server process.

- [ ] **Step 5: Verify the comparison script is missing**

Run:

```bash
node scripts/compare-lighthouse.mjs \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-comparison-self-test.json \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-speed-insights-baseline.json
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/compare-lighthouse.mjs`.

- [ ] **Step 6: Create the deterministic comparison script**

Create `scripts/compare-lighthouse.mjs`:

```js
import fs from 'node:fs';

const [baselinePath, outputPath, ...runPaths] = process.argv.slice(2);

if (!baselinePath || !outputPath || runPaths.length !== 5) {
  throw new Error('Usage: node scripts/compare-lighthouse.mjs BASELINE OUTPUT RUN1 RUN2 RUN3 RUN4 RUN5');
}

const readReport = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const median = (values) => [...values].sort((a, b) => a - b)[2];

function summarize(report) {
  const requests = report.audits['network-requests'].details.items;
  const categoryScore = (id) => Math.round(report.categories[id].score * 100);
  const metric = (id) => report.audits[id].numericValue;
  const requestCount = (predicate) => requests.filter(predicate).length;

  return {
    scores: {
      performance: categoryScore('performance'),
      accessibility: categoryScore('accessibility'),
      bestPractices: categoryScore('best-practices'),
      seo: categoryScore('seo'),
    },
    metrics: {
      fcpMs: metric('first-contentful-paint'),
      lcpMs: metric('largest-contentful-paint'),
      tbtMs: metric('total-blocking-time'),
      cls: metric('cumulative-layout-shift'),
      speedIndexMs: metric('speed-index'),
    },
    resources: {
      transferBytes: requests.reduce((sum, request) => sum + request.transferSize, 0),
      images: requestCount((request) => request.resourceType === 'Image'),
      fonts: requestCount((request) => request.resourceType === 'Font'),
      media: requestCount((request) => request.resourceType === 'Media'),
      routePrefetches: requestCount((request) => request.mimeType === 'text/x-component'),
    },
    environment: {
      lighthouseVersion: report.lighthouseVersion,
      chromeUserAgent: report.environment.hostUserAgent,
      benchmarkIndex: report.environment.benchmarkIndex,
      fetchTime: report.fetchTime,
    },
    failedWeightedAudits: Object.entries(report.categories).flatMap(([categoryId, category]) =>
      category.auditRefs
        .filter(({ id, weight }) => weight > 0 && (report.audits[id].score ?? 1) < 1)
        .map(({ id, weight }) => ({ categoryId, id, weight, score: report.audits[id].score }))
    ),
  };
}

const baseline = summarize(readReport(baselinePath));
const runs = runPaths.map((path) => summarize(readReport(path)));
const scoreKeys = Object.keys(baseline.scores);
const metricKeys = Object.keys(baseline.metrics);
const resourceKeys = Object.keys(baseline.resources);

const comparison = {
  commit: process.env.GIT_COMMIT ?? null,
  baseline,
  runs,
  median: {
    scores: Object.fromEntries(scoreKeys.map((key) => [key, median(runs.map((run) => run.scores[key]))])),
    metrics: Object.fromEntries(metricKeys.map((key) => [key, median(runs.map((run) => run.metrics[key]))])),
    resources: Object.fromEntries(resourceKeys.map((key) => [key, median(runs.map((run) => run.resources[key]))])),
  },
};

fs.writeFileSync(outputPath, `${JSON.stringify(comparison, null, 2)}\n`);
```

- [ ] **Step 7: Verify the comparison script and calculate optimized medians**

Run the script with the baseline repeated five times:

```bash
GIT_COMMIT="$(git rev-parse HEAD)" node scripts/compare-lighthouse.mjs \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-comparison-self-test.json \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-speed-insights-baseline.json
jq -e '.median.scores == .baseline.scores and .median.metrics == .baseline.metrics and .median.resources == .baseline.resources' .context/lighthouse-comparison-self-test.json
```

Expected: `jq` prints `true` and exits 0.

Calculate the optimized comparison:

```bash
GIT_COMMIT="$(git rev-parse HEAD)" node scripts/compare-lighthouse.mjs \
  .context/lighthouse-speed-insights-baseline.json \
  .context/lighthouse-optimization-comparison.json \
  .context/lighthouse-optimized-run-1.json \
  .context/lighthouse-optimized-run-2.json \
  .context/lighthouse-optimized-run-3.json \
  .context/lighthouse-optimized-run-4.json \
  .context/lighthouse-optimized-run-5.json
```

Expected: the calculated values exactly match the source JSON files; Accessibility and Best Practices have no identified baseline failures, and initial payload excludes the reel and offscreen route prefetches.

- [ ] **Step 8: Write and commit the comparison**

Use `apply_patch` to create `docs/superpowers/audits/2026-07-21-lighthouse-optimization-comparison.md` with the actual baseline, five per-run scores, medians, metric deltas, request/payload deltas, environment metadata, remaining failed audits, and the localhost SEO caveat. Do not write estimated or synthetic values.

Run: `git diff --check && git status --short`

```bash
git add scripts/compare-lighthouse.mjs docs/superpowers/audits/2026-07-21-lighthouse-optimization-comparison.md
git commit -m "Record Lighthouse optimization results"
```

Expected: the tracked comparison is committed; raw reports and screenshots remain ignored.
