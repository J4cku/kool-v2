# WebMCP Site Tools — Phase 0–1 Design

**Date:** 2026-08-26
**Status:** Approved for specification
**Scope:** Repository discovery and native WebMCP foundation only

## Objective

Add a testable, feature-gated native WebMCP foundation to the kool studio site. This first slice proves that a supported browser can discover, invoke, and cleanly unregister a site tool without changing the normal experience for unsupported browsers.

The longer-term product direction is to expose the same application logic used by people through two focused tools:

1. `kool_find_projects`, a deterministic portfolio search tool.
2. `kool_prepare_project_inquiry`, a write-to-UI tool that fills the visible enquiry form but never submits it.

Those tools are explicitly outside this slice.

## Repository Findings

The application is a Next.js 16 App Router site using React 19, TypeScript, next-intl, and Vercel. Public pages live below the always-present `pl` or `en` locale segment. The shared locale layout is `app/[locale]/layout.tsx`.

Portfolio content is canonical in `data/projects.ts`. It already provides category, location, year, textual area, scope, status, localized editorial content, and route slugs. It does not provide reliable structured tags for concepts such as “pre-war” or other objective features. Future deterministic search must either stay within the existing factual fields or add curated metadata before claiming those matches.

The enquiry workflow already exists and must be extended rather than rebuilt:

- `components/kontakt/BriefForm.tsx` renders the localized form.
- `lib/brief.ts` contains framework-independent types, normalization, validation, and email formatting.
- `app/[locale]/kontakt/actions.ts` validates the form and sends through Resend, with a mailto fallback.
- `components/kontakt/BriefModal.tsx` owns the visible dialog lifecycle, but its current PostHog feature-flag gate is known to fail closed in production.

PostHog feature flags are therefore not a valid control plane for WebMCP. WebMCP rollout will use explicit public build-time environment variables.

## Phase 0 Deliverable

Create `docs/webmcp/repo-findings.md` containing:

- framework, versions, rendering model, and deployment platform;
- portfolio and enquiry data sources;
- shared client integration point;
- current tests, analytics, and delivery flow;
- exact files proposed for later phases;
- deviations from the supplied implementation plan.

This document changes no runtime behavior.

## Phase 1 Architecture

### Integration boundary

Mount one small client component from `app/[locale]/layout.tsx`. It owns WebMCP registration for the active document and locale while leaving the layout itself server-rendered.

The proposed files are:

```text
components/WebMcpProvider.tsx
lib/webmcp/model-context.ts
lib/webmcp/tools/debug.ts
tests/webmcp-model-context.test.ts
docs/webmcp/repo-findings.md
app/[locale]/layout.tsx
next.config.mjs
package.json
pnpm-lock.yaml
```

The final names may change only if an existing repository convention makes another location clearly superior.

### Native API adapter

Use the native imperative API, `document.modelContext.registerTool(...)`, behind a thin adapter. Do not introduce an MCP server or a runtime polyfill.

The adapter will:

- feature-detect `document.modelContext?.registerTool`;
- no-op without warnings when unsupported;
- accept narrow JSON-schema tool definitions;
- pass an `AbortSignal` during registration;
- unregister on component cleanup;
- prevent duplicate live registrations by tool name;
- tolerate React Strict Mode mount, cleanup, and remount cycles;
- propagate execution cancellation to tool implementations;
- return plain JSON-serializable results;
- handle rejected registration without breaking page rendering.

Use the official `webmcp-types` package as a development-only type source. Keep any project-owned types limited to the adapter abstraction; do not duplicate the browser API declarations. No runtime package is required.

### Feature gates

WebMCP registration is enabled when either condition is true:

- the app runs in local development; or
- `NEXT_PUBLIC_WEBMCP_ENABLED=true` at build time.

The debug tool has a separate gate, `NEXT_PUBLIC_WEBMCP_DEBUG=true`, so it can be enabled on an experimental preview while remaining absent from production. Local development enables it automatically.

The provider must render nothing and must not alter analytics, cookies, navigation, accessibility, or visible UI.

### Origin isolation

Add `Origin-Agent-Cluster: ?1` consistently to application responses through `next.config.mjs`. WebMCP requires an origin-keyed agent cluster. The repository does not use `document.domain` or same-site cross-origin synchronous scripting, so no known application behavior depends on the capability this header disables.

The header must be applied consistently across normal and error responses. Its presence will be verified against the local or preview response headers, and `window.originAgentCluster` will be checked in a fresh browsing context.

### Debug tool

Register one read-only tool named `kool_webmcp_debug` while the debug gate is enabled.

Its description will make its diagnostic-only purpose explicit. It accepts no arguments (`additionalProperties: false`) and returns:

```json
{
  "supported": true,
  "locale": "pl",
  "pathname": "/pl",
  "title": "kool studio"
}
```

The exact title and pathname reflect the current page. The tool uses `annotations.readOnlyHint: true` and has no side effects.

## Error Handling

Unsupported browsers are a successful no-op. Registration failures are caught and reported only in development diagnostics; they must not throw through React or affect page rendering. Cleanup is idempotent. A tool invocation after cancellation must not continue application work.

The debug tool reads only public document state and returns no personal, analytics, or environment data.

## Tests

Add deterministic Vitest/jsdom coverage for:

- unsupported-browser no-op;
- enabled and disabled feature gates;
- registration name, description, input schema, and annotations;
- invocation output for locale and page state;
- duplicate-registration prevention;
- cleanup through `AbortController`;
- registration rejection without an unhandled error;
- Strict Mode-style register/cleanup/register behavior.

Run targeted tests while iterating. Before handoff, run `pnpm check` and inspect its exit code. Manual verification will then confirm:

1. `Origin-Agent-Cluster: ?1` is present.
2. `window.originAgentCluster` is true in a fresh supported browser context.
3. The tool appears under Site tools when the debug gate is enabled.
4. Invocation returns the visible page’s locale, path, and title.
5. The tool disappears after navigation or cleanup when its providing document is no longer active.

## Non-goals

Phase 0–1 will not:

- implement portfolio search or ranking;
- alter project metadata;
- open, populate, or submit the enquiry form;
- change the existing enquiry feature flag;
- send email or create enquiry drafts;
- add WebMCP analytics;
- enable any tool in production by default.

## Later Phases

After the debug checkpoint is verified:

1. Add curated factual project metadata and shared deterministic search logic, then expose `kool_find_projects`.
2. Refactor the existing form into controlled draft state shared with `lib/brief.ts`, then expose `kool_prepare_project_inquiry` to open and populate the visible form.
3. Keep submission human-controlled. Any later submission tool requires separate design approval, form-bound authorization, duplicate prevention, and explicit confirmation.

Each phase gets its own implementation and evaluation checkpoint.
