# WebMCP Project-Inquiry Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe, localized `kool_prepare_project_inquiry` tool that opens and prefills the existing contact form without ever submitting it.

**Architecture:** A pure tool factory validates untrusted arguments through the shared draft parser, then calls an identity-safe in-memory bridge. The contact-page `BriefModal` owns the only bridge handler and applies the patch to its controlled draft; the shared provider registers the tool globally and returns navigation guidance when the contact page is absent.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, next-intl 4, WebMCP imperative API, Vitest/Testing Library

**Spec:** `docs/superpowers/specs/2026-08-27-webmcp-project-inquiry-prepare-design.md`

## Global Constraints

- The tool description must include: `Populate the visible project-enquiry form without submitting or contacting kool studio.`
- The result always contains `submitted: false` and never echoes supplied values.
- No tool code may call `submitBrief`, `formAction`, `requestSubmit`, dispatch a submit event, click a submit button, send email, or navigate to mailto.
- Use `parseInquiryDraftPatch`, `applyInquiryDraftPatch`, and `getMissingRecommendedInquiryFields`; do not duplicate the form schema or validation logic.
- Draft values remain page-scoped memory only and never enter URLs, storage, analytics, logs, or server state.
- Registration is feature-detected and production tools are always attempted; unsupported browsers remain unaffected.
- `pnpm check` is the final gate.

---

### Task 1: Tool contract and preparation bridge

**Files:**
- Create: `lib/webmcp/inquiry-preparation.ts`
- Create: `lib/webmcp/inquiry-preparation.test.ts`
- Create: `lib/webmcp/tools/prepare-project-inquiry.ts`
- Create: `lib/webmcp/tools/prepare-project-inquiry.test.ts`

**Interfaces:**
- Consumes: `InquiryDraftPatch`, `InquiryRecommendedField`, `parseInquiryDraftPatch`, `LIMITS`, `PROJECT_TYPES`, `STAGES`, `SCOPE_ITEMS`, `Locale`, `WebMcpTool`, `BASE_URL`
- Produces: `registerInquiryPreparationHandler(handler): () => void`, `prepareProjectInquiry(patch): InquiryPreparationResult`, `createPrepareProjectInquiryTool(locale, copy): PrepareProjectInquiryWebMcpTool`

- [ ] **Step 1: Write failing bridge tests**

Cover unavailable status, forwarding to the current handler, identity-safe cleanup, and replacement registration. Results contain only `status`, `contactUrl`, `missingRecommendedFields`, `submitted`, and `opened`.

- [ ] **Step 2: Run the bridge tests and confirm RED**

Run: `pnpm vitest run lib/webmcp/inquiry-preparation.test.ts`

Expected: failure because the module does not exist.

- [ ] **Step 3: Implement the minimal bridge**

Use one module-local `{ id, handler }` slot and a monotonically increasing identity. Cleanup clears only the registration it created. The unavailable result is deterministic and stores no patch.

- [ ] **Step 4: Run the bridge tests and confirm GREEN**

Run: `pnpm vitest run lib/webmcp/inquiry-preparation.test.ts`

- [ ] **Step 5: Write failing tool tests**

Test both locales, exact tool name and `{ readOnlyHint: false }`, every schema bound/enum, optional partial input, `additionalProperties: false`, prepared/unavailable forwarding, structural and option/length rejection, no PII echo, and AbortSignal behavior.

- [ ] **Step 6: Run the tool tests and confirm RED**

Run: `pnpm vitest run lib/webmcp/tools/prepare-project-inquiry.test.ts`

Expected: failure because the tool factory does not exist.

- [ ] **Step 7: Implement the minimal tool factory**

Build the schema from canonical limits/options. Execute in this order: `signal.throwIfAborted()`, `parseInquiryDraftPatch`, `apply` validation against `createInquiryDraft(locale)` only to validate option/length boundaries without changing real state, bridge call, `signal.throwIfAborted()`, return. Error text may identify field names/codes but never values.

- [ ] **Step 8: Run focused tests and confirm GREEN**

Run: `pnpm vitest run lib/webmcp/inquiry-preparation.test.ts lib/webmcp/tools/prepare-project-inquiry.test.ts tests/inquiry-draft.test.ts`

### Task 2: Contact-modal integration and global registration

