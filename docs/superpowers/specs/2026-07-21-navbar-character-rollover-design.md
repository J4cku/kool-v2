# Navbar character rollover

## Goal

Give the desktop menu links the letter-by-letter vertical rollover seen on Mersi Architecture while preserving Kool Studio's existing navigation structure and visual tokens.

## Scope

- Apply the interaction to the four desktop internal links and the desktop Instagram link.
- Render an accessible text label with a duplicate visual copy inside a clipped wrapper.
- On hover or keyboard focus, translate the visible characters upward and the duplicate characters into place with a 15 ms character stagger, a 450 ms duration, and the existing cubic-bezier ease.
- Remove the existing hover underline for these links.
- Leave mobile navigation, menu opening/closing choreography, active-link weight, links, translations, and crawlable server HTML unchanged.

## Implementation

Create a small local `NavLinkLabel` helper inside `components/Navbar.tsx`. It will split each supplied label into character spans, preserving spaces with non-breaking spaces. Framer Motion will animate the two character rows in response to the parent link's hover and focus state.

The desktop links will use the helper. The mobile menu will continue rendering plain translated labels because touch has no hover equivalent and its existing entrance animation already provides its intended movement.

## Verification

- Desktop hover and keyboard focus roll every label cleanly in both locales.
- Links retain their destinations and active weight.
- Mobile menu behavior is unchanged.
- `pnpm check` passes.
