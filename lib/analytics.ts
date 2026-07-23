import posthog from 'posthog-js';

/* Client-side event capture. posthog is only initialized when
   NEXT_PUBLIC_POSTHOG_KEY is set (instrumentation-client.ts), so guard to
   keep local dev and preview builds silent. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (posthog.__loaded) {
    posthog.capture(event, properties);
  }
}

/* Consent API for cookieless_mode 'on_reject' (CookieBanner.tsx).
   'pending' = no choice yet and nothing is captured; accept enables cookies,
   replay and (future) ad pixels; decline falls back to the anonymous
   server-side hash. null = posthog not running (no key), so no banner. */
export function consentStatus(): 'granted' | 'denied' | 'pending' | null {
  return posthog.__loaded ? posthog.get_explicit_consent_status() : null;
}

const consentListeners = new Set<() => void>();

function notifyConsentChange() {
  consentListeners.forEach((listener) => listener());
}

/* useSyncExternalStore subscription for consentStatus(). Notifies on
   accept/decline in this tab, on the storage event (choice made in another
   tab), and once posthog finishes initializing — instrumentation-client.ts
   and React hydration race each other, so the first snapshot may be null;
   the init poll gives up after 10s for keyless environments. */
export function subscribeConsentStatus(onChange: () => void): () => void {
  consentListeners.add(onChange);
  window.addEventListener('storage', onChange);
  let id: ReturnType<typeof setInterval> | null = null;
  if (!posthog.__loaded) {
    let ticks = 0;
    id = setInterval(() => {
      if (posthog.__loaded || ++ticks > 100) {
        if (id) {
          clearInterval(id);
          id = null;
        }
        if (posthog.__loaded) {
          onChange();
        }
      }
    }, 100);
  }
  return () => {
    consentListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
    if (id) {
      clearInterval(id);
    }
  };
}

export function acceptCookies() {
  if (posthog.__loaded) {
    posthog.opt_in_capturing();
    notifyConsentChange();
  }
}

export function declineCookies() {
  if (posthog.__loaded) {
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
