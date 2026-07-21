# Mersi-Informed Interaction System Design

## Brief

Replace the first-pass visual imitation with the interaction architecture verified in the public Mersi site source. Kool Studio keeps its own routes, projects, copy, Poppins typography, beige/coral/dark tokens, accessibility safeguards, and Next.js architecture; only the reference's layout logic, pacing, and transitions are adapted.

## Verified Reference Mechanics

The public Webflow markup, CSS, and custom JavaScript bundle establish the following behavior:

- The homepage is a full-viewport, two-panel project reel driven by vertical scroll rather than autoplay. It uses a very tall virtual scroll range, begins near its midpoint, silently recenters away from the ends, and snaps to the nearest project after wheel input settles.
- The left image reveals from top to bottom while the paired right image reveals from bottom to top. Project metadata changes with the same fractional progress.
- At 991px and below, page scrolling is stopped and a 30px vertical swipe changes projects discretely.
- Project detail pages pin a full-height track and translate it horizontally as the document scrolls vertically. Their sequence is hero, narrow narrative/meta panel, intrinsic-width media gallery, contact panel, and a final next-project experience. At 991px and below the same content returns to a normal vertical document.
- The archive uses FLIP-style layout transitions for filtering and its introductory thumbnail composition.
- Route arrivals are revealed by paired curtains. Images and headings use clipped entry reveals, with reduced motion falling back to static content.

No proprietary source, assets, fonts, or copy will be copied. The implementation reproduces the observable interaction model using the project's existing Framer Motion dependency and native browser primitives.

## Homepage

### Structure

The public homepage becomes reel-only: fixed navigation plus the project reel. `ManifestoSection` and the content portion of the home footer are removed from this route, because a true recentering virtual reel cannot also provide a reliable linear path to content below it. The fixed `FooterBar` remains so Instagram and language switching are never lost. Manifesto content remains represented elsewhere in the public site.

The existing eight curated project/image pairs remain the source of truth. Only the current and adjacent pair are mounted at full size to avoid decoding all sixteen photographs at once.

### Desktop interaction (992px and wider)

- The document receives 100 cycles of `projectCount × viewportHeight` virtual distance and initializes at cycle 50.
- Scroll position maps to a fractional project step. The integer part selects the current pair; the fractional part drives two opposing clip paths and metadata cross-reveal.
- Crossing the midpoint updates the folio link, accessible name, and progress counter. The polite live region updates only after snap completion or an explicit discrete command, never during fractional scroll.
- After 500ms without wheel/scroll input, the page animates to the closest step in 800ms using a power-like ease-out curve.
- When the virtual cycle leaves the 10–90 safety band, scroll is moved without animation to the center cycle while preserving the exact fractional project position.
- Arrow Up/Left and Arrow Down/Right move one project. Home/End are intentionally not overloaded because the reel is circular.

### Mobile interaction (991px and narrower)

- The reel is fixed to `100svh`, with two `50svh` image fields stacked vertically.
- Document scrolling is locked while this route is mounted.
- A vertical pointer/touch movement of at least 30px advances or reverses one project with an 800ms opposing clip transition.
- Keyboard navigation remains available. A concise localized instruction is exposed visually and to assistive technology.

### Reduced motion

The reel becomes a fixed, discrete controller at every width when reduced motion is requested: page scrolling is locked and each wheel, swipe, or keyboard gesture changes exactly one project without interpolated clip, snap, or smooth-scroll animation. Announcements occur only after a snapped or discrete change, never on a fractional midpoint.

## Project Detail Story

### Data normalization

A pure helper converts each `Project` into a media sequence while preserving the existing hero-inclusive insertion indices for images, reels, and before/after sliders. A second helper rotates the project list so the current project's successors drive the final panel. Desktop media frames use explicit viewport-relative widths rather than decoded intrinsic dimensions, keeping the track measurable and stable during hydration, image loading, and history restoration. This is a deliberate fidelity exception to the reference's intrinsic media widths because the current `Project` model stores paths but not trustworthy source dimensions.

### Desktop interaction (992px and wider)

`ProjectStory` owns an outer scroll section, a `position: sticky` viewport, and a `width: max-content` flex track. `ResizeObserver` measures `track.scrollWidth - viewportWidth`; the outer height includes one viewport, that horizontal distance, and the separate rail distance. Scroll maps piecewise: the first segment drives negative track X and clamps at the track boundary, while only the remaining segment drives next-project progress.

The track contains:

