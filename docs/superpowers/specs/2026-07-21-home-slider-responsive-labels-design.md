# Home Slider Responsive Labels — Design

Date: 2026-07-21

## Goal

Refine the homepage composition shown in the supplied screenshot: restore the navigation orb to its earlier, quieter size; expose project names when desktop users explore the image strip; and prevent three narrow slides from competing for space in smaller desktop windows.

## Approved design

### Navigation orb

The menu orb returns from 56×54 px to 36×35 px in both the closed navbar and the open mobile menu. Its current four-second nudge cadence, reduced-motion behavior, pointer cursor, and menu interaction remain unchanged. Any shared geometry used by contact transitions must follow the restored dimensions so the transition still lands at the orb center.

### Project label interaction

Each homepage slide derives its localized project title from the existing project data. On pointer hover or keyboard focus, a sharp-edged coral caption bar fades and rises into the lower part of the image. Dark `#1A1A1A` uppercase text on coral `#FC3117` provides approximately 4.65:1 contrast and contains the project title only. The image keeps its existing restrained scale treatment.

The caption is hidden by default. Pointer hover reveals it only inside `@media (hover: hover) and (pointer: fine)`, so touch interactions cannot leave it stuck. Keyboard users reveal it through `:focus-visible`. The duplicated visual caption is `aria-hidden="true"`; the project link retains its localized accessible name through the image alternative text.

The caption transition is 220 ms from `opacity: 0; transform: translateY(8px)` to `opacity: 1; transform: translateY(0)`, using `cubic-bezier(0.22, 1, 0.36, 1)`. Under `prefers-reduced-motion`, translation is removed while the opacity state change remains.

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

`ImageStrip` already owns the project slug, current locale, link, and image. It resolves the title during render with `localizeProject(project, useLocale())`; the module-cached shuffled slide model continues to contain only locale-neutral slugs and image paths, so switching locales cannot retain a title from the previous locale. This avoids a second data source or new translation keys. `Navbar` remains the owner of orb dimensions and interaction. No new components or dependencies are needed.

The shared contact-transition target changes only on the horizontal axis: `--nav-orb-center-x` becomes `calc(100% - 34px)` below 768 px and `calc(100% - 42px)` from 768 px upward (page padding plus half of the 36 px orb width). `--nav-orb-center-y` remains `calc(var(--nav-top-padding) + 38.5px)` because flex alignment keeps the orb centered against the unchanged 77 px header regardless of orb height.

## Verification

- Add a failing source/contract test for the 1/2/3 Swiper breakpoints, responsive image sizes, localized `useLocale()` caption resolution, hover-capable and `:focus-visible` visibility, `aria-hidden`, exact motion values, 36×35 orb geometry, and the two `--nav-orb-center-x` values.
- Run the focused test red, implement the minimum change, then run it green.
- Run `pnpm check`.
- Verify screenshots and computed geometry at 767, 768, 1024, 1279, and 1280 px plus keyboard focus, a touch viewport, and the contact route; confirm no console, hydration, overflow, stuck-caption, target-alignment, or reduced-motion regressions.
