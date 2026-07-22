// Privacy-safe GA4 event wrapper (SEO playbook §16.3).
//
// This module is a thin, defensive shim around `window.gtag`. It is INERT until
// GA4 is configured: every helper no-ops when gtag has not been loaded (i.e. no
// NEXT_PUBLIC_GA4_ID, so no <script> was injected). No helper ever throws and no
// helper ever blocks navigation or form submission.
//
// HARD PRIVACY RULES (do not relax without a decision-log entry):
//   - No PII, ever. No free-text field, no email/phone value, no reversible id.
//   - No URLs carrying user input (query strings), no user-agent / geolocation.
//   - Only the parameters enumerated per event below are ever sent.
// The event_id used for brief de-duplication is a RANDOM UUID with no link to
// any person — it exists purely so client + server measurement can be joined
// without double-counting.
//
// Consent posture: GA4 loads with Consent Mode v2 defaults set to `denied` for
// every storage signal (see components/GoogleAnalytics.tsx), so until a CMP
// calls grantAnalyticsConsent() GA4 only sends cookieless pings. Decision-log
// gate G4 (CMP choice) is still OPEN.

type GtagArgs =
  | ['event', string, Record<string, unknown>]
  | ['consent', 'default' | 'update', Record<string, unknown>]
  | ['config', string, Record<string, unknown>]
  | ['js', Date];

type GtagFn = (...args: GtagArgs[number][]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

// Coarse, non-identifying page categories. Derived from the route only — never
// from a full URL, never from query input.
export type PageType =
  | 'home'
  | 'services'
  | 'service'
  | 'projects'
  | 'project'
  | 'studio'
  | 'contact'
  | 'other';

// True only when a GA4 property id is configured at build time. Instrumentation
// setup (observers / listeners) is gated on this so the un-configured site adds
// zero runtime behavior. NEXT_PUBLIC_ vars are statically inlined into the
// client bundle, so this is identical on server and client (no hydration skew).
export const analyticsEnabled: boolean = Boolean(process.env.NEXT_PUBLIC_GA4_ID);

// Drop undefined keys so an optional param (e.g. `service`) is simply absent
// rather than sent as `undefined`.
function compact(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') out[key] = value;
  }
  return out;
}

// The single dispatch point. No-ops safely when gtag is missing; never throws.
function sendEvent(name: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;
  try {
    gtag('event', name, params);
  } catch {
    // Analytics must never break the page.
  }
}

// A random, non-identifying id for brief de-duplication. crypto.randomUUID when
// available; a non-crypto fallback otherwise (still carries no user data).
function newEventId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

// Route -> page_type. Accepts a next-intl pathname (locale-stripped) but also
// tolerates a leading /pl or /en. Only ever sees the path, never a query string.
export function pageTypeFromPath(pathname: string): PageType {
  const path = pathname.replace(/^\/(pl|en)(?=\/|$)/, '') || '/';
  if (path === '/') return 'home';
  if (path === '/kontakt') return 'contact';
  if (path === '/studio') return 'studio';
  if (path === '/oferta') return 'services';
  if (path.startsWith('/oferta/')) return 'service';
  if (path === '/projekty') return 'projects';
  if (path.startsWith('/projekty/')) return 'project';
  return 'other';
}

// --- Typed event helpers (allowed params ONLY) -------------------------------

// cta_click {page_type, service?, cta_text, position}
// cta_text is a static UI label (button/link chrome), never user input.
export function trackCtaClick(params: {
  page_type: PageType;
  service?: string;
  cta_text: string;
  position: string;
}): void {
  sendEvent(
    'cta_click',
    compact({
      page_type: params.page_type,
      service: params.service,
      cta_text: params.cta_text,
      position: params.position,
    })
  );
}

// brief_start {page_path, service?} — first meaningful form interaction, once
// per page view. page_path is a bare pathname (no query string).
export function trackBriefStart(params: { page_path: string; service?: string }): void {
  sendEvent(
    'brief_start',
    compact({ page_path: params.page_path, service: params.service })
  );
}

// brief_submit {event_id, service?} — fires ONLY after a confirmed server-side
// success. Generates a fresh random event_id per call and returns it.
export function trackBriefSubmit(params?: { service?: string }): string {
  const event_id = newEventId();
  sendEvent('brief_submit', compact({ event_id, service: params?.service }));
  return event_id;
}

// brief_mailto_fallback {event_id} — the mailto path, kept distinct from
// brief_submit so a server delivery and a client-side fallback are never
// conflated. Fresh random event_id per call, returned to the caller.
export function trackBriefMailtoFallback(): string {
  const event_id = newEventId();
  sendEvent('brief_mailto_fallback', { event_id });
  return event_id;
}

// email_click {page_type, position} — NEVER the address itself.
export function trackEmailClick(params: { page_type: PageType; position: string }): void {
  sendEvent('email_click', compact({ page_type: params.page_type, position: params.position }));
}

// case_engaged {case_id, service?} — a case-study section entered the viewport.
// case_id is a project slug (public, non-PII).
export function trackCaseEngaged(params: { case_id: string; service?: string }): void {
  sendEvent(
    'case_engaged',
    compact({ case_id: params.case_id, service: params.service })
  );
}

// --- Consent -----------------------------------------------------------------

// Grant analytics_storage. Intended to be called by a future consent-management
// platform (decision-log G4) once the visitor has opted in. Ad signals stay
// denied — this site measures analytics only. No banner is built here.
export function grantAnalyticsConsent(): void {
  if (typeof window === 'undefined') return;
  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;
  try {
    gtag('consent', 'update', { analytics_storage: 'granted' });
  } catch {
    // never throw
  }
}

// Re-deny analytics_storage (e.g. the visitor withdraws consent).
export function denyAnalyticsConsent(): void {
  if (typeof window === 'undefined') return;
  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;
  try {
    gtag('consent', 'update', { analytics_storage: 'denied' });
  } catch {
    // never throw
  }
}
