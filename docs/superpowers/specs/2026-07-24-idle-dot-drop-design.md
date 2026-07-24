# Idle dot drop — design

**Date:** 2026-07-24
**Status:** approved, ready for implementation

## Summary

After 10 seconds of user idleness, the coral dot menu button falls from the navbar
to the coral hairline at the top of `FooterBar`, bounces on it with decaying
squash-and-stretch, and floats back to its place. Fires at most once per page
view. An easter egg, not a feature.

Delivered in two phases:

- **Phase A** — the dot falls, bounces and returns. Self-contained.
- **Phase B** — the hairline reacts: it flexes under the impact like a taut wire
  and springs back.

Phase A is a strict prefix of phase B: same fall, same impact timing, same
`kool:dot-impact` dispatch. B only adds a listener at the other end. A browser
checkpoint sits between them.

## Motivation

The dot already carries the site's only playful gesture — a recurring 1.5px
x-jitter every ~4s (`components/Navbar.tsx:208`). This extends that established
vocabulary rather than introducing a new one. The constraint throughout is that
this is a photography-led portfolio: the gag must be rare, brief and silent.

## Anatomy (existing code)

| Thing | Where | Notes |
|---|---|---|
| Dot button | `components/Navbar.tsx:194` | `motion.button`, 44×44 hit area, 36×35 `dot.svg` |
| Dot shrink wrapper | `components/Navbar.tsx:199` | `style={{ scale: dotScale, y: dotY }}` + `.nav-dot-shrink` |
| Scroll-timeline CSS | `app/globals.css:130` | `@keyframes nav-dot-shrink`, explicit `from` to **replace** the inline Framer transform |
| Idle x-jitter | `components/Navbar.tsx:208` | `x: [0,0,-1.5,1.5,-1,1,0,0]`, `repeat: Infinity`, `repeatDelay: 3.4` |
| Footer hairline | `components/FooterBar.tsx:14` | `h-px w-full origin-top bg-coral [transform:scaleY(0.5)]` — a 0.5px line |
| Footer bar | `components/FooterBar.tsx:13` | `fixed inset-x-0 bottom-0 z-40` |
| Navbar | `components/Navbar.tsx:112` | `fixed top-0 left-0 right-0 z-50` |
| Cross-component event idiom | `lib/analytics.ts:101` | `kool:`-namespaced window event + paired `onX(cb): () => void` unsubscriber |
| Reduced motion | `hooks/useReducedMotion.ts` | `useSyncExternalStore` over a media query |

Both the navbar and the footer bar are `position: fixed`, so the drop is a pure
`translateY` in viewport space — transform-only, no reflow, no CLS, no SEO
surface. Nav `z-50` over footer `z-40` means the dot lands visually *on top of*
the line, which is the read we want.

`FooterBar` renders on every real page (via `FooterBanner` on home, studio,
projekty, projekty/[slug], oferta, oferta/wnetrza-komercyjne; directly on
kontakt and polityka-prywatnosci). It is absent on 404 and design-system, where
the effect must silently no-op.

## Phase A — the drop

### Trigger

New hook `hooks/useIdle.ts`, following the `useReducedMotion` idiom in the same
directory (client-only, subscription-based, SSR-safe default).

- Idle = 10 000ms with no `pointermove`, `pointerdown`, `keydown`, `scroll`,
  `wheel`, `touchstart` or `focus`. All listeners passive.
- Additionally gated on `document.visibilityState === 'visible'`; the timer
  resets on `visibilitychange` so a backgrounded tab never accrues idle time.
- Suppressed entirely when: the menu is open, `useReducedMotion()` is true, or
  the footer line is not in the DOM.

### Fire-once-per-page-view

A `useRef(false)` armed flag, reset when `pathname` changes. `usePathname()` is
already imported in `Navbar.tsx`. Navigation is client-side through the
next-intl `Link`, so a pathname change is the correct re-arm signal.

### Geometry

Measured at fire time, never precomputed:

```
distance = footerLine.getBoundingClientRect().top - dot.getBoundingClientRect().bottom
```

Bail if the line is missing or `distance <= 0`. Re-measured on every fire so
iOS Safari's collapsing bars cannot desync it. The line is located via a
`data-footer-line` attribute added to `components/FooterBar.tsx:14`.

### Animation layer

The drop animates on a **new** `motion.div` wrapping the `<motion.button>`,
outside the existing shrink wrapper.

This is not optional. The existing wrapper is owned by the `.nav-dot-shrink`
scroll timeline, whose explicit `from`-keyframes exist specifically to *replace*
the inline Framer transform (see the comment at `app/globals.css:119`).
Animating `y` there fights the compositor and breaks the mobile shrink.

The existing x-jitter is paused for the duration of the flight (drive its
`animate.x` to `0` while dropping) so the dot does not jitter mid-fall.

### Choreography (~1.9s)

