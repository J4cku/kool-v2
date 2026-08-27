# Meta Pixel + Conversions API — design

Date: 2026-08-27
Dataset: **KOOL Studio | Website** · Pixel ID **2041137253179699**

## Goal

Meta ads campaign needs conversion measurement on koolstudio.pl:

1. Base Pixel code on every subpage.
2. Standard `PageView` event.
3. Standard `Lead` event **only after a genuinely successful brief submission** —
   not on landing on /kontakt, not on clicking "wyślij".
4. Conversions API (CAPI) server-side, deduplicated against the browser Pixel.

## Constraints that shape the design

### Consent is not optional here

`messages/{pl,en}.json → privacy.adsBody` already promises, in the published
privacy policy:

> "Jeśli prowadzimy kampanie reklamowe (np. na Instagramie), **za Twoją zgodą**
> możemy używać plików cookie mierzących ich skuteczność (np. Meta Pixel).
> **Bez zgody te narzędzia nie są uruchamiane.**"

So the Pixel loads only after "akceptuję" in `CookieBanner`. The same gate
applies to CAPI: server-side transmission of a hashed e-mail, IP and user agent
to Meta is the same marketing purpose and needs the same legal basis. A visitor
who declines or ignores the banner produces neither a Pixel event nor a CAPI
event.

Consequence to accept knowingly: **conversions from non-consenting visitors are
invisible to Meta.** Changing that would require rewriting the privacy policy
and is a legal decision, not an engineering one.

