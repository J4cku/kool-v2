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
