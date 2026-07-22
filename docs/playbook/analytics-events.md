# Analytics event dictionary (as implemented)

Privacy-safe GA4 event scaffold for koolstudio.pl. This documents what the code
in `lib/analytics.ts` + the instrumented components actually emit. It is the
engineering-side companion to playbook §16.3 and backlog **B02**.

**Status: INERT.** No GA4 property exists yet and no consent-management platform
(CMP) has been chosen (`decision-log.md` gate **G4**, items G4-4 / G4-5 OPEN).
With `NEXT_PUBLIC_GA4_ID` unset (the current, shipped state) the site loads **zero**
analytics scripts and emits **zero** events. The `data-analytics-*` attributes in
the HTML are inert data that do nothing until GA4 is configured.

---

## Iron privacy rules

Enforced in `lib/analytics.ts` and honored at every call site:

- **No PII, ever.** No free-text field, no email/phone value, no name, no
  reversible identifier. Free-text brief fields (`priorities`, `budget`,
  `location`, …) are never read by analytics.
- **No user-supplied URLs / query strings.** `page_path` is a bare pathname; no
  querystring is ever attached.
- **No user-agent or geolocation** collected by our code. GA4 is loaded with
  `anonymize_ip: true`.
- **Allowed parameters only** — the enumerated set below, nothing else.
- **`event_id` is a random UUID** (`crypto.randomUUID()`), generated fresh per
  submission purely for de-duplication. It is not derived from any user data and
  identifies no one.
- Every helper is **defensive**: no-ops when gtag is absent, never throws, never
  blocks navigation or form submission.

---

## Events

| Event | Trigger | Params (allowed set) | Notes / PII rule |
|-------|---------|----------------------|------------------|
| `cta_click` | Click on any element carrying `data-analytics="cta_click"` (document-level delegate) | `page_type`, `service?`, `cta_text`, `position` | `cta_text` is a static UI label (button chrome), never user input. `page_type` derived centrally from the route. |
| `brief_start` | First meaningful interaction (focus/input) with the brief form, once per page view | `page_path`, `service?` | `page_path` is a bare pathname, no querystring. Honeypot + anti-spam fields excluded. |
| `brief_submit` | Confirmed **server-side** success (Resend delivery `status: 'success'`) | `event_id`, `service?` | Random UUID for dedup. Fires once per successful submission. Carries **no** field values. |
| `brief_mailto_fallback` | The mailto fallback path (`status: 'fallback'`) — server delivery unavailable or failed | `event_id` | Kept distinct from `brief_submit` so the two paths are **never conflated**. |
| `email_click` | Click on any `a[href^="mailto:"]` (document-level delegate) | `page_type`, `position` | **Never** the email address itself. The brief mailto-fallback button is excluded (`data-analytics-skip`) — it reports `brief_mailto_fallback` instead. |
| `case_engaged` | A case-study section enters the viewport (IntersectionObserver, threshold ~0.4), once per page view | `case_id`, `service?` | `case_id` is a public project slug (non-PII). |

No other events and no other parameters are emitted. `page_type` is one of:
`home`, `services`, `service`, `projects`, `project`, `studio`, `contact`,
`other`.

### Where each event fires

- **`cta_click`**
  - Service landing page CTA → `/kontakt` — `components/oferta/ServiceLandingPage.tsx`, `position: "service-cta"`, `service: <service slug>`.
  - Project case → brief CTA → `/kontakt#brief` — `components/ProjectServiceCta.tsx`, `position: "project-cta"`, `service: <related service slug>` (omitted when the cross-link target is the `/oferta` hub).
  - Services hub links block — `components/oferta/ServicesHubLinks.tsx`, `position: "hub"`, `service: <service slug>`.
- **`email_click`** — `components/AddressBlock.tsx` footer email link, `position: "footer"`. (No homepage/footer `/kontakt` CTA exists to instrument.)
- **`brief_start` / `brief_submit` / `brief_mailto_fallback`** — `components/kontakt/BriefForm.tsx`, keyed off the `useActionState` transitions (`brief-state.ts`).
- **`case_engaged`** — `components/CaseStudySection.tsx` (observes its own `<section>` root).

