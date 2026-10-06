# Project Enquiry Form — Phase 3 Design

**Date:** 2026-08-26
**Status:** Approved for implementation
**Scope:** The ordinary human enquiry form and its shared draft model only

## Objective

Make the existing project-enquiry form available to every visitor and refactor it around one controlled, framework-independent draft model. The result must be a complete human workflow in Polish and English, preserve the current validated Resend/mailto delivery path, and provide a clean state boundary for a later WebMCP prepare tool.

This phase does not register a WebMCP write tool. The shared draft helpers are independently useful for an atomic controlled human form; their future-safe shape does not authorize or ship Phase 4. Any later WebMCP prepare tool requires its own design approval, implementation, and review. The first-party product flow exposes submission only through the person's visible form controls; the unauthenticated server-action abuse boundary is documented below.

## Existing Flow

The implementation extends the current flow rather than replacing it:

- `components/kontakt/BriefModal.tsx` renders the contact-page CTA and dialog.
- `components/kontakt/BriefForm.tsx` renders the fields and uses `submitBrief` through `useActionState`.
- `lib/brief.ts` owns option keys, limits, normalization, validation, and email/mailto formatting.
- `app/[locale]/kontakt/actions.ts` validates the submitted `FormData`, delivers through Resend when configured, sends a localized receipt, and otherwise returns a mailto fallback.
- `app/[locale]/kontakt/brief-state.ts` defines the server-action result states.
- `messages/pl.json` and `messages/en.json` provide the public copy.

`BriefModal` currently hides the entire CTA when the PostHog `brief-form` flag cannot be evaluated. That gate is ineffective in production because the site's cookieless analytics identity receives no feature flags.

## Availability

The enquiry CTA and modal are always available on `/pl/kontakt` and `/en/kontakt`.

Remove the `brief-form` PostHog gate and its `useSyncExternalStore`, `subscribeFeatureFlags`, and `featureFlagEnabled` dependencies from `BriefModal`. Do not replace it with another environment variable or rollout flag. The existing `#brief` deep link must continue to open the dialog.

A repository search on 2026-08-26 found no runtime consumers of `featureFlagEnabled` or `subscribeFeatureFlags` outside `BriefModal`. After the gate is removed, delete those now-dead exports and their feature-flag store comments from `lib/analytics.ts`. Update the stale flag-gated comments in `components/oferta/ContactBriefCta.tsx`, `components/oferta/ResidentialDetails.tsx`, `components/oferta/CommercialDetails.tsx`, and the current contact-form guidance in `CLAUDE.md`. Do not remove generic `useSyncExternalStore` usage or PostHog consent code used elsewhere. Re-run repository search before deletion; if a new runtime consumer has appeared, retain the shared helper and update only the brief-specific comments.

This change does not alter analytics consent behavior. `contact_form_opened` continues to fire through `track()` when the person opens the form, and `track()` remains responsible for consent-aware no-op behavior.

## Canonical Draft Model

`lib/brief.ts` remains the single domain module. It gains the controlled draft types and helpers; no parallel WebMCP-only model is created.

```ts
type InquiryLanguage = 'pl' | 'en';
type PropertyStage = (typeof STAGES)[number];
type DesiredScopeItem = (typeof SCOPE_ITEMS)[number];

interface InquiryDraft {
  name: string;
  email: string;
  phone: string;
  projectType: ProjectType | '';
  location: string;
  propertyStage: PropertyStage | '';
  area: string;
  desiredScope: DesiredScopeItem[];
  designStart: string;
  constructionStart: string;
  budget: string;
  requirements: string;
  plansUrl: string;
  language: InquiryLanguage;
}

type InquiryDraftPatch = Partial<InquiryDraft>;

type InquiryPatchErrorCode = 'type' | 'option' | 'tooLong';

type InquiryPatchResult =
  | { ok: true; draft: InquiryDraft }
  | {
      ok: false;
      errors: Partial<Record<keyof InquiryDraft, InquiryPatchErrorCode>>;
    };

type InquiryPatchParseResult =
  | { ok: true; patch: InquiryDraftPatch }
  | {
      ok: false;
      rootError?: 'type';
      errors: Partial<Record<keyof InquiryDraft, InquiryPatchErrorCode>>;
      unknownKeys: string[];
    };
```

Keep the existing `STAGES` and `SCOPE_ITEMS` constants as the canonical wire-value lists and explicitly export the `PropertyStage` and `DesiredScopeItem` aliases above. This avoids a duplicate enum while giving the renamed domain fields precise types.

