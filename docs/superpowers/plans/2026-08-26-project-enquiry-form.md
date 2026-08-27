# Project Enquiry Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the bilingual project-enquiry form available to every contact-page visitor and rebuild it around one controlled, framework-independent `InquiryDraft` while preserving validated Resend/mailto delivery.

**Architecture:** `lib/brief.ts` remains the only enquiry domain module. It owns the canonical draft, runtime patch boundary, submit normalization/validation, exact field orders, and delivery formatting; the server action remains the only delivery surface. `BriefModal` owns page-lifetime draft/timestamp/analytics/dialog state, while `BriefForm` owns only action/result state and renders controlled inputs.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, next-intl, Framer Motion, Vitest/jsdom, Testing Library, Node test runner, Resend HTTP API

**Spec:** `docs/superpowers/specs/2026-08-26-project-enquiry-form-design.md`

## Global Constraints

- Phase 3 ships only the human enquiry form and shared draft helpers; it registers no WebMCP write or prepare tool.
- The CTA is always available on `/pl/kontakt` and `/en/kontakt`; no environment or PostHog gate replaces `brief-form`.
- The visible `<form>` and visible submit button are the only first-party submission surface.
- Never call `requestSubmit`, dispatch/click submit programmatically, auto-send email, or submit from a draft/modal callback.
- Keep draft/PII out of browser storage, cookies, site HTTP URLs, analytics, logs, and server-side draft storage.
- Analytics remain argument-free: `contact_form_opened`, `contact_form_started`, `contact_form_submitted`, `contact_form_mailto_fallback`.
- Preserve `#brief`, option wire keys, Resend environment names, `hello@koolstudio.pl`, localized receipt, and encoded mailto fallback.
- Required visible controls remain exactly `name`, `email`, and `projectType`.
- Do not accept legacy `completionDate` as `constructionStart`.
- Add no upload, component/focus library, retry queue, lead store, process-memory limiter, rate-limit vendor, consent checkbox, or marketing opt-in.
- Residual automated/distributed/replay abuse remains; distributed rate limiting, idempotency, and submission references are Phase 5 work.
- Use `Link` from `@/i18n/navigation`; maintain exact PL/EN message-key parity.
- Use synthetic test data and never print request bodies, mailto URIs, or personal values.
- Run `pnpm check` and inspect exit code before handoff.

## File Map

- Modify `lib/brief.ts`: one canonical draft/parser/validator/formatter domain.
- Create `tests/inquiry-draft.test.ts`: pure draft/patch/runtime parser tests.
- Modify `tests/brief-validation.test.ts`: canonical submission validation and formatter tests.
- Modify `app/[locale]/kontakt/actions.ts`: canonical action orchestration.
- Modify `app/[locale]/kontakt/brief-state.ts`: canonical result/error state.
- Create `lib/brief-action.test.ts`: actual action/Resend/mailto tests.
- Modify `components/kontakt/BriefForm.tsx`: canonical controlled fields/results/privacy.
- Modify `components/kontakt/BriefModal.tsx`: always-on draft owner and accessible dialog.
- Create `components/kontakt/BriefForm.test.tsx`: localized control/action-state tests.
- Create `components/kontakt/BriefModal.test.tsx`: draft/dialog lifetime tests.
- Create `lib/brief-privacy.test.ts`: bilingual disclosure tests.
- Modify `lib/analytics.ts`, offer CTA comments, and `CLAUDE.md`: remove dead gate and document abuse boundary.
- Modify `messages/pl.json` and `messages/en.json`: canonical field, language-summary, notice, and privacy copy.

---


### Task 1: Add the Framework-Independent Draft and Patch Boundary

**Files:**
- Modify: `lib/brief.ts`
- Create: `tests/inquiry-draft.test.ts`

**Interfaces:**
- Consumes: existing `PROJECT_TYPES`, `STAGES`, `SCOPE_ITEMS`, and `LIMITS`
- Produces: `InquiryDraft`, `InquiryDraftPatch`, `InquiryPatchResult`, `InquiryPatchParseResult`, `createInquiryDraft`, `parseInquiryDraftPatch`, `applyInquiryDraftPatch`, and `getMissingRecommendedInquiryFields`
- Transitional rule: retain existing submit-validator exports unchanged in this task so the existing action/UI remain green; Task 2 migrates and removes their legacy field names.

- [ ] **Step 1: Write the complete failing draft/parser test**

Create `tests/inquiry-draft.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LIMITS,
  applyInquiryDraftPatch,
  createInquiryDraft,
  getMissingRecommendedInquiryFields,
  parseInquiryDraftPatch,
  type InquiryDraft,
  type InquiryLanguage,
  type ProjectType,
} from '../lib/brief.ts';

test('creates an empty draft in the requested language', () => {
  assert.deepEqual(createInquiryDraft('en'), {
    name: '', email: '', phone: '', projectType: '', location: '',
    propertyStage: '', area: '', desiredScope: [], designStart: '',
    constructionStart: '', budget: '', requirements: '', plansUrl: '', language: 'en',
  });
});

test('applies typed patches atomically with replace, clear, omission, and canonical scope order', () => {
  const current: InquiryDraft = {
    ...createInquiryDraft('pl'),
    name: 'Ola',
    location: 'Wrocław',
    desiredScope: ['nadzor-autorski'],
  };
  const changed = applyInquiryDraftPatch(current, {
    name: undefined,
    location: '',
    desiredScope: ['nadzor-autorski', 'uklad-funkcjonalny', 'nadzor-autorski'],
  });
  assert.equal(changed.ok, true);
  if (!changed.ok) return;
  assert.equal(changed.draft.name, 'Ola');
  assert.equal(changed.draft.location, '');
  assert.deepEqual(changed.draft.desiredScope, ['uklad-funkcjonalny', 'nadzor-autorski']);
  const cleared = applyInquiryDraftPatch(changed.draft, { desiredScope: [] });
  assert.equal(cleared.ok, true);
  if (cleared.ok) assert.deepEqual(cleared.draft.desiredScope, []);
});

test('reports every typed option/length error and leaves the source unchanged', () => {
  const current = createInquiryDraft('pl');
  const result = applyInquiryDraftPatch(current, {
    name: 'x'.repeat(LIMITS.name + 1),
    projectType: 'spoofed' as ProjectType,
    language: 'de' as InquiryLanguage,
  });
  assert.deepEqual(result, {
    ok: false,
    errors: { name: 'tooLong', projectType: 'option', language: 'option' },
  });
  assert.deepEqual(current, createInquiryDraft('pl'));
});

test('runtime parsing accepts only plain objects and reports all structural failures', () => {
  for (const input of [null, [], new Date(0)]) {
    assert.deepEqual(parseInquiryDraftPatch(input), {
      ok: false, rootError: 'type', errors: {}, unknownKeys: [],
    });
  }
  assert.deepEqual(parseInquiryDraftPatch({
    name: undefined,
    phone: null,
    desiredScope: 'bad',
    company: '',
    ts: '123',
  }), {
    ok: false,
    errors: { name: 'type', phone: 'type', desiredScope: 'type' },
    unknownKeys: ['company', 'ts'],
  });
});

test('composes parsing and application without partial mutation', () => {
  const current = createInquiryDraft('en');
  const parsed = parseInquiryDraftPatch({
    phone: '+44 (0)20 1234 5678',
    propertyStage: 'remont',
    desiredScope: ['nadzor-autorski', 'uklad-funkcjonalny'],
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const applied = applyInquiryDraftPatch(current, parsed.patch);
  assert.equal(applied.ok, true);
  if (applied.ok) {
    assert.equal(applied.draft.phone, '+44 (0)20 1234 5678');
    assert.equal(applied.draft.propertyStage, 'remont');
    assert.deepEqual(applied.draft.desiredScope, ['uklad-funkcjonalny', 'nadzor-autorski']);
  }
});

test('reports recommended fields in stable order and ignores phone/plansUrl', () => {
  const draft = {
    ...createInquiryDraft('pl'),
    name: '   ',
    phone: '+48 600 700 800',
    plansUrl: 'https://drive.example.com/folder',
  };
  assert.deepEqual(getMissingRecommendedInquiryFields(draft), [
    'name', 'email', 'projectType', 'location', 'propertyStage', 'area',
    'desiredScope', 'designStart', 'constructionStart', 'budget', 'requirements',
  ]);
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/inquiry-draft.test.ts
```

Expected: FAIL because the draft types/helpers are not exported.

- [ ] **Step 3: Add canonical types and limits without migrating submit consumers**

Retain the existing `ProjectType` alias. Extend `LIMITS` with canonical keys `phone: 40`, `designStart: 60`, `constructionStart: 60`, and `requirements: 1000`; retain legacy limit keys and `Stage`/`ScopeItem` aliases until Task 2. Add:

```ts
export type PropertyStage = (typeof STAGES)[number];
export type DesiredScopeItem = (typeof SCOPE_ITEMS)[number];
export type InquiryLanguage = 'pl' | 'en';

export interface InquiryDraft {
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

export type InquiryDraftPatch = Partial<InquiryDraft>;
export type InquiryPatchErrorCode = 'type' | 'option' | 'tooLong';
export type InquiryPatchResult =
  | { ok: true; draft: InquiryDraft }
  | { ok: false; errors: Partial<Record<keyof InquiryDraft, InquiryPatchErrorCode>> };
export type InquiryPatchParseResult =
  | { ok: true; patch: InquiryDraftPatch }
  | {
      ok: false;
      rootError?: 'type';
      errors: Partial<Record<keyof InquiryDraft, InquiryPatchErrorCode>>;
      unknownKeys: string[];
    };

export function createInquiryDraft(language: InquiryLanguage): InquiryDraft {
  return {
    name: '', email: '', phone: '', projectType: '', location: '',
    propertyStage: '', area: '', desiredScope: [], designStart: '',
    constructionStart: '', budget: '', requirements: '', plansUrl: '', language,
  };
}
```

- [ ] **Step 4: Add the complete parser/apply/missing implementation**

