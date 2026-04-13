# Design System Design

## Context

Kool Studio's site already has a recognizable design language: beige page background, coral brand accent, dark and muted text, Poppins typography, image-led portfolio layouts, fixed animated navigation, marquee footer treatment, and localized content under `/pl` and `/en`.

After reviewing the new PDF layouts for the homepage and offer page, the design-system reference should follow that next direction: dark editorial typography is primary, while coral is used for brand and accent moments. The first public implementation of those PDFs is still out of scope here.

## Goals

- Create a coded design-system layer that developers can use while maintaining this Next.js site.
- Create a private styleguide surface for developers and the client to review the current visual language.
- Keep the first pass faithful to the new PDF direction without changing public pages yet.
- Keep the styleguide unavailable on deployed production.
- Avoid changing public navigation, sitemap output, or public page URLs.

## Non-Goals

- No public design-system page.
- No public homepage or offer-page rebuild in this phase.
- No token cleanup pass beyond what is required for the design-system reference.
- No Figma library or external documentation site in this phase.
- No authentication system. Local development access is enough for this first pass.

## Proposed Approach

Use a token-first, conservative update aligned to the new PDF direction.

The source tokens stay in `app/globals.css` and continue to define the current palette, typeface, and content width:

- `beige`
- `coral`
- `dark`
- `muted`
- `white`
- `font-sans`
- `max-width-content`

Add a small design-system layer around patterns the current site already repeats. Candidate primitives include:

- Page/container wrappers
- Section spacing wrappers
- Uppercase display headings
- Supporting text styles
- Text links
- Marquee text treatment
- Media/image example blocks
- Project-card display examples

Follow the repo's current flat `components/` convention unless implementation reveals a strong reason to introduce a subdirectory.

Existing public components should continue to render the same way. The first implementation should favor reuse where it is low risk and defer deeper component API redesigns.

Typography role update:

- Primary display headings use `dark`.
- Body copy uses `dark`.
- Coral remains for the logo, dot, small labels, separator lines, text links, marquee/accent text, and project status accents.
- Keep the current web coral token `#FC3117` for now rather than switching to the slightly duller red sampled from the PDF exports.

## Styleguide Route

Add a dev-only localized styleguide route, for example:

- `/pl/design-system`
- `/en/design-system`

In the App Router this should live under the localized route tree, for example `app/[locale]/design-system/page.tsx`.

The route should be hidden from navigation and sitemap generation.

The route should call `notFound()` outside local development. A simple guard based on `process.env.NODE_ENV !== 'development'` is enough for this phase because the requested access model is "only accessible on localhost dev."

For this phase, "localhost dev" means development-mode access only. It does not require a new hostname check, password gate, or auth integration.

The styleguide should use real site tokens, assets, and components where practical. It should document:

- Color palette
- Typography examples
- Color role guidance for dark primary typography and coral accents
- Layout/container spacing
- Navigation/menu behavior summary
- Link/button-like interactions currently used on the site
- Project card treatment, including the in-progress state
- Image treatment and aspect ratios
- Marquee/footer pattern
- Localization notes for Polish and English content

The styleguide should be understandable for both developers and the client. It should explain what is used and where, but it should avoid becoming a public marketing page.

## Boundaries

- Preserve the existing public pages and visual output.
- Update only the private design-system reference for the PDF direction in this phase.
- Do not add the design-system route to `Navbar`.
- Do not add the design-system route to `app/sitemap.ts`.
- Do not introduce a new styling framework or component library.
- Keep new abstractions close to existing Tailwind v4 and Next App Router patterns.
- Do not change project data shape unless implementation reveals a direct need.

## Verification

Implementation should be verified with:

- A production build or equivalent project-level type/build check.
- A local dev-server check that `/pl/design-system` renders in development.
- A production-mode check that the route is not exposed outside development.
- Browser sanity checks at desktop and mobile widths to catch text overflow, broken imagery, or layout issues.

## Open Follow-Up

After this first pass lands, a later phase can rebuild the public homepage and offer page from the PDF direction and normalize inconsistent classes and token usage. That public-page work is intentionally out of scope for this phase.
