# Idle dot drop — design

**Date:** 2026-07-24
**Status:** approved, ready for implementation

## Summary

After 10 seconds of user idleness, the coral dot falls from the navbar to the
coral hairline at the top of `FooterBar`, bounces on it under real gravity with
decaying squash-and-stretch, and floats back to its place. Only the dot moves —
its button stays where the user left it. Fires at most once per page view. An
easter egg, not a feature.

Delivered in two phases:

- **Phase A** — the dot falls, bounces and returns. Self-contained.
- **Phase B** — the hairline reacts: it flexes under the impact like a taut wire
  and springs back.

Phase A is a strict prefix of phase B: same fall, same impact timing, same
`kool:dot-impact` dispatch. B only adds a listener at the other end. A browser
checkpoint sits between them.

Both phases shipped. Phase B did not survive first contact with the pixel
diff and was re-derived; see [Phase B — the flexing line](#phase-b--the-flexing-line).

## Launch gate

The whole easter egg sits behind the PostHog feature flag `dot-drop`, read in
`components/Navbar.tsx` with the idiom `components/kontakt/BriefModal.tsx`
already uses for `brief-form`:

```ts
useSyncExternalStore(
  subscribeFeatureFlags,
  () => featureFlagEnabled('dot-drop') || process.env.NODE_ENV === 'development',
  () => process.env.NODE_ENV === 'development'
)
```

Fail-closed: no flag, no drop. The one deliberate exception is local
development — posthog never initialises without `NEXT_PUBLIC_POSTHOG_KEY`, so
a purely fail-closed gate would make the effect impossible to see at all.
`NODE_ENV` is inlined at build time into both the server and the client
bundle, so the two snapshots above agree in every environment and hydration
never sees the value flip.

The result feeds `useIdle`'s `enabled` argument rather than guarding the
animation, so with the flag off the hook registers no input listeners and
starts no timer: an unlaunched easter egg costs a visitor nothing.

The flag gates the **drop**, not the hairline. The hairline is an SVG for
every visitor on every page whether the flag is on or off, which is what
makes its resting render the hard constraint in phase B.

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
| Footer hairline | `components/FooterBar.tsx:14` | `h-px w-full origin-top bg-coral [transform:scaleY(0.5)]` — a 0.5px line (phase B replaces the paint, not the box) |
| Feature-flag store | `lib/analytics.ts:69` | `featureFlagEnabled` / `subscribeFeatureFlags`, fail-closed |
| Flag-gated UI precedent | `components/kontakt/BriefModal.tsx:26` | `brief-form`, via `useSyncExternalStore` |
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

The button never moves. It stays in the navbar — hit-testable, focusable, in
the a11y tree, at the coordinates the user sees at rest — and the drop
displaces only what is inside it. A **new** `motion.div` sits inside the
`<motion.button>`, wrapping the existing shrink wrapper, and that is what
flies.

Keeping the drop off the shrink wrapper is not optional. That wrapper is owned
by the `.nav-dot-shrink` scroll timeline, whose explicit `from`-keyframes exist
specifically to *replace* the inline Framer transform (see the comment at
`app/globals.css:119`). Animating `y` there fights the compositor and breaks
the mobile shrink.

Because the hit target never leaves home, the flight needs no
`pointer-events` toggling, no stationary proxy button and no `aria-hidden`
duplicate: a tap where the dot normally sits opens the menu at any point in
the flight.

The existing x-jitter is paused for the duration of the flight (drive its
`animate.x` to `0` while dropping) so the dot does not jitter mid-fall. The
suppression needs a transition of its own — reusing the jitter's would inherit
its `delay: 2` / `repeat: Infinity` and hold `x` wherever the sequence caught
it.

### Choreography (~2.0s), from one restitution constant

The flight is **one** `controls.start()`. Awaiting a leg per phase resolves on
one frame and starts the next on a later one, so every seam drops a frame;
that, rather than the curves, is what reads as jank.

The bounce is therefore the **easing function** — framer-motion accepts a
custom `(p: number) => number` and does not clamp its output, so `y = d ·
ease(p)` along a non-monotonic curve is exactly right. Transform values animate
on framer's JS path (only `opacity`, `filter`, `clipPath` and a whole
`transform` are WAAPI-accelerated), so the function is evaluated at full
precision every frame.