Draft strings retain the exact visible control value while the person edits. Trimming, option narrowing, and URL/email validation happen at the shared validation boundary on submission. `area` and `budget` remain strings because the current form intentionally accepts approximate values, ranges, units, and currencies; they must not imply numeric precision the studio did not request.

`language` means the preferred language for the customer receipt and subsequent correspondence. It defaults to the active route locale and is submitted in a hidden field. It does not control the page's UI locale. In this phase it is not exposed as a visible control; navigation to the other locale creates a new page-scoped draft using that locale.

The honeypot `company` and render timestamp `ts` are submission mechanics, not draft fields. They must never be accepted by a draft patch. The timestamp nevertheless shares the draft's lifetime and is owned by `BriefModal`, not the conditionally mounted `BriefForm`.

The canonical visible/submission order is `name`, `email`, `phone`, `projectType`, `location`, `propertyStage`, `area`, `desiredScope`, `designStart`, `constructionStart`, `budget`, `requirements`, `plansUrl`, followed by the hidden `language`. Reuse this order for first-error focus, studio-facing email output, and submitted summaries.

### Field contract

| Field | Type and limit | Submit requirement | Recommended completeness | Visible treatment |
|---|---|---:|---:|---|
| `name` | string, 120 characters | Required | Yes | Text input, `autocomplete="name"` |
| `email` | string, 254 characters, permissive email-shape check | Required | Yes | Email input, `autocomplete="email"` |
| `phone` | string, 40 characters | Optional | No | Telephone input, `autocomplete="tel"`; length validation only so international formats are not rejected |
| `projectType` | `mieszkanie \| dom \| komercyjne \| inne \| ''` | Required, known option | Yes | Select using the existing stable option keys |
| `location` | string, 160 characters | Optional | Yes | Text input; a city is sufficient |
| `propertyStage` | existing stage keys or `''` | Optional | Yes | Select using the existing stage choices |
| `area` | string, 40 characters | Optional | Yes | Text input with decimal-friendly input mode and an m² example |
| `desiredScope` | array of existing scope keys | Optional | Yes | Checkbox group; empty array means no selection |
| `designStart` | string, 60 characters | Optional | Yes | Free-text timing input, such as a month or quarter |
| `constructionStart` | string, 60 characters | Optional | Yes | Free-text timing input, distinct from design start |
| `budget` | string, 80 characters | Optional | Yes | Free text for an approximate amount, range, and currency |
| `requirements` | string, 1000 characters | Optional | Yes | Textarea for needs, constraints, and priorities |
| `plansUrl` | string, 600 characters; empty or valid HTTP(S) URL | Optional | No | URL input for a cloud folder; no file upload |
| `language` | `pl \| en` | Required internally | Yes | Hidden value initialized from the active locale |

“Recommended” is informational metadata for the future prepare workflow and tests. It must not block submission, add required markers, or show errors merely because the value is absent. The only person-visible required fields remain name, email, and project type.

### Patch semantics

Add two distinct pure boundaries:

- `applyInquiryDraftPatch(current, patch: InquiryDraftPatch)` is the typed path used by ordinary controlled UI changes.
- `parseInquiryDraftPatch(input: unknown)` is the runtime boundary for any future or otherwise untrusted caller. It first requires a non-array plain object, rejects unknown keys, `null`, wrong scalar/array types, and `undefined` values, and returns an `InquiryPatchParseResult`. A successful parsed patch may then be passed to `applyInquiryDraftPatch` for option and length checks.

The composed parse/apply contract is:

- Applying a patch is atomic. The runtime parser collects structural and unknown-key errors; the apply helper collects option, length, and language errors. If either step fails, no field changes. Validate all supplied keys and return all detected errors rather than stopping at the first.
- Omitted fields preserve the current value. A typed UI patch may contain `undefined`, which is treated as omitted; the runtime parser rejects explicitly supplied `undefined`.
- An empty string explicitly clears a scalar field; an empty array explicitly clears `desiredScope`.
- `desiredScope` replaces the complete array rather than merging with the previous value. Duplicate keys are removed and valid keys are stored in canonical `SCOPE_ITEMS` order.
- `null` is not a valid patch value and must not mean “clear.”
- Patch application does not trim ordinary strings or run submit-required checks. A partial draft is valid while being prepared.
- The helpers return either a typed patch/next draft or structured field error codes; neither submits, opens UI, stores data, logs values, or performs network work.

