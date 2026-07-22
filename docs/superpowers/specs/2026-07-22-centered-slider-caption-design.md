# Centered Homepage Slider Caption — Design

Date: 2026-07-22

## Goal

Move homepage project titles from the bottom coral bar to the exact visual center of each slider image. Keep the title readable without obscuring the photograph.

## Visual treatment

The caption overlay fills the slide and centers its content on both axes. The visible label is a compact, sharp-cornered rectangle rather than a full-width band:

- localized project title in uppercase beige (`#E5DDD0`);
- existing Poppins caption weight and letter spacing;
- centered text with a maximum width of 85% of the image;
- translucent dark background derived from the existing dark token (`#1A1A1A` at 45% opacity);
- minimal 2px backdrop blur and compact horizontal/vertical padding;
- no border, shadow, coral fill, pill shape, or additional decoration.

This keeps the image as the dominant element while giving titles enough contrast over both light and dark photography.

## Interaction and accessibility

The caption remains hidden by default and appears on fine-pointer hover or keyboard focus-visible, matching the existing behavior. Its fade and subtle vertical settle remain short and restrained. Under `prefers-reduced-motion`, the translation is removed and only visibility changes.

The caption remains `aria-hidden` because the linked image already supplies localized accessible text. The overlay remains pointer-event transparent, so the entire image continues to be the link target. Touch behavior is unchanged; this request applies to the hover/focus caption treatment.

## Implementation boundary

Only the homepage slider caption markup/styles and its focused regression contract change. Slide order, autoplay, responsive 1/2/3 layout, image scaling, localization, URLs, and other page styling remain unchanged.

## Verification

- A focused test proves the caption overlay is centered and the inner label uses beige text with a translucent dark rectangle rather than the coral bottom bar.
- Existing hover, focus-visible, and reduced-motion contracts remain green.
- Desktop browser screenshots verify true centering and readable contrast on representative light and dark project images.
- Run `pnpm check` before handoff.
