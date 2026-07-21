# Lighthouse Optimization Design

## Goal

Raise the mobile Lighthouse scores of the Polish homepage as close to 100/100 as repeatable production behavior allows, without changing Kool Studio's coral token, core visual identity, content, or carousel interaction.

The implementation targets the measured baseline: Performance 73, Accessibility 91, Best Practices 96, and SEO 92. Performance acceptance uses the median of repeated runs because a single synthetic score is environment-sensitive.

## Measured Causes

- Simulated Largest Contentful Paint is 7.6 seconds and Speed Index is 4.4 seconds.
- Initial transfer is 2.9 MiB: a 1.5 MiB below-fold reel, 19 images totaling about 905 KiB, 28 font files totaling about 204 KiB, and 14 prefetched project route payloads.
- Every carousel image except the first is explicitly eager, while all carousel links prefetch after hydration.
- Hydration replaces the server slide order with a client shuffle and remounts Swiper.
- The nav dot selected as the LCP candidate is lazy-discovered.
- Coral `#FC3117` on beige `#E5DDD0` has 2.79:1 contrast, below Lighthouse thresholds.
- The footer address target is under 24 CSS pixels tall and its split-letter presentation hides all visible characters from the accessibility tree.
- Local Vercel telemetry endpoints return 404, and the production canonical is intentionally cross-origin during a localhost audit.

## Performance Design

### Carousel critical path

- Keep Swiper, autoplay, mousewheel, touch behavior, and the first project image visually unchanged.
- Remove hydration-time random reordering and the keyed Swiper remount. Stable server and client ordering gives the browser one critical render path.
- Keep `priority` only on the first slide image. Allow every other slide image to use native lazy loading instead of forcing eager loading.
- Disable Next.js route prefetch on carousel project links. Navigation still loads normally when activated.
- Retain the existing responsive `sizes` contract and lower carousel image quality only if visual screenshot comparison shows no material degradation.

### Critical UI assets

- Mark the visible nav dot as priority/eager so it is discovered in the initial document and no longer becomes a late LCP candidate.
- Remove the unused italic Poppins variants. Preserve every normal weight currently used by public pages and the private design system.

### Deferred media

- Introduce one reusable lazy autoplay video component for the homepage footer and contact page.
- Do not attach the 1.5 MiB reel source until its frame approaches the viewport via `IntersectionObserver`.
- Once eligible, retain autoplay, mute, loop, plays-inline, sizing, and accessible labeling.
- Render a stable empty frame before eligibility so layout does not shift.

## Accessibility Design

The coral token remains exactly `#FC3117`.

- Render coral marquee text on the existing white token. This produces 3.76:1 contrast and preserves coral as the accent.
- Use dark text on coral for active language and Instagram controls, and dark text on beige for inactive language controls. These combinations exceed 4.5:1.
- Keep the visible 26-pixel circular controls while wrapping them in at least 44-by-44-pixel interactive hit areas.
- Give address and email links at least 44 pixels of target height.
- Stop hiding the distributed visible characters from the accessibility tree so the address link's accessible name is derived from its actual text.

## Audit Environment

- Mount Vercel Analytics and Speed Insights only when the build runs on Vercel. This prevents expected local telemetry 404s from reducing Best Practices while preserving deployed measurement.
- Keep the self-referencing production canonical unchanged. The localhost SEO deduction is an audit-environment artifact; the deployed URL is authoritative for SEO.
- Record Lighthouse version, Chrome version, benchmark index, commit, timestamp, run scores, and median in the new audit summary.

## Verification

- Run focused typecheck/lint checks during implementation and `pnpm check` before handoff.
- Run browser QA for the Polish and English homepage and contact page at mobile and desktop widths, checking carousel interaction, deferred video playback, focus/touch targets, contrast treatment, and console errors.
- Run five mobile Lighthouse audits against the same local production server and report the median category scores and metrics.
- Do not claim deployed SEO or telemetry results until the merged build is deployed and audited at `https://koolstudio.pl/pl`.

## Success Criteria

- Coral remains exactly `#FC3117`.
- No carousel, navigation, locale switching, video playback, or page-transition regression.
- Accessibility audit has no contrast, target-size, or label-content-name failure from the identified elements.
- Initial homepage payload no longer includes the entire reel, all carousel images, or carousel route prefetches.
- Median local Performance materially improves from 73; Accessibility and Best Practices target 100.
- Full project verification passes and remaining deductions, if any, are supported by the new reports rather than assumptions.
