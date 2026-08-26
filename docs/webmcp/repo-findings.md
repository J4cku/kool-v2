# WebMCP Repository Findings

## Runtime and deployment

- Next.js 16 App Router, React 19, TypeScript, pnpm.
- Locale-prefixed `pl` and `en` routes are rendered below `app/[locale]`.
- Vercel is the production deployment platform.
- `app/[locale]/layout.tsx` is the shared server layout and the integration point for a renderless client provider.

## Portfolio source

- `data/projects.ts` is canonical.
- Existing deterministic fields: slug, title, location, category, status, year, textual area, scope, and localized copy.
- Missing deterministic search fields: curated building-era and objective-feature tags. Later search must not infer or claim them until added explicitly.

## Existing enquiry flow

- `components/kontakt/BriefForm.tsx` renders named localized inputs.
- `lib/brief.ts` owns shared normalization and validation.
- `app/[locale]/kontakt/actions.ts` sends through Resend and falls back to mailto.
- `components/kontakt/BriefModal.tsx` owns dialog visibility.
- The current PostHog `brief-form` gate is known to fail closed in production, so WebMCP rollout will not depend on PostHog flags.

## Verification and observability

- Vitest/jsdom covers component and hook tests.
- Node's test runner covers `tests/*.test.ts`.
- `pnpm check` runs tests, typecheck, lint, i18n parity, and build.
- PostHog analytics is initialized in `instrumentation-client.ts`; WebMCP Phase 0–1 adds no analytics.

## Phase 0–1 files

- Add a native adapter under `lib/webmcp/`.
- Add a renderless `components/WebMcpProvider.tsx` mounted from `app/[locale]/layout.tsx`.
- Add `Origin-Agent-Cluster: ?1` through `next.config.mjs`.
- Add deterministic unit and configuration tests.

## Deviations from the supplied plan

- Do not build a new enquiry form or backend; extend the existing validated flow in a later phase.
- Do not use PostHog feature flags for WebMCP rollout.
- Do not claim portfolio matching on metadata that is not yet canonical.
- Phase 0–1 exposes only `kool_webmcp_debug`.
