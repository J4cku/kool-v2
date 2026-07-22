# Lighthouse Optimization Comparison

Date: 2026-07-21

Audited route: `http://localhost:4173/pl`

Audited site commit: `e4a0d0392591800d0f5378f264ad63f21d193555`

Lighthouse: `13.4.1`, mobile defaults, five sequential runs against one `pnpm start` process

## Category scores

| Report | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 73 | 91 | 96 | 92 |
| Final run 1 | 92 | 100 | 100 | 92 |
| Final run 2 | 92 | 100 | 100 | 92 |
| Final run 3 | 90 | 100 | 100 | 92 |
| Final run 4 | 92 | 100 | 100 | 92 |
| Final run 5 | 92 | 100 | 100 | 92 |
| Final median | 92 | 100 | 100 | 92 |
| Median delta | +19 | +9 | +4 | 0 |

Accessibility and Best Practices reached 100 in every final run. Performance improved from the earlier optimized median of 83 to 92 after the residual LCP pass.

## Metric medians

Lower is better for every timed metric and CLS.

| Metric | Baseline | Final median | Delta | Change |
| --- | ---: | ---: | ---: | ---: |
| First Contentful Paint | 908.871 ms | 1,207.356 ms | +298.485 ms | +32.84% |
| Largest Contentful Paint | 7,638.946 ms | 3,310.442 ms | -4,328.504 ms | -56.66% |
| Total Blocking Time | 33.500 ms | 14.500 ms | -19.000 ms | -56.72% |
| Cumulative Layout Shift | 0 | 0 | 0 | 0% |
| Speed Index | 4,445.635 ms | 1,207.356 ms | -3,238.279 ms | -72.84% |

The observed, unthrottled LCP median was 85 ms in the final trace set. Lighthouse's Lantern mobile simulation remains the limiting score input at a 3.310 s median.

## Requests and payload

| Resource | Baseline | Final median | Delta | Change |
| --- | ---: | ---: | ---: | ---: |
| Total network requests | 83 | 31 | -52 | -62.65% |
| Transfer bytes | 2,960,380 B | 384,376 B | -2,576,004 B | -87.02% |
| Images | 19 | 3 | -16 | -84.21% |
| Fonts | 28 | 5 | -23 | -82.14% |
| Media | 1 | 0 | -1 | -100.00% |
| `text/x-component` responses | 14 | 5 | -9 | -64.29% |

The initial mobile load now requests only the logo, nav dot, and LCP hero image. Offscreen carousel and manifesto images are deferred, the showreel remains absent from the initial load, and Poppins retains all used weights without preloading every face.

## Environment

All reports used Lighthouse `13.4.1` and `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36`.

| Report | Fetch time (UTC) | Benchmark index |
| --- | --- | ---: |
| Final run 1 | 2026-07-21T18:00:31.050Z | 2307.0 |
| Final run 2 | 2026-07-21T18:00:42.827Z | 2878.0 |
| Final run 3 | 2026-07-21T18:00:55.000Z | 2860.5 |
| Final run 4 | 2026-07-21T18:01:07.199Z | 2915.0 |
| Final run 5 | 2026-07-21T18:01:18.778Z | 2782.5 |

## Remaining score limits

The final Performance score is limited by simulated LCP (`3.304–3.556 s`, score `0.62–0.69`) and a near-perfect simulated FCP score of `0.99`. Achieving a repeatable synthetic 100 would require a more invasive hero/navigation runtime redesign or deliberate metric gaming; neither is justified by the measured 79–119 ms observed LCP in four of five runs.

SEO remains 92 only because the local document correctly declares the production canonical `https://koolstudio.pl/pl`. The deployed origin must be audited separately; weakening production canonical metadata to satisfy localhost would be incorrect.

## Post-visual-restore single run

This follow-up is one mobile-default production run after the visual restoration review fixes. It does not replace or alter the historical five-run comparison above and should not be interpreted as a new median.

- Audited route: `http://localhost:55040/pl`
- Audited commit: `9f20e8a097545d52324c1f905ab0eb8f8aa4e69f`
- Lighthouse: `13.4.1`
- Fetch time: `2026-07-21T18:29:15.500Z`
- Benchmark index: `2876.5`

| Performance | Accessibility | Best Practices | SEO |
| ---: | ---: | ---: | ---: |
| 91 | 96 | 100 | 92 |

### Key audit data