1. A `100vw` split hero with primary photograph and project identity.
2. A `45rem` narrative/meta panel using current project facts and description.
3. A horizontal gallery whose media frames alternate approximately 60%, 80%, and 100% of viewport height with `2.5rem` gaps.
4. A `100vw` contact panel using the existing Kool contact identity.
5. A `100vw` next-project panel followed by a separate pinned vertical phase. Let `horizontalDistance = trackWidth - viewportWidth` and `railDistance = (successorCount - 1) × viewportHeight`; the single piecewise outer height is `viewportHeight + horizontalDistance + railDistance`. Track X consumes and clamps after the horizontal segment, then only the remaining scroll maps to rail progress. Scrolling upward from preview zero naturally returns to the story, and scrolling past the last preview naturally reaches the document boundary. Visible previous/next controls and arrow keys move between previews; touch follows the same ordinary vertical document scroll.

The main track never relies on horizontal overflow scrolling, so the browser retains a conventional vertical scrollbar and history restoration semantics. When keyboard focus enters an off-screen gallery, contact, or next-project control, the story scrolls the corresponding panel into view before leaving focus there.

### Mobile and reduced motion

At 991px and below, and at every width when reduced motion is requested, the measured pinning is disabled. The exact same DOM becomes a normal vertical column; media is full width, the contact block follows the gallery, and only the immediate next project is shown. Videos retain muted/loop/plays-inline behavior, and the existing before/after control remains interactive. The fixed `FooterBar` remains present on every detail route.

## Projects Archive

The existing semantic filters and Framer Motion layout transitions remain. They are refined with one scoped `LayoutGroup`, a moving active-filter rule, position-only card transitions, and a full-viewport introductory thumbnail field that collapses and fades into the editorial archive rhythm before focus can enter the cards. The actual cards remain the sole navigation targets; the intro is decorative and hidden from accessibility APIs. The intro is omitted for filtered query URLs and under reduced motion, while filter reflow remains a separate position-only FLIP animation.

## Global Motion and Navigation

- The reel, project-story responsive layout, and full/mobile navbar all share the same 992px breakpoint. The navbar uses the light-on-image treatment throughout the reel-only homepage. Project stories publish a small theme event so navigation is light over the opening hero and returns to its beige/dark treatment once the hero has translated away.
- `PageTransition` becomes a route-keyed, two-curtain dark-panel arrival reveal with only a one-pixel coral seam. It does not transform the page subtree, preserving sticky tracks and fixed elements and respecting the rule against large coral fills.
- Existing image and heading reveals are tightened to the faster source-informed cadence.
- Global smooth scrolling is removed because it conflicts with silent reel recentering and pinned-track measurement.
- `prefers-reduced-motion` disables curtains, marquees, smooth transitions, and nonessential reveals.
- The mobile menu keeps its existing focus trap, Escape handling, body lock, and focus restoration even though the reference omits those safeguards.

## File Boundaries

- `lib/portfolio-motion.ts`: virtual reel math, snapping/recentering, media normalization, successor rotation, pinned/rail geometry, and index clamping.
- `tests/portfolio-motion.test.mts`: pure behavior contracts for the interaction system.
- `components/ImageStrip.tsx`: homepage reel rendering and input controller.
- `components/project-detail/ProjectStory.tsx`: measured sticky track and responsive layout.
- `components/project-detail/ProjectMedia.tsx`: image/video/comparison media renderer.
- `components/project-detail/NextProjectRail.tsx`: progress-driven final project selector with visible and keyboard controls.
- `app/[locale]/projekty/[slug]/page.tsx`: server-side project selection and story composition.
- `app/[locale]/projekty/ProjectsListing.tsx`, `components/FilterTabs.tsx`, `components/ProjectGrid.tsx`: archive motion refinements.
- `components/PageTransition.tsx`, `components/Navbar.tsx`, `components/Reveal.tsx`, `components/RevealHeading.tsx`, `app/globals.css`, and locale messages: shared finish work.

`ProjectHero.tsx` stays intact because Studio and Oferta also consume it. Legacy detail-only `ProjectMeta.tsx` and `ProjectContent.tsx` may remain temporarily unused to avoid unrelated deletion risk. The autoplay-only `lib/showcase-playback.ts` contract is retired, and `pnpm test` discovers both homepage curation and interaction-system tests.

## Verification

- Pure interaction tests must fail before each helper implementation and pass afterward.
- `pnpm check` must pass in this workspace.
- Every public PL/EN route and every project route must return its expected status from a production server.
- Desktop checks target 1440×900 and 1024×768; mobile checks target 390×844 and 768×1024.
- The in-app browser is the required visual surface. If it remains unavailable, route/build evidence is collected and the visual gate is reported as unavailable rather than claimed.

## Explicit Non-Goals

- Copying Mersi assets, brand typography, CMS code, or proprietary JavaScript.
- Adding GSAP, Lenis, Taxi, or another runtime when the verified behavior can be expressed with the existing stack.
- Replacing the accessible mobile menu with the less accessible reference behavior.
- Building a cross-route shared-image morph, which would require concurrent route trees and a custom navigation layer beyond this interaction pass.
