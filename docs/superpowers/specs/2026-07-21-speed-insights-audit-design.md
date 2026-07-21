# Speed Insights and Lighthouse Baseline Design

## Goal

Enable Vercel Speed Insights for every localized page and capture a production Lighthouse baseline before any performance optimization work begins.

## Integration

- Add `@vercel/speed-insights` as a production dependency with pnpm.
- Import `SpeedInsights` from `@vercel/speed-insights/next` in `app/[locale]/layout.tsx`.
- Render `<SpeedInsights />` beside the existing Vercel `<Analytics />` component so it covers both locales and all routes.
- Keep the integration independent of page content, translations, and visual components.

## Verification

- Run `pnpm check` to verify typechecking, lint, translation parity, and the production build.
- Run Lighthouse against the Polish homepage served from a local production build.
- Capture the category scores and key performance metrics as the baseline for a later optimization task.
- Do not make performance fixes in this change.

## Operational Notes

Speed Insights reports field data after deployment and dashboard enablement. It does not directly improve Lighthouse results. Lighthouse provides a synthetic point-in-time baseline; later work should use both sources when prioritizing fixes.