| Phase | Duration | Motion |
|---|---|---|
| Fall | 420ms | `y: 0 → d`, ease-in `[0.55, 0, 1, 0.45]`, stretch to `scaleX 0.92 / scaleY 1.12` at peak speed |
| Impact 1 | 90ms | squash `scaleX 1.18 / scaleY 0.82`; emits impact strength `1.0` |
| Bounce 1 | 300ms | up to `d − 0.32d` and back |
| Impact 2 | 70ms | squash `scaleX 1.10 / scaleY 0.90`; strength `0.45` |
| Bounce 2 | 200ms | up to `d − 0.12d` and back |
| Impact 3 | 50ms | squash `scaleX 1.05 / scaleY 0.95`; strength `0.18` |
| Return | 620ms | `y: d → 0` on the site's standard `[0.22, 1, 0.36, 1]`, with a 4px overshoot before settling |

Squash pivots from `transform-origin: bottom center` so the dot deforms against
the line rather than through it.

### Abort

The dot is a live menu button, so a displaced dot must never take a click from
a position the user did not aim at.

- `pointer-events: none` on the drop wrapper whenever `y !== 0`.
- Any of the idle-reset events during flight cancels the sequence and floats the
  dot home in 250ms on `[0.22, 1, 0.36, 1]`.
- Because `focus` is in the reset set, keyboard users tabbing to the dot abort
  the flight first; focus then lands on a button in its resting place.

### Impact signal

New `lib/dot-drop.ts` — not `lib/analytics.ts`, since this is not analytics —
following the event idiom at `lib/analytics.ts:101` exactly:

```ts
const DOT_IMPACT_EVENT = 'kool:dot-impact';
export function emitDotImpact(detail: { x: number; strength: number }): void
export function onDotImpact(cb: (detail: { x: number; strength: number }) => void): () => void
```

`x` is the impact point in viewport pixels; `strength` is the normalised
0–1 force of that particular bounce. Phase A dispatches it with no listener
attached, which is inert and correct.

## Phase B — the flexing line

`components/FooterBar.tsx:14` keeps its `h-px` wrapper so layout is byte-for-byte
unchanged, and gains `relative`. Inside it, an absolutely positioned
`<svg className="absolute -top-[6px] left-0 w-full h-[12px] overflow-visible pointer-events-none">`
with `preserveAspectRatio="none"` draws the line as a `<motion.path>` at
`strokeWidth={0.5}` with `vector-effect="non-scaling-stroke"` — which keeps the
stroke at a constant 0.5 CSS px regardless of the non-uniform viewBox scaling.

Flat state is a straight path. On impact the path becomes two cubic segments
meeting at the impact `x`, pulled down by `dip = 6px * strength`, driven by a
Framer spring and derived through `useTransform(dip, v => buildPath(v, x))`. A
single quadratic across the full width would bow the entire line like a
skipping rope; two localised cubics read as a taut wire struck at a point.

Reduced-motion users never subscribe, so the line never bends.

**This is the risk in phase B and the reason for the checkpoint.** The hairline
is permanently visible on every page. Re-implementing it as an SVG stroke to
enable a 2-second gag means that if the render differs at all — weight,
subpixel position, 1x vs 2x DPR — every page changes subtly, always. The gate
is a before/after screenshot diff of the footer at rest at both DPRs. If it
cannot be made pixel-identical, phase B is abandoned and phase A ships alone.

## Files

| File | Phase | Change |
|---|---|---|
| `hooks/useIdle.ts` | A | new |
| `lib/dot-drop.ts` | A | new |
| `components/Navbar.tsx` | A | drop wrapper, idle wiring, jitter suppression |
| `components/FooterBar.tsx` | A | `data-footer-line` attribute only |
| `components/Navbar.test.tsx` | A | extend framer-motion mock; add reduced-motion case |
| `components/FooterBar.tsx` | B | hairline becomes a flexible SVG path |

### Test-mock constraint

`components/Navbar.test.tsx:37` mocks `framer-motion` wholesale, exporting only
`AnimatePresence`, `motion`, `useScroll`, `useSpring` and `useTransform`. Any
new import from that package (`useAnimationControls`, `useMotionValue`,
`animate`, …) must be added to that mock in the same commit or the suite breaks
with an unhelpful undefined-is-not-a-function error.

## Verification

- `pnpm check` — vitest + node tests, typecheck, lint, i18n parity, build.
- Browser, phase A: dot falls, bounces, returns; aborts on input; no drop under
  `prefers-reduced-motion: reduce`; no drop on 404 or design-system; menu still
  opens on click at rest.
- Browser, phase B: footer hairline screenshot-identical at rest, 1x and 2x DPR.
- `verify-site` skill across routes × both locales before handoff.

## Non-goals

- No sound.
- No analytics event — this would be noise in the funnel.
- No new colors, tokens or typefaces.
- Not on the design-system page.
- No behaviour on the 404 page.
