# UI Polish Design

**Date:** 2026-07-21
**Status:** approved for planning

## Goal

Refine the existing Kool Studio site without changing its visual identity or information architecture. The pass should make motion quieter, mobile layouts more reliable, navigation more legible, project content consistently localized, and interactive elements clearly clickable.

## Direction

Use targeted changes in the existing components. Do not introduce a new component library, typeface, palette, or broad animation framework. Keep Poppins, beige, coral, dark typography, the existing project data model, and the current desktop/mobile navigation structure.

## Navigation and brand orb

- Render the menu orb at approximately `56 × 54px`, matching the visual size of an `O` in the `208 × 77px` KOOL logo.
- Apply the same dimensions to the normal navbar and the open mobile-menu header.
- Keep the organic `dot.svg` silhouette.
- Change the shake cadence to one start every four seconds. Reduce the displacement so the motion reads as a gentle nudge rather than jitter.
- Use weight `600` for inactive desktop menu links and Instagram; retain a stronger active state.
- Keep the word `instagram` in the desktop menu and the Instagram icon in the fixed mobile footer.

## Motion

- Retain the existing motion language but reduce translation distances and scale changes.
- Use the existing editorial easing curve and slightly longer settling transitions where that improves smoothness.
- Reduce navbar/menu offsets, contact-page entrance offsets, grid exit scaling, reveal overscale, and scroll-indicator travel.
- Make the mobile scroll-linked logo/orb transformation less aggressive and keep the Framer Motion fallback and CSS scroll-timeline values equivalent.
- Respect `prefers-reduced-motion` for continuous marquees, homepage autoplay/indicators, navigation nudges, and page-specific motion where it is currently missing.
- Preserve the contact route wipe, but align its collapse point to the actual orb center at mobile and desktop breakpoints.

## Homepage hero

- On desktop only, define the available hero band as the space between the logo's bottom edge and the language switcher's top edge.
- Vertically center the project image strip within that band across viewport heights.
- Preserve the current mobile hero flow.
- Remove Swiper's grab cursor and use a pointer cursor on clickable project slides.

## Mobile page heroes

- On mobile, place the leading images for offer, project details, and studio below the KOOL header rather than behind it.
- Preserve the assets' native `16:9` framing.
- Keep the hero frame and its document-flow spacer driven by one shared layout contract so they cannot drift apart.
- Allow Next.js image optimization for these large hero assets instead of forcing original multi-megabyte files to mobile devices.

## Contact page and iOS viewport

- Replace layout-viewport sizing with dynamic viewport sizing where the contact page and mobile overlay must fit the visible screen.
- Account for safe-area insets in fixed top and bottom controls.
- Give the fixed footer bar an explicit beige surface so browser chrome and page content do not show as stray bands.
- Keep the coral separator visually crisp and attached to the footer treatment.
- Add a beige browser theme color.

## Project content and order

- Display projects in this row-major desktop order:

  1. Dobrzykowice, Dehesa, Walecznych
  2. Łazienki Warszawa, Fandom, Belmonte
  3. Kancelaria, Biblioteka, PRS
  4. Widmo, Strachowicka ("Amerykanie"), Dobry Materiał
  5. Gdańsk, Piazza, Toalety w Teatrze

- Reorder the canonical `projects` array so the three-column grid and filtered views preserve the requested relative order.
- Keep using `localizeProject` for English listings, details, metadata, description blocks, and slider labels.
- Verify all English project descriptions in the rendered UI. The current data already contains English content for all 15 projects, so this is a rendering/verification task rather than new translation writing.
- Replace the hard-coded `PROJECT IN PROGRESS` card text with the existing localized message key and correct the Polish copy.

## Interaction cursors and accessibility

- Use the pointer cursor for enabled anchors, buttons, filter controls, the navbar orb, locale buttons, project cards, and homepage slides.
- Preserve specialized interaction cursors such as the before/after slider's column-resize cursor.
- Retain visible keyboard focus behavior and semantic buttons/links.

## Link preview metadata

- Use the studio team image as the homepage link-preview source instead of allowing crawlers to infer the first Dobrzykowice slider image.
- Produce a dedicated `1200 × 630` social crop from that source.
- Add explicit Open Graph and Twitter card image metadata for both locales.

## Verification

- Run the smallest relevant checks while implementing.
- Run `pnpm check` before handoff.
- Run browser QA for public routes in Polish and English, with focused screenshots at desktop and mobile widths.
- Specifically verify homepage vertical centering at multiple desktop heights, hero/logo separation on mobile, contact safe areas on a mobile Safari-sized viewport, project order, English project descriptions, cursor behavior, reduced-motion behavior, and social metadata.