```ts
const DRAFT_KEYS = [
  'name', 'email', 'phone', 'projectType', 'location', 'propertyStage', 'area',
  'desiredScope', 'designStart', 'constructionStart', 'budget', 'requirements',
  'plansUrl', 'language',
] as const satisfies readonly (keyof InquiryDraft)[];
const STRING_DRAFT_KEYS = DRAFT_KEYS.filter(
  (key): key is Exclude<keyof InquiryDraft, 'desiredScope'> => key !== 'desiredScope',
);
const RECOMMENDED_FIELDS = [
  'name', 'email', 'projectType', 'location', 'propertyStage', 'area',
  'desiredScope', 'designStart', 'constructionStart', 'budget', 'requirements',
] as const;
export type InquiryRecommendedField = (typeof RECOMMENDED_FIELDS)[number];

function canonicalScope(values: readonly DesiredScopeItem[]): DesiredScopeItem[] {
  const supplied = new Set(values);
  return SCOPE_ITEMS.filter((key) => supplied.has(key));
}

export function parseInquiryDraftPatch(input: unknown): InquiryPatchParseResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, rootError: 'type', errors: {}, unknownKeys: [] };
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    return { ok: false, rootError: 'type', errors: {}, unknownKeys: [] };
  }
  const record = input as Record<string, unknown>;
  const unknownKeys = Object.keys(record).filter(
    (key) => !(DRAFT_KEYS as readonly string[]).includes(key),
  );
  const errors: Partial<Record<keyof InquiryDraft, InquiryPatchErrorCode>> = {};
  const patch: InquiryDraftPatch = {};
  for (const key of DRAFT_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
    const value = record[key];
    if (key === 'desiredScope') {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        errors.desiredScope = 'type';
      } else {
        patch.desiredScope = value as DesiredScopeItem[];
      }
    } else if (typeof value !== 'string') {
      errors[key] = 'type';
    } else {
      patch[key] = value as never;
    }
  }
  return unknownKeys.length || Object.keys(errors).length
    ? { ok: false, errors, unknownKeys }
    : { ok: true, patch };
}

export function applyInquiryDraftPatch(
  current: InquiryDraft,
  patch: InquiryDraftPatch,
): InquiryPatchResult {
  const errors: Partial<Record<keyof InquiryDraft, InquiryPatchErrorCode>> = {};
  for (const key of STRING_DRAFT_KEYS) {
    const value = patch[key];
    if (value === undefined) continue;
    if (key === 'projectType' && value !== '' && !PROJECT_TYPES.includes(value as ProjectType)) {
      errors.projectType = 'option';
    } else if (key === 'propertyStage' && value !== '' && !STAGES.includes(value as PropertyStage)) {
      errors.propertyStage = 'option';
    } else if (key === 'language' && value !== 'pl' && value !== 'en') {
      errors.language = 'option';
    } else if (key in LIMITS && value.length > LIMITS[key as keyof typeof LIMITS]) {
      errors[key] = 'tooLong';
    }
  }
  if (
    patch.desiredScope !== undefined
    && patch.desiredScope.some((item) => !SCOPE_ITEMS.includes(item))
  ) {
    errors.desiredScope = 'option';
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const supplied = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  );
  return {
    ok: true,
    draft: {
      ...current,
      ...supplied,
      desiredScope: patch.desiredScope === undefined
        ? current.desiredScope
        : canonicalScope(patch.desiredScope),
    } as InquiryDraft,
  };
}

export function getMissingRecommendedInquiryFields(
  draft: InquiryDraft,
): InquiryRecommendedField[] {
  return RECOMMENDED_FIELDS.filter((field) => {
    const value = draft[field];
    return Array.isArray(value) ? value.length === 0 : value.trim().length === 0;
  });
}
```

- [ ] **Step 5: Run GREEN and commit**

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/inquiry-draft.test.ts
pnpm typecheck
git add lib/brief.ts tests/inquiry-draft.test.ts
git commit -m "feat: add project enquiry draft model"
```

Expected: focused tests and typecheck pass; current form/action behavior remains unchanged.

---


### Task 2: Migrate Validation, Delivery, and Canonical Form Wire Names

**Files:**
- Modify: `tests/brief-validation.test.ts`
- Create: `lib/brief-action.test.ts`
- Modify: `lib/brief.ts`
- Modify: `app/[locale]/kontakt/actions.ts`
- Modify: `app/[locale]/kontakt/brief-state.ts`
- Modify: `components/kontakt/BriefForm.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: Task 1 draft types/options and current Resend/mailto behavior
- Produces: `InquiryField`, `VisibleInquiryField`, `INQUIRY_VISIBLE_FIELD_ORDER`, `INQUIRY_SUBMISSION_FIELD_ORDER`, canonical `BriefRawInput`, `NormalizedBrief`, `validateBrief`, `submitBrief`, and compile-safe canonical HTML names

- [ ] **Step 1: Write canonical validation and action tests before migration**

Replace the imports and fixture in `tests/brief-validation.test.ts` with:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LIMITS,
  BRIEF_CONTACT_EMAIL,
  buildBriefSubject,
  buildBriefText,
  buildMailtoHref,
  isBriefValid,
  validateBrief,
  type BriefRawInput,
  type InquiryField,
} from '../lib/brief.ts';

const NOW = 1_800_000_000_000;
const FULL_RAW: BriefRawInput = {
  name: ' Ola Testowa ', email: ' ola@example.com ', phone: ' +48 600 700 800 ',
  projectType: 'mieszkanie', location: ' Wrocław ', propertyStage: 'po-odbiorze',
  area: ' ok. 85 m² ',
  desiredScope: ['nadzor-autorski', 'uklad-funkcjonalny', 'nadzor-autorski'],
  designStart: ' Q4 2026 ', constructionStart: ' Q2 2027 ',
  budget: ' 180–220 tys. zł ', requirements: ' Ciche miejsce do pracy. ',
  plansUrl: ' https://drive.example.com/folder ', language: 'pl',
  company: '', ts: String(NOW - 10_000),
};
```

Validation assertions must cover all limits, three required fields, permissive email, international phone punctuation, distinct start values, strict project/stage/scope/language options, canonical scope order/deduplication, missing-language fallback to `pl`, HTTP(S)-only URL, honeypot, and timing. Assert exact subject and body:

```ts
test('normalizes and formats a complete canonical enquiry', () => {
const result = validateBrief(FULL_RAW, NOW);
assert.equal(isBriefValid(result), true);
assert.equal(buildBriefSubject(result.values), 'Brief projektowy — mieszkanie');
assert.equal(buildBriefText(result.values), [
  'Brief projektowy — mieszkanie', '',
  'Imię: Ola Testowa', 'E-mail: ola@example.com', 'Telefon: +48 600 700 800',
  'Typ projektu: mieszkanie', 'Lokalizacja: Wrocław',
  'Etap nieruchomości: po odbiorze kluczy',
  'Przybliżona powierzchnia (m²): ok. 85 m²',
  'Oczekiwany zakres: układ funkcjonalny, nadzór autorski',
  'Pożądany start projektu: Q4 2026',
  'Planowany start realizacji: Q2 2027',
  'Przybliżony budżet realizacji: 180–220 tys. zł',
  'Wymagania i priorytety: Ciche miejsce do pracy.',
  'Link do rzutów / zdjęć: https://drive.example.com/folder',
  'Język korespondencji: polski', '',
].join('\n'));
});

test('enforces required, option, URL, phone, and timing boundaries', () => {
  assert.equal(validateBrief({ ...FULL_RAW, name: ' ' }, NOW).errors.name, 'required');
  assert.equal(validateBrief({ ...FULL_RAW, email: 'bad' }, NOW).errors.email, 'email');
  assert.equal(validateBrief({ ...FULL_RAW, projectType: '' }, NOW).errors.projectType, 'required');
  assert.equal(validateBrief({ ...FULL_RAW, projectType: 'bad' }, NOW).errors.projectType, 'option');
  assert.equal(validateBrief({ ...FULL_RAW, propertyStage: 'bad' }, NOW).errors.propertyStage, 'option');
  assert.equal(validateBrief({ ...FULL_RAW, desiredScope: ['bad'] }, NOW).errors.desiredScope, 'option');
  assert.equal(validateBrief({ ...FULL_RAW, language: 'de' }, NOW).errors.language, 'option');
  assert.equal(validateBrief({ ...FULL_RAW, plansUrl: 'ftp://example.com' }, NOW).errors.plansUrl, 'url');
  assert.equal(validateBrief({ ...FULL_RAW, phone: '+44 (0)20 1234-5678' }, NOW).errors.phone, undefined);
  assert.equal(validateBrief({ ...FULL_RAW, company: 'bot' }, NOW).spam, true);
  assert.equal(validateBrief({ ...FULL_RAW, ts: String(NOW - 100) }, NOW).spam, true);
});

test('enforces every canonical string limit and keeps both start facts distinct', () => {
  const cases: Array<[keyof typeof LIMITS, keyof BriefRawInput]> = [
    ['name', 'name'], ['email', 'email'], ['phone', 'phone'], ['location', 'location'],
    ['area', 'area'], ['designStart', 'designStart'],
    ['constructionStart', 'constructionStart'], ['budget', 'budget'],
    ['requirements', 'requirements'], ['plansUrl', 'plansUrl'],
  ];
  for (const [limit, field] of cases) {
    const checked = validateBrief({
      ...FULL_RAW,
      [field]: 'x'.repeat(LIMITS[limit] + 1),
    }, NOW);
    assert.equal(checked.errors[field as InquiryField], 'tooLong', field);
  }
  const checked = validateBrief({
    ...FULL_RAW, designStart: 'Q4 2026', constructionStart: 'Q2 2027',
  }, NOW);
  assert.equal(checked.values.designStart, 'Q4 2026');
  assert.equal(checked.values.constructionStart, 'Q2 2027');
  assert.deepEqual(checked.values.desiredScope, ['uklad-funkcjonalny', 'nadzor-autorski']);
  assert.equal(validateBrief({ ...FULL_RAW, language: undefined }, NOW).values.language, 'pl');
});

test('accepts a sparse enquiry with only the three required fields', () => {
  const result = validateBrief({
    name: 'A', email: 'a@b.co', projectType: 'inne', language: 'en',
    company: '', ts: String(NOW - 10_000),
  }, NOW);
  assert.equal(isBriefValid(result), true);
  assert.equal(result.spam, false);
  assert.deepEqual(result.errors, {});
  assert.equal(result.values.phone, '');
  assert.deepEqual(result.values.desiredScope, []);
  assert.equal(result.values.designStart, '');
  assert.equal(result.values.constructionStart, '');
  assert.equal(result.values.language, 'en');
});