Add a pure `getMissingRecommendedInquiryFields(draft)` helper returning stable field names in this exact order: `name`, `email`, `projectType`, `location`, `propertyStage`, `area`, `desiredScope`, `designStart`, `constructionStart`, `budget`, `requirements`. It includes missing required identity fields as well as the recommended project fields, but excludes optional phone and `plansUrl`. Whitespace-only strings and an empty scope array count as missing. This helper is preparatory application logic only in Phase 3; no WebMCP tool invokes it yet.

## Controlled UI and Lifetime

`BriefModal` owns one `InquiryDraft`, initialized with empty values and the active locale. It passes the draft and an `onDraftPatch` callback to `BriefForm`. Every visible input is controlled with `value` or `checked`; changes emit the smallest applicable typed patch through `applyInquiryDraftPatch`. `BriefForm` continues to own transient server-action status such as pending, validation errors, success, and fallback.

`BriefModal` also owns the anti-fast-submit timestamp and the `contact_form_started` guard. Initialize the timestamp with `Date.now()` on the first client-side opening of a page-scoped draft and pass its stable value to each `BriefForm` mount; do not evaluate time during server render. Closing and reopening the dialog must neither reset the timestamp nor create a fresh anti-spam window. The first meaningful interaction fires `contact_form_started` once for that draft even if the modal is closed and reopened. A confirmed Resend success creates the next empty draft and resets the timestamp to an uninitialized state and the started guard to false; the next opening starts its own timing window. Invalid, generic-error, and fallback states reset neither.

The draft lifetime is exactly the mounted contact page:

- Closing and reopening the modal preserves the draft because the state lives above the conditionally rendered form.
- Invalid submissions, generic errors, and mailto fallback preserve the draft.
- A confirmed Resend success clears the parent draft after the submitted summary has been captured, so reopening starts a new blank enquiry.
- A route navigation, locale navigation, hard reload, or new tab creates a fresh draft.
- Do not write any draft or personal field to `localStorage`, `sessionStorage`, cookies, the site's HTTP URL parameters, analytics, logs, or a server-side draft store.

The existing `#brief` hash remains an opening affordance only. Draft values never appear in the site's hash or query string. The one intentional exception is the encoded `mailto:` fallback URI created only after a person explicitly submits a valid form; it is handed to the person's mail client and is not an application HTTP URL.

## Field Semantics and Renames

The new domain names remove ambiguity without inventing new project facts:

| Current field | New field | Rule |
|---|---|---|
| `stage` | `propertyStage` | Direct rename; retain all existing stable option keys and their meanings. |
| `scope` | `desiredScope` | Direct rename; retain all existing stable checkbox keys and their meanings. |
| `startDate` | `designStart` | Rename and clarify the label as the desired start of design work. |
| `completionDate` | `constructionStart` | Replace rather than alias: desired completion and construction start are different facts. Existing completion text must never be silently reinterpreted as a construction-start date. |
| `priorities` | `requirements` | Broaden the prompt to cover requirements, constraints, and priorities; retain the 1000-character cap. |

`phone` is added as an optional contact method. The existing `plansUrl` field remains because it is useful and already supported by validation and delivery, even though it was not listed in the initial Phase 3 shorthand.

There is no persisted draft database, separately supported public API, or external schema to migrate. The form and server action deploy together, so canonical HTML names may move to the new names in one change. Preserve compatibility where it represents the same fact: stable project/stage/scope option keys, `#brief`, Resend environment variables, contact address, analytics event names, and mailto behavior all remain unchanged. Do not accept legacy `completionDate` as `constructionStart`; the semantic mismatch is worse than silently dropping an obsolete internal field from an old document.

## Validation and Submission

The framework-independent validator is updated to accept the canonical draft/raw field names and to return a normalized enquiry containing the same domain fields. It must enforce:

- trimmed strings in the normalized result;
- required name, email, and project type;
- current permissive email shape;
- maximum lengths from the field contract;
- known project type, property stage, and scope options;
- deduplicated scope values in canonical order;
- empty or HTTP(S)-only `plansUrl`;
- `pl` or `en` language, defaulting safely to `pl` when missing from an older form;
- the existing empty honeypot and minimum human-submit timing heuristic.

