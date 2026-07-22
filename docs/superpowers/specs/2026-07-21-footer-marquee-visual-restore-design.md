# Footer and Marquee Visual Restore

## Goal

Restore the pre-Lighthouse visual treatment for the fixed footer controls and marquee surfaces without reverting structural accessibility or performance improvements.

## Visual changes

- Restore beige glyphs on the coral Instagram circle.
- Restore beige text on the active coral language circle.
- Restore coral text on the inactive transparent language control.
- Restore both language buttons to their original 26-by-26-pixel geometry with the existing 4-pixel gap.
- Remove the white backgrounds added to the homepage manifesto marquee, shared footer marquee, and studio marquee so they inherit the original beige page surface.
- Keep coral exactly `#FC3117`.

## Preserved behavior

- Retain the 44-by-44-pixel Instagram hit area around its 26-pixel circle.
- Retain `aria-label`, `aria-pressed`, locale switching, Instagram behavior, fixed positioning, and hover states.
- Retain all image, video, font, transition, and initial-load performance optimizations.

## Validation

- Run `pnpm check`.
- Verify the 26-pixel language buttons, 4-pixel gap, Instagram control, and all three marquee contexts at mobile and desktop widths.
- Rerun Lighthouse once to record the expected accessibility impact of the intentional palette restoration.
- Update the open pull request with the resulting commit.

## Trade-off

The original coral/beige pairing and 26-pixel language buttons do not meet Lighthouse's strict contrast and target-size thresholds, so Accessibility may fall below 100. Exact production visual spacing takes precedence for the language changer; its semantic state and behavior remain accessible.
