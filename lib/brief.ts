// Pure, framework-agnostic logic for the project-brief form.
// No 'use client' / 'use server' directive: this module is imported by the
// server action (app/[locale]/kontakt/actions.ts), by the client form
// (components/kontakt/BriefForm.tsx, types + option keys only) and by the
// Node validation test (tests/brief-validation.test.ts). Keep it side-effect
// free and dependency free so all three call sites stay in sync.

// The studio inbox every brief is addressed to. Matches the published
// contact email (footer + JSON-LD). Overridable at delivery time via
// BRIEF_TO_EMAIL, but this is the honest default shown to users.
export const BRIEF_CONTACT_EMAIL = 'hello@koolstudio.pl';

// Minimum time (ms) a human is expected to spend before submitting. A submit
// faster than this — with a roughly-synced clock — is treated as a bot.
export const MIN_SUBMIT_MS = 3000;

// Stable option keys submitted by the form. Display labels are localised in
// messages/*.json (client) and mapped to canonical Polish below (email body).
export const PROJECT_TYPES = ['mieszkanie', 'dom', 'komercyjne', 'inne'] as const;
export const STAGES = [
  'zakup',
  'przed-zmianami',
  'w-budowie',
  'po-odbiorze',
  'remont',
] as const;
export const SCOPE_ITEMS = [
  'uklad-funkcjonalny',
  'projekt-koncepcyjny',
  'dokumentacja-wykonawcza',
  'zabudowy-na-wymiar',
  'zestawienia-wyceny',
  'nadzor-autorski',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type Stage = (typeof STAGES)[number];
export type ScopeItem = (typeof SCOPE_ITEMS)[number];

// Text-length caps (characters). Server-enforced; the client also sets
// maxLength for immediate feedback.
export const LIMITS = {
  name: 120,
  email: 254,
  location: 160,
  area: 40,
  startDate: 60,
  completionDate: 60,
  budget: 80,
  priorities: 1000,
  plansUrl: 600,
} as const;

export type BriefField =
  | 'name'
  | 'email'
  | 'projectType'
  | 'location'
  | 'stage'
  | 'area'
  | 'startDate'
  | 'completionDate'
  | 'scope'
  | 'budget'
  | 'priorities'
  | 'plansUrl';

// Field order used for focus management, the email body and the success
// render-back. Keeping one source of order avoids drift between the three.
export const BRIEF_FIELD_ORDER: BriefField[] = [
  'name',
  'email',
  'projectType',
  'location',
  'stage',
  'area',
  'startDate',
  'completionDate',
  'scope',
  'budget',
  'priorities',
  'plansUrl',
];

export type BriefErrorCode = 'required' | 'email' | 'url' | 'tooLong' | 'option';

// Raw, untrusted input (all strings from FormData; scope is multi-value).
export interface BriefRawInput {
  name?: string;
  email?: string;
  projectType?: string;
  location?: string;
  stage?: string;
  area?: string;
  startDate?: string;
  completionDate?: string;
  scope?: string[];
  budget?: string;
  priorities?: string;
  plansUrl?: string;
  company?: string; // honeypot — must stay empty
  ts?: string; // form-render timestamp (ms since epoch)
}

// Normalised, trimmed values with scope narrowed to known keys.
export interface NormalizedBrief {
  name: string;
  email: string;
  projectType: string;
  location: string;
  stage: string;
  area: string;
  startDate: string;
  completionDate: string;
  scope: string[];
  budget: string;
  priorities: string;
  plansUrl: string;
}

export interface BriefCheckResult {
  // Honeypot filled or submitted implausibly fast. Reject silently.
  spam: boolean;
  // field -> error code (empty when valid)
  errors: Partial<Record<BriefField, BriefErrorCode>>;
  // trimmed + narrowed values, safe to email / render back
  values: NormalizedBrief;
}

// Deliberately permissive shape check — never a full RFC validator, just
// enough to catch obvious typos without rejecting valid addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function str(value: string | undefined): string {
  return (value ?? '').trim();
}

/**
 * Validate a raw brief submission. Pure and synchronous so it can be unit
 * tested and reused server-side. Separates spam signals (honeypot / timing)
 * from field-level errors, and returns normalised values either way.
 */
