# WebMCP Evaluation Log

## PR 64 integration verification

- Integrated current `origin/main` (`58ba68c`) while preserving WebMCP and the controlled enquiry lifecycle, main's consent-gated Meta browser/CAPI conversions, and main's exact dependency versions. Conversion tracking remains owned by the persistent modal; draft preparation and fallback do not emit a Lead event.
- Installed the integrated frozen lockfile successfully. `pnpm check` with Next.js 16.3.7 exited `0`: 196/196 Vitest tests, 69/69 Node tests, typecheck, lint, 466-key translation parity, and the default Turbopack build with 58/58 pages passed. The earlier local build restriction below no longer blocks the integrated branch.
- Independent integration review and 78 focused tests passed against the installed dependencies. One earlier focused run during dependency replacement failed the dismissed-success preparation test; the full gate and fresh focused reruns passed. The conversion regression additionally checks close/reopen/dismiss/reprepare without duplicating the Lead event.

## 2026-10-06 integration verification

The evidence below applies to the current local working tree, not a deployed release. Earlier phase records remain historical.

- Native discovery and invocation were performed through the Codex desktop in-app browser's document-bound WebMCP capability against `http://localhost:55991` using `pnpm dev`. No polyfill or mocked registration API was substituted.
- `/en` exposed exactly the two production tools plus the development diagnostic tool. Search was classified read-only and preparation state-changing.
- English search `{category: "residential", location: "Wroclaw", targetAreaM2: 85, limit: 2}` returned three total matches and two results, including the 84 m² Walecznych apartment. Results included canonical category/type/features, localized published scope, localhost navigation URLs, production `canonicalUrl`, and localized match reasons.
- Preparing `{projectType: "mieszkanie", area: "85"}` on `/en` returned `navigate_to_contact`, `http://localhost:55991/en/kontakt#brief`, and `submitted: false`.
- On `/en/kontakt#brief`, preparation with an 85 m² apartment, Wrocław, and a synthetic verification requirement returned `prepared`, `opened: true`, missing recommended fields, and `submitted: false`. Browser inspection confirmed those values in the visible form; name/email remained empty. The submit control was never invoked.
- Switching to Polish through the visible locale control replaced the English registrations with exactly one Polish registration per tool. Polish search returned localized scope/reasons and a `/pl/projekty/...` localhost navigation URL.
- Polish preparation returned `prepared` and `submitted: false`; browser inspection confirmed apartment/Wrocław/85 in the visible form.
- The diagnostic tool returned only support, locale, and tool registration names/states. All three were `registered`; page title, pathname, input arguments, and arbitrary error messages were absent.
- The debug definition includes the progressive `debugging` annotation described in [Chrome's imperative API documentation](https://developer.chrome.com/docs/ai/webmcp/imperative-api), which documents support from Chrome 156. This browser's manifest did not expose that annotation; filtering by it is not claimed verified.
- The same browser was then checked against `PORT=55991 pnpm start` serving the successful Webpack production build. `/pl/kontakt` exposed exactly the two production tools with the expected read-only classification; the diagnostic tool was absent. Native search returned the rich localized facts/current-origin links, and preparation populated the visible form with `submitted: false`. Switching through the locale control to `/en/kontakt` yielded exactly the two English registrations.
- `pnpm check` passed 182/182 Vitest tests, 58/58 Node tests, typecheck, lint, and 466-key i18n parity, but exited `1` at the build: the sandbox first blocked Google Fonts fetching, and the escalated rerun encountered Turbopack's OS worker-port binding restriction. An escalated standalone `pnpm build` reproduced that port restriction. The default gate is not claimed passed.
- Supported fallback `pnpm build --webpack` exited `0`, compiled/typechecked successfully, and generated 58/58 pages. Independent code review approved the scoped changes; independent focused tests passed 75 WebMCP/provider tests and 12 project-search tests. `git diff --check` exited `0`.
- Production deployment, Chrome origin-trial activation, ChatGPT account/model eligibility, and autonomous natural-language tool selection remain unverified. Successful local manual invocation does not establish those properties.
- User-reported Chrome verification: enabling the local WebMCP testing flag made all three development tools visible in Chrome DevTools; the user subsequently confirmed manual execution worked. This is user-reported evidence, distinct from the agent-observed Codex browser checks above.

## Current implementation behavior

- Browser navigation stays on the current document origin; non-browser execution falls back to the canonical site origin. Search separately preserves the published source as `canonicalUrl`.
- Search includes category, project type, curated objective features, and localized published scope, excluding long descriptions and galleries. The current maximal five-result regression fixture is capped at 4,500 serialized characters in both locales; this is a fixture regression budget, not a universal bound for future catalog data.
- Registration handles synchronous exceptions and asynchronous rejection, frees failed names, isolates diagnostic callbacks, and prevents stale completion/rejection/cleanup from changing a newer registration. Registrations are isolated by model context.
- Production registration warnings contain only the tool name and fixed `registration_failed` code. Diagnostic state never stores tool arguments or exception text. The debug tool remains development/explicit-opt-in only.

## Phase 4 availability evidence

- RED: the prescribed availability command exited `1` with 9 passing and exactly 2 failing provider tests: the obsolete base-gate export was still present and a configured origin-trial token produced no meta.
- GREEN: `pnpm vitest run components/WebMcpProvider.test.tsx && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/webmcp-config.test.ts` exited `0`; Vitest passed 11/11 and Node passed 2/2, including the exact `Origin-Agent-Cluster: ?1` assertion.
- Focused integration: `pnpm vitest run components/WebMcpProvider.test.tsx components/kontakt/BriefModal.test.tsx lib/webmcp/tools/prepare-project-inquiry.test.ts` exited `0`; 53/53 tests passed.
- Safety search: the prescribed ripgrep command found no forbidden runtime submission tool, imperative DOM submission call, or obsolete base flag in the requested runtime/config/documentation scope; ripgrep exited `1`, its expected no-match status.
- Full repository gate: `pnpm check` on 2026-08-27 (Europe/Warsaw) exited `0` against the Phase 4 implementation tree later committed as `def6b8707f2d2fbedc45f1111db5a763aa1d63ed`; Vitest passed 158/158 tests, Node passed 58/58 tests, typecheck, lint, and i18n parity passed, 466 translation keys matched, and the production build generated 58/58 static pages.
- Evidence packaging: `10df53e9ca5d98e147511f7a42cebf7d057533bf` added only the Task 3 report after that full check. It did not change the tested runtime, configuration, or tests and is not presented as the tested implementation snapshot.
- Review correction: `pnpm check` was rerun against exact docs-only commit `4b38e2aede274520426b01f7de1e0cee1bbdae67` and exited `0` with the same 158/158 Vitest, 58/58 Node, typecheck, lint, 466-key i18n, and 58/58-page build results. Later evidence text that records this SHA does not alter the tested runtime, configuration, tests, or browser procedure.
- Native browser discovery was not run in this workspace; the setup and prompts below are the reproducible follow-up procedure.

## ChatGPT desktop Site tools procedure

Use [OpenAI's Site tools procedure](https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app). Site tools are currently available only in the ChatGPT desktop app's built-in browser, not in Chrome, and only when the account and selected model support them. A matching tool must also be available on the current page.

1. In the ChatGPT desktop app, confirm Browser settings → Permissions → **Enable site tools** is on, choose a model eligible for Site tools on the current account, and open the built-in browser from the app toolbar.
2. Open a deployed `/pl` or `/en` page in that built-in browser. Eligible accounts need no Chrome flag, extension, origin-trial token, or separate connection.
3. If the address-bar Site tools arrow appears, open it and confirm the production manifest contains `kool_find_projects` as read-only and `kool_prepare_project_inquiry` as state-changing. `kool_webmcp_debug` may additionally appear only when its explicit debug configuration is enabled.
4. Run a safe prompt below. Review the website-access prompt, then confirm the visible form/result boundary described under **Expected production manifest**.

If the Site tools arrow does not appear, first verify desktop built-in-browser usage, account rollout/eligibility, selected-model support, the Site tools permission, and that the current page exposes a matching tool. Absence on an ineligible account/model is not evidence of a kool studio registration failure.

## Chrome 149 WebMCP procedure

Use [Chrome's official WebMCP procedure](https://developer.chrome.com/docs/ai/webmcp). Chrome 149 requires one activation path and the official inspector for discovery/manual execution:

1. For local testing, enable `chrome://flags/#enable-webmcp-testing` and relaunch Chrome. For preview or production testing without that flag, register the exact origin for the Chrome origin trial, configure its matching server-only `WEBMCP_ORIGIN_TRIAL_TOKEN`, and redeploy. A token for one preview hostname does not activate another preview hostname or production.
2. Install and use the official **Model Context Tool Inspector** extension linked from Chrome's WebMCP documentation.
3. Open a locale-prefixed page and evaluate `document.modelContext` in DevTools. An object means the page API is available; `undefined` means Chrome is not activated/supported in that environment, not that kool studio registration failed.
4. In the Inspector, confirm the registered manifest contains `kool_find_projects` and `kool_prepare_project_inquiry` with parseable schemas. `kool_webmcp_debug` may additionally appear only when its debug configuration is enabled.
5. Use the Inspector to manually invoke search and preparation with non-sensitive test data. Confirm structured output, visible form population, `submitted: false`, and no email, mailto navigation, or form submission.

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

## Historical Phase 2 native browser status

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

## Phase 2 rollout status

- Phase 2 commit SHA tested: `1aae340e380f14b1d146f4f16e621ad90ae01c13`.
- Production enablement: not performed.
- Deployment: not performed.
- Known limitation: native discovery and agent selection remain unverified unless evidence is recorded above. `document.modelContext === undefined` in an ordinary unsupported browser is expected and cannot supply that evidence.
