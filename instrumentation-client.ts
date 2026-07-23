/* PostHog EU, first-party proxied through /dot (see next.config.mjs rewrites).
   cookieless_mode 'always' = no cookies/storage, no consent banner, no
   identify() — requires "Cookieless server hash mode" enabled in the PostHog
   project settings, otherwise events are ignored.

   posthog-js is imported dynamically after the window load event (plus an
   idle callback) so its ~70KB stays out of the initial bundle and off the
   LCP/TBT critical path on mobile. The initial $pageview still fires — init
   just happens a moment later. */
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (POSTHOG_KEY) {
  const initPostHog = () => {
    void import('posthog-js').then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: '/dot',
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-05-30',
        cookieless_mode: 'always',
      });
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