Unknown submitted scope values must produce an `option` error for `desiredScope`, rather than being silently discarded. The ordinary checkbox UI cannot produce this state, but the server boundary must reject tampering deterministically.

The visible `<form>` and its submit button remain the only first-party UI submission surface. Native user actions, including activating the button or pressing Enter in the form, may invoke `submitBrief`. Draft helpers, modal-opening code, and future-compatible patch callbacks must have no reference to the server action and must not call `requestSubmit`, dispatch a submit event, click the submit button, send email, or navigate to a mailto URL.

`submitBrief` keeps the current delivery sequence:

1. Read untrusted `FormData`.
2. Validate and screen spam through shared pure logic.
3. On invalid input, return localized field error codes without delivery.
4. Format a stable Polish studio-facing subject/body containing every canonical field, including phone, both start dates, requirements, and language.
5. When `RESEND_API_KEY` is configured, send to `BRIEF_TO_EMAIL` or `hello@koolstudio.pl` and send the existing best-effort receipt in the draft language.
6. When Resend is unconfigured or studio delivery fails, return the same fully encoded mailto fallback and let the person complete the send in their email application.

No automatic retry, duplicate submission queue, lead database, attachment upload, or background draft save is introduced. The pending state disables the visible submit control to prevent ordinary double activation.

### Residual abuse risk

Making the form public exposes a server action that unauthenticated clients can call. The honeypot, timing heuristic, strict validation, disabled pending button, and Resend provider controls reduce ordinary noise but do not stop a determined automated client, distributed abuse, or replay. This phase therefore retains a residual risk of unwanted email and server/provider resource use.

There is no approved distributed rate-limit or idempotency infrastructure in this repository. Do not add a process-memory counter, because serverless instances do not share it and restarts erase it, and do not introduce a new vendor under this phase. Robust distributed rate limiting, replay/idempotency protection, and submission reference handling remain Phase 5 work requiring a separate design. Where the deployment platform or WAF already offers request limiting, production operators should configure it for the enquiry action and keep Resend quotas/alerts enabled; this is an operational mitigation, not an application guarantee or Phase 3 acceptance blocker.

## User-Visible Copy

Keep the current heading, introduction, CTA, status messages, and option translations unless a field rename requires clearer wording. Add or replace the following keys with exact localized intent:

| Key | Polish | English |
|---|---|---|
| `brief.fields.phone.label` | `Telefon (opcjonalnie)` | `Phone (optional)` |
| `brief.fields.phone.help` | `Jeśli wolisz kontakt telefoniczny.` | `If you prefer us to contact you by phone.` |
| `brief.fields.propertyStage.label` | `Etap nieruchomości` | `Property stage` |
| `brief.fields.propertyStage.placeholder` | `Wybierz…` | `Choose…` |
| `brief.fields.designStart.label` | `Pożądany start projektu` | `Desired design start` |
| `brief.fields.designStart.placeholder` | `np. wrzesień 2026` | `e.g. September 2026` |
| `brief.fields.constructionStart.label` | `Planowany start realizacji` | `Planned construction start` |
| `brief.fields.constructionStart.placeholder` | `np. wiosna 2027` | `e.g. spring 2027` |
| `brief.fields.desiredScope.label` | `Oczekiwany zakres` | `Desired scope` |
| `brief.fields.desiredScope.help` | `Zaznacz, co Cię interesuje.` | `Select what you are interested in.` |
| `brief.fields.requirements.label` | `Wymagania i priorytety` | `Requirements and priorities` |
| `brief.fields.requirements.help` | `Opisz potrzeby, ograniczenia i to, co powinno działać lepiej. Maks. 1000 znaków.` | `Describe your needs, constraints, and what should work better. Maximum 1,000 characters.` |

The privacy notice must include an ordinary localized internal link built with `Link` from `@/i18n/navigation` and accurately describe the two delivery paths:

- Polish: `Dane z formularza wykorzystamy, aby odpowiedzieć na Twoje zapytanie. Skonfigurowaną wysyłkę obsługuje nasz dostawca poczty; jeśli formularz nie może wysłać wiadomości, otworzymy gotowy brief w Twoim programie pocztowym. Szczegóły znajdziesz w polityce prywatności.` The words `polityce prywatności` link to `/polityka-prywatnosci`.
- English: `We use the form details to reply to your enquiry. Configured delivery is handled by our email provider; if the form cannot send the message, we will open a prepared brief in your email app. See our privacy policy for details.` The words `privacy policy` link to `/polityka-prywatnosci`.

