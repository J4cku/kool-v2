# WebMCP Repository Findings

## Runtime and deployment

- Next.js 16 App Router, React 19, TypeScript, pnpm.
- Locale-prefixed `pl` and `en` routes are rendered below `app/[locale]`.
- Vercel is the production deployment platform.
- `app/[locale]/layout.tsx` is the shared server layout and the integration point for a renderless client provider. It renders the optional server-only `WEBMCP_ORIGIN_TRIAL_TOKEN` as the first first-party `<meta http-equiv="origin-trial">` in `<head>`.
- Production tools are always attempted and rely on native feature detection. `NEXT_PUBLIC_WEBMCP_DEBUG=true` enables the diagnostic tool outside development; development enables it automatically.
- `Origin-Agent-Cluster: ?1` remains an exact catch-all response header, and the browser's default `tools=(self)` permissions behavior remains unchanged.

## Browser availability and deployment

- [ChatGPT Site tools](https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app) use WebMCP only in the ChatGPT desktop app's built-in browser, not Chrome. The built-in browser needs no separate connection, Chrome flag, extension, or site origin-trial token, but Site tools appear only when the account rollout, selected model, Site tools permission, current page, and matching tool are eligible.
- [Chrome 149 WebMCP](https://developer.chrome.com/docs/ai/webmcp) requires either the local `chrome://flags/#enable-webmcp-testing` flag or a valid origin-trial token. Chrome manifest inspection and manual invocation use the official Model Context Tool Inspector extension linked from that documentation, not ChatGPT's Site tools UI.
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
- Existing deterministic fields include slug, title, location, category, status, year, textual area, numeric `areaM2`, `projectType`, curated `objectiveFeatures`, scope, and localized copy.
- Building-era facts are canonical curated values within `objectiveFeatures` (`pre_war_building`, `modernist_building`, and `post_industrial_building`); search may match only the values explicitly assigned to each project.

## Existing enquiry flow

- `components/kontakt/BriefForm.tsx` renders named localized inputs.
- `lib/brief.ts` owns shared normalization and validation.
- `app/[locale]/kontakt/actions.ts` sends through Resend and falls back to mailto.
- `components/kontakt/BriefModal.tsx` owns dialog visibility and is mounted unconditionally by `app/[locale]/kontakt/KontaktPage.tsx`; the contact brief modal is always available.
- The former PostHog `brief-form` gate has been removed. WebMCP and contact-form availability do not depend on PostHog feature flags.

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