### Delivery mechanism

A single client `AnalyticsListener` (`components/AnalyticsListener.tsx`) is
mounted once in the layout **only when GA4 is configured**. It reads the
`data-analytics*` attributes via document-level click delegation, so server
components stay server components and only gain inert data attributes. Case and
brief events live inside components that are already client components.

---

## Environment variables

| Var | Effect | Default |
|-----|--------|---------|
| `NEXT_PUBLIC_GA4_ID` | GA4 measurement id (`G-XXXXXXXXXX`). When set, `components/GoogleAnalytics.tsx` injects gtag.js via `next/script` (`afterInteractive`). When unset, nothing loads. | unset |

Documented in `.env.example`. Validated against `/^G-[A-Z0-9]+$/i` before it is
interpolated into the inline consent script.

---

## Consent posture

- **Consent Mode v2, denied by default.** Before any `config` runs, the loader
  sets `ad_storage`, `ad_user_data`, `ad_personalization`, and
  `analytics_storage` all to `'denied'`.
- **Cookieless pings only** until consent is granted: GA4 sends anonymous,
  cookieless pings and stores nothing on the device.
- **CMP pending — decision-log G4.** No CMP has been chosen (G4-5 OPEN) and the
  consent/PII basis is unconfirmed (G4-4 OPEN). Until then, consent must stay
  denied by default.
- **Grant hook, no banner.** `grantAnalyticsConsent()` in `lib/analytics.ts`
  calls `gtag('consent', 'update', { analytics_storage: 'granted' })` for a
  future CMP to call once a visitor opts in. `denyAnalyticsConsent()` is the
  inverse. Ad signals stay denied — this site measures analytics only. **No
  cookie banner is built here** (that is the CMP's job, blocked on G4).

---

## QA steps (once a GA4 property exists)

1. Set `NEXT_PUBLIC_GA4_ID` in `.env.local`, run `pnpm build && pnpm start`.
2. Confirm the built HTML now contains the gtag snippet and the consent-default
   block runs **before** `config` (view source / network).
3. **GA4 DebugView** (`gtag('config', …, { debug_mode: true })` or the GA
   Debugger extension): trigger each event and confirm the exact param set:
   - `cta_click` from a service CTA, a project CTA, and a hub link.
   - `brief_start` on first focus of the brief form; `brief_submit` on a
     confirmed Resend success; `brief_mailto_fallback` on the mailto path.
   - `email_click` from the footer email link (verify **no** address param).
   - `case_engaged` by scrolling a project case block into view (fires once).
4. **Tag Assistant** (tagassistant.google.com): confirm Consent Mode shows
   `analytics_storage: denied` on load, and that a `consent update` flips it to
   `granted` after `grantAnalyticsConsent()` runs.
5. Confirm de-duplication: `brief_submit` carries a unique `event_id` per
   submission (server-side Measurement Protocol join is B02 work).
6. Re-verify the inert state: unset the env var, rebuild, confirm no
   gtag/googletagmanager reference in the HTML.

---

## Remaining for the business (backlog B02, gate G4)

Engineering has shipped the inert scaffold. The following are **not** something
engineering can finish alone — they need account access and a privacy decision:

- **Create the GA4 property** and obtain the measurement id → set
  `NEXT_PUBLIC_GA4_ID`.
- **Choose a CMP** and wire it to `grantAnalyticsConsent()` /
  `denyAnalyticsConsent()` (decision-log **G4-5**); confirm the consent/PII
  basis and retention (**G4-4**).
- **Confirm the qualified-lead definition + CRM stages** (**G4-1**) so
  `brief_submit` can be joined to outcomes.
- **Verify GSC (Google Search Console) + Bing Webmaster** and connect the CRM
  (backlog **B02**); wire the server-side Measurement Protocol join for
  `brief_submit` de-duplication.

See `docs/playbook/backlog.md` (**B02**) and `docs/playbook/decision-log.md`
(**G4**).