Update `privacy.contactBody` in both locale files as part of the same release with this exact factual content:

- Polish: `Gdy piszesz na hello@koolstudio.pl lub wysyłasz brief przez formularz, przetwarzamy podane dane: imię, adres e-mail, opcjonalny numer telefonu i język korespondencji oraz informacje o projekcie (typ, lokalizacja, etap nieruchomości, przybliżona powierzchnia, zakres, terminy projektu i realizacji, budżet, wymagania oraz opcjonalny link do rzutów lub zdjęć). Używamy ich, aby odpowiedzieć i omówić możliwą współpracę. Gdy wysyłka formularza jest skonfigurowana, wiadomość do studia i potwierdzenie dla Ciebie obsługuje Resend, nasz dostawca wysyłki e-mail, który przetwarza dane w naszym imieniu. Jeśli formularz nie może wysłać wiadomości, strona tworzy gotowy brief w Twoim programie pocztowym; strona go nie wysyła — to Ty decydujesz, czy wysłać go z programu pocztowego. Korespondencję przechowujemy tak długo, jak wymaga tego prowadzona sprawa.`
- English: `When you write to hello@koolstudio.pl or send a brief through the form, we process the details you provide: name, email address, optional phone number and correspondence language, plus project information (type, location, property stage, approximate area, scope, design and construction timing, budget, requirements, and an optional link to plans or photos). We use them to reply and discuss a potential collaboration. When form delivery is configured, Resend, our email-delivery provider acting as our processor, handles the message to the studio and your confirmation receipt. If the form cannot send the message, the site creates a prepared brief in your email app; the site does not send it — you decide whether to send it from the email app. We keep correspondence for as long as the matter requires.`

Do not claim a Resend storage region, retention period, or legal basis that the repository does not establish.

Do not add a privacy-consent checkbox, marketing opt-in, pre-checked control, or invented legal assertion. The notice and link inform the person; they do not create a new required validation condition.

## Accessibility and Interaction

Preserve and complete the dialog and form accessibility contract:

- The CTA and close control are real buttons with visible focus treatment and localized accessible names.
- The modal keeps `role="dialog"`, `aria-modal="true"`, its localized label, Escape handling, backdrop-close behavior, scroll lock, initial focus on close, and focus restoration to the opener.
- While open, Tab from the last enabled visible focusable element cycles to the first and Shift-Tab from the first cycles to the last. Recompute the focusable set for each key event so pending/result states remain correct; if none is available, keep focus on the dialog container.
- Page content outside the modal is non-interactive while the dialog is open. Use the platform `inert` property where supported and an `aria-hidden` fallback for assistive technology, while keeping the modal subtree exposed. Starting from the mounted modal layer, walk toward `document.body` and suppress siblings at each ancestor level; never mark an ancestor containing the dialog inert or hidden. Record each affected element's previous property/attribute state and restore it exactly on close and component unmount.
- All controls retain explicit labels, appropriate `autocomplete` and `inputMode`, `aria-required` only where required, and error/help IDs through `aria-describedby`.
- Server errors set `aria-invalid`, the summary remains in a polite live region, and focus moves to the first invalid field or generic error.
- Pending, success, and fallback states remain announced without leaking values to an assertive global announcement.
- The scope checkbox group remains a labelled `fieldset`/`legend` and becomes error-addressable for a tampered-value response.
- Reduced-motion behavior remains unchanged.
- Closing the modal never discards an unfinished draft, but it also never submits it.

Implement focus containment with the existing React/browser primitives; do not add a focus-trap library or component system. All key, scroll-lock, `inert`, and `aria-hidden` listeners/state must be removed or restored on Escape, backdrop close, ordinary close, and unmount.

## Analytics and Privacy

Retain the existing event names:

- `contact_form_opened`
- `contact_form_started`
- `contact_form_submitted`
- `contact_form_mailto_fallback`

Each event remains argument-free. Do not include draft values, email, phone, location, URL, requirements, individual field names, completion counts, validation values, or encoded mailto content. `contact_form_started` fires once per page-scoped draft, not once per conditional `BriefForm` mount; its guard therefore lives with the modal-owned draft and resets only after confirmed delivery creates a new draft. Do not call `identify()` from the enquiry flow. Phase 3 adds no WebMCP analytics.