There is exactly one consent switch on the site (`cookies.message` — "Używamy
cookies do statystyk i reklam"), stored by posthog-js and exposed through
`lib/analytics.ts` (`consentStatus`, `subscribeConsentStatus`). Meta reuses it;
no second banner, no second store.

### The App Router fires the base snippet once

Meta's snippet ends with `fbq('track', 'PageView')`, which is correct for a
classic multi-document site. Here every in-site navigation is client-side, so
PageView has to be router-driven anyway. Keeping the snippet's own PageView
*and* a router-driven one would double-count the landing page.

Decision: install Meta's base code **without** its trailing
`fbq('track', 'PageView')` line, and fire PageView from one place — a pathname
effect that also covers the first path. One event per document, one per
client-side navigation, no double count.

### `<noscript>` fallback is omitted

`<img src="https://www.facebook.com/tr?...">` fires unconditionally, before any
consent choice, and a no-JS visitor cannot be shown a consent banner. It cannot
be reconciled with the gate above, and it is a negligible traffic slice.

### Verified against production, 2026-08-27

- `/pl/kontakt` renders the brief CTA ("opowiedz nam o projekcie"); the
  `brief-form` PostHog flag now evaluates `true` for the cookieless distinct id.
  The earlier "flags never reach the browser" finding no longer holds — Lead is
  reachable.
- `graph.facebook.com` serves versions up to **v26.0**; `POST /v26.0/<pixel>/events`
  is live.
- `after` is exported from `next/server` (Next 16.3.1) — CAPI can run after the
  response is flushed, adding no latency to the form submit.

## Event flow

```
visitor accepts cookies
  └─ MetaPixel mounts fbevents.js, fbq('init', PIXEL_ID)
     └─ fbq('track','PageView')  ← on first path and on every route change

visitor submits the brief
  └─ submitBrief() validates → Resend delivers → status 'success'
     ├─ generates eventId (uuid), returns it in the action state
     ├─ after(): CAPI POST Lead { event_id: eventId, user_data: hashed }
     └─ client: fbq('track','Lead', {...}, { eventID: eventId })

Meta deduplicates on (event_name='Lead', event_id)
```

Only `status: 'success'` — i.e. Resend confirmed delivery — produces a Lead.
`invalid`, `error`, `fallback` (mailto) and spam rejections produce nothing.

## Files

| File | Change |
|---|---|
| `lib/site.ts` | `META_PIXEL_ID` constant (env-overridable) |
| `lib/meta-pixel.ts` | **new** — browser Pixel loader + `metaTrack` |
| `components/MetaPixel.tsx` | **new** — consent gate + router-driven PageView |
| `app/[locale]/layout.tsx` | mount `<MetaPixel />` |
| `lib/meta-capi.ts` | **new** — pure payload builder + CAPI send (server) |
| `app/[locale]/kontakt/actions.ts` | generate `eventId`, `after()` CAPI send |
| `app/[locale]/kontakt/brief-state.ts` | `metaEventId?: string` on success |
| `components/kontakt/BriefForm.tsx` | hidden `marketingConsent`, fire Lead on success |
| `messages/{pl,en}.json` | one sentence on the Meta transfer in `privacy.adsBody` |
| `.env.example` | `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_TEST_EVENT_CODE` |
| `tests/meta-capi.test.ts` | **new** — payload/hashing unit test |
| `components/MetaPixel.test.tsx` | **new** — consent-gate test (jsdom) |
| `CLAUDE.md` | Analytics section entry |

## Configuration

| Variable | Where | Required | Effect when unset |
|---|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | build (client) | no | falls back to `2041137253179699` |
| `META_CAPI_ACCESS_TOKEN` | Vercel (server) | **yes, for CAPI** | CAPI skipped; browser Pixel still fires |
| `META_TEST_EVENT_CODE` | Vercel (server), temporary | no | no `test_event_code` in the payload |
| `RESEND_API_KEY` | Vercel (server) | **yes, for Lead** | form falls back to mailto → never `success` → no Lead |

The Pixel ID is hardcoded as the default because it is public by construction
(it appears in the page source of every visitor). The env var exists so a
preview build can point at another dataset or disable the pixel with `""`.

The Pixel is skipped entirely when `process.env.NODE_ENV !== 'production'`, so
`pnpm dev` never pollutes the dataset. Vercel previews build as production and
do fire — deliberate, so Events Manager Test Events can be used before a
production deploy.

## Deduplication contract

- `event_id` — one uuid per successful submission, generated **server-side** in
  `submitBrief` and returned in the action state, so the browser event and the
  CAPI event are provably the same string. No hidden field, no client/server
  drift.
- `event_name` — `Lead` on both sides.
- Both sides send matching `custom_data.content_name = 'project-brief'`.
- Meta's dedup window is 48h; the two events are at most a few hundred ms apart.

## CAPI payload

`POST https://graph.facebook.com/v26.0/2041137253179699/events`

```jsonc
{
  "data": [{
    "event_name": "Lead",
    "event_time": 1756282800,          // unix seconds
    "event_id": "<uuid>",
    "event_source_url": "https://koolstudio.pl/pl/kontakt",
    "action_source": "website",
    "user_data": {
      "em": ["<sha256(lowercased, trimmed email)>"],
      "fn": ["<sha256(lowercased first name, letters only)>"],
      "client_ip_address": "…",        // x-forwarded-for, first hop
      "client_user_agent": "…",
      "fbp": "fb.1.…",                 // _fbp cookie, when present
      "fbc": "fb.1.…"                  // _fbc cookie, when present
    },
    "custom_data": {
      "content_name": "project-brief",
      "content_category": "mieszkanie" // brief projectType key
    }
  }],
  "access_token": "…",
  "test_event_code": "TEST12345"       // only when META_TEST_EVENT_CODE is set
}
```

Raw e-mail and name **never** leave the server unhashed. Nothing else from the
brief (location, budget, priorities, plan links) is sent to Meta.

## Failure behaviour

CAPI is strictly best-effort and must never affect the visitor:

- runs inside `after()` — the success screen is already rendered when it fires;
- 5s `AbortSignal.timeout`;
- every throw swallowed; a non-2xx response is logged server-side and dropped;
- an unset access token is a silent no-op.

A blocked `fbevents.js` (ad blocker) costs the browser event but not the CAPI
event — consent state travels through the form POST, not through Meta's script,
so CAPI still fires. That is the main reason CAPI is worth having here.

## Out of scope

- Server-side `_fbc` synthesis from `fbclid` for ad-blocked visitors (would need
  a first-party cookie of our own, hence its own consent story).
- Any event beyond `PageView` and `Lead` — no `ViewContent`, no `Contact` on the
  mailto link.
- First-party proxying of `fbevents.js` (the `/dot` treatment). CAPI already
  covers the blocked case.
