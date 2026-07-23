import type { PostHog } from 'posthog-js';

declare global {
  interface Window {
    /* Set by instrumentation-client.ts after its deferred posthog init;
       the type-only import above keeps posthog-js out of this chunk. */
    __koolPosthog?: PostHog;
  }
}

function posthogInstance(): PostHog | null {
  return typeof window === 'undefined' ? null : (window.__koolPosthog ?? null);
}

/* Client-side event capture. posthog-js is dynamically imported and
   initialized by instrumentation-client.ts only when NEXT_PUBLIC_POSTHOG_KEY
   is set — until then (local dev, or clicks before the deferred init
   completes) this is a silent no-op. */
export function track(event: string, properties?: Record<string, unknown>) {
  posthogInstance()?.capture(event, properties);
}

/* Consent API for cookieless_mode 'on_reject' (CookieBanner.tsx).
   'pending' = no choice yet (counted anonymously via
   opt_out_capturing_by_default); accept enables cookies, replay and (future)
   ad pixels; decline keeps the anonymous server-side hash. null = posthog
   not initialized (no key, or deferred init still pending), so no banner. */
export function consentStatus(): 'granted' | 'denied' | 'pending' | null {
  return posthogInstance()?.get_explicit_consent_status() ?? null;
}

const consentListeners = new Set<() => void>();

function notifyConsentChange() {
  consentListeners.forEach((listener) => listener());
}

/* useSyncExternalStore subscription for consentStatus(). Notifies on
   accept/decline in this tab, on the storage event (choice made in another
   tab), and on kool:posthog-ready — the event instrumentation-client.ts
   fires once its deferred init has published window.__koolPosthog. */
export function subscribeConsentStatus(onChange: () => void): () => void {
  consentListeners.add(onChange);
  window.addEventListener('storage', onChange);
  window.addEventListener('kool:posthog-ready', onChange);
  return () => {
    consentListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
    window.removeEventListener('kool:posthog-ready', onChange);
  };
}

export function acceptCookies() {
  const posthog = posthogInstance();
  if (posthog) {
    posthog.opt_in_capturing();
    notifyConsentChange();
  }
}

export function declineCookies() {
  const posthog = posthogInstance();
  if (posthog) {
    posthog.opt_out_capturing();
    notifyConsentChange();
  }
}

/* Re-opens the consent banner (GDPR: withdrawing consent must be as easy as
   giving it). Fired by the FooterBar "cookies" link and the privacy page;
   CookieBanner listens via onCookieSettingsOpen. */
const COOKIE_SETTINGS_EVENT = 'kool:cookie-settings';

export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}

export function onCookieSettingsOpen(callback: () => void): () => void {
  window.addEventListener(COOKIE_SETTINGS_EVENT, callback);
  return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, callback);
}
