# WebMCP Project-Inquiry Preparation — Phase 4 Design

**Date:** 2026-08-27
**Status:** Approved for implementation
**Scope:** A prepare-only WebMCP adapter for the existing visible enquiry form, plus production API availability wiring

## Objective

Expose `kool_prepare_project_inquiry` as a progressive enhancement. The tool validates a partial `InquiryDraft`, opens and atomically populates the ordinary contact-page form, reports missing recommended fields, and always returns `submitted: false`. The person reviews the ordinary form and is the only actor that can submit it through the existing Resend server action or its manual mailto fallback.

This phase does not add a submission tool, call `submitBrief`, trigger form submission, send email, open a mail client, or add a second enquiry model.

## Tool contract

The stable tool name is `kool_prepare_project_inquiry`. Its discoverable description contains this exact English safety sentence in both localized descriptions:

> Populate the visible project-enquiry form without submitting or contacting kool studio.

The JSON Schema is an object with `additionalProperties: false`. Every property is optional so an agent can incrementally prepare a draft. It exposes the canonical `InquiryDraft` fields: bounded strings, the existing project/stage/scope enum keys, and `language: pl | en`. It accepts neither submission mechanics (`company`, `ts`) nor authorization/consent controls.

Execution must:

1. honor cancellation before and after every application boundary;
2. parse untrusted input with `parseInquiryDraftPatch`;
3. reject structural, unknown-field, length, and option errors without changing UI;
4. locate the currently mounted contact-page preparation handler;
5. atomically apply the parsed patch with `applyInquiryDraftPatch`;
6. initialize the existing stable anti-spam timestamp, open the dialog, and retain the page-scoped draft;
7. compute missing recommended fields with `getMissingRecommendedInquiryFields`;
8. return compact JSON with status, contact URL, missing field names, and `submitted: false` without echoing any supplied personal or project values.

Annotations are `{ readOnlyHint: false }`: the tool mutates visible UI state, although it is non-destructive and performs no external write.

## Page availability and bridge

The shared locale layout continues registering the tool on every page so agents can discover it before navigating. `BriefModal` remains page-scoped to `/kontakt`; it registers one in-memory handler while mounted and removes it on unmount.

The bridge is an ordinary module-local handler slot. It stores no draft and performs no navigation. When the handler is absent, execution returns `status: "navigate_to_contact"`, the localized absolute contact URL ending in `#brief`, an empty missing-field list, and `submitted: false`. The agent may navigate and invoke the tool again. Supplied values are not retained across that navigation and never enter the URL, browser storage, logs, analytics, or server state.

When the handler is available and the form is idle, invalid, or in a recoverable error state, it applies the complete patch in one operation and opens the visible form. It returns `status: "prepared"`, the missing recommended fields, and `submitted: false`.

When a submission is pending or a success/mailto terminal result is visible, the handler does not mutate or dismiss that state. It returns `status: "form_busy"`, no values, and `submitted: false`. This protects the person's in-flight or completed action.

Only one contact page can be mounted in the current application shell. Registration cleanup is identity-safe so an obsolete unmount cannot remove a newer handler.

## Human submission boundary

The preparation bridge has no reference to `submitBrief`, `formAction`, the form element, its submit button, or the mailto navigator. It may call the existing modal-opening function, which retains the argument-free `contact_form_opened` event. It must not fire `contact_form_started`; that event remains tied to a person's first meaningful control interaction.

Privacy consent and send authorization remain untouched. The current product uses an informational privacy notice rather than a consent checkbox; Phase 4 does not invent or pre-check one. There is no `kool_submit_project_inquiry` registration.

## Browser and deployment availability

WebMCP registration becomes always attempted and feature-detected. Remove the production `NEXT_PUBLIC_WEBMCP_ENABLED` gate: supported browsers register the production tools, while unsupported browsers continue rendering the ordinary site with no error. The debug tool remains development-only unless `NEXT_PUBLIC_WEBMCP_DEBUG=true`.

Chrome 149 requires either its local `chrome://flags/#enable-webmcp-testing` flag or an origin-trial token. Add optional `WEBMCP_ORIGIN_TRIAL_TOKEN` server configuration and render it as `<meta http-equiv="origin-trial">` before the client provider executes. Tokens are origin-specific; the repository cannot supply a real token. Document that production and preview origins need matching registrations. Keep `Origin-Agent-Cluster: ?1` and the default `tools=(self)` permissions behavior.

## Localization

Add `webmcp.projectInquiry` copy in Polish and English for title, description, every schema property, and status guidance. Wire enum choice titles to the existing human-form option labels rather than introducing a parallel vocabulary. Translation key parity remains mandatory.

The structured result uses stable machine values for `status` and missing field names. The contact URL follows the current tool locale (`/pl/kontakt#brief` or `/en/kontakt#brief`).

## Verification

Automated tests must prove:

- exact name, write classification, localized metadata, schema bounds, and enum keys;
- runtime rejection is atomic and does not leak input values in results/errors;
- unavailable, prepared, busy, and cancelled executions;
- bridge identity-safe registration and cleanup;
- contact modal opens with an atomically merged controlled draft, preserves omitted fields, does not mark the form started, and does not submit or navigate to mailto;
- provider registers search and prepare in production without a base flag, while debug retains its gate;
- an origin-trial meta tag appears only when configured;
- neither source nor the registered manifest contains `kool_submit_project_inquiry`.

Run focused Vitest tests during TDD, then `pnpm check`. Browser QA requires a WebMCP-capable in-app browser or Chrome 149 with the testing flag/origin trial; `document.modelContext === undefined` in an unsupported browser is an environment limitation, not a registration failure.
