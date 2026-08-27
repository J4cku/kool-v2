# WebMCP Repository Findings

## Runtime and deployment

- Next.js 16 App Router, React 19, TypeScript, pnpm.
- Locale-prefixed `pl` and `en` routes are rendered below `app/[locale]`.
- Vercel is the production deployment platform.
- `app/[locale]/layout.tsx` is the shared server layout and the integration point for a renderless client provider. It renders the optional server-only `WEBMCP_ORIGIN_TRIAL_TOKEN` as the first first-party `<meta http-equiv="origin-trial">` in `<head>`.
- Production tools are always attempted and rely on native feature detection. `NEXT_PUBLIC_WEBMCP_DEBUG=true` enables the diagnostic tool outside development; development enables it automatically.
- `Origin-Agent-Cluster: ?1` remains an exact catch-all response header, and the browser's default `tools=(self)` permissions behavior remains unchanged.

## Browser availability and deployment

- ChatGPT's in-app browser supports WebMCP out of the box; it does not need the Chrome testing flag or this site's origin-trial token.
- Chrome 149 requires either the local `chrome://flags/#enable-webmcp-testing` flag or a valid origin-trial token. Enable the flag and relaunch Chrome for local testing.
- Origin-trial tokens are origin-specific. Register and configure a matching token separately for every preview and production origin, then set `WEBMCP_ORIGIN_TRIAL_TOKEN` as a server-only deployment variable. The repository intentionally contains no token.
- In a supported page context, `document.modelContext` is present. If it is `undefined`, the browser/environment does not support WebMCP; that result is not a kool studio tool-registration failure.

## Production tool manifest

| Tool | Classification | Boundary |
| --- | --- | --- |
| `kool_find_projects` | Read-only | Searches only canonical published portfolio facts. |
| `kool_prepare_project_inquiry` | Visible UI mutation, non-destructive | Opens and populates the ordinary enquiry form; always reports `submitted: false`. |

There is permanently no automatic inquiry-submission tool. WebMCP cannot submit the form, trigger its submit control, send email, or open the mail client; a person must review and submit through the visible form. `kool_webmcp_debug` is diagnostic-only and appears in development or when the explicit debug flag is enabled.

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

## WebMCP files

- Native adapters live under `lib/webmcp/`.
- The renderless `components/WebMcpProvider.tsx` is mounted from `app/[locale]/layout.tsx`.
- `next.config.mjs` adds `Origin-Agent-Cluster: ?1`.
- Deterministic unit and configuration tests cover registration, schemas, execution, UI preparation, and deployment wiring.

## Preserved boundaries

- Do not build a second enquiry form or backend; preparation reuses the existing controlled form and validation model.
- Do not use PostHog feature flags for WebMCP rollout.
- Do not claim portfolio matching on metadata that is not canonical.
- Do not add an automatic submission tool.
