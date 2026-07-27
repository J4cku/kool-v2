# Bottom-arrival dot drop — design

**Date:** 2026-07-27
**Status:** approved, ready for implementation
**Extends:** `2026-07-24-idle-dot-drop-design.md`

## Summary

A second trigger for the existing dot drop: when the visitor scrolls all the
way to the bottom of the page and the scroll settles, the navbar dot falls to
the footer hairline, bounces, and returns — the same flight the idle trigger
fires, from the same machinery. Every *fresh* arrival at the bottom fires,
independent of the idle trigger's cooldown. The idle trigger keeps its
existing behaviour unchanged.

## Motivation

At the bottom of the page the `ScrollDot` rider has just completed its journey
to the right end of the hairline. A second dot arriving from above is a small
reward beat for reaching the end — the same playful vocabulary as the idle
drop, at the one moment the visitor has demonstrably finished something.

Both ends of the flight are `position: fixed`, so the drop is pure
viewport-space and works identically at any scroll position; nothing about the
physics changes.

## Decisions taken

- **Fire on every fresh arrival** (owner's call, option B): the bottom trigger
  does not consult the idle trigger's `armed`/45s cooldown. Leaving the bottom
  and coming back fires again.
- **Settle before firing**: `scroll` is the idle flight's abort signal, and a
  visitor reaching the bottom is mid-momentum by definition. Firing on the
  crossing itself would abort on the triggering gesture (or demand carving
  scroll out of the abort set). Instead the drop fires after a short beat of
  scroll silence at the bottom — you land, the page exhales, the dot falls.
- **A bottom flight consumes the idle cooldown**: sitting at the bottom after
  a bottom drop must not produce a second, idle-triggered drop ten seconds
  later. The reverse also holds — any flight is one flight; the triggers share
  the dot.
- **Abort follows the trigger's premise**: the idle flight aborts on any input
  because its premise — idleness — ended. The bottom flight's premise is
  *being at the bottom*, so it aborts on leaving the bottom zone, and
  tolerates pointer movement and micro-scrolls. Without that tolerance a
  trackpad twitch would kill the gag almost every time on desktop.

## Trigger — `hooks/useBottomArrival.ts` (new)

Module-level store + `useSyncExternalStore`, the `useIdle` idiom exactly:
client-only, SSR snapshot inert, `enabled` gating that keeps listeners off the
page entirely (reduced motion, open menu) rather than merely ignoring the
result. One passive, non-capture `scroll` listener on `window` — the document
scroller is the only scroller that defines "the bottom" — plus the
genuine-input listeners below.

All geometry is read live from `document.scrollingElement` at event time,
never cached, so iOS address-bar collapse cannot desync it:

```
remaining = scrollHeight - scrollTop - clientHeight   // ≤ 0 at the bottom
```

The store exposes two things:

- **`atBottom`** — a level: `remaining <= JIGGLE_PX`. This is what holds a
  bottom-triggered flight alive.
- **`arrival`** — a counter, incremented when all of the following hold:
  1. **Crossed into the fire zone**: `remaining <= FIRE_ZONE_PX` (`<=` covers
     iOS rubber-band overshoot, where `remaining` goes negative).
  2. **Settled**: `SETTLE_MS` elapse with no further `scroll` event while
     still in the fire zone. The settle timer restarts on every scroll.
  3. **Fresh**: the store was re-armed since the last arrival. It re-arms
     when the visitor rises more than `REARM_FRACTION` of the viewport height
     above the bottom (`remaining > clientHeight * REARM_FRACTION`). Initial
     state is armed. A jiggle at the bottom is not a fresh arrival; coming
     back down from the project photos is.
  4. **Genuine**: at least one real input event (`wheel`, `touchstart`,
     `pointerdown`, `keydown`) has occurred *since the last client-side
     navigation*. Browser scroll *restoration* on back-navigation emits
     scroll events straight into the bottom zone with no gesture; without
     this guard, back-nav onto a previously-bottomed page would drop the dot
     on load. The store is module-global and outlives navigations, so input
     on a previous page must not carry over: it exports `noteNavigation()`,
     which clears the flag, and the navbar calls it on `pathname` change.
     The flag also starts cleared, covering hard loads at a restored scroll
     position, and clears when the last subscriber unsubscribes.

Pages too short to scroll never produce a zone crossing, so they are excluded
for free — no minimum-scroll-range special case. No `visibilitychange`
handling either: the trigger is position-based, not time-based, and a hidden
tab cannot scroll.

### Constants

| Constant | Value | Meaning |
|---|---|---|
| `FIRE_ZONE_PX` | `2` | How close to max scroll counts as "the bottom" for firing |
| `SETTLE_MS` | `250` | Scroll silence required before firing |
| `JIGGLE_PX` | `24` | `atBottom` hold tolerance — micro-scrolls that do not abort |
| `REARM_FRACTION` | `0.5` | Viewport fraction to rise before the next arrival counts |

These are feel constants, tunable at the browser-check step, the same way the
physics constants were.

## Wiring — `components/Navbar.tsx`

The bottom trigger feeds the machinery the idle trigger already uses: the same
`fly()`, physics, impact events into the hairline, generation token, and the
same fire-time suppressions (missing `[data-footer-line]`, open
`[aria-modal="true"]` dialog, open menu, reduced motion, `distance <= 0`).

- **Subscription**: `useBottomArrival(!menuOpen && !reduceMotion)` — gated
  like `useIdle`, so suppressed visitors never carry the listeners.
- **Fire**: the navbar keeps a consumed-arrival baseline (a ref), initialised
  to the store's current counter on mount and re-baselined on `pathname`
  change, where it also calls `noteNavigation()` — the store is module-global
  and outlives client-side navigations.
  An unconsumed arrival fires a flight through the existing fire path,
  including `setArmed(false)`; `fly()`'s completion already schedules the
  idle re-arm, which is how a bottom flight consumes the idle cooldown. The
  idle branch (`idle && armed`) is untouched.
- **Hold**: the effect's keep-alive condition widens from `idle` to
  `(idle || atBottom)`, still `&& !menuOpen && !reduceMotion`. Today's
  structure would insta-abort any flight the idle flag didn't own (the fire
  itself flips state, the effect re-runs, `idle` is false, the abort branch
  runs). With the widened condition:
  - idle flight, mid-page: any input flips `idle` false, `atBottom` is
    already false → abort floats the dot home. Unchanged behaviour.
  - bottom flight: pointer movement and sub-`JIGGLE_PX` scrolls leave
    `atBottom` true → the flight plays out. Scrolling away beyond the jiggle
    tolerance flips it false → abort. Menu, dialog and navigation abort as
    they do today.
