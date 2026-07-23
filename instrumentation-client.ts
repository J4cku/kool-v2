import posthog from 'posthog-js';

/* PostHog EU, first-party proxied through /dot (see next.config.mjs rewrites).
   cookieless_mode 'on_reject' pairs with CookieBanner.tsx; accept = cookies +
   session replay, decline = anonymous server-side hash (requires "Cookieless
   server hash mode" enabled in the PostHog project settings).
   opt_out_capturing_by_default makes visitors who haven't answered yet
   behave like decliners — counted anonymously, nothing stored — while
   get_explicit_consent_status() still reports 'pending' so the banner shows.
   identify() stays forbidden for pending/declined visitors. */
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/dot',
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-05-30',
    cookieless_mode: 'on_reject',
    opt_out_capturing_by_default: true,
  });
}