test('fully encodes a sparse mailto with empty fields and language', () => {
  const values = validateBrief({
    name: 'A', email: 'a@b.co', projectType: 'inne', language: 'en',
    ts: String(NOW - 10_000),
  }, NOW).values;
  const subject = buildBriefSubject(values);
  const body = buildBriefText(values);
  const href = buildMailtoHref(subject, body);
  assert.ok(href.startsWith(`mailto:${BRIEF_CONTACT_EMAIL}?`));
  assert.doesNotMatch(href, /\s/);
  const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));
  assert.equal(query.get('subject'), 'Brief projektowy — inne');
  assert.match(query.get('body') ?? '', /Telefon: —/);
  assert.match(query.get('body') ?? '', /Pożądany start projektu: —/);
  assert.match(query.get('body') ?? '', /Planowany start realizacji: —/);
  assert.match(query.get('body') ?? '', /Język korespondencji: angielski/);
});
```

Create `lib/brief-action.test.ts` with this compile-ready action coverage:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitBrief } from '@/app/[locale]/kontakt/actions';
import { initialBriefState } from '@/app/[locale]/kontakt/brief-state';
import type { NormalizedBrief } from '@/lib/brief';

const NOW = 1_800_000_000_000;
const EXPECTED_SUBMITTED = {
  name: 'Ola Testowa', email: 'ola@example.com', phone: '+48 600 700 800',
  projectType: 'mieszkanie', location: 'Wrocław', propertyStage: 'po-odbiorze',
  area: 'ok. 85 m²', desiredScope: ['uklad-funkcjonalny', 'nadzor-autorski'],
  designStart: 'Q4 2026', constructionStart: 'Q2 2027',
  budget: '180–220 tys. zł', requirements: 'Ciche miejsce do pracy.',
  plansUrl: 'https://drive.example.com/folder', language: 'en',
} satisfies NormalizedBrief;
const EXPECTED_STUDIO_TEXT = [
  'Brief projektowy — mieszkanie', '',
  'Imię: Ola Testowa', 'E-mail: ola@example.com', 'Telefon: +48 600 700 800',
  'Typ projektu: mieszkanie', 'Lokalizacja: Wrocław',
  'Etap nieruchomości: po odbiorze kluczy',
  'Przybliżona powierzchnia (m²): ok. 85 m²',
  'Oczekiwany zakres: układ funkcjonalny, nadzór autorski',
  'Pożądany start projektu: Q4 2026',
  'Planowany start realizacji: Q2 2027',
  'Przybliżony budżet realizacji: 180–220 tys. zł',
  'Wymagania i priorytety: Ciche miejsce do pracy.',
  'Link do rzutów / zdjęć: https://drive.example.com/folder',
  'Język korespondencji: angielski', '',
].join('\n');

function form(overrides: Record<string, string | string[]> = {}): FormData {
  const values: Record<string, string | string[]> = {
    name: 'Ola Testowa', email: 'ola@example.com', phone: '+48 600 700 800',
    projectType: 'mieszkanie', location: 'Wrocław', propertyStage: 'po-odbiorze',
    area: 'ok. 85 m²', desiredScope: ['uklad-funkcjonalny', 'nadzor-autorski'],
    designStart: 'Q4 2026', constructionStart: 'Q2 2027',
    budget: '180–220 tys. zł', requirements: 'Ciche miejsce do pracy.',
    plansUrl: 'https://drive.example.com/folder', language: 'pl',
    company: '', ts: String(NOW - 10_000), ...overrides,
  };
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
  }
  return data;
}

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW);
  vi.stubEnv('RESEND_API_KEY', '');
  vi.stubEnv('BRIEF_FROM_EMAIL', 'briefs@example.test');
  vi.stubEnv('BRIEF_TO_EMAIL', 'studio@example.test');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('submitBrief', () => {
  it('never fetches for invalid, honeypot, or too-fast input', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await submitBrief(initialBriefState, form({ email: 'invalid' }))).status)
      .toBe('invalid');
    expect(await submitBrief(initialBriefState, form({ company: 'bot' })))
      .toMatchObject({ status: 'error', formError: 'generic' });
    expect(await submitBrief(initialBriefState, form({ ts: String(NOW - 100) })))
      .toMatchObject({ status: 'error', formError: 'generic' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns complete encoded mailto without fetch when unconfigured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await submitBrief(initialBriefState, form());
    expect(result).toMatchObject({
      status: 'fallback', fallback: { reason: 'unconfigured' },
    });
    expect(result.fallback?.mailtoHref).toMatch(/^mailto:hello@koolstudio\.pl\?/);
    expect(result.fallback?.mailtoHref).toContain('Planowany%20start%20realizacji%3A%20Q2%202027');
    expect(result.fallback?.mailtoHref).not.toMatch(/\s/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends exact studio subject/body and English receipt', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await submitBrief(initialBriefState, form({ language: 'en' }));
    expect(result).toEqual({
      status: 'success', submitted: EXPECTED_SUBMITTED, submittedAt: NOW,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const studio = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(studio).toEqual({
      from: 'briefs@example.test', to: ['studio@example.test'],
      reply_to: 'ola@example.com', subject: 'Brief projektowy — mieszkanie',
      text: EXPECTED_STUDIO_TEXT,
    });
    const receipt = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(receipt.to).toEqual(['ola@example.com']);
    expect(receipt.reply_to).toBe('studio@example.test');
    expect(receipt.subject).toBe('Kool Studio — we received your brief');
  });

  it.each([
    ['non-OK', () => Promise.resolve(new Response(null, { status: 503 }))],
    ['rejection', () => Promise.reject(new Error('synthetic receipt rejection'))],
  ])('keeps studio success after receipt %s', async (_label, receiptResult) => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockImplementationOnce(receiptResult);
    vi.stubGlobal('fetch', fetchMock);
    await expect(submitBrief(initialBriefState, form()))
      .resolves.toMatchObject({ status: 'success' });
  });

  it.each([
    ['non-OK', () => Promise.resolve(new Response(null, { status: 503 }))],
    ['throw', () => Promise.reject(new Error('synthetic studio failure'))],
  ])('returns delivery-failed without receipt after studio %s', async (_label, studioResult) => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const fetchMock = vi.fn().mockImplementationOnce(studioResult);
    vi.stubGlobal('fetch', fetchMock);
    const result = await submitBrief(initialBriefState, form());
    expect(result).toMatchObject({
      status: 'fallback', fallback: { reason: 'delivery-failed' },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run RED before editing production consumers**

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/brief-validation.test.ts
pnpm exec vitest run lib/brief-action.test.ts
```

Expected: FAIL because canonical raw fields, orders, body, action reader, phone, and language-aware payloads are not implemented.

- [ ] **Step 3: Replace raw/normalized types and export both exact orders**

Remove legacy `stage`, `scope`, `startDate`, `completionDate`, and `priorities` types/limits. Add:

```ts
export const LIMITS = {
  name: 120, email: 254, phone: 40, location: 160, area: 40,
  designStart: 60, constructionStart: 60, budget: 80,
  requirements: 1000, plansUrl: 600,
} as const;

export type InquiryField = keyof InquiryDraft;
export type VisibleInquiryField = Exclude<InquiryField, 'language'>;
export const INQUIRY_VISIBLE_FIELD_ORDER: VisibleInquiryField[] = [
  'name', 'email', 'phone', 'projectType', 'location', 'propertyStage', 'area',
  'desiredScope', 'designStart', 'constructionStart', 'budget', 'requirements',
  'plansUrl',
];
export const INQUIRY_SUBMISSION_FIELD_ORDER: InquiryField[] = [
  ...INQUIRY_VISIBLE_FIELD_ORDER,
  'language',
];

export interface BriefRawInput {
  name?: string; email?: string; phone?: string; projectType?: string;
  location?: string; propertyStage?: string; area?: string;
  desiredScope?: string[]; designStart?: string; constructionStart?: string;
  budget?: string; requirements?: string; plansUrl?: string; language?: string;
  company?: string; ts?: string;
}

export interface NormalizedBrief {
  name: string; email: string; phone: string; projectType: ProjectType | '';
  location: string; propertyStage: PropertyStage | ''; area: string;
  desiredScope: DesiredScopeItem[]; designStart: string; constructionStart: string;
  budget: string; requirements: string; plansUrl: string; language: InquiryLanguage;
}

export type BriefErrorCode = 'required' | 'email' | 'url' | 'tooLong' | 'option';
export interface BriefCheckResult {
  spam: boolean;
  errors: Partial<Record<InquiryField, BriefErrorCode>>;
  values: NormalizedBrief;
}
```

- [ ] **Step 4: Replace `validateBrief` with the complete canonical validator**

```ts
export function validateBrief(input: BriefRawInput, now = Date.now()): BriefCheckResult {
  const rawProjectType = str(input.projectType);
  const rawPropertyStage = str(input.propertyStage);
  const rawLanguage = str(input.language) || 'pl';
  const rawScope = (input.desiredScope ?? []).map((value) => value.trim());
  const projectType = PROJECT_TYPES.includes(rawProjectType as ProjectType)
    ? rawProjectType as ProjectType : '';
  const propertyStage = STAGES.includes(rawPropertyStage as PropertyStage)
    ? rawPropertyStage as PropertyStage : '';
  const language: InquiryLanguage = rawLanguage === 'en' ? 'en' : 'pl';
  const validScope = rawScope.filter(
    (value): value is DesiredScopeItem => SCOPE_ITEMS.includes(value as DesiredScopeItem),
  );
  const values: NormalizedBrief = {
    name: str(input.name), email: str(input.email), phone: str(input.phone),
    projectType, location: str(input.location), propertyStage, area: str(input.area),
    desiredScope: canonicalScope(validScope), designStart: str(input.designStart),
    constructionStart: str(input.constructionStart), budget: str(input.budget),
    requirements: str(input.requirements), plansUrl: str(input.plansUrl), language,
  };
  const errors: Partial<Record<InquiryField, BriefErrorCode>> = {};
  if (!values.name) errors.name = 'required';
  else if (values.name.length > LIMITS.name) errors.name = 'tooLong';
  if (!values.email) errors.email = 'required';
  else if (values.email.length > LIMITS.email) errors.email = 'tooLong';
  else if (!EMAIL_RE.test(values.email)) errors.email = 'email';
  if (!rawProjectType) errors.projectType = 'required';
  else if (!projectType) errors.projectType = 'option';
  if (values.phone.length > LIMITS.phone) errors.phone = 'tooLong';
  if (values.location.length > LIMITS.location) errors.location = 'tooLong';
  if (rawPropertyStage && !propertyStage) errors.propertyStage = 'option';
  if (values.area.length > LIMITS.area) errors.area = 'tooLong';
  if (rawScope.some((value) => !SCOPE_ITEMS.includes(value as DesiredScopeItem))) {
    errors.desiredScope = 'option';
  }
  if (values.designStart.length > LIMITS.designStart) errors.designStart = 'tooLong';
  if (values.constructionStart.length > LIMITS.constructionStart) {
    errors.constructionStart = 'tooLong';
  }
  if (values.budget.length > LIMITS.budget) errors.budget = 'tooLong';
  if (values.requirements.length > LIMITS.requirements) errors.requirements = 'tooLong';
  if (values.plansUrl.length > LIMITS.plansUrl) errors.plansUrl = 'tooLong';
  else if (values.plansUrl && !isValidHttpUrl(values.plansUrl)) errors.plansUrl = 'url';
  if (rawLanguage !== 'pl' && rawLanguage !== 'en') errors.language = 'option';
  const timestamp = Number(input.ts);
  const elapsed = now - timestamp;
  const tooFast = Number.isFinite(timestamp) && elapsed >= 0 && elapsed < MIN_SUBMIT_MS;
  return { spam: str(input.company).length > 0 || tooFast, errors, values };
}
```

Use `INQUIRY_SUBMISSION_FIELD_ORDER` in the complete formatter:

```ts
function displayValue(field: InquiryField, values: NormalizedBrief): string {
  if (field === 'projectType') {
    return values.projectType ? PROJECT_TYPE_LABELS_PL[values.projectType] : '—';
  }
  if (field === 'propertyStage') {
    return values.propertyStage ? STAGE_LABELS_PL[values.propertyStage] : '—';
  }
  if (field === 'desiredScope') {
    return values.desiredScope.length
      ? values.desiredScope.map((key) => SCOPE_LABELS_PL[key]).join(', ')
      : '—';
  }
  if (field === 'language') return values.language === 'en' ? 'angielski' : 'polski';
  const value = values[field] as string;
  return value || '—';
}

export function buildBriefText(values: NormalizedBrief): string {
  const lines = INQUIRY_SUBMISSION_FIELD_ORDER.map(
    (field) => `${FIELD_LABELS_PL[field]}: ${displayValue(field, values)}`,
  );
  return `${buildBriefSubject(values)}\n\n${lines.join('\n')}\n`;
}
```

`FIELD_LABELS_PL: Record<InquiryField, string>` includes every field, with language `Język korespondencji`.

- [ ] **Step 5: Replace action orchestration with canonical names**

`readForm()` must return exactly:

```ts
return {
  name: one('name'), email: one('email'), phone: one('phone'),
  projectType: one('projectType'), location: one('location'),
  propertyStage: one('propertyStage'), area: one('area'),
  desiredScope: many('desiredScope'), designStart: one('designStart'),
  constructionStart: one('constructionStart'), budget: one('budget'),
  requirements: one('requirements'), plansUrl: one('plansUrl'),
  language: one('language'), company: one('company'), ts: one('ts'),
};
```

