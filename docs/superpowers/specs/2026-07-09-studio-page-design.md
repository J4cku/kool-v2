# Studio Page Design

## Context

The current localized Studio route is a placeholder assembled from unrelated portfolio imagery and generic editorial sections. The supplied `KOOL_www_layout_studio_prev.pdf` replaces that placeholder with the approved Studio page direction. Two accompanying archives provide the final studio portraits, four press-card images, and three publication logos.

The page must stay within the site's existing visual system: Poppins, beige `#E5DDD0`, coral `#FC3117`, dark `#1A1A1A`, muted `#888888`, white, and the 1400px content width. The fixed `Navbar`, locale routing, and `FooterBanner` remain shared site elements.

## Goals

- Replace the current Studio placeholder with a faithful responsive implementation of the supplied PDF.
- Use the supplied final assets rather than existing project-image placeholders.
- Link each press card to the publication URL supplied by the client.
- Preserve Polish source copy on `/pl/studio`.
- Provide natural English Studio copy on `/en/studio`.
- Translate press-card titles on the English page and mark every Polish-language destination with `[PL]`.
- Keep the implementation accessible, localized, and aligned with existing project conventions.

## Non-Goals

- No changes to the shared navigation design, footer design, design tokens, sitemap, or other public routes.
- No generalized CMS or site-wide press/publications system.
- No new typefaces, colors, animation system, or component library.
- No unrelated cleanup of the existing Studio placeholder components or site-wide styles.

## Approved Approach

Replace the existing Studio route rather than retaining any placeholder sections below the new layout. Keep the implementation page-scoped: a small typed press-card data structure and local rendering helpers are appropriate, but a generalized publication abstraction is unnecessary.

### Client-Approved Revision

The client review supersedes the initial static hero and manifesto direction below. Reuse `ProjectHero` for a fixed, full-viewport Studio cover behind the shared navigation. After an `h-screen` reveal, the beige page content—including the footer—scrolls over the cover using the same layering pattern as project-detail routes. The manifesto reuses the homepage marquee treatment: four repeated coral copies move continuously, while a single semantic `h1` exposes only the first copy to assistive technology.

Move the nine supplied final assets into `public/images/studio/` with stable descriptive names:

- Studio team hero image
- Studio detail portrait
- Four square press images
- Label, WhiteMAD, and PLNdesign logos

Render photography with `next/image`. Publication links use ordinary external anchors, open in a new tab, and include `rel="noopener noreferrer"`.

## Page Structure

### 1. Hero

Keep the fixed shared `Navbar` above a fixed, full-viewport team portrait rendered by `ProjectHero`. The portrait is the page's visual thesis and uses the supplied `KOOL_studio_main.webp` image. An `h-screen` spacer reveals the cover before a beige, relatively positioned content wrapper scrolls over it. Its cover crop preserves both founders at supported widths.

### 2. Manifesto Line

Place `WE ARE KOOL AND WE DESIGN KOOL THINGS!` at the start of the beige scrolling content as a large coral, regular-weight uppercase marquee. Match the homepage's overflow-hidden, no-wrap spacing and `animate-marquee` treatment with four repeated copies. Keep one semantic `h1`: expose the first copy to assistive technology and hide the remaining three copies with `aria-hidden="true"`.

Use asymmetric marquee padding—`pt-16 pb-8 md:pt-24 md:pb-12`—to reduce the distance to the introduction without changing the motion.

### 3. Studio Introduction

Use the PDF's asymmetric two-column composition:

- Left: the exact Polish Studio description on `/pl/studio`, or its approved English translation on `/en/studio`.
- Right: the supplied vertical atelier photograph.

The section retains generous negative space. On mobile, copy appears before the image.

Use `pt-10 pb-20 md:pt-14 md:pb-28 lg:pt-20 lg:pb-36` so the section starts closer to the marquee while preserving its established lower spacing.

