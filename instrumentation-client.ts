import posthog from 'posthog-js';

/* PostHog EU, first-party proxied through /dot (see next.config.mjs rewrites).
   cookieless_mode 'always' = no cookies/storage, no consent banner, no
   identify() — requires "Cookieless server hash mode" enabled in the PostHog
   project settings, otherwise events are ignored. */
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/dot',
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-05-30',
    cookieless_mode: 'always',
  });
}