**Files:**
- Modify: `components/kontakt/BriefModal.tsx`
- Modify: `components/kontakt/BriefModal.test.tsx`
- Modify: `components/WebMcpProvider.tsx`
- Modify: `components/WebMcpProvider.test.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: Task 1 bridge and tool factory
- Produces: mounted contact-page preparation handler and global `kool_prepare_project_inquiry` registration

- [ ] **Step 1: Add failing modal integration tests**

Capture the registered bridge handler, invoke it with a valid patch, and assert the dialog opens, omitted draft values survive, supplied values update atomically, timestamp initializes, missing fields come from the resulting draft, and analytics contains `contact_form_opened` but not `contact_form_started`. Add invalid/busy tests proving no mutation, submission, or mailto navigation.

- [ ] **Step 2: Run the modal tests and confirm RED**

Run: `pnpm vitest run components/kontakt/BriefModal.test.tsx components/kontakt/BriefModal.pending.test.tsx`

- [ ] **Step 3: Register the modal handler**

Use an effect bound to current `draft`, `state`, `isPending`, `language`, and the stable `show` callback. For idle/invalid/error, call `applyInquiryDraftPatch`; on success update the draft once, call `show`, and return `getMissingRecommendedInquiryFields(nextDraft)`. Return busy without changes for pending/success/fallback. Cleanup with the bridge's identity-safe disposer.

- [ ] **Step 4: Run modal tests and confirm GREEN**

Run: `pnpm vitest run components/kontakt/BriefModal.test.tsx components/kontakt/BriefModal.pending.test.tsx`

- [ ] **Step 5: Add failing provider/i18n tests**

Assert production registers `kool_find_projects` and `kool_prepare_project_inquiry` with no base flag, debug remains gated, locale changes replace localized metadata, and unmount cleans each registration exactly once. Assert PL/EN copy key parity and the exact English safety sentence appears in both descriptions.

- [ ] **Step 6: Run provider tests and confirm RED**

Run: `pnpm vitest run components/WebMcpProvider.test.tsx`

- [ ] **Step 7: Wire provider and localized copy**

Remove `isWebMcpEnabled` usage. Read `webmcp.projectInquiry` through `t.raw`, create the tool beside project search, retain development-only registration warnings, and keep debug gating unchanged. Add schema property and enum display copy in both message files.

- [ ] **Step 8: Run integration tests and confirm GREEN**

Run: `pnpm vitest run components/WebMcpProvider.test.tsx components/kontakt/BriefModal.test.tsx lib/webmcp/tools/prepare-project-inquiry.test.ts`

### Task 3: Origin-trial availability and operational documentation

**Files:**
- Modify: `app/[locale]/layout.tsx`
- Modify: `.env.example`
- Modify: `lib/webmcp/flags.ts`
- Modify: `components/WebMcpProvider.test.tsx`
- Modify: `tests/webmcp-config.test.ts`
- Modify: `docs/webmcp/repo-findings.md`
- Modify: `docs/webmcp/evals.md`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `WEBMCP_ORIGIN_TRIAL_TOKEN`, current locale layout `<head>`, debug flag helper
- Produces: optional early origin-trial activation and reproducible browser-test instructions

- [ ] **Step 1: Write failing availability tests**

Test that the obsolete base-gate helper/export is absent, production registration no longer depends on `NEXT_PUBLIC_WEBMCP_ENABLED`, and layout conditionally emits `<meta httpEquiv="origin-trial" content={process.env.WEBMCP_ORIGIN_TRIAL_TOKEN}>` only for a non-empty configured token. Preserve the exact `Origin-Agent-Cluster: ?1` test.

- [ ] **Step 2: Run availability tests and confirm RED**

Run: `pnpm vitest run components/WebMcpProvider.test.tsx && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/webmcp-config.test.ts`

- [ ] **Step 3: Implement availability wiring**

Delete only `isWebMcpEnabled`; retain `isWebMcpDebugEnabled`. Read the server-only origin token in the locale layout and render its meta before client code. Document `WEBMCP_ORIGIN_TRIAL_TOKEN` and `NEXT_PUBLIC_WEBMCP_DEBUG`; do not add a fake token.

- [ ] **Step 4: Update operational docs and evals**

Document Chrome 149's `chrome://flags/#enable-webmcp-testing`, origin-specific trial tokens for preview/production, ChatGPT in-app browser support, expected `document.modelContext`, tool manifest (`kool_find_projects`, `kool_prepare_project_inquiry`), safe evaluation prompts, and the permanent absence of an automatic submission tool.

- [ ] **Step 5: Run focused tests and repository safety searches**

Run:

```bash
pnpm vitest run components/WebMcpProvider.test.tsx components/kontakt/BriefModal.test.tsx lib/webmcp/tools/prepare-project-inquiry.test.ts
rg -n "kool_submit_project_inquiry|requestSubmit|NEXT_PUBLIC_WEBMCP_ENABLED" app components lib messages .env.example docs/webmcp CLAUDE.md
```

Expected: tests pass; no runtime submission tool/requestSubmit/base-gate usage. Historical design documents may still name future submission.

- [ ] **Step 6: Run the full verification gate**

Run: `pnpm check`

Expected: exit code 0 for tests, typecheck, lint, i18n parity, and production build.