Match the established Oferta body-copy treatment exactly: `max-w-[610px] font-[400] leading-[1.5] text-dark/80` with `fontSize: 'clamp(15px, 1.5vw, 20px)'`.

Polish source copy remains verbatim from the supplied PDF except for responsive line wrapping. The English translation preserves the meaning and tone rather than mirroring Polish syntax mechanically.

### 4. Press Header

Display `NAPISALI O NAS` on Polish and `FEATURED IN` on English at Poppins font weight `700`. Align the Label, WhiteMAD, and PLNdesign logos opposite the heading on desktop. On mobile, the logo row moves below the heading and stays legible without dominating it.

### 5. Press Grid

Render four linked press cards in the PDF order:

1. Label Magazine — Dehesa article
2. WhiteMAD — Dehesa article
3. Label Magazine — city guide
4. PLNdesign — law office article

Use a three-column desktop grid so the fourth item begins a second row, matching the PDF. Use two columns at tablet widths and one column on small mobile screens. Each card contains a square supplied image, uppercase publication name, and article title. Hover and keyboard focus use a restrained opacity change; no decorative animation is needed.

Polish titles:

- `Delikatesy iberyjskie we Wrocławiu. Wypełniły je kolory jak z filmów Almodovara`
- `Delikatesy we Wrocławiu inspirowane kolorami Hiszpanii`
- `Polska. Miejski przewodnik`
- `Architektki urządziły kancelarię na 19 m² we Wrocławiu`

English titles:

- `An Iberian delicatessen in Wrocław, filled with colours straight out of Almodóvar's films [PL]`
- `A delicatessen in Wrocław inspired by the colours of Spain [PL]`
- `Poland. City Guide [PL]`
- `Architects designed a 19 m² law office in Wrocław [PL]`

The `[PL]` marker is visible text and part of the localized title, so screen readers receive the same language warning.

### 6. Footer

Keep the existing `FooterBanner` without its own marquee. Place it inside the beige scrolling content wrapper so the fixed Studio cover never shows behind the footer.

## Responsive Behavior

- Desktop follows the supplied 1528px artboard proportions within the site's 1400px content convention.
- The hero is a fixed full-viewport cover; crop changes must not cut off either founder.
- The intro collapses from two columns to one.
- The press header logos wrap below the heading when horizontal space is insufficient.
- The press grid moves from three to two to one column.
- Typography uses fluid sizing or existing responsive utilities to avoid clipped headlines and excessive mobile line lengths.
- Existing fixed navigation and language controls must not cover interactive content.

## Accessibility and Interaction

- Provide localized alt text for the two Studio photographs and four press images.
- Publication logos are decorative because the publication names appear in card text; render them with empty alt text.
- Every press card is a single clear link with a visible keyboard focus state.
- Preserve semantic heading order: one page-level heading, followed by the press section heading and card content.
- Reuse the existing homepage marquee motion; introduce no new animation primitive.
- Disable the manifesto animation with `motion-reduce:animate-none` when the visitor prefers reduced motion.

## Localization

Replace the current placeholder `studio` message shape in both locale files with keys needed by the approved layout. Polish content comes from the PDF text extraction to preserve diacritics. English content is a natural translation.

Publication brand names stay unchanged in both locales. Polish article titles stay original on `/pl/studio`; `/en/studio` uses the approved translations with `[PL]` markers.

## Verification

- Before implementation, confirm the current Studio page does not match the supplied structure, establishing the acceptance-test baseline.
- Run the smallest available checks while iterating: TypeScript, ESLint for touched files, and i18n key parity.
- Run `pnpm check` before handoff.
- Run the project `verify-site` workflow for all localized routes, recording HTTP status, console errors, and screenshots.
- Compare desktop `/pl/studio` and `/en/studio` screenshots side by side with the rasterized PDF.
- Inspect Studio at desktop, tablet, and mobile widths for crop fidelity, line wrapping, focus states, and overlap with fixed UI.