Everything is derived at fire time from the measured `d`, so the model stays
physical at any viewport height. With restitution `e = 0.55` and a `380ms`
fall:

```
g        = 2d / t_fall²          v_impact = g · t_fall
v_n      = eⁿ · v_impact         h_n      = v_n² / 2g = e²ⁿ · d
airtime_n = 2 v_n / g = 2 eⁿ · t_fall
```

Heights and airtimes come from the same number, and it is that mutual
agreement — not the individual values — that the eye reads as real. Bouncing
stops when an airtime falls below ~30ms; the dot then stays down.

For `d ≈ 760px` (a phone) that is five bounces:

| Bounce | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Airtime | 418ms | 230ms | 126ms | 70ms | 38ms |
| Peak above the line | 230px | 70px | 21px | 6px | 2px |

Fall 380ms + 882ms of bouncing ≈ **1.27s** of flight, then ~180ms still, then
the return. The airtimes are `d`-invariant (they reduce to `2eⁿ·t_fall`); only
the heights scale with the drop.

Supporting motion rides the same single animation, as per-property transitions
with `times` — never as extra animation boundaries:

- **Squash** scaled to impact speed (`1 − 0.18·v/v_impact`, so `0.82` on the
  first hit and `0.99` on the last), with contact time scaled the same way
  (~45ms first, ~10ms floor). A flat squash on every contact makes the small
  bounces look rubbery instead of light.
- **Stretch** proportional to *instantaneous* speed (`1 + 0.12·v/v_impact`),
  sampled at the moments physics puts them — contact, release, apex — with
  linear interpolation between, which is exact rather than approximate because
  speed is linear in time under constant gravity.
- Both are area-preserving: `scaleX = 1/scaleY`, so the dot never appears to
  gain mass.
- **Return**: after the last contact the dot holds still for ~180ms, then goes
  home over 620ms on the site's standard `[0.22, 1, 0.36, 1]` with a 4px
  overshoot. Returning the instant it settles reads as a rewind; the pause
  reads as the dot deciding to go back. This is the one remaining seam, and it
  sits inside the stillness where it cannot show.

Squash pivots on the dot's own bottom-centre, measured in wrapper-local px at
fire time — not on the wrapper's box. The mobile shrink
(`translateY(-10px) scale(0.8)` about the top right) lifts the dot ~17px clear
of the wrapper's bottom and pulls it right; scaling about the wrapper's
bottom-centre would punch the dot ~3px through the hairline and slide it
sideways on every squash. Re-measured per fire, because the shrink depends on
scroll position.

The impact signal is scheduled off the same plan (one timer per contact,
cancelled on abort, unmount or a fresh flight).

### Abort

- Any of the idle-reset events during flight cancels the sequence and floats
  the dot home in 250ms on `[0.22, 1, 0.36, 1]`, and drops the pending impact
  signals.
- Because `focus` is in the reset set, keyboard users tabbing to the dot abort
  the flight first; focus then lands on a button that never moved.
- A tap does not depend on the abort: the button is always at home, so the
  click that interrupts the flight is also the click that opens the menu.

### Impact signal

New `lib/dot-drop.ts` — the drop's shared model: `planDotFlight(distance)`
returns the bounce (duration, easing function, squash/stretch keyframes and
contact times), and alongside it the landing event. Not `lib/analytics.ts`,
since this is not analytics; the event follows the idiom at
`lib/analytics.ts:101` exactly:

```ts
const DOT_IMPACT_EVENT = 'kool:dot-impact';
export function emitDotImpact(detail: { x: number; strength: number }): void
export function onDotImpact(cb: (detail: { x: number; strength: number }) => void): () => void
```