Keep a canonical echo through this task so the still-uncontrolled form preserves invalid/error/fallback input; Task 3 removes echo state after parent ownership exists. In `brief-state.ts` define:

```ts
export interface BriefEchoValues {
  name: string; email: string; phone: string; projectType: string;
  location: string; propertyStage: string; area: string; desiredScope: string[];
  designStart: string; constructionStart: string; budget: string;
  requirements: string; plansUrl: string; language: InquiryLanguage;
}
```

In `actions.ts` add:

```ts
function echo(raw: BriefRawInput): BriefEchoValues {
  return {
    name: raw.name ?? '', email: raw.email ?? '', phone: raw.phone ?? '',
    projectType: raw.projectType ?? '', location: raw.location ?? '',
    propertyStage: raw.propertyStage ?? '', area: raw.area ?? '',
    desiredScope: raw.desiredScope ?? [], designStart: raw.designStart ?? '',
    constructionStart: raw.constructionStart ?? '', budget: raw.budget ?? '',
    requirements: raw.requirements ?? '', plansUrl: raw.plansUrl ?? '',
    language: raw.language === 'en' ? 'en' : 'pl',
  };
}
```

Then replace `submitBrief` with this complete orchestration:

```ts
export async function submitBrief(
  _previous: BriefFormState,
  formData: FormData,
): Promise<BriefFormState> {
  const raw = readForm(formData);
  const result = validateBrief(raw);
  const values = echo(raw);
  const submittedAt = Date.now();
  if (result.spam) {
    return { status: 'error', formError: 'generic', values, submittedAt };
  }
  if (!isBriefValid(result)) {
    return { status: 'invalid', errors: result.errors, values, submittedAt };
  }
  const clean = result.values;
  const subject = buildBriefSubject(clean);
  const body = buildBriefText(clean);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: 'fallback',
      fallback: { reason: 'unconfigured', mailtoHref: buildMailtoHref(subject, body) },
      submitted: clean,
      values,
      submittedAt,
    };
  }
  const delivered = await deliverViaResend(apiKey, clean, subject, body);
  if (!delivered) {
    return {
      status: 'fallback',
      fallback: { reason: 'delivery-failed', mailtoHref: buildMailtoHref(subject, body) },
      submitted: clean,
      values,
      submittedAt,
    };
  }
  await sendReceipt(apiKey, clean, clean.language);
  return { status: 'success', submitted: clean, submittedAt };
}
```

`BriefEchoValues` uses every canonical draft field; `language` is narrowed to `en` only for exact `en`, otherwise `pl`. Studio delivery calls global `fetch` once with exact `from`, `to`, `reply_to`, subject/body and `AbortSignal.timeout(10_000)`; receipt is best-effort and never changes success.

- [ ] **Step 6: Migrate the existing uncontrolled form to canonical wire names compile-safely**

Before Task 3 makes the controls parent-controlled, replace every legacy form reference using this exhaustive mapping:

```ts
const FORM_MIGRATION = {
  stage: 'propertyStage',
  scope: 'desiredScope',
  startDate: 'designStart',
  completionDate: 'constructionStart',
  priorities: 'requirements',
} as const;
```

Delete this mapping after applying it; it is an implementation checklist, not shipped code. Add phone after email. Reorder controls exactly by `INQUIRY_VISIBLE_FIELD_ORDER`. Every control's `id`, `name`, error key, `defaultValue`/`defaultChecked`, help/error IDs, and summary lookup must use the canonical field. Use `autoComplete="name"`, phone `type="tel" autoComplete="tel"`, area `inputMode="decimal"`, and hidden `<input name="language" value={locale === 'en' ? 'en' : 'pl'} />`. Only name/email/project type carry `required` and `aria-required`.

Replace component helper types with:

```ts
const ERRORABLE_ORDER: VisibleInquiryField[] = INQUIRY_VISIBLE_FIELD_ORDER;
interface FieldProps {
  field: VisibleInquiryField;
  label: string;
  help?: string;
  required?: boolean;
  className?: string;
  error?: string | null;
  children: React.ReactNode;
}
const describedBy = (field: InquiryField, hasHelp: boolean): string | undefined => {
  const ids: string[] = [];
  if (hasHelp) ids.push(`brief-${field}-help`);
  if (errors?.[field]) ids.push(`brief-${field}-error`);
  return ids.length ? ids.join(' ') : undefined;
};
```

Replace the form grid with this compile-ready canonical control body; it uses the existing `Field`, `CONTROL`, `describedBy`, `errorText`, option arrays, and `values` helpers:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
  <Field field="name" label={t('fields.name.label')} help={t('fields.name.help')} required error={errorText('name')}>
    <input id="brief-name" name="name" type="text" required aria-required="true"
      maxLength={LIMITS.name} autoComplete="name" defaultValue={values?.name ?? ''}
      aria-invalid={errors?.name ? true : undefined} aria-describedby={describedBy('name', true)} className={CONTROL} />
  </Field>
  <Field field="email" label={t('fields.email.label')} help={t('fields.email.help')} required error={errorText('email')}>
    <input id="brief-email" name="email" type="email" required aria-required="true"
      inputMode="email" maxLength={LIMITS.email} autoComplete="email"
      defaultValue={values?.email ?? ''} aria-invalid={errors?.email ? true : undefined}
      aria-describedby={describedBy('email', true)} className={CONTROL} />
  </Field>
  <Field field="phone" label={t('fields.phone.label')} help={t('fields.phone.help')} error={errorText('phone')}>
    <input id="brief-phone" name="phone" type="tel" maxLength={LIMITS.phone}
      autoComplete="tel" defaultValue={values?.phone ?? ''}
      aria-invalid={errors?.phone ? true : undefined} aria-describedby={describedBy('phone', true)} className={CONTROL} />
  </Field>
  <Field field="projectType" label={t('fields.projectType.label')} required error={errorText('projectType')}>
    <select id="brief-projectType" name="projectType" required aria-required="true"
      defaultValue={values?.projectType ?? ''} aria-invalid={errors?.projectType ? true : undefined}
      aria-describedby={describedBy('projectType', false)} className={CONTROL}>
      <option value="">{t('fields.projectType.placeholder')}</option>
      {PROJECT_TYPES.map((key) => <option key={key} value={key}>{t(`projectTypeOptions.${key}`)}</option>)}
    </select>
  </Field>
  <Field field="location" label={t('fields.location.label')} help={t('fields.location.help')} error={errorText('location')}>
    <input id="brief-location" name="location" type="text" maxLength={LIMITS.location}
      placeholder={t('fields.location.placeholder')} defaultValue={values?.location ?? ''}
      aria-invalid={errors?.location ? true : undefined} aria-describedby={describedBy('location', true)} className={CONTROL} />
  </Field>
  <Field field="propertyStage" label={t('fields.propertyStage.label')} error={errorText('propertyStage')}>
    <select id="brief-propertyStage" name="propertyStage" defaultValue={values?.propertyStage ?? ''}
      aria-invalid={errors?.propertyStage ? true : undefined}
      aria-describedby={describedBy('propertyStage', false)} className={CONTROL}>
      <option value="">{t('fields.propertyStage.placeholder')}</option>
      {STAGES.map((key) => <option key={key} value={key}>{t(`stageOptions.${key}`)}</option>)}
    </select>
  </Field>
  <Field field="area" label={t('fields.area.label')} error={errorText('area')}>
    <input id="brief-area" name="area" type="text" inputMode="decimal" maxLength={LIMITS.area}
      placeholder={t('fields.area.placeholder')} defaultValue={values?.area ?? ''}
      aria-invalid={errors?.area ? true : undefined} aria-describedby={describedBy('area', false)} className={CONTROL} />
  </Field>
  <fieldset id="brief-desiredScope" className="md:col-span-2 border-0 p-0 m-0"
    aria-invalid={errors?.desiredScope ? true : undefined}
    aria-describedby={describedBy('desiredScope', true)}>
    <legend>{t('fields.desiredScope.label')}</legend>
    <p id="brief-desiredScope-help">{t('fields.desiredScope.help')}</p>
    {SCOPE_ITEMS.map((key) => (
      <label key={key} htmlFor={`brief-desiredScope-${key}`}>
        <input id={`brief-desiredScope-${key}`} type="checkbox" name="desiredScope" value={key}
          defaultChecked={values?.desiredScope.includes(key) ?? false} />
        <span>{t(`scopeOptions.${key}`)}</span>
      </label>
    ))}
    {errors?.desiredScope && <p id="brief-desiredScope-error">{errorText('desiredScope')}</p>}
  </fieldset>
  <Field field="designStart" label={t('fields.designStart.label')} error={errorText('designStart')}>
    <input id="brief-designStart" name="designStart" type="text" maxLength={LIMITS.designStart}
      placeholder={t('fields.designStart.placeholder')} defaultValue={values?.designStart ?? ''}
      aria-invalid={errors?.designStart ? true : undefined}
      aria-describedby={describedBy('designStart', false)} className={CONTROL} />
  </Field>
  <Field field="constructionStart" label={t('fields.constructionStart.label')} error={errorText('constructionStart')}>
    <input id="brief-constructionStart" name="constructionStart" type="text"
      maxLength={LIMITS.constructionStart} placeholder={t('fields.constructionStart.placeholder')}
      defaultValue={values?.constructionStart ?? ''}
      aria-invalid={errors?.constructionStart ? true : undefined}
      aria-describedby={describedBy('constructionStart', false)} className={CONTROL} />
  </Field>
  <Field field="budget" className="md:col-span-2" label={t('fields.budget.label')} help={t('fields.budget.help')} error={errorText('budget')}>
    <input id="brief-budget" name="budget" type="text" maxLength={LIMITS.budget}
      defaultValue={values?.budget ?? ''} aria-invalid={errors?.budget ? true : undefined}
      aria-describedby={describedBy('budget', true)} className={CONTROL} />
  </Field>
  <Field field="requirements" className="md:col-span-2" label={t('fields.requirements.label')} help={t('fields.requirements.help')} error={errorText('requirements')}>
    <textarea id="brief-requirements" name="requirements" rows={4} maxLength={LIMITS.requirements}
      defaultValue={values?.requirements ?? ''} aria-invalid={errors?.requirements ? true : undefined}
      aria-describedby={describedBy('requirements', true)} className={`${CONTROL} resize-y`} />
  </Field>
  <Field field="plansUrl" className="md:col-span-2" label={t('fields.plansUrl.label')} help={t('fields.plansUrl.help')} error={errorText('plansUrl')}>
    <input id="brief-plansUrl" name="plansUrl" type="url" inputMode="url"
      maxLength={LIMITS.plansUrl} placeholder={t('fields.plansUrl.placeholder')}
      defaultValue={values?.plansUrl ?? ''} aria-invalid={errors?.plansUrl ? true : undefined}
      aria-describedby={describedBy('plansUrl', true)} className={CONTROL} />
  </Field>