- **Cross-trigger interplay**, all falling out of the shared machinery rather
  than new code: an idle flight aborted by scrolling toward the bottom can be
  followed by a bottom fire once settled (abort is a 250ms float home; the
  settle beat covers it). Idling *at* the bottom fires the idle trigger if
  armed — one flight, and no re-arrival can follow because the visitor never
  left the zone.

## Files

| File | Change |
|---|---|
| `hooks/useBottomArrival.ts` | new — zone/settle/arrival store |
| `hooks/useBottomArrival.test.ts` | new |
| `components/Navbar.tsx` | second trigger wiring; hold condition widened |
| `components/Navbar.test.tsx` | bottom-trigger cases |

## Tests

`hooks/useBottomArrival.test.ts`, following `useIdle.test.ts`:

- disabled registers no listeners and no timer
- arrival requires: zone entry + settle silence + genuine input
- restoration-style scroll (no prior input event) never increments `arrival`
- `noteNavigation()` clears the genuine-input flag — input on the previous
  page does not validate a post-navigation arrival
- no re-arrival without rising past the re-arm threshold; re-arrival after

`components/Navbar.test.tsx`, under the existing wholesale framer-motion mock
(no new framer imports are expected, so the mock's export list is untouched):

- settled bottom arrival fires a flight and emits impacts
- a bottom flight fires even while the idle trigger is cooling down
- a bottom flight sets `armed` false (idle cooldown consumed)
- micro-scroll (`atBottom` still true) does not abort a bottom flight
- leaving the bottom zone aborts a bottom flight
- existing idle-trigger suite unchanged

## Verification

- `pnpm check` — vitest + node tests, typecheck, lint, i18n parity, build.
- Browser: scroll to the bottom of a long page, stop → dot drops after the
  settle beat; scroll away mid-flight → dot floats home; return past half a
  viewport and come back → drops again; jiggle at the bottom → no re-fire;
  reduced motion → nothing; /kontakt (short page) → behaves per its actual
  scroll range; back-navigation onto a bottomed page → no drop on load.
- Feel pass on the constants (settle, jiggle, re-arm) before handoff.

## Non-goals

Unchanged from the idle spec: no sound, no analytics event, no new tokens, no
behaviour on 404 or design-system (no footer line → the fire path no-ops).
