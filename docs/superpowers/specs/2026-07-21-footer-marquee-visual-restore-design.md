# Footer and Marquee Visual Restore

## Goal

Restore the pre-Lighthouse visual treatment for the fixed footer controls and marquee surfaces without reverting structural accessibility or performance improvements.

## Visual changes

- Restore beige glyphs on the coral Instagram circle.
- Restore beige text on the active coral language circle.
- Restore coral text on the inactive transparent language control.
- Remove the white backgrounds added to the homepage manifesto marquee, shared footer marquee, and studio marquee so they inherit the original beige page surface.
- Keep coral exactly `#FC3117`.

## Preserved behavior

- Retain the 44-by-44-pixel interactive hit areas around the 26-pixel footer circles.
- Retain `aria-label`, `aria-pressed`, locale switching, Instagram behavior, fixed positioning, and hover states.
- Retain all image, video, font, transition, and initial-load performance optimizations.

## Validation

- Run `pnpm check`.
- Verify the footer controls and all three marquee contexts at mobile and desktop widths.
- Rerun Lighthouse once to record the expected accessibility impact of the intentional palette restoration.
- Update the open pull request with the resulting commit.

## Trade-off

The original coral/beige pairing does not meet Lighthouse's strict small-text contrast threshold, so Accessibility may fall below 100. The visual identity takes precedence for these two compact fixed controls; target size and semantic accessibility remain improved over the original implementation.
