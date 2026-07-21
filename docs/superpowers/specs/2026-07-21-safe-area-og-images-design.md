# Mobile Safe Area and Per-Page Social Images — Design

Date: 2026-07-21

## Goal

Keep the iOS status area beige when entering the contact page and provide stable, relevant Open Graph/Twitter images for every public page family.

## Confirmed causes

The locale layout already declares beige `themeColor`. The coral shown behind the iOS status area comes from the contact route transition: its fixed `inset-0` coral sheet extends through `env(safe-area-inset-top)`. The full-screen mobile navigation is a separate coral overlay and should remain coral while the menu is open.

The production homepage and static subpages currently emit Open Graph titles and descriptions without `og:image`. The draft branch adds a homepage-only social image, while `pageMetadata()` intentionally omits images for projects listing, studio, offer, and contact. Project detail routes already emit their own project image and keep that behavior.

## Mobile contact safe area

The document canvas (`html` and `body`) stays explicitly beige. The contact route wipe remains coral but begins below `env(safe-area-inset-top)` and continues to the other three viewport edges. Because the clip path is then measured in the inset overlay's local coordinate space, its endpoint uses `calc(var(--nav-orb-center-y) - env(safe-area-inset-top))`; the horizontal center is unchanged. On devices without a top safe area the inset and subtraction are zero, preserving current desktop and Android motion.

This change affects only `PageTransition`. The mobile navigation overlay remains full-screen coral, so opening the menu still intentionally colors the entire visible viewport. Reduced-motion behavior and the wipe endpoint at the navbar orb remain unchanged.

## Stable per-page social imagery

Social images must be deterministic. Crawlers cache metadata for long periods, so request-time or random rotation would make previews inconsistent and difficult to invalidate. Each page family receives one stable 1200×630 WebP derived only from imagery already used by that page:

| Page family | Source | Output |
|---|---|---|
| Home | `public/images/mieszkanie-walecznych/KOOL_m_walecznych_www_main.webp` | `public/images/social/home-walecznych.webp` |
| Projects listing | `public/images/dehesa/kool_dehesa_04.webp` (a current listing thumbnail) | `public/images/social/projects-dehesa.webp` |
| Studio | `public/images/studio/team.webp` | `public/images/social/studio-team.webp` |
| Offer | `public/images/oferta/KOOL_oferta_komercyjne.webp` | `public/images/social/offer-commercial.webp` |
| Contact | the material-palette frame at 9.6 seconds in `public/videos/reel.mp4`, which is the page's primary media | `public/images/social/contact-reel.webp` |

The four photographs are source-preserving crops: no generated content, retouching, or identity changes. Crops prioritize the page's main subject and use the standard 1200×630 large-card ratio. The contact still uses a centered 360×189 crop from the reel's 360×640 frame at 9.6 seconds, then scales to 1200×630. This is an explicit 3.33× source upscale: it trades some sharpness for a preview genuinely derived from the contact page. At typical social-card display sizes the effective upscale is smaller; visual QA must still reject the asset if compression or softness is distracting.

Project detail pages continue using their own first project image; they do not inherit a static-page fallback.

## Metadata architecture

`lib/metadata.ts` owns a typed `MetaPageKey → social image` map for the four static subpages. `pageMetadata()` adds the selected image, dimensions, localized alt text, and matching Twitter `summary_large_image` metadata. The locale homepage uses the Walecznych asset with its existing localized title/description and a localized Walecznych-specific alt.

The static social image path is identical between Polish and English for a given route, while the title, description, canonical URL, locale, and image alt remain localized. `/pl` and `/en` homes must expose an absolute `og:image` URL after deployment. The root `/` is a locale redirect, so verification checks the redirect target and then asserts the followed `/pl` response metadata rather than expecting metadata on the redirect itself.

Project detail metadata remains independent. This change does not add dimensions, alt text, or Twitter metadata to project details; verification asserts only that their existing project-specific `og:image` remains present and is not replaced by any static-page image.

## Testing and verification

- Add a failing metadata contract test covering home, all four static page keys, Twitter large-card fields, 1200×630 dimensions, localized alt, and project-detail independence.
- Add a failing safe-area contract test proving the beige canvas, the contact transition top inset, and the unchanged full-screen coral mobile menu.
- Generate/crop the five assets and verify exact dimensions, MIME format, and non-empty file size.
- Run `pnpm check` and diff hygiene.
- Verify `/` redirects to `/pl`, then render `/pl`, `/en`, and both locales of projects/studio/offer/contact. On those static pages assert exactly one absolute `og:image`, its width/height/alt, matching Twitter image, canonical URL, and locale. On representative project details assert only that the existing project-specific `og:image` remains independent.
- Run mobile Chrome QA for direct contact load, navigation into contact during the wipe, and open mobile menu. Confirm the status safe area is beige on contact and coral only while the menu is open; note that physical Mobile Safari remains the final device-level check.
- After pushing, verify the draft deployment HTML before relying on third-party crawler caches. OpenGraph.xyz and social platforms may need a re-scrape after deployment.
