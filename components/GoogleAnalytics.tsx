import Script from 'next/script';

// GA4 loader, rendered by the root layout ONLY when NEXT_PUBLIC_GA4_ID is set.
// When the env var is absent, the layout renders nothing and the built HTML
// contains zero gtag / googletagmanager references.
//
// Consent Mode v2: the inline script sets every storage signal to `denied`
// BEFORE `config` runs, so GA4 operates in cookieless-ping mode until a CMP
// (decision-log G4) grants analytics_storage via grantAnalyticsConsent().
// The `gtag` function is declared at the top level of a classic inline script,
// so it becomes window.gtag — which lib/analytics.ts dispatches through.

// GA4 measurement ids look like `G-XXXXXXXXXX`. Validate before interpolating
// into an inline script so a malformed env value can never inject markup.
const GA4_ID_PATTERN = /^G-[A-Z0-9]+$/i;

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  if (!GA4_ID_PATTERN.test(gaId)) return null;

  return (
    <>
      <Script id="ga-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            send_page_view: true
          });
        `}
      </Script>
      <Script
        id="ga-gtag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
      />
    </>
  );
}
