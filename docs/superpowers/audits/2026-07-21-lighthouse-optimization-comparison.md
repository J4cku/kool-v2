# Lighthouse Optimization Comparison

Date: 2026-07-21  
Audited route: `http://localhost:4173/pl`  
Audited site commit: `03f4ca501d59224d2343e8a0ea4e3748669538c9`  
Lighthouse: `13.4.1`, mobile defaults, five sequential runs against one `pnpm start` process

## Category scores

| Report | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 73 | 91 | 96 | 92 |
| Optimized run 1 | 83 | 100 | 100 | 92 |
| Optimized run 2 | 83 | 100 | 100 | 92 |
| Optimized run 3 | 83 | 100 | 100 | 92 |
| Optimized run 4 | 83 | 100 | 100 | 92 |
| Optimized run 5 | 83 | 100 | 100 | 92 |
| Optimized median | 83 | 100 | 100 | 92 |
| Median delta | +10 | +9 | +4 | 0 |

Accessibility and Best Practices have no remaining failed weighted audits in any optimized run.

## Metric medians

Lower is better for every timed metric and CLS.

| Metric | Baseline | Optimized median | Delta | Change |
| --- | ---: | ---: | ---: | ---: |
| First Contentful Paint | 908.871 ms | 904.862 ms | -4.010 ms | -0.44% |
| Largest Contentful Paint | 7,638.946 ms | 4,705.099 ms | -2,933.847 ms | -38.41% |
| Total Blocking Time | 33.500 ms | 12.000 ms | -21.500 ms | -64.18% |
| Cumulative Layout Shift | 0 | 0 | 0 | 0% |
| Speed Index | 4,445.635 ms | 1,371.231 ms | -3,074.404 ms | -69.16% |

## Requests and payload

| Resource | Baseline | Optimized median | Delta | Change |
| --- | ---: | ---: | ---: | ---: |
| Total network requests | 83 | 46 | -37 | -44.58% |
| Transfer bytes | 2,960,380 B | 830,267 B | -2,130,113 B | -71.95% |
| Images | 19 | 9 | -10 | -52.63% |
| Fonts | 28 | 14 | -14 | -50.00% |
| Media | 1 | 0 | -1 | -100.00% |
| `text/x-component` responses | 14 | 5 | -9 | -64.29% |

The baseline loaded `/videos/reel.mp4` for 1,512,897 transfer bytes. None of the five optimized initial loads requested the reel. The five remaining `text/x-component` responses in each optimized report all target the current `/pl` route; offscreen project route prefetches are absent.

## Environment

All reports used Lighthouse `13.4.1` and `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36`.

| Report | Fetch time (UTC) | Benchmark index |
| --- | --- | ---: |
| Baseline | 2026-07-21T15:36:08.279Z | 2889.0 |
| Optimized run 1 | 2026-07-21T16:31:18.775Z | 2885.5 |
| Optimized run 2 | 2026-07-21T16:31:30.355Z | 2610.0 |
| Optimized run 3 | 2026-07-21T16:31:41.882Z | 2896.0 |
| Optimized run 4 | 2026-07-21T16:31:53.408Z | 2882.0 |
| Optimized run 5 | 2026-07-21T16:32:04.974Z | 2897.5 |

## Remaining failed weighted audits

Every optimized run has the same two remaining audit IDs:

| Category | Audit | Weight | Optimized score | Observation |
| --- | --- | ---: | ---: | --- |
| Performance | `largest-contentful-paint` | 25 | 0.31–0.32 | Median LCP is 4.705 s, improved from 7.639 s but still above the passing threshold. |
| SEO | `canonical` | 1 | 0 | The audit was run on localhost while the page declares the production canonical `https://koolstudio.pl/pl`. |

The canonical result is a localhost caveat, not a deployed-origin measurement. Lighthouse reports that the canonical points to another hreflang location when the document URL is `http://localhost:4173/pl`; the deployed `https://koolstudio.pl/pl` origin must be audited separately to validate production canonical behavior.

The baseline additionally failed `speed-index`, `color-contrast`, `target-size`, and `errors-in-console`; those weighted failures are absent from all five optimized reports.
