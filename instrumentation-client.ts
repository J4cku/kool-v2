/* PostHog EU, first-party proxied through /dot (see next.config.mjs rewrites).

   cookieless_mode 'on_reject' pairs with CookieBanner.tsx; accept = cookies +
   session replay, decline = anonymous server-side hash (requires "Cookieless
   server hash mode" enabled in the PostHog project settings).
   opt_out_capturing_by_default makes visitors who haven't answered yet
   behave like decliners — counted anonymously, nothing stored — while
   get_explicit_consent_status() still reports 'pending' so the banner shows.
   identify() stays forbidden for pending/declined visitors.

   posthog-js is imported dynamically after the window load event (plus an
   idle callback) so its ~70KB stays out of the initial bundle and off the
   LCP/TBT critical path on mobile. The initial $pageview still fires — init
   just happens a moment later. Once ready, the instance is published on
   window.__koolPosthog and kool:posthog-ready fires so lib/analytics.ts
   (track + the consent store behind CookieBanner) can reach it without
   re-importing the bundle. */
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (POSTHOG_KEY) {
  const initPostHog = () => {
    void import('posthog-js').then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: '/dot',
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-05-30',
        cookieless_mode: 'on_reject',
        opt_out_capturing_by_default: true,
      });

      /* Founder/internal traffic: opening any page with ?kool=<name> opts
         this device in and identifies it as team-<name> with internal: true,
         which the project-level "Filter out internal and test users" setting
         excludes from insights. Sticky per browser via the consent cookie —
         re-visit the URL after clearing site data. */
      const kool = new URLSearchParams(window.location.search).get('kool');
      if (kool) {
        posthog.opt_in_capturing();
        posthog.identify(`team-${kool}`, { internal: true });
      }

      window.__koolPosthog = posthog;
      window.dispatchEvent(new Event('kool:posthog-ready'));
    });
  };

  const whenIdle = () =>
    'requestIdleCallback' in window
      ? requestIdleCallback(initPostHog, { timeout: 3000 })
      : setTimeout(initPostHog, 1500);

  if (document.readyState === 'complete') {
    whenIdle();
  } else {
    window.addEventListener('load', whenIdle, { once: true });
  }
}