Client or server diagnostic output must not log raw `FormData`, normalized enquiries, Resend payloads, or mailto URIs. The intended transfers are the configured Resend studio email and receipt, or—only after an explicit valid user submission—the encoded mailto URI handed to the person's email client. No personal data enters site HTTP URLs.

## Result and Error States

The form supports the following deterministic states:

- **Idle:** controlled draft is editable; required and privacy hints are visible.
- **Pending:** submit is disabled and a localized polite status is visible.
- **Invalid:** field messages are localized from stable error codes, the draft remains intact, a summary is shown, and focus moves to the first erroneous control.
- **Spam/generic error:** no spam reason is revealed; the draft remains intact and focus moves to the generic message.
- **Delivery success:** the submitted normalized summary is shown, `contact_form_submitted` fires once, and the parent draft is cleared for the next modal opening.
- **Mailto fallback:** the submitted summary and manual mailto button are shown, one automatic mailto navigation may be attempted, `contact_form_mailto_fallback` fires once, and the draft is retained because successful delivery is not known.

A Resend receipt failure remains best-effort and must not turn a successful studio delivery into an error. Server actions return states rather than throwing through the page.

## Implementation Boundaries

Expected modifications:

```text
lib/brief.ts
lib/analytics.ts
components/kontakt/BriefModal.tsx
components/kontakt/BriefForm.tsx
components/kontakt/BriefModal.test.tsx
components/kontakt/BriefForm.test.tsx
lib/brief-action.test.ts
lib/brief-privacy.test.ts
app/[locale]/kontakt/actions.ts
app/[locale]/kontakt/brief-state.ts
components/oferta/ContactBriefCta.tsx            # stale comment cleanup
components/oferta/ResidentialDetails.tsx         # stale comment cleanup
components/oferta/CommercialDetails.tsx          # stale comment cleanup
messages/pl.json
messages/en.json
tests/brief-validation.test.ts
CLAUDE.md                                         # current form guidance
```

Add focused component and mocked action/delivery tests using the repository's existing Vitest/jsdom setup. Locate Vitest tests under `components/` or `lib/` so the existing include glob runs them; `lib/brief-action.test.ts` may import the async server action directly and mock `globalThis.fetch` and environment variables. If extracting a pure `FormData` reader or formatter makes the action boundary clearer, keep that helper in `lib/brief.ts`; do not create a second enquiry schema.

Phase 3 should not modify `components/WebMcpProvider.tsx` or register another tool. A negative manifest assertion may be added to existing WebMCP tests if needed to prove that `kool_prepare_project_inquiry` is absent.

## Automated Tests

### Domain tests

Extend `tests/brief-validation.test.ts` to cover:

- an empty draft factory with the requested language;
- typed atomic patch application, omitted-field preservation, explicit clearing, array replacement, canonical scope ordering, and duplicate removal;
- runtime parsing and atomic parse/apply composition from `unknown`, including non-object/array/null inputs, unknown keys, explicit `undefined`, wrong types, invalid options, and overlong values;
- stable missing-recommended-field order, including required identity fields and excluding phone/plans URL;
- valid full and sparse enquiries;
- required name, email, and project type;
- optional phone, including international punctuation and its length cap;
- both start fields remaining distinct;
- strict project type, property stage, desired scope, and language options;
- all length limits and HTTP(S)-only plans URLs;
- honeypot and timing spam behavior;
- normalized output and the complete Polish studio email body;
- fully encoded mailto output containing the new fields without raw whitespace.

### Component tests

Add jsdom coverage for:

- the CTA rendering without PostHog or a feature-flag response;
- opening by CTA and by `#brief`;
- editing representative text, select, and checkbox fields as controlled values;
- closing and reopening without losing draft values;
- the anti-fast-submit timestamp retaining the same value across close/reopen, including an immediate submit after reopening that is judged from the original timestamp rather than a reset timestamp;
- a hard remount starting from an empty draft;
- optional phone attributes and the three required controls only;
- localized PL and EN labels and privacy-policy links;
- Escape/backdrop close, Tab and Shift-Tab containment, background `inert`/`aria-hidden`, focus restoration, and exact cleanup on close/unmount;
- pending/invalid/success/fallback states and first-error focus;
- analytics events firing once with no properties, including `contact_form_started` remaining once across close/reopen and resetting only for a new draft after confirmed delivery;
- a draft patch never invoking the server action or submitting the form.

### Action and delivery tests

Add mocked action coverage for the actual `submitBrief` orchestration:

- canonical renamed `FormData` is read correctly, including phone, `propertyStage`, `desiredScope`, `designStart`, `constructionStart`, requirements, plans URL, and language;
- invalid input performs no `fetch`;
- honeypot and too-fast spam responses perform no `fetch` and expose no spam detail;
- with `RESEND_API_KEY`, a successful studio delivery sends the complete canonical payload and a second localized receipt, then returns `success`;
- a receipt rejection, thrown error, or non-success response remains a successful studio submission;
- a failed or thrown studio-delivery request does not attempt a receipt and returns the encoded `delivery-failed` mailto fallback;
- without `RESEND_API_KEY`, no `fetch` occurs and the action returns the encoded `unconfigured` mailto fallback;
- environment and `fetch` mocks are restored after every test so tests cannot leak delivery configuration.

Assertions must inspect addresses, `reply_to`, subject/body, and receipt locale without snapshotting or printing real personal data. Use synthetic values only.

### Privacy-content tests

Add a focused test that reads both locale message files and proves that the form notice and `privacy.contactBody` remain present in PL/EN. The short notice must disclose provider processing and the email-app fallback; `privacy.contactBody` must name Resend and cover optional phone and plans/photos URL data. This complements the form component's localized privacy-link assertion; it does not attempt to encode a legal opinion in the test.

### Repository gates

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm check:i18n`
- `pnpm build`
- final `pnpm check`

## Manual Evaluation

Verify both `/pl/kontakt` and `/en/kontakt` at desktop and mobile widths:

1. The “tell us about your project” CTA appears without a PostHog key, consent decision, or feature flags.
2. Mouse, keyboard, Escape, backdrop, Tab/Shift-Tab containment, background inertness, and `#brief` opening/closing behavior work.
3. A partially completed draft and its original anti-spam timestamp survive close/reopen and disappear after reload.
4. Polish and English labels clearly distinguish design start from construction start.
5. The privacy link opens the localized privacy route.
6. Required, malformed, pending, and fallback states are understandable and focus moves correctly.
7. A configured Resend submission sends the complete studio brief and the receipt uses the draft language.
8. No personal value appears in analytics calls, browser storage, site HTTP URLs, or console output; the only URL-like exception is the expected encoded `mailto:` fallback after explicit submit.
9. Site tools contain no `kool_prepare_project_inquiry` tool in this phase, and asking an assistant to “send it now” cannot submit the page.

## Acceptance Criteria

- Every contact-page visitor can open the human enquiry form.
- One controlled `InquiryDraft` is the source of visible form values.
- The form contains the exact canonical fields and validation rules in this document.
- Draft state persists only across modal close/reopen in the current page memory.
- The first-party UI submits only through explicit user interaction with the visible form; the residual public server-action abuse risk is documented and not misrepresented as eliminated.
- Validation, spam screening, Resend delivery, localized receipt, and mailto fallback remain functional.
- Modal focus is contained, background content is inert/hidden while open, and all temporary state is restored on close/unmount.
- The privacy policy is linked in both locales without a consent checkbox.
- Privacy copy accurately covers the submitted field categories, Resend processing, and mailto fallback.
- Existing analytics event names remain useful and contain zero personal data.
- Automated tests and `pnpm check` pass.
- No Phase 4 WebMCP write tool is present.

## Non-goals

Phase 3 does not:

- register `kool_prepare_project_inquiry` or any other WebMCP write tool;
- expose a programmatic submission API or auto-submit after preparing a draft;
- add `kool_submit_project_inquiry`, confirmation tokens, review authorization, duplicate-prevention storage, or submission reference numbers;
- persist drafts in browser storage, cookies, site HTTP URLs, databases, or analytics; the post-submit mailto fallback remains the explicit exception;
- add accounts, CRM integration, calendar/availability claims, budget qualification, attachments, or project-acceptance decisions;
- change portfolio search, project metadata, the Phase 1 debug tool, or the Phase 2 read-only search tool;
- invent a consent checkbox or marketing permission;
- replace Resend/mailto or change the studio contact address;
- claim that honeypot/timing checks eliminate public-form abuse, or add an in-memory/serverless rate limiter or new rate-limit vendor.

Phase 4 may, only after separate approval and review, add a prepare-only WebMCP adapter that calls the runtime parser and shared patch logic, opens this visible modal, identifies missing recommended information, and returns `submitted: false`. Phase 3 registers no such tool and grants no submission capability.
