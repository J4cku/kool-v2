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
export type PropertyStage = (typeof STAGES)[number];
export type DesiredScopeItem = (typeof SCOPE_ITEMS)[number];
export type InquiryLanguage = 'pl' | 'en';

// Text-length caps (characters). Server-enforced; the client also sets
// maxLength for immediate feedback.
export const LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  location: 160,
  area: 40,
  designStart: 60,
  constructionStart: 60,
  budget: 80,
  requirements: 1000,
  plansUrl: 600,
} as const;

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

const DRAFT_KEYS: readonly InquiryField[] = INQUIRY_SUBMISSION_FIELD_ORDER;
const STRING_DRAFT_KEYS = DRAFT_KEYS.filter(
  (key): key is Exclude<InquiryField, 'desiredScope'> => key !== 'desiredScope',
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

export type BriefErrorCode = 'required' | 'email' | 'url' | 'tooLong' | 'option';

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

export interface BriefCheckResult {
  spam: boolean;
  errors: Partial<Record<InquiryField, BriefErrorCode>>;
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

export function isBriefValid(result: BriefCheckResult): boolean {
  return !result.spam && Object.keys(result.errors).length === 0;
}

// --- Canonical Polish labels for the email body -------------------------
// The recipient is the studio (Polish). These are independent of the UI
// locale so the delivered brief is deterministic and testable.
export const PROJECT_TYPE_LABELS_PL: Record<ProjectType, string> = {
  mieszkanie: 'mieszkanie',
  dom: 'dom',
  komercyjne: 'wnętrze komercyjne',
  inne: 'inne',
};

export const STAGE_LABELS_PL: Record<PropertyStage, string> = {
  zakup: 'planuję zakup',
  'przed-zmianami': 'przed zmianami lokatorskimi',
  'w-budowie': 'w budowie',
  'po-odbiorze': 'po odbiorze kluczy',
  remont: 'remont istniejącego wnętrza',
};

export const SCOPE_LABELS_PL: Record<DesiredScopeItem, string> = {
  'uklad-funkcjonalny': 'układ funkcjonalny',
  'projekt-koncepcyjny': 'projekt koncepcyjny',
  'dokumentacja-wykonawcza': 'dokumentacja wykonawcza',
  'zabudowy-na-wymiar': 'zabudowy na wymiar',
  'zestawienia-wyceny': 'zestawienia i wyceny',
  'nadzor-autorski': 'nadzór autorski',
};

const FIELD_LABELS_PL: Record<InquiryField, string> = {
  name: 'Imię',
  email: 'E-mail',
  phone: 'Telefon',
  projectType: 'Typ projektu',
  location: 'Lokalizacja',
  propertyStage: 'Etap nieruchomości',
  area: 'Przybliżona powierzchnia (m²)',
  desiredScope: 'Oczekiwany zakres',
  designStart: 'Pożądany start projektu',
  constructionStart: 'Planowany start realizacji',
  budget: 'Przybliżony budżet realizacji',
  requirements: 'Wymagania i priorytety',
  plansUrl: 'Link do rzutów / zdjęć',
  language: 'Język korespondencji',
};

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

export function buildBriefSubject(values: NormalizedBrief): string {
  const type = values.projectType ? PROJECT_TYPE_LABELS_PL[values.projectType] : '';
  return `Brief projektowy — ${type || 'zapytanie'}`;
}

// Plain-text, structured body listing every field in a stable order.
export function buildBriefText(values: NormalizedBrief): string {
  const lines = INQUIRY_SUBMISSION_FIELD_ORDER.map(
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
