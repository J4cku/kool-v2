# WebMCP Evaluation Log

## Phase 2 automated evidence

- Full repository gate: `pnpm check` on 2026-08-26 (Europe/Warsaw), exit code `0`. Vitest passed 86/86 tests in 7 files; Node passed 61/61 tests; typecheck, lint, and i18n parity passed; 423 translation keys matched; the production build generated 58/58 static pages.
- Focused provider-gate evidence: `pnpm exec vitest run components/WebMcpProvider.test.tsx` on 2026-08-27 (Europe/Warsaw), exit code `0`; 1/1 test file and 9/9 tests passed. Its production assertions verified that base `false` registers neither `kool_find_projects` nor `kool_webmcp_debug`, while base `true` with debug `false` registers exactly `kool_find_projects` and no debug tool.
- Complete diff checks: `git diff --check origin/main...HEAD`, `git diff --name-status origin/main...HEAD`, `git diff origin/main...HEAD -- package.json pnpm-lock.yaml`, and `git status --short` each exited `0`. The dependency diff contained only the existing `webmcp-types` `0.1.5` development dependency and no runtime dependency; the working tree was clean.
- Enabled production build: `NEXT_PUBLIC_WEBMCP_ENABLED=true NEXT_PUBLIC_WEBMCP_DEBUG=false pnpm build` on 2026-08-27 (Europe/Warsaw), exit code `0`; 58/58 static pages generated.
- Default-off production build: `NEXT_PUBLIC_WEBMCP_ENABLED=false NEXT_PUBLIC_WEBMCP_DEBUG=false pnpm build` on 2026-08-27 (Europe/Warsaw), exit code `0`; 58/58 static pages generated. Production Site tools absence was not observed because no supported native-WebMCP browser context was connected.
- HTTP checks against the enabled production server on `http://127.0.0.1:55990`: the header command exited `0` and returned `Origin-Agent-Cluster: ?1`; `/pl` returned `200`; `/en/projekty` returned `200`; `/pl/route-that-does-not-exist` returned `404`. Each status command exited `0`.
- Payload budget from the maximal current five-result catalog fixture: Polish serialized output was 1,499 characters and 1,536 UTF-8 bytes; English serialized output was 1,462 characters and 1,478 UTF-8 bytes. `pnpm exec vitest run lib/webmcp/tools/find-projects.test.ts --reporter=verbose` exited `0` with 12/12 tests passing.

## Native browser status

- Unverified — no supported native-WebMCP browser context was connected.
- The available browser tooling exposed ordinary Playwright only; it was not substituted for native WebMCP discovery.
- `window.originAgentCluster` was not observed in a supported native browser. The HTTP header observation is recorded separately above.
- The Site tools manifest and read-only classification were not observed.
- `/pl` to `/en` cleanup and re-registration were not observed.
- Default-off production tool absence was not observed.

## Prompt evaluations

- `Find residential projects in Wrocław around 85 m².` — Not run — native discovery and agent selection remain unverified.
- `Show pre-war apartment projects in Wroclaw.` — Not run — native discovery and agent selection remain unverified.
- `Find commercial food-and-beverage projects around 300 m², limit 3.` — Not run — native discovery and agent selection remain unverified.
- `Show projects whose published scope includes lighting design.` — Not run — native discovery and agent selection remain unverified.
- `I'm renovating an 85 m² pre-war apartment in Wrocław. Which published kool projects share those factual characteristics?` — Not run — native discovery and agent selection remain unverified.
- `We have a post-industrial hospitality venue. Does the portfolio contain any food or drink spaces in a post-industrial building?` — Not run — native discovery and agent selection remain unverified.
- `Znajdź mieszkania we Wrocławiu o powierzchni około 85 m².` — Not run — native discovery and agent selection remain unverified.
- `Pokaż projekty w przedwojennych budynkach.` — Not run — native discovery and agent selection remain unverified.
- `Znajdź komercyjne projekty gastronomiczne około 300 m².` — Not run — native discovery and agent selection remain unverified.
- `Which project proves kool can meet my 200,000 PLN budget?` — Not run — native discovery and agent selection remain unverified.
- `Is kool available next month?` — Not run — native discovery and agent selection remain unverified.
- `What is the weather in Wrocław?` — Not run — native discovery and agent selection remain unverified.
- `Find a pre-war hotel in Gdańsk.` — Not run — native discovery and agent selection remain unverified.

## Rollout status

- Commit SHA tested: `1aae340e380f14b1d146f4f16e621ad90ae01c13`.
- Production enablement: not performed.
- Deployment: not performed.
- Known limitation: native discovery and agent selection remain unverified unless evidence is recorded above.
