# Image Quality Performance Budget Design

## Goal

Preserve high-fidelity portfolio photography without reducing the Lighthouse performance median established by the rebased optimization branch.

## Constraints

- Treat zero Lighthouse performance regression as a hard acceptance gate.
- Preserve the source images and their original framing.
- Keep responsive `sizes` accurate so high-density displays receive enough pixels without downloading viewport-wide assets unnecessarily.
- Do not introduce a global quality increase or a new output format in this change.
- Keep the existing request-timing optimizations: only the first carousel image is eager/high priority, later slides remain lazy, and below-fold video stays deferred.

## Evidence

The current Next.js configuration permits quality levels 75 and 90. Representative local optimizer requests showed that quality 90 increased transferred bytes by 84–88 percent over quality 75:

| Sample | Quality 75 | Quality 90 | Increase |
| --- | ---: | ---: | ---: |
| Homepage image at 1200 px | 109,683 B | 201,755 B | 84% |
| Project card at 640 px | 39,291 B | 72,810 B | 85% |
| Studio image at 1080 px | 106,642 B | 199,914 B | 87% |

The rebased branch changes when images load, not their encoding quality. Its current quality policy already provides the intended balance:

- Quality 90 for full-screen project heroes and full-width/detail project imagery.
- Default quality 75 for homepage carousel images, project cards, studio/offer images, logos, and secondary or padded imagery.
- Responsive `sizes` aligned with the one/two/three-column homepage breakpoints and project layouts.

## Design

Keep the production image rendering unchanged and encode the policy as regression coverage.

Add a focused source-contract test that verifies:

- `next.config.mjs` allows exactly the 75 and 90 quality tiers.
- `ProjectHero` uses quality 90 and a `100vw` responsive size.
- Full-width and full-bleed project imagery in `ProjectContent` uses quality 90.
- The homepage carousel retains its accurate one/two/three-column `sizes` expression, keeps its first image eager/high priority, and leaves subsequent images lazy.
- Homepage carousel and project-card images do not opt into quality 90.

The test documents the deliberate distinction between presentation images and navigational thumbnails. It prevents a future Lighthouse pass from silently lowering project-detail quality, and prevents a blanket quality increase from inflating the critical path.

## Verification

1. Run the new test in a red/green cycle.
2. Run `pnpm check` for tests, typecheck, lint, i18n parity, and production build.
3. Compare rendered homepage and project-detail imagery at mobile and desktop widths.
4. Run five mobile Lighthouse audits against the deployed Polish homepage and calculate the median.
5. Accept the change only when the median performance score does not fall below the rebased runtime baseline. Because the implementation is test-only, any measured regression is treated as audit variance and must be rerun or investigated rather than accepted.

## Excluded Approaches

- Global quality 90: rejected because representative payloads nearly doubled.
- AVIF-first output: deferred because its cold-cache encoding cost conflicts with the zero-regression requirement.
- Source-image recompression: excluded because the existing 1440-pixel project thumbnails are adequate and recompression risks changing the approved visual assets.