export function validateBrief(
  input: BriefRawInput,
  now: number = Date.now()
): BriefCheckResult {
  // --- spam signals ------------------------------------------------------
  const honeypot = str(input.company);
  const ts = Number(input.ts);
  const elapsed = now - ts;
  // Only reject when the elapsed time is a plausible, non-negative, too-small
  // value. Missing/negative (clock skew, cached page) values are allowed
  // through so genuine users are never blocked by the timing heuristic.
  const tooFast = Number.isFinite(ts) && elapsed >= 0 && elapsed < MIN_SUBMIT_MS;
  const spam = honeypot.length > 0 || tooFast;

  // --- normalise ---------------------------------------------------------
  const values: NormalizedBrief = {
    name: str(input.name),
    email: str(input.email),
    projectType: str(input.projectType),
    location: str(input.location),
    stage: str(input.stage),
    area: str(input.area),
    startDate: str(input.startDate),
    completionDate: str(input.completionDate),
    scope: (input.scope ?? [])
      .map((v) => v.trim())
      .filter((v): v is ScopeItem => (SCOPE_ITEMS as readonly string[]).includes(v)),
    budget: str(input.budget),
    priorities: str(input.priorities),
    plansUrl: str(input.plansUrl),
  };

  // --- field validation --------------------------------------------------
  const errors: Partial<Record<BriefField, BriefErrorCode>> = {};

  // name (required)
  if (!values.name) errors.name = 'required';
  else if (values.name.length > LIMITS.name) errors.name = 'tooLong';

  // email (required + shape)
  if (!values.email) errors.email = 'required';
  else if (values.email.length > LIMITS.email) errors.email = 'tooLong';
  else if (!EMAIL_RE.test(values.email)) errors.email = 'email';

  // projectType (required + known option)
  if (!values.projectType) errors.projectType = 'required';
  else if (!(PROJECT_TYPES as readonly string[]).includes(values.projectType))
    errors.projectType = 'option';

  // location (optional, length)
  if (values.location && values.location.length > LIMITS.location)
    errors.location = 'tooLong';

  // stage (optional, known option)
  if (values.stage && !(STAGES as readonly string[]).includes(values.stage))
    errors.stage = 'option';

  // area (optional, length)
  if (values.area && values.area.length > LIMITS.area) errors.area = 'tooLong';

  // start / completion (optional, length)
  if (values.startDate && values.startDate.length > LIMITS.startDate)
    errors.startDate = 'tooLong';
  if (values.completionDate && values.completionDate.length > LIMITS.completionDate)
    errors.completionDate = 'tooLong';

  // budget (optional, length)
  if (values.budget && values.budget.length > LIMITS.budget) errors.budget = 'tooLong';

  // priorities (optional, length)
  if (values.priorities && values.priorities.length > LIMITS.priorities)
    errors.priorities = 'tooLong';

  // plansUrl (optional, length + http(s) shape)
  if (values.plansUrl) {
    if (values.plansUrl.length > LIMITS.plansUrl) errors.plansUrl = 'tooLong';
    else if (!isValidHttpUrl(values.plansUrl)) errors.plansUrl = 'url';
  }

  return { spam, errors, values };
}

export function isBriefValid(result: BriefCheckResult): boolean {
  return !result.spam && Object.keys(result.errors).length === 0;
}

// --- Canonical Polish labels for the email body -------------------------
// The recipient is the studio (Polish). These are independent of the UI
// locale so the delivered brief is deterministic and testable.
export const PROJECT_TYPE_LABELS_PL: Record<string, string> = {
  mieszkanie: 'mieszkanie',
  dom: 'dom',
  komercyjne: 'wnętrze komercyjne',
  inne: 'inne',
};

export const STAGE_LABELS_PL: Record<string, string> = {
  zakup: 'planuję zakup',
  'przed-zmianami': 'przed zmianami lokatorskimi',
  'w-budowie': 'w budowie',
  'po-odbiorze': 'po odbiorze kluczy',
  remont: 'remont istniejącego wnętrza',
};

export const SCOPE_LABELS_PL: Record<string, string> = {
  'uklad-funkcjonalny': 'układ funkcjonalny',
  'projekt-koncepcyjny': 'projekt koncepcyjny',
  'dokumentacja-wykonawcza': 'dokumentacja wykonawcza',
  'zabudowy-na-wymiar': 'zabudowy na wymiar',
  'zestawienia-wyceny': 'zestawienia i wyceny',
  'nadzor-autorski': 'nadzór autorski',
};

const FIELD_LABELS_PL: Record<BriefField, string> = {
  name: 'Imię',
  email: 'E-mail',
  projectType: 'Typ projektu',
  location: 'Lokalizacja',
  stage: 'Etap projektu',
  area: 'Przybliżona powierzchnia (m²)',
  startDate: 'Pożądany start',
  completionDate: 'Pożądane zakończenie',
  scope: 'Oczekiwany zakres',
  budget: 'Przybliżony budżet realizacji',
  priorities: 'Priorytety (maks. 3)',
  plansUrl: 'Link do rzutów / zdjęć',
};

const EMPTY = '—';

function displayValue(field: BriefField, values: NormalizedBrief): string {
  switch (field) {
    case 'projectType':
      return PROJECT_TYPE_LABELS_PL[values.projectType] ?? values.projectType ?? EMPTY;
    case 'stage':
      return values.stage ? (STAGE_LABELS_PL[values.stage] ?? values.stage) : EMPTY;
    case 'scope':
      return values.scope.length
        ? values.scope.map((k) => SCOPE_LABELS_PL[k] ?? k).join(', ')
        : EMPTY;
    default: {
      const v = values[field];
      return typeof v === 'string' && v.length ? v : EMPTY;
    }
  }
}

export function buildBriefSubject(values: NormalizedBrief): string {
  const type = PROJECT_TYPE_LABELS_PL[values.projectType] ?? values.projectType;
  return `Brief projektowy — ${type || 'zapytanie'}`;
}

// Plain-text, structured body listing every field in a stable order.
export function buildBriefText(values: NormalizedBrief): string {
  const lines = BRIEF_FIELD_ORDER.map(
    (field) => `${FIELD_LABELS_PL[field]}: ${displayValue(field, values)}`
  );
  return `${buildBriefSubject(values)}\n\n${lines.join('\n')}\n`;
}

// mailto: href addressed to the studio inbox, with the structured brief
// prefilled. Used by the client fallback when server delivery is not
// configured (or fails).
export function buildMailtoHref(subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  // URLSearchParams encodes spaces as '+'; mail clients want %20 in the body.
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${BRIEF_CONTACT_EMAIL}?${query}`;
}