`x` is the impact point in viewport pixels; `strength` is the normalised
0–1 force of that particular bounce. Phase A dispatches it with no listener
attached, which is inert and correct.

## Phase B — the flexing line

`components/FooterBar.tsx` keeps its `h-px` wrapper so layout is byte-for-byte
unchanged and the `top` the navbar measures is untouched; it gains `relative`
and one child, `components/FooterHairline.tsx`. That renders an absolutely
positioned `<svg className="absolute -top-[6px] left-0 w-full h-[12px] overflow-visible pointer-events-none">`
with `preserveAspectRatio="none"` and `viewBox="0 0 100 12"` — 12 units into a
12px box, so one unit is one CSS pixel vertically and unit `y = 6` is the top
of the `h-px` box, while `x` stretches to whatever the viewport is.

On impact the line becomes two cubic segments meeting at the impact `x`,
pulled down by `dip = 6px * strength` and derived through
`useTransform([dip, strikeX], …)`. A single quadratic across the full width
would bow the entire line like a skipping rope; two cubics whose outer control
points stay on the resting line past the halfway mark read as a taut wire
struck at a point.

The strike is a `dip.jump()`, not a spring towards the dip: the dot arrives at
speed, so the displacement is instantaneous and the spring
(`stiffness 520, damping 22, mass 0.5`, ζ ≈ 0.68) carries only the recovery
and its ring. That also makes the spring's target permanently `0` — an
interrupted flight, an unmount and an aborted drop all leave the wire on its
way back to flat, never parked bent. Nothing waits for the spring to land on
exactly zero either: below `0.02px` the bend cannot occupy a device pixel at
any DPR and the resting render is restored.

Reduced-motion users never subscribe, so the line never bends.

### The resting line is a `<rect>`, not the path

**This was the risk in phase B, and it materialised.** The hairline is
permanently visible on every page for every visitor, flag or no flag, so the
resting render had to be the old `h-px bg-coral [transform:scaleY(0.5)]` box
to the pixel. Measured in Chromium against the phase-A build, the stroked path
the spec called for is not:

| Resting primitive | DPR 1, on beige | DPR 2 |
|---|---|---|
| `div` + `bg-coral` + `scaleY(0.5)` (shipped) | `(241,135,115)` on one row | one full-coral row |
| `path` + 0.5px `non-scaling-stroke` | `(232,200,185)` **and** `(238,157,139)` on two rows | one full-coral row |
| `path` + 0.5px plain stroke, or a filled ribbon | `(240,134,115)` on one row | one full-coral row |
| `rect y=6 height=0.5` | `(241,135,115)` on one row | one full-coral row |

Two separate defects. `vector-effect="non-scaling-stroke"` biases the stroke
1/8 CSS px upward at DPR 1, spilling ink into the row above — invisible at DPR
2, where the band still lands on one whole device pixel. And *any* path,
stroked or filled, over identical geometry blends one 8-bit step lighter than
the background box. Skia's analytic anti-aliasing of an axis-aligned rect is
the path the `div`'s background went through, and a `<rect>` is the only
primitive that reproduces it exactly at both DPRs.

So the SVG holds a plain `<rect x=0 y=6 width=100 height=0.5>` at rest and
swaps to the `<motion.path>` while bent — the stroke, with
`non-scaling-stroke`, is still right for the bend, where a constant 0.5 CSS px
weight along a horizontally stretched curve is exactly what is wanted and a
1/8px bias on a line that is mid-flight is meaningless. `bent` is React state
driven off the dip, false through SSR, hydration, every reduced-motion visit
and every page view where the drop never fires: the resting render is the
default, not a state the component has to find its way back to.

The diff, phase A build (`0577499`) against this one, at rest: **0 differing
pixels of 1,119,960 compared, max per-channel delta 0**, over
`/pl/polityka-prywatnosci`, `/pl/kontakt` and `/pl/projekty` × 390/1280/1441px
viewports × DPR 1 and 2, with a baseline-against-itself control run first to
prove the harness deterministic.