</div>
<input type="hidden" name="language" value={locale === 'en' ? 'en' : 'pl'} />
```

Replace summary iteration with compile-ready full-order logic:

```ts
const rows = INQUIRY_SUBMISSION_FIELD_ORDER.map((field) => {
  let value: string;
  if (field === 'projectType') value = submitted.projectType
    ? t(`projectTypeOptions.${submitted.projectType}`) : '';
  else if (field === 'propertyStage') value = submitted.propertyStage
    ? t(`stageOptions.${submitted.propertyStage}`) : '';
  else if (field === 'desiredScope') value = submitted.desiredScope
    .map((key) => t(`scopeOptions.${key}`)).join(', ');
  else if (field === 'language') value = t(`languageOptions.${submitted.language}`);
  else value = submitted[field];
  return { field, value };
}).filter(({ value }) => value.length > 0);
```

Add `brief.fields.language.label` and `brief.languageOptions.pl/en` in both message files so the hidden language appears in the localized submitted summary.

Use these exact new/renamed values:

```json
"phone": { "label": "Telefon (opcjonalnie)", "help": "Jeśli wolisz kontakt telefoniczny." },
"propertyStage": { "label": "Etap nieruchomości", "placeholder": "Wybierz…" },
"designStart": { "label": "Pożądany start projektu", "placeholder": "np. wrzesień 2026" },
"constructionStart": { "label": "Planowany start realizacji", "placeholder": "np. wiosna 2027" },
"desiredScope": { "label": "Oczekiwany zakres", "help": "Zaznacz, co Cię interesuje." },
"requirements": { "label": "Wymagania i priorytety", "help": "Opisz potrzeby, ograniczenia i to, co powinno działać lepiej. Maks. 1000 znaków." },
"language": { "label": "Język korespondencji" },
"languageOptions": { "pl": "polski", "en": "angielski" }
```

```json
"phone": { "label": "Phone (optional)", "help": "If you prefer us to contact you by phone." },
"propertyStage": { "label": "Property stage", "placeholder": "Choose…" },
"designStart": { "label": "Desired design start", "placeholder": "e.g. September 2026" },
"constructionStart": { "label": "Planned construction start", "placeholder": "e.g. spring 2027" },
"desiredScope": { "label": "Desired scope", "help": "Select what you are interested in." },
"requirements": { "label": "Requirements and priorities", "help": "Describe your needs, constraints, and what should work better. Maximum 1,000 characters." },
"language": { "label": "Correspondence language" },
"languageOptions": { "pl": "Polish", "en": "English" }
```

Place `languageOptions` beside `projectTypeOptions`/`stageOptions`/`scopeOptions`, not inside `fields`.

- [ ] **Step 7: Run GREEN and commit**

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/brief-validation.test.ts
pnpm exec vitest run lib/brief-action.test.ts
pnpm typecheck
pnpm check:i18n
git add tests/brief-validation.test.ts lib/brief-action.test.ts lib/brief.ts app/'[locale]'/kontakt/actions.ts app/'[locale]'/kontakt/brief-state.ts components/kontakt/BriefForm.tsx messages/pl.json messages/en.json
git commit -m "feat: migrate project enquiry delivery"
```

Expected: validation/action tests, typecheck, and i18n parity pass; no legacy `completionDate` acceptance remains.

---

### Task 3: Make the Modal Always-On and Own the Controlled Draft Lifetime

**Files:**
- Create: `components/kontakt/BriefModal.test.tsx`
- Modify: `components/kontakt/BriefModal.tsx`
- Modify: `components/kontakt/BriefForm.tsx`
- Modify: `app/[locale]/kontakt/actions.ts`
- Modify: `app/[locale]/kontakt/brief-state.ts`
- Modify: `lib/analytics.ts`
- Modify: `components/oferta/ContactBriefCta.tsx`
- Modify: `components/oferta/ResidentialDetails.tsx`
- Modify: `components/oferta/CommercialDetails.tsx`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: Task 1 patch helpers and Task 2 canonical action/state
- Produces: `BriefFormProps`, always-on CTA, page-scoped draft, stable timestamp, one-shot started guard, and success-only reset

- [ ] **Step 1: Create compile-ready modal test setup and failing lifetime tests**

Create `components/kontakt/BriefModal.test.tsx` with this complete deterministic shell:

```tsx
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BriefModal from '@/components/kontakt/BriefModal';
import type { BriefFormProps } from '@/components/kontakt/BriefForm';
import { validateBrief } from '@/lib/brief';

const trackMock = vi.hoisted(() => vi.fn());
type ProbeMode = 'form' | 'success' | 'error' | 'fallback';
const formProbe = vi.hoisted(() => ({
  props: null as BriefFormProps | null,
  mode: 'form' as ProbeMode,
  submittedTimestamp: null as number | null,
}));
const navigationMock = vi.hoisted(() => vi.fn());
const NOW = 1_800_000_000_000;

vi.mock('next-intl', () => ({
  useLocale: () => 'pl',
  useTranslations: () => (key: string) => key,
}));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));
vi.mock('@/lib/analytics', () => ({ track: trackMock }));
vi.mock('@/components/kontakt/BriefForm', () => ({
  default: (props: BriefFormProps) => {
    formProbe.props = props;
    if (formProbe.mode !== 'form') {
      return (
        <section>
          <div tabIndex={-1} data-testid={`probe-${formProbe.mode}`}>
            {`probe-${formProbe.mode}`}
          </div>
          <a href={`#${formProbe.mode}`}>{`${formProbe.mode}-link`}</a>
        </section>
      );
    }
    return (
      <form
        id="brief-form"
        onSubmit={(event) => {
          event.preventDefault();
          formProbe.submittedTimestamp = props.renderedAt;
        }}
      >
        <input
          aria-label="probe-name"
          value={props.draft.name}
          onFocus={props.onStarted}
          onChange={(event) => props.onDraftPatch({ name: event.target.value })}
        />
        <input name="ts" type="hidden" value={props.renderedAt ?? ''} />
        <button type="button" onClick={props.onDelivered}>probe-success</button>
        <button type="submit">probe-submit</button>
      </form>
    );
  },
}));

const motionTags = vi.hoisted(() => new Map<string, ComponentType<Record<string, unknown>>>());
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: new Proxy({}, {
    get: (_target, tag) => {
      const name = String(tag);
      if (!motionTags.has(name)) {
        const Motion = ({ children, initial, animate, exit, transition, ...props }:
          ComponentProps<'div'> & Record<string, unknown>) =>
          createElement(name, props, children);
        motionTags.set(name, Motion);
      }
      return motionTags.get(name);
    },
  }),
}));

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW);
});
afterEach(() => {
  cleanup();
  formProbe.props = null;
  formProbe.mode = 'form';
  formProbe.submittedTimestamp = null;
  trackMock.mockReset();
  navigationMock.mockReset();
  vi.restoreAllMocks();
  vi.useRealTimers();
  window.history.replaceState(null, '', '/pl/kontakt');
  document.documentElement.style.overflow = '';
});
```

Add these complete CTA, lifetime, remount, and hash tests. The hash test must schedule the effect before timers advance:

```tsx
it('renders the always-on CTA and tracks an argument-free open', () => {
  render(<BriefModal navigateToMailto={navigationMock} />);
  const opener = screen.getByRole('button', { name: /openCta/ });
  expect(opener).toBeTruthy();
  expect(navigationMock).not.toHaveBeenCalled();
  fireEvent.click(opener);
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(trackMock).toHaveBeenCalledWith('contact_form_opened');
  expect(trackMock.mock.calls.every((call) => call.length === 1)).toBe(true);
  expect(navigationMock).not.toHaveBeenCalled();
});

it('opens from #brief after the effect schedules its timer', () => {
  vi.useFakeTimers();
  window.history.replaceState(null, '', '/pl/kontakt#brief');
  render(<BriefModal />);
  act(() => vi.runAllTimers());
  expect(screen.getByRole('dialog')).toBeTruthy();
});

it('preserves draft and timestamp across close/reopen, then resets only on success', () => {
  render(<BriefModal navigateToMailto={navigationMock} />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect(navigationMock).not.toHaveBeenCalled();
  const name = screen.getByLabelText('probe-name');
  fireEvent.focus(name);
  fireEvent.change(name, { target: { value: 'Ola' } });
  fireEvent.focus(name);
  expect(trackMock.mock.calls.filter(([event]) => event === 'contact_form_started')).toHaveLength(1);
  expect(navigationMock).not.toHaveBeenCalled();
  const timestamp = (document.querySelector('[name="ts"]') as HTMLInputElement).value;
  fireEvent.click(screen.getByRole('button', { name: /close/ }));
  expect(navigationMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect((screen.getByLabelText('probe-name') as HTMLInputElement).value).toBe('Ola');
  expect((document.querySelector('[name="ts"]') as HTMLInputElement).value).toBe(timestamp);
  fireEvent.focus(screen.getByLabelText('probe-name'));
  expect(trackMock.mock.calls.filter(([event]) => event === 'contact_form_started')).toHaveLength(1);
  expect(navigationMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'probe-success' }));
  expect(formProbe.props?.draft.name).toBe('');
  expect(formProbe.props?.renderedAt).toBeNull();
  expect(navigationMock).not.toHaveBeenCalled();
});

