# Home Slider Responsive Labels — Design

Date: 2026-07-21

## Goal

Refine the homepage composition shown in the supplied screenshot: restore the navigation orb to its earlier, quieter size; expose project names when desktop users explore the image strip; and prevent three narrow slides from competing for space in smaller desktop windows.

## Approved design

### Navigation orb

The menu orb returns from 56×54 px to 36×35 px in both the closed navbar and the open mobile menu. Its current four-second nudge cadence, reduced-motion behavior, pointer cursor, and menu interaction remain unchanged. Any shared geometry used by contact transitions must follow the restored dimensions so the transition still lands at the orb center.

### Project label interaction

Each homepage slide derives its localized project title from the existing project data. On pointer hover or keyboard focus, a sharp-edged coral caption bar fades and rises into the lower part of the image. Beige uppercase text contains the project title only. The image keeps its existing restrained scale treatment.

The caption is hidden by default and does not appear permanently on touch layouts. The project link retains a localized accessible name through the image alternative text, and keyboard focus exposes the same visual caption as hover. Motion is short and uses the site's existing easing; `prefers-reduced-motion` removes the translation while preserving the state change.

Rejected alternatives:

- A full-image dark overlay with centered type obscures too much of the architectural photography.
- A permanently visible label changes the intentionally image-led homepage and creates unnecessary density on mobile.

### Responsive slide count

Swiper uses three presentation bands:

- below 768 px: 1 slide;
- 768–1279 px: 2 slides;
- 1280 px and above: 3 slides.

The image `sizes` hint mirrors those bands: 100vw, 50vw, and 33vw. Existing loop, autoplay, reduced-motion, mousewheel, touch, and drag behavior remain unchanged.

## Component and data flow

`ImageStrip` already owns the project slug, current locale, link, and image. Its slide model will also expose the localized title, avoiding a second data source or new translation keys. `Navbar` remains the owner of orb dimensions and interaction. No new components or dependencies are needed.

## Verification

- Add a failing source/contract test for the 1/2/3 Swiper breakpoints, responsive image sizes, localized caption, hover/focus visibility, and 36×35 orb geometry.
- Run the focused test red, implement the minimum change, then run it green.
- Run `pnpm check`.
- Verify desktop screenshots around 1024, 1279, and 1280 px plus keyboard focus and a mobile viewport; confirm no console, hydration, overflow, or reduced-motion regressions.