## Files

| File | Phase | Change |
|---|---|---|
| `hooks/useIdle.ts` | A | new |
| `lib/dot-drop.ts` | A | new — bounce physics + impact event |
| `components/Navbar.tsx` | A | drop wrapper inside the button, idle wiring, jitter suppression |
| `components/FooterBar.tsx` | A | `data-footer-line` attribute only |
| `components/Navbar.test.tsx` | A | extend framer-motion mock; drop, physics, pivot and abort cases |
| `components/Navbar.tsx` | B | `dot-drop` flag into `useIdle`'s `enabled` |
| `components/FooterBar.tsx` | B | hairline moves into `FooterHairline`; wrapper gains `relative` |
| `components/FooterHairline.tsx` | B | new — the resting rect, the bend, the spring |
| `components/FooterHairline.test.tsx` | B | new — path shape, rest/settle, reduced motion, unmount |
| `hooks/useIdle.test.ts` | B | new — off registers no listeners and no timer |
| `vitest.config.ts` | B | `include` widened to `{components,hooks}` |

### Test-mock constraint

`components/Navbar.test.tsx` mocks `framer-motion` wholesale, exporting only
`AnimatePresence`, `motion`, `useAnimationControls`, `useScroll`, `useSpring`
and `useTransform`. Any new import from that package (`useMotionValue`,
`animate`, …) must be added to that mock in the same commit or the suite breaks
with an unhelpful undefined-is-not-a-function error. It also mocks
`@/lib/analytics`, because the launch gate reads a feature flag posthog cannot
supply in jsdom.

The `motion` proxy must hand back the **same** component for a given tag on
every access. A fresh function per access changes the element type on each
render, so React tears the dot down and rebuilds it — losing refs, DOM identity
and the imperatively written squash pivot, none of which happens in a browser.

`FooterHairline.test.tsx` fakes the motion values rather than the animation:
`jump()` lands immediately, `set()` only records where the value is *heading*,
and the test says when it arrives. The real spring covers that ground in
~250ms, which is over before a first assertion could run. The fakes are
memoised per component instance for the same reason the `motion` proxy is
stable — a fresh value per render hands the test a value the component is no
longer holding.

## Verification

- `pnpm check` — vitest + node tests, typecheck, lint, i18n parity, build.
- Browser, phase A: dot falls, bounces, returns; aborts on input; no drop under
  `prefers-reduced-motion: reduce`; no drop on 404 or design-system; menu opens
  on a click at the dot's home position both at rest and mid-flight.
- Browser, phase A geometry: with the drop transform applied at every squash and
  stretch extremum, the dot's bottom edge sits exactly on the hairline
  (penetration `0.00px`) and does not slide sideways (`0.00px`) — on desktop and
  on a mobile viewport scrolled past the shrink range, where an unmeasured
  wrapper-box pivot instead gives `+3.06px` / `0.38px`.
- Browser, phase B: footer hairline screenshot-identical at rest, 1x and 2x DPR
  — two production builds served side by side, a control run of the baseline
  against itself, then baseline against the change. 0 of 1,119,960 pixels
  differ; max per-channel delta 0.
- Browser, phase B: the line dips at the strike, rings, and comes back to the
  exact resting `<rect>`; a second strike after settling behaves the same; under
  `prefers-reduced-motion: reduce` it never leaves the rect.
- Browser, the launch gate: in a production build with no flag, `window` carries
  none of the idle-reset listeners and the dot does not move after 12s of
  stillness; injecting a posthog stub with `dot-drop` enabled and firing
  `kool:posthog-ready` registers them and the drop fires — no reload.
- `verify-site` skill across routes × both locales before handoff.

## Non-goals

- No sound.
- No analytics event — this would be noise in the funnel.
- No new colors, tokens or typefaces.
- Not on the design-system page.
- No behaviour on the 404 page.