it('starts with a blank draft after a hard component remount', () => {
  const first = render(<BriefModal navigateToMailto={navigationMock} />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  fireEvent.change(screen.getByLabelText('probe-name'), { target: { value: 'Ola' } });
  expect((screen.getByLabelText('probe-name') as HTMLInputElement).value).toBe('Ola');
  first.unmount();
  render(<BriefModal navigateToMailto={navigationMock} />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect((screen.getByLabelText('probe-name') as HTMLInputElement).value).toBe('');
  expect(navigationMock).not.toHaveBeenCalled();
});

it('uses the original timestamp for an immediate submit after close/reopen', () => {
  vi.mocked(Date.now).mockReturnValue(NOW - 10_000);
  render(<BriefModal navigateToMailto={navigationMock} />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  const originalTimestamp = Number(
    (document.querySelector('[name="ts"]') as HTMLInputElement).value,
  );
  fireEvent.click(screen.getByRole('button', { name: /close/ }));
  vi.mocked(Date.now).mockReturnValue(NOW);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  fireEvent.submit(document.getElementById('brief-form')!);
  expect(formProbe.submittedTimestamp).toBe(originalTimestamp);
  const result = validateBrief({
    name: 'A', email: 'a@b.co', projectType: 'inne', language: 'pl',
    company: '', ts: String(formProbe.submittedTimestamp),
  }, NOW);
  expect(result.spam).toBe(false);
  expect(navigationMock).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run components/kontakt/BriefModal.test.tsx
```

Expected: FAIL because the CTA is feature-gated and state/timestamp/start guard live in the conditional form.

- [ ] **Step 3: Replace modal feature-gate/lifetime state with this exact ownership**

```ts
export interface BriefModalProps {
  navigateToMailto?: (href: string) => void;
}
```

Change the component signature to `export default function BriefModal({ navigateToMailto }: BriefModalProps = {}) {`, then use this state body:

```ts
const locale = useLocale();
const language: InquiryLanguage = locale === 'en' ? 'en' : 'pl';
const [open, setOpen] = useState(false);
const [draft, setDraft] = useState<InquiryDraft>(() => createInquiryDraft(language));
const [renderedAt, setRenderedAt] = useState<number | null>(null);
const startedRef = useRef(false);

const patchDraft = useCallback((patch: InquiryDraftPatch) => {
  setDraft((current) => {
    const result = applyInquiryDraftPatch(current, patch);
    return result.ok ? result.draft : current;
  });
}, []);
const markStarted = useCallback(() => {
  if (startedRef.current) return;
  startedRef.current = true;
  track('contact_form_started');
}, []);
const resetAfterDelivery = useCallback(() => {
  setDraft(createInquiryDraft(language));
  setRenderedAt(null);
  startedRef.current = false;
}, [language]);
const show = useCallback(() => {
  setRenderedAt((current) => current ?? Date.now());
  setOpen(true);
  track('contact_form_opened');
}, []);
```

Delete `useSyncExternalStore`, `featureFlagEnabled`, `subscribeFeatureFlags`, `formEnabled`, and the fail-closed return. Keep the existing delayed `#brief` effect calling `show()`.

- [ ] **Step 4: Convert the form to the exact controlled contract**

Export:

```ts
export interface BriefFormProps {
  draft: InquiryDraft;
  renderedAt: number | null;
  onDraftPatch: (patch: InquiryDraftPatch) => void;
  onStarted: () => void;
  onDelivered: () => void;
  navigateToMailto?: (href: string) => void;
}
```

Mount it from the modal:

```tsx
<BriefForm
  draft={draft}
  renderedAt={renderedAt}
  onDraftPatch={patchDraft}
  onStarted={markStarted}
  onDelivered={resetAfterDelivery}
  navigateToMailto={navigateToMailto}
/>
```

Every scalar uses this compile-ready pattern with its own canonical key:

```tsx
<input
  id="brief-phone"
  name="phone"
  type="tel"
  value={draft.phone}
  onChange={(event) => onDraftPatch({ phone: event.target.value })}
  maxLength={LIMITS.phone}
  autoComplete="tel"
  aria-invalid={errors?.phone ? true : undefined}
  aria-describedby={describedBy('phone', true)}
  className={CONTROL}
/>
```

Selects use `value={draft.projectType}` / `value={draft.propertyStage}` and smallest patches. Scope uses:

```tsx
checked={draft.desiredScope.includes(key)}
onChange={(event) => onDraftPatch({
  desiredScope: event.target.checked
    ? [...draft.desiredScope, key]
    : draft.desiredScope.filter((item) => item !== key),
})}
```

Hidden mechanics are:

```tsx
<input type="hidden" name="ts" value={renderedAt === null ? '' : String(renderedAt)} />
<input type="hidden" name="language" value={draft.language} />
```

For every Task 2 scalar control, replace `defaultValue={values?.field ?? ''}` with the exact controlled pair `value={draft.field}` and `onChange={(event) => onDraftPatch({ field: event.target.value })}`. For narrowed selects use:

```tsx
onChange={(event) => onDraftPatch({
  projectType: event.target.value as InquiryDraft['projectType'],
})}
```

and:

```tsx
onChange={(event) => onDraftPatch({
  propertyStage: event.target.value as InquiryDraft['propertyStage'],
})}
```

Remove `values` from rendering entirely.

Delete action-state echo values and `BriefEchoValues`; parent state preserves invalid/error/fallback drafts. Wire the form interaction boundary exactly:

```ts
const handleMeaningfulInteraction = (event: React.SyntheticEvent) => {
  const name = (event.target as HTMLElement & { name?: string }).name;
  if (name === 'company' || name === 'ts') return;
  onStarted();
};
```

Use it as both `onFocusCapture` and `onInput`. Explicitly delete both existing post-submit effects, including the old `window.location.href = state.fallback.mailtoHref` line. Replace them with these complete focus and one-shot terminal effects:

```ts
function navigateBrowserToMailto(href: string) {
  window.location.href = href;
}

const invalidSummaryRef = useRef<HTMLParagraphElement>(null);
const focusedResponseRef = useRef<number | null>(null);
const handledResponseRef = useRef<number | null>(null);

useEffect(() => {
  if (state.submittedAt === undefined || focusedResponseRef.current === state.submittedAt) return;
  focusedResponseRef.current = state.submittedAt;
  if (state.status === 'invalid' && state.errors) {
    const firstVisible = INQUIRY_VISIBLE_FIELD_ORDER.find((field) => state.errors?.[field]);
    const target = firstVisible ? document.getElementById(`brief-${firstVisible}`) : null;
    if (target) target.focus();
    else invalidSummaryRef.current?.focus();
    return;
  }
  if (state.status === 'error') {
    formErrorRef.current?.focus();
    return;
  }
  if (state.status === 'success' || state.status === 'fallback') {
    resultRef.current?.focus();
  }
}, [state]);

useEffect(() => {
  if (state.submittedAt === undefined || handledResponseRef.current === state.submittedAt) return;
  handledResponseRef.current = state.submittedAt;
  if (state.status === 'success') {
    track('contact_form_submitted');
    onDelivered();
  } else if (state.status === 'fallback' && state.fallback) {
    track('contact_form_mailto_fallback');
    const openMailClient = navigateToMailto ?? navigateBrowserToMailto;
    openMailClient(state.fallback.mailtoHref);
  }
}, [state, onDelivered, navigateToMailto]);
```

Render the invalid summary with `ref={invalidSummaryRef}` and `tabIndex={-1}`. `resultRef` and `formErrorRef` remain on their existing programmatically focusable panels. Exactly one function—the injected `navigateToMailto` or production `navigateBrowserToMailto`—is called once for each distinct fallback response identity.

Invalid/error/fallback never call `onDelivered()`.

At the same boundary delete `echo()` and every `values` property from `submitBrief`; final spam/invalid states are exactly:

```ts
if (result.spam) {
  return { status: 'error', formError: 'generic', submittedAt };
}
if (!isBriefValid(result)) {
  return { status: 'invalid', errors: result.errors, submittedAt };
}
```

Fallback retains only `fallback`, normalized `submitted`, and `submittedAt`; controlled parent state preserves editable values.

- [ ] **Step 5: Remove only dead gate code and document residual risk**

Run `rg -n 'featureFlagEnabled|subscribeFeatureFlags|brief-form|flag-gated' --glob '!docs/**' --glob '!node_modules/**'`. If the two helpers have no new consumer, delete them and their feature-store comments from `lib/analytics.ts`; retain all consent-store code. Update three offer comments and replace `CLAUDE.md` guidance with always-on behavior plus this exact boundary:

```text
The unauthenticated action retains validation, honeypot, timing, disabled-pending, and provider controls, but determined automation, distributed abuse, and replay remain possible. Distributed rate limiting, idempotency, and submission references are Phase 5 work; do not add a process-memory limiter or vendor without separate design.
```

- [ ] **Step 6: Run GREEN and commit**

```bash
pnpm exec vitest run components/kontakt/BriefModal.test.tsx
pnpm typecheck
pnpm lint
rg -n 'featureFlagEnabled|subscribeFeatureFlags|brief-form|flag-gated' --glob '!docs/**' --glob '!node_modules/**'
git add components/kontakt/BriefModal.tsx components/kontakt/BriefForm.tsx components/kontakt/BriefModal.test.tsx app/'[locale]'/kontakt/actions.ts app/'[locale]'/kontakt/brief-state.ts lib/analytics.ts components/oferta/ContactBriefCta.tsx components/oferta/ResidentialDetails.tsx components/oferta/CommercialDetails.tsx CLAUDE.md
git commit -m "feat: make project enquiry always available"
```

Expected: tests/type/lint pass and final search has no runtime/stale gate references.

---


### Task 4: Implement Focus Containment, Background Suppression, and Deferred Restoration

**Files:**
- Modify: `components/kontakt/BriefModal.tsx`
- Modify: `components/kontakt/BriefModal.test.tsx`

**Interfaces:**
- Consumes: Task 3 modal refs/state
- Produces: dynamic focus containment, exact `inert`/`aria-hidden` cleanup, scroll cleanup, and opener focus only after close cleanup

- [ ] **Step 1: Write failing focus/cleanup/restoration tests**

The Task 3 `formProbe.mode` setup can render `form`, `success`, `error`, and `fallback`. Add exactly these eight compile-ready tests:

```tsx
it('focuses the close button initially', async () => {
  render(<BriefModal />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  await waitFor(() => expect(document.activeElement)
    .toBe(screen.getByRole('button', { name: /close/ })));
});

it('wraps Tab from the last form control to close', () => {
  render(<BriefModal />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  const last = screen.getByRole('button', { name: 'probe-submit' });
  last.focus();
  fireEvent.keyDown(window, { key: 'Tab' });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/ }));
});

it('wraps Shift-Tab from close to the last form control', () => {
  render(<BriefModal />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  const closeButton = screen.getByRole('button', { name: /close/ });
  closeButton.focus();
  fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'probe-submit' }));
});

it('moves Tab from every programmatic result panel to the first sequential control', () => {
  for (const mode of ['success', 'error', 'fallback'] as const) {
    const view = render(<BriefModal />);
    fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
    formProbe.mode = mode;
    view.rerender(<BriefModal />);
    const panel = screen.getByTestId(`probe-${mode}`);
    panel.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/ }));
    view.unmount();
  }
});

it('moves Shift-Tab from every programmatic result panel to its last sequential control', () => {
  for (const mode of ['success', 'error', 'fallback'] as const) {
    const view = render(<BriefModal />);
    fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
    formProbe.mode = mode;
    view.rerender(<BriefModal />);
    const panel = screen.getByTestId(`probe-${mode}`);
    panel.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('link', { name: `${mode}-link` }));
    view.unmount();
  }
});

it('closes by Escape and by the backdrop itself', async () => {
  render(<BriefModal />);
  const opener = screen.getByRole('button', { name: /openCta/ });
  fireEvent.click(opener);
  fireEvent.keyDown(window, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(opener);
  const dialog = screen.getByRole('dialog');
  fireEvent.mouseDown(dialog);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('restores exact background state before restoring opener focus', async () => {
  const background = document.createElement('main');
  background.inert = false;
  background.setAttribute('aria-hidden', 'false');
  document.body.appendChild(background);
  render(<BriefModal />);
  const opener = screen.getByRole('button', { name: /openCta/ });
  fireEvent.click(opener);
  expect(background.inert).toBe(true);
  expect(background.getAttribute('aria-hidden')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: /close/ }));
  await waitFor(() => expect(document.activeElement).toBe(opener));
  expect(background.inert).toBe(false);
  expect(background.getAttribute('aria-hidden')).toBe('false');
  background.remove();
});

it('restores pre-existing inert, absent aria-hidden, and overflow on unmount', () => {
  const background = document.createElement('aside');
  background.inert = true;
  document.body.appendChild(background);
  document.documentElement.style.overflow = 'clip';
  const view = render(<BriefModal />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect(document.documentElement.style.overflow).toBe('hidden');
  expect(background.getAttribute('aria-hidden')).toBe('true');
  view.unmount();
  expect(background.inert).toBe(true);
  expect(background.hasAttribute('aria-hidden')).toBe(false);
  expect(document.documentElement.style.overflow).toBe('clip');
  background.remove();
});
```

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run components/kontakt/BriefModal.test.tsx -t "focus|Tab|background|restore|Escape|backdrop"
```

- [ ] **Step 3: Add complete focus/suppression helpers**

```ts
const FOCUSABLE_SELECTOR = [
  'a[href]', 'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      const style = window.getComputedStyle(element);
      return !element.hidden
        && element.getAttribute('aria-hidden') !== 'true'
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    },
  );
}

interface SuppressedState {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
}

function suppressOutside(dialog: HTMLElement): () => void {
  const seen = new Set<HTMLElement>();
  const states: SuppressedState[] = [];
  let node: HTMLElement = dialog;
  while (node.parentElement) {
    const parent = node.parentElement;
    for (const sibling of Array.from(parent.children)) {
      if (!(sibling instanceof HTMLElement)) continue;
      if (sibling === node || sibling.contains(dialog) || seen.has(sibling)) continue;
      seen.add(sibling);
      states.push({
        element: sibling,
        inert: sibling.inert,
        ariaHidden: sibling.getAttribute('aria-hidden'),
      });
      sibling.inert = true;
      sibling.setAttribute('aria-hidden', 'true');
    }
    node = parent;
    if (parent === document.body) break;
  }
  return () => {
    for (const state of states.reverse()) {
      state.element.inert = state.inert;
      if (state.ariaHidden === null) state.element.removeAttribute('aria-hidden');
      else state.element.setAttribute('aria-hidden', state.ariaHidden);
    }
  };
}
```

- [ ] **Step 4: Replace the open effect and close ordering with compile-ready logic**

Attach `dialogRef` and `tabIndex={-1}` to the element with `role="dialog"`. Use:

```ts
const pendingRestoreRef = useRef<HTMLElement | null>(null);
const close = useCallback(() => {
  pendingRestoreRef.current = triggerRef.current;
  setOpen(false);
}, []);

useEffect(() => {
  if (open || !pendingRestoreRef.current) return;
  const target = pendingRestoreRef.current;
  pendingRestoreRef.current = null;
  const timeout = window.setTimeout(() => target.focus(), 0);
  return () => window.clearTimeout(timeout);
}, [open]);

useEffect(() => {
  if (!open || !dialogRef.current) return;
  const dialog = dialogRef.current;
  closeRef.current?.focus();
  const restoreOutside = suppressOutside(dialog);
  const previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const available = focusables(dialog);
    if (!available.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = available[0];
    const last = available[available.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const activeIndex = active ? available.indexOf(active) : -1;
    if (event.shiftKey && activeIndex <= 0) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (activeIndex === -1 || activeIndex === available.length - 1)) {
      event.preventDefault();
      first.focus();
    }
  };
  window.addEventListener('keydown', onKeyDown);
  return () => {
    window.removeEventListener('keydown', onKeyDown);
    document.documentElement.style.overflow = previousOverflow;
    restoreOutside();
  };
}, [open, close]);
```

Because React runs the open-effect cleanup before the subsequent `[open]` effect, and restoration is deferred to the next event-loop task, the opener is no longer inert when focused. Closing never synchronously focuses it.

- [ ] **Step 5: Run GREEN and commit**

```bash
pnpm exec vitest run components/kontakt/BriefModal.test.tsx
pnpm typecheck
pnpm lint
git add components/kontakt/BriefModal.tsx components/kontakt/BriefModal.test.tsx
git commit -m "fix: contain focus in enquiry dialog"
```

---


### Task 5: Publish Exact Localized Form and Privacy Disclosure

**Files:**
- Modify: `components/kontakt/BriefForm.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`
- Create: `lib/brief-privacy.test.ts`

**Interfaces:**
- Consumes: canonical field/language message keys from Task 2
- Produces: localized privacy-policy link and exact provider/mailto disclosure without consent UI

- [ ] **Step 1: Write failing bilingual content tests**

Create `lib/brief-privacy.test.ts`:

```ts
import en from '@/messages/en.json';
import pl from '@/messages/pl.json';
import { describe, expect, it } from 'vitest';

describe('project enquiry privacy copy', () => {
  it('discloses provider handling and the email-app fallback in both notices', () => {
    expect(pl.brief.privacy.beforeLink).toContain('dostawca poczty');
    expect(pl.brief.privacy.beforeLink).toContain('programie pocztowym');
    expect(pl.brief.privacy.link).toBe('polityce prywatności');
    expect(en.brief.privacy.beforeLink).toContain('email provider');
    expect(en.brief.privacy.beforeLink).toContain('email app');
    expect(en.brief.privacy.link).toBe('privacy policy');
  });

  it('names Resend and covers optional phone and plan links in the full policy', () => {
    expect(pl.privacy.contactBody).toContain('Resend');
    expect(pl.privacy.contactBody).toContain('opcjonalny numer telefonu');
    expect(pl.privacy.contactBody).toContain('link do rzutów lub zdjęć');
    expect(en.privacy.contactBody).toContain('Resend');
    expect(en.privacy.contactBody).toContain('optional phone number');
    expect(en.privacy.contactBody).toContain('link to plans or photos');
  });
});
```

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run lib/brief-privacy.test.ts
```

Expected: FAIL because the short notice is a string and full policy lacks canonical/provider details.

- [ ] **Step 3: Install exact notice fragments and internal link**

Use these exact message objects:

```json
"privacy": {
  "beforeLink": "Dane z formularza wykorzystamy, aby odpowiedzieć na Twoje zapytanie. Skonfigurowaną wysyłkę obsługuje nasz dostawca poczty; jeśli formularz nie może wysłać wiadomości, otworzymy gotowy brief w Twoim programie pocztowym. Szczegóły znajdziesz w ",
  "link": "polityce prywatności",
  "afterLink": "."
}
```

```json
"privacy": {
  "beforeLink": "We use the form details to reply to your enquiry. Configured delivery is handled by our email provider; if the form cannot send the message, we will open a prepared brief in your email app. See our ",
  "link": "privacy policy",
  "afterLink": " for details."
}
```

Render with the project navigation helper:

```tsx
<p className="text-muted text-[13px] leading-[1.5] max-w-[560px]">
  {t('privacy.beforeLink')}
  <Link
    href="/polityka-prywatnosci"
    className="underline underline-offset-2 hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
  >
    {t('privacy.link')}
  </Link>
  {t('privacy.afterLink')}
</p>
```

Add no checkbox or new validation condition.

- [ ] **Step 4: Replace both `privacy.contactBody` values exactly**

Polish:

```text
Gdy piszesz na hello@koolstudio.pl lub wysyłasz brief przez formularz, przetwarzamy podane dane: imię, adres e-mail, opcjonalny numer telefonu i język korespondencji oraz informacje o projekcie (typ, lokalizacja, etap nieruchomości, przybliżona powierzchnia, zakres, terminy projektu i realizacji, budżet, wymagania oraz opcjonalny link do rzutów lub zdjęć). Używamy ich, aby odpowiedzieć i omówić możliwą współpracę. Gdy wysyłka formularza jest skonfigurowana, wiadomość do studia i potwierdzenie dla Ciebie obsługuje Resend, nasz dostawca wysyłki e-mail, który przetwarza dane w naszym imieniu. Jeśli formularz nie może wysłać wiadomości, strona tworzy gotowy brief w Twoim programie pocztowym; strona go nie wysyła — to Ty decydujesz, czy wysłać go z programu pocztowego. Korespondencję przechowujemy tak długo, jak wymaga tego prowadzona sprawa.
```

English:

```text
When you write to hello@koolstudio.pl or send a brief through the form, we process the details you provide: name, email address, optional phone number and correspondence language, plus project information (type, location, property stage, approximate area, scope, design and construction timing, budget, requirements, and an optional link to plans or photos). We use them to reply and discuss a potential collaboration. When form delivery is configured, Resend, our email-delivery provider acting as our processor, handles the message to the studio and your confirmation receipt. If the form cannot send the message, the site creates a prepared brief in your email app; the site does not send it — you decide whether to send it from the email app. We keep correspondence for as long as the matter requires.
```

Do not add a storage region, fixed retention period, or invented legal basis.

- [ ] **Step 5: Run GREEN and commit**

```bash
pnpm exec vitest run lib/brief-privacy.test.ts
pnpm check:i18n
pnpm typecheck
git add components/kontakt/BriefForm.tsx messages/pl.json messages/en.json lib/brief-privacy.test.ts
git commit -m "feat: disclose enquiry delivery paths"
```

---


### Task 6: Add Localized Component and Result-State Regression Coverage

**Files:**
- Create: `components/kontakt/BriefForm.test.tsx`
- Modify: `components/kontakt/BriefForm.tsx`
- Modify: `components/kontakt/BriefModal.test.tsx`

**Interfaces:**
- Consumes: real PL/EN messages, controlled props, canonical visible/submission orders, and action states
- Produces: exact localized control/result tests, visible-error/hidden-language focus behavior, explicit-only submission proof, and language summary proof

- [ ] **Step 1: Create complete real-next-intl test harness**

Create `components/kontakt/BriefForm.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { useState, type ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BriefForm from '@/components/kontakt/BriefForm';
import { initialBriefState, type BriefFormState } from '@/app/[locale]/kontakt/brief-state';
import {
  applyInquiryDraftPatch,
  createInquiryDraft,
  type InquiryDraft,
  type InquiryLanguage,
  type NormalizedBrief,
} from '@/lib/brief';
import enMessages from '@/messages/en.json';
import plMessages from '@/messages/pl.json';

const localeState = vi.hoisted(() => ({ locale: 'pl' as InquiryLanguage }));
const actionHarness = vi.hoisted(() => ({
  state: { status: 'idle' } as BriefFormState,
  formAction: vi.fn(),
  pending: false,
}));
const trackMock = vi.hoisted(() => vi.fn());
const onStarted = vi.fn();
const onDelivered = vi.fn();
const navigateToMailto = vi.fn();

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: () => [actionHarness.state, actionHarness.formAction, actionHarness.pending],
  };
});
vi.mock('@/lib/analytics', () => ({ track: trackMock }));
vi.mock('@/app/[locale]/kontakt/actions', () => ({ submitBrief: vi.fn() }));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));
vi.mock('framer-motion', () => ({ motion: { div: (props: ComponentProps<'div'>) => <div {...props} /> } }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: ComponentProps<'a'>) => (
    <a href={`/${localeState.locale}${String(href)}`} {...props}>{children}</a>
  ),
}));

const completeDraft: InquiryDraft = {
  name: 'Ola Testowa', email: 'ola@example.com', phone: '+48 600 700 800',
  projectType: 'mieszkanie', location: 'Wrocław', propertyStage: 'po-odbiorze',
  area: 'ok. 85 m²', desiredScope: ['uklad-funkcjonalny', 'nadzor-autorski'],
  designStart: 'Q4 2026', constructionStart: 'Q2 2027',
  budget: '180–220 tys. zł', requirements: 'Ciche miejsce do pracy.',
  plansUrl: 'https://drive.example.com/folder', language: 'pl',
};
const normalizedComplete: NormalizedBrief = { ...completeDraft };

function Harness({ initial = createInquiryDraft(localeState.locale) }: { initial?: InquiryDraft }) {
  const [draft, setDraft] = useState(initial);
  return (
    <NextIntlClientProvider
      locale={localeState.locale}
      messages={localeState.locale === 'en' ? enMessages : plMessages}
    >
      <BriefForm
        draft={draft}
        renderedAt={1_799_999_990_000}
        onDraftPatch={(patch) => setDraft((current) => {
          const result = applyInquiryDraftPatch(current, patch);
          return result.ok ? result.draft : current;
        })}
        onStarted={onStarted}
        onDelivered={onDelivered}
        navigateToMailto={navigateToMailto}
      />
    </NextIntlClientProvider>
  );
}

afterEach(() => {
  cleanup();
  actionHarness.state = initialBriefState;
  actionHarness.pending = false;
  actionHarness.formAction.mockReset();
  trackMock.mockReset();
  onStarted.mockReset();
  onDelivered.mockReset();
  navigateToMailto.mockReset();
  localeState.locale = 'pl';
});
```

- [ ] **Step 2: Write exact localized control and explicit-submit tests**

```tsx
it('renders only three required controls and canonical Polish attributes', () => {
  render(<Harness />);
  expect(Array.from(document.querySelectorAll('[aria-required="true"]')).map(
    (element) => element.getAttribute('name'),
  )).toEqual(['name', 'email', 'projectType']);
  const phone = screen.getByLabelText('Telefon (opcjonalnie)') as HTMLInputElement;
  expect(phone.type).toBe('tel');
  expect(phone.autocomplete).toBe('tel');
  expect((screen.getByLabelText('Przybliżona powierzchnia (m²)') as HTMLInputElement).inputMode)
    .toBe('decimal');
});

it('edits without submission and submits only from the visible form', async () => {
  const view = render(<Harness initial={completeDraft} />);
  fireEvent.change(screen.getByLabelText('Lokalizacja'), { target: { value: 'Poznań' } });
  fireEvent.change(screen.getByLabelText('Etap nieruchomości'), { target: { value: 'remont' } });
  expect(actionHarness.formAction).not.toHaveBeenCalled();
  expect(navigateToMailto).not.toHaveBeenCalled();
  fireEvent.submit(view.container.querySelector('form')!);
  await waitFor(() => expect(actionHarness.formAction).toHaveBeenCalledOnce());
  expect(navigateToMailto).not.toHaveBeenCalled();
});

it('controls desiredScope checkbox toggles and clears the complete array', () => {
  render(<Harness />);
  const layout = screen.getByLabelText('układ funkcjonalny') as HTMLInputElement;
  const supervision = screen.getByLabelText('nadzór autorski') as HTMLInputElement;
  fireEvent.click(supervision);
  fireEvent.click(layout);
  expect(layout.checked).toBe(true);
  expect(supervision.checked).toBe(true);
  fireEvent.click(layout);
  expect(layout.checked).toBe(false);
  expect(supervision.checked).toBe(true);
  fireEvent.click(supervision);
  expect(layout.checked).toBe(false);
  expect(supervision.checked).toBe(false);
  expect(navigateToMailto).not.toHaveBeenCalled();
});

it.each([
  ['pl', 'Telefon (opcjonalnie)', 'Pożądany start projektu', 'Planowany start realizacji', '/pl/polityka-prywatnosci'],
  ['en', 'Phone (optional)', 'Desired design start', 'Planned construction start', '/en/polityka-prywatnosci'],
] as const)('renders exact %s labels and localized privacy link', (
  locale, phone, design, construction, href,
) => {
  localeState.locale = locale;
  render(<Harness initial={{ ...completeDraft, language: locale }} />);
  expect(screen.getByLabelText(phone)).toBeTruthy();
  expect(screen.getByLabelText(design)).toBeTruthy();
  expect(screen.getByLabelText(construction)).toBeTruthy();
  const linkName = locale === 'pl' ? 'polityce prywatności' : 'privacy policy';
  expect(screen.getByRole('link', { name: linkName }).getAttribute('href')).toBe(href);
});
```

- [ ] **Step 3: Write exact visible/hidden error focus and result tests**

```tsx
it('focuses desiredScope fieldset for a tampered scope error', async () => {
  actionHarness.state = {
    status: 'invalid', errors: { desiredScope: 'option' }, submittedAt: 1,
  };
  render(<Harness />);
  const group = document.getElementById('brief-desiredScope')!;
  await waitFor(() => expect(document.activeElement).toBe(group));
  expect(group.getAttribute('aria-describedby')).toContain('brief-desiredScope-error');
});

it('focuses the invalid summary when hidden language is the first error', async () => {
  actionHarness.state = {
    status: 'invalid', errors: { language: 'option' }, submittedAt: 2,
  };
  render(<Harness />);
  const summary = screen.getByText('Popraw zaznaczone pola i wyślij ponownie.');
  await waitFor(() => expect(document.activeElement).toBe(summary));
});

it('uses actual localized pending and generic messages', async () => {
  actionHarness.pending = true;
  const pending = render(<Harness />);
  expect(screen.getByText('Wysyłanie briefu…')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Wysyłanie…' }) as HTMLButtonElement).disabled)
    .toBe(true);
  pending.unmount();
  actionHarness.pending = false;
  actionHarness.state = { status: 'error', formError: 'generic', submittedAt: 3 };
  render(<Harness />);
  const generic = screen.getByText(
    'Nie udało się wysłać formularza. Spróbuj ponownie za chwilę lub napisz bezpośrednio na hello@koolstudio.pl.',
  );
  await waitFor(() => expect(document.activeElement).toBe(generic));
});

it('shows localized language label/value in success summary and resets once', async () => {
  actionHarness.state = {
    status: 'success', submitted: normalizedComplete, submittedAt: 4,
  };
  render(<Harness initial={completeDraft} />);
  expect(await screen.findByText('Język korespondencji')).toBeTruthy();
  expect(screen.getByText('polski')).toBeTruthy();
  await waitFor(() => expect(onDelivered).toHaveBeenCalledOnce());
  expect(trackMock.mock.calls).toContainEqual(['contact_form_submitted']);
  expect(trackMock.mock.calls.every((call) => call.length === 1)).toBe(true);
});

it('shows actual fallback copy, manual link, and never clears the draft', async () => {
  const href = 'mailto:hello@koolstudio.pl?subject=Brief%20projektowy';
  actionHarness.state = {
    status: 'fallback', submitted: normalizedComplete,
    fallback: { reason: 'unconfigured', mailtoHref: href }, submittedAt: 5,
  };
  const view = render(<Harness initial={completeDraft} />);
  expect((await screen.findByRole('link', { name: 'Otwórz program pocztowy' })).getAttribute('href'))
    .toBe(href);
  expect(navigateToMailto).toHaveBeenCalledWith(href);
  expect(navigateToMailto).toHaveBeenCalledOnce();
  view.rerender(<Harness initial={completeDraft} />);
  expect(navigateToMailto).toHaveBeenCalledOnce();
  expect(onDelivered).not.toHaveBeenCalled();
  expect(trackMock.mock.calls).toContainEqual(['contact_form_mailto_fallback']);
});
```

- [ ] **Step 4: Finish the focusable invalid markup and full-order result rendering**

Retain the single response-focus effect and `invalidSummaryRef` introduced in Task 3; do not redeclare either. Replace the invalid status paragraph and controlled scope fieldset with:

```tsx
{!isPending && state.status === 'invalid' && (
  <p
    ref={invalidSummaryRef}
    tabIndex={-1}
    className="text-coral text-[15px] font-[500] outline-none"
  >
    {t('errors.summary')}
  </p>
)}

<fieldset
  id="brief-desiredScope"
  tabIndex={errors?.desiredScope ? -1 : undefined}
  className="md:col-span-2 border-0 p-0 m-0"
  aria-invalid={errors?.desiredScope ? true : undefined}
  aria-describedby={describedBy('desiredScope', true)}
>
  <legend>{t('fields.desiredScope.label')}</legend>
  <p id="brief-desiredScope-help">{t('fields.desiredScope.help')}</p>
  {SCOPE_ITEMS.map((key) => (
    <label key={key} htmlFor={`brief-desiredScope-${key}`}>
      <input
        id={`brief-desiredScope-${key}`}
        type="checkbox"
        name="desiredScope"
        value={key}
        checked={draft.desiredScope.includes(key)}
        onChange={(event) => onDraftPatch({
          desiredScope: event.target.checked
            ? [...draft.desiredScope, key]
            : draft.desiredScope.filter((item) => item !== key),
        })}
      />
      <span>{t(`scopeOptions.${key}`)}</span>
    </label>
  ))}
  {errors?.desiredScope && (
    <p id="brief-desiredScope-error">{errorText('desiredScope')}</p>
  )}
</fieldset>
```

Keep Task 2's `INQUIRY_SUBMISSION_FIELD_ORDER` summary iteration unchanged so its last row renders the localized language label and value.

- [ ] **Step 5: Run all focused/full tests and commit**

```bash
pnpm exec vitest run components/kontakt/BriefForm.test.tsx components/kontakt/BriefModal.test.tsx lib/brief-action.test.ts lib/brief-privacy.test.ts
pnpm test
pnpm typecheck
pnpm lint
pnpm check:i18n
git add components/kontakt/BriefForm.test.tsx components/kontakt/BriefForm.tsx components/kontakt/BriefModal.test.tsx
git commit -m "test: cover project enquiry workflow"
```

---


### Task 7: Run Full Verification and Manual Human-Workflow Checkpoint

**Files:**
- Verify: all Task 1–6 files
- Create only if needed for durable evidence: `.context/project-enquiry-form-verification.md`

**Interfaces:**
- Consumes: completed Phase 3
- Produces: fresh automated/manual evidence and explicit residual-risk limitation

- [ ] **Step 1: Run the complete gate in the background**

```bash
pnpm check
```

Expected exit 0: Vitest, Node tests, typecheck, lint, i18n parity, and production build pass.

- [ ] **Step 2: Audit the branch and forbidden capabilities**

```bash
git diff --check origin/main...HEAD
git status --short
git diff --stat origin/main...
rg -n 'kool_prepare_project_inquiry|kool_submit_project_inquiry|requestSubmit|localStorage|sessionStorage|identify\(' components/WebMcpProvider.tsx lib/webmcp components/kontakt lib/brief.ts app/'[locale]'/kontakt
rg -n 'featureFlagEnabled|subscribeFeatureFlags|brief-form|flag-gated' --glob '!docs/**' --glob '!node_modules/**'
rg -n "track\('contact_form_(opened|started|submitted|mailto_fallback)'" components/kontakt
```

Expected: diff check passes; only intended files changed; no WebMCP prepare/submit tool, programmatic submit, storage, enquiry identify, or stale gate; analytics calls have no second argument.

- [ ] **Step 3: Run a production-like site and manually check both locales**

Start on the isolated workspace port:

```bash
PORT=${CONDUCTOR_PORT:-8080} NEXT_PUBLIC_POSTHOG_KEY= pnpm start
```

At desktop and mobile widths verify `/pl/kontakt` and `/en/kontakt`: CTA without PostHog; CTA and `#brief`; Escape/backdrop/close; Tab/Shift-Tab; inert background; deferred focus restoration; draft/timestamp survives close but not reload; exact labels/privacy link; exactly three required controls; invalid/pending/generic/success/fallback focus/status; complete configured Resend email and draft-language receipt; no PII in analytics/storage/site URL/console; only explicit valid submit can produce mailto. Confirm site tools contain no prepare/submit capability and “send it now” cannot submit.

- [ ] **Step 4: Record limitations and residual abuse honestly**

If a browser session or safe Resend test credential is unavailable, record the exact unobserved manual items; do not claim mocked delivery as live delivery and do not invent credentials.

The handoff must include:

```text
The public unauthenticated server action is protected by validation, a honeypot, a minimum-time heuristic, a disabled pending control, and Resend/provider controls, but determined automated calls, distributed abuse, and replay remain possible. Distributed rate limiting, idempotency/replay protection, and submission references are deferred to Phase 5 and require a separate design; Phase 3 adds no in-memory limiter or new vendor.
```

- [ ] **Step 5: Inspect focused commits and stop before publication**

```bash
git log --oneline --decorate origin/main..HEAD
git status --short
```

Expected: focused domain, delivery, controlled UI, accessibility, privacy, and regression commits. Do not push, deploy, merge, or create a PR without explicit authorization.
