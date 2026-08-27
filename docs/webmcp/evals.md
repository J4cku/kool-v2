# WebMCP Evaluation Log

## Phase 4 availability evidence

- RED: the prescribed availability command exited `1` with 9 passing and exactly 2 failing provider tests: the obsolete base-gate export was still present and a configured origin-trial token produced no meta.
- GREEN: `pnpm vitest run components/WebMcpProvider.test.tsx && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/webmcp-config.test.ts` exited `0`; Vitest passed 11/11 and Node passed 2/2, including the exact `Origin-Agent-Cluster: ?1` assertion.
- Focused integration: `pnpm vitest run components/WebMcpProvider.test.tsx components/kontakt/BriefModal.test.tsx lib/webmcp/tools/prepare-project-inquiry.test.ts` exited `0`; 53/53 tests passed.
- Safety search: the prescribed ripgrep command found no forbidden runtime submission tool, imperative DOM submission call, or obsolete base flag in the requested runtime/config/documentation scope; ripgrep exited `1`, its expected no-match status.
- Full repository gate: `pnpm check` on 2026-08-27 (Europe/Warsaw) exited `0`; Vitest passed 158/158 tests, Node passed 58/58 tests, typecheck, lint, and i18n parity passed, 466 translation keys matched, and the production build generated 58/58 static pages.
- Native browser discovery was not run in this workspace; the setup and prompts below are the reproducible follow-up procedure.

## Reproducible browser setup

1. ChatGPT's in-app browser supports WebMCP out of the box. Open a deployed `/pl` or `/en` page; no Chrome flag or origin-trial token is needed.
2. For local Chrome 149 testing, enable `chrome://flags/#enable-webmcp-testing`, relaunch Chrome, start the site, and open a locale-prefixed page.
3. For Chrome 149 preview or production testing without the local flag, register each exact origin for the trial, configure its matching server-only `WEBMCP_ORIGIN_TRIAL_TOKEN`, and redeploy. A token for one preview hostname does not activate another preview hostname or production.
4. In DevTools, evaluate `document.modelContext`. An object means the API is available to the page. `undefined` means the environment is unsupported, not that kool studio registration failed.
5. In the browser's Site tools surface, confirm the production manifest contains exactly `kool_find_projects` and `kool_prepare_project_inquiry`. `kool_webmcp_debug` may additionally appear in development or with `NEXT_PUBLIC_WEBMCP_DEBUG=true`.
6. Invoke preparation only with non-sensitive test data. Confirm the ordinary visible form opens and is populated, the tool result says `submitted: false`, and no email, mailto navigation, or form submission occurs.

There is no automatic submission tool. Evaluation must stop at the populated visible form; only a person may review and press its ordinary submit button.

## Expected production manifest

| Name | Read-only hint | Expected effect |
| --- | --- | --- |
| `kool_find_projects` | `true` | Returns canonical portfolio matches without changing UI or external state. |
| `kool_prepare_project_inquiry` | `false` | Atomically opens/populates the visible enquiry form and returns `submitted: false`; it never contacts the studio. |

## Phase 2 automated evidence

- Full repository gate: `pnpm check` on 2026-08-26 (Europe/Warsaw), exit code `0`. Vitest passed 86/86 tests in 7 files; Node passed 61/61 tests; typecheck, lint, and i18n parity passed; 423 translation keys matched; the production build generated 58/58 static pages.
- Complete diff checks: `git diff --check origin/main...HEAD`, `git diff --name-status origin/main...HEAD`, `git diff origin/main...HEAD -- package.json pnpm-lock.yaml`, and `git status --short` each exited `0`. The dependency diff contained only the existing `webmcp-types` `0.1.5` development dependency and no runtime dependency; the working tree was clean.
- HTTP checks against the enabled production server on `http://127.0.0.1:55990`: the header command exited `0` and returned `Origin-Agent-Cluster: ?1`; `/pl` returned `200`; `/en/projekty` returned `200`; `/pl/route-that-does-not-exist` returned `404`. Each status command exited `0`.
- Payload budget from the maximal current five-result catalog fixture: Polish serialized output was 1,499 characters and 1,536 UTF-8 bytes; English serialized output was 1,462 characters and 1,478 UTF-8 bytes. `pnpm exec vitest run lib/webmcp/tools/find-projects.test.ts --reporter=verbose` exited `0` with 12/12 tests passing.

## Native browser status

- Unverified — no supported native-WebMCP browser context was connected.
- The available browser tooling exposed ordinary Playwright only; it was not substituted for native WebMCP discovery.
- `window.originAgentCluster` was not observed in a supported native browser. The HTTP header observation is recorded separately above.
- The Site tools manifest and read-only classification were not observed.
- `/pl` to `/en` cleanup and re-registration were not observed.

## Prompt evaluations

These prompts are safe because they request search or visible-form preparation only, explicitly prohibit submission, and avoid real personal data:

- `Find residential projects in Wrocław around 85 m², then prepare—but do not submit—a visible inquiry for a similar apartment. Leave name and email empty.` — Expected: search results, then the visible form opens; result has `submitted: false` and reports missing recommended identity/contact fields.
- `Prepare the visible inquiry form for a 120 m² restaurant at concept stage with architecture, furniture, and lighting scope. Use "WebMCP Test" and "webmcp-eval@example.com". Do not submit or contact the studio.` — Expected: one atomic visible draft update, no form submission, email, analytics "started" event, or mailto navigation.
- `Znajdź projekty gastronomiczne, a następnie przygotuj widoczny formularz zapytania o lokal 200 m² na etapie koncepcji. Nie wysyłaj formularza i nie kontaktuj się ze studiem.` — Expected: Polish search and form metadata; result has `submitted: false`.
- `I am not on the contact page. Prepare—but do not submit—an inquiry for an 85 m² apartment.` — Expected: `navigate_to_contact` with the localized `#brief` URL and no retention of supplied values; navigate, then invoke again.
- `Prepare—but do not submit—an inquiry while the visible form is already submitting or showing a terminal result.` — Expected: `form_busy`, no mutation or dismissal of the person's state.

Search-only baseline prompts:

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
- Known limitation: native discovery and agent selection remain unverified unless evidence is recorded above. `document.modelContext === undefined` in an ordinary unsupported browser is expected and cannot supply that evidence.
