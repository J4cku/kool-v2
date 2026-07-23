# Homepage Swiper Design

## Goal

Make the homepage hero feel like a conventional, responsive project slider while retaining its full-viewport, split-project presentation and the established Kool folio styling.

## Interaction

- Replace the custom horizontal wheel, pointer, keyboard, and transition state machine with Swiper.
- Show one project per viewport on mobile and two projects side by side from 992px.
- Move projects horizontally, one project at a time, using touch drag, mouse drag, horizontal trackpad input, arrow keys, and five-second autoplay.
- Keep vertical wheel and touch movement available for scrolling to the content beneath the hero.
- Pause autoplay while keyboard focus is inside the slider and when reduced motion is enabled.
- Preserve server-provided project order and loop continuously.

## Visual Treatment

- Keep the hero at `100svh` behind the fixed header.
- Each project remains a full-height image and links to its detail page.
- Each translucent beige project folio spans the full width of its image. It is always visible on touch-sized layouts and fades in on hover or keyboard focus on desktop.
- Remove the scroll/swipe instructional labels and their translation keys.
- Restore the three vertically stacked coral dots at the bottom center. Their staggered downward motion signals that more page content is available below; they fade as the document scrolls and remain static when reduced motion is requested.

## Accessibility and Performance

- Provide localized labels and project announcements through Swiper's accessibility support and the existing project-link labels.
- Maintain visible focus rings and usable arrow-key navigation.
- Keep the first visible images prioritized and use responsive `next/image` sizes for one- and two-column layouts.
- Do not block native vertical page scrolling.

## Verification

- Source-contract tests cover Swiper configuration, responsive slide counts, full-width folios, removal of instruction copy, and the restored dot cue.
- Browser QA covers desktop and mobile drag, autoplay, horizontal trackpad control, vertical page scrolling, hover/focus folios, reduced motion, and project links.
- `pnpm check` remains the final repository gate.