| Measurement | Single-run result |
| --- | ---: |
| Simulated Largest Contentful Paint | 3,458.645 ms |
| Observed Largest Contentful Paint | 98 ms |
| Total network requests | 35 |
| Total transfer bytes | 680,907 B |
| Image requests / transfer | 7 / 335,405 B |
| Font requests / transfer | 5 / 36,323 B |
| Media requests / transfer | 0 / 0 B |

All carousel slides now exist in the initial markup so an immediately interactive Swiper cannot reveal placeholder-only slides. Only the first image is eager/high-priority; subsequent images use native lazy loading. This run therefore includes more image requests and bytes than the historical optimized median, while avoiding the previous hidden 3-second eager-image burst that occurred after the earlier Lighthouse trace ended.

### Caveats

The accessibility score is 96 because the contrast audit flags three intentionally restored coral/beige elements: the marquee text and both locale-control labels. The SEO score is 92 because the localhost audit rejects the production canonical URL; production canonical metadata should not be weakened to satisfy a localhost audit. Both caveats require validation on the deployed origin and, for contrast, an explicit design decision rather than silent palette drift.

## Post-rebase image-quality gate

This gate evaluated the image-quality policy after the rebase. Navigation imagery targets the implicit Next.js default quality of 75, while project-detail hero and full-width content imagery explicitly use quality 90. `next.config.mjs` permits both tiers, and `tests/image-quality-policy.test.ts` locks the policy without requiring runtime-neutral quality props.

### Required branch-alias gate

The baseline and both candidate attempts used Lighthouse mobile defaults and five sequential runs against `https://kool-v2-bkd0aaxfs-j4ckus-projects.vercel.app/pl`.

| Set | Performance scores | Median Performance | Median LCP | Median transfer | Performance delta | Verdict |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Baseline | `98, 84, 84, 90, 89` | 89 | 3,399.189 ms | 756,427 B | — | Reference |
| Explicit-75 candidate | `83, 83, 83, 83, 84` | 83 | 4,094.428 ms | 756,415 B | -6 | Fail |
| Single permitted rerun | `84, 90, 83, 88, 84` | 84 | 4,025.924 ms | 756,410 B | -5 | Fail |

The candidate did not pass the raw five-run zero-regression gate. The baseline was highly variable (`84–98`), but the policy does not permit accepting a negative Performance delta as noise.

### Alternating immutable-deployment diagnosis

To remove branch-alias timing ambiguity, five baseline-then-candidate pairs compared immutable deployments of `af7f68b` and `56591f1`.

| Pair | Baseline Performance | Candidate Performance | Pair delta |
| --- | ---: | ---: | ---: |
| 1 | 93 | 95 | +2 |
| 2 | 83 | 83 | 0 |
| 3 | 84 | 82 | -2 |
| 4 | 83 | 83 | 0 |
| 5 | 84 | 84 | 0 |
| Median | 84 | 83 | -1 |

The per-pair deltas were `+2, 0, -2, 0, 0`, with a median of 0. Independently calculated five-run medians remained 84 and 83, so the strict median-difference gate was still negative. Median LCP was 4,108.168 ms versus 4,124.870 ms (`+16.702 ms`), and median transfer was 769,110 B versus 769,141 B (`+31 B`).

Every normalized image request URL was identical across the paired deployments, including width and `q=75`. Every corresponding image resource size was also identical; only HTTP transfer framing varied by tens of bytes. This confirms that the explicit `quality={75}` props were equivalent to Next.js's existing default output on the audited route.

### Contingency result

Commit `e0cf249` removed the runtime-equivalent explicit 75 props while retaining the test-only 75/90 policy contract. The production diff from the pre-policy base is empty:

```bash
git diff --exit-code 45cda12..e0cf249 -- components app next.config.mjs
```

The command exits 0. The final policy therefore has no production performance or image-rendering tradeoff by construction: it preserves the approved runtime exactly and rejects the failed explicit-prop candidate rather than relabeling a negative audit delta as a pass.

### Available visual evidence

The paired Lighthouse final screenshots show the same mobile hero image, matching crop and apparent sharpness, with no blank hero or broken image. They capture different transient navbar animation positions, so they are not sufficient to prove interactive navigation behavior. The in-app browser had no available backend, and the existing Lighthouse artifacts do not cover desktop, project-card, project-detail, caption, or carousel-interaction states. Those limitations are non-blocking for this contingency because the final production runtime is identical to the already reviewed pre-policy base; no broader visual pass is claimed here.
