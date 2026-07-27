# Bottom-Arrival Dot Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fire the existing dot-drop flight whenever the visitor scrolls to the bottom of the page and the scroll settles — every fresh arrival, independent of the idle trigger's cooldown.

**Architecture:** A new module-level scroll store (`hooks/useBottomArrival.ts`, the exact `useIdle` idiom) exposes an `arrival` counter (bumped per fresh, settled, genuinely-scrolled arrival at the bottom) and an `atBottom` level (holds a bottom flight alive). `components/Navbar.tsx` consumes both: an unconsumed arrival fires the existing `fly()` machinery, and the drop effect's keep-alive condition widens from `idle` to `(idle || atBottom || bottomPending)`.

**Tech Stack:** React 19 `useSyncExternalStore`, framer-motion (no new imports from it), vitest + @testing-library/react in jsdom.

**Spec:** `docs/superpowers/specs/2026-07-27-bottom-arrival-dot-drop-design.md` — read it first.

## Global Constraints

- No new dependencies, colors, tokens, or analytics events.
- Constants exactly as specced: `FIRE_ZONE_PX = 2`, `SETTLE_MS = 250`, `JIGGLE_PX = 24`, `REARM_FRACTION = 0.5`.
- `components/Navbar.test.tsx` mocks framer-motion wholesale — do **not** add new framer-motion imports to `Navbar.tsx` (none are needed); any new mocked module must export everything `Navbar.tsx` imports from it.
- Comment style: prose comments that state constraints the code can't show, matching `hooks/useIdle.ts` and `components/Navbar.tsx`. No "what the next line does" comments.
- All listeners passive. All geometry read live from `document.scrollingElement` at event time, never cached.
- Verification gate before claiming done: `pnpm check` (vitest + node tests, typecheck, lint, i18n parity, build).

---

### Task 1: The bottom-arrival store

**Files:**
- Create: `hooks/useBottomArrival.ts`
- Test: `hooks/useBottomArrival.test.ts` (auto-included — vitest `include` is already `{components,hooks}/**/*.test.{ts,tsx}`)

**Interfaces:**
- Consumes: nothing new.
- Produces (Task 2 relies on these exact names):
  - `useBottomArrival(enabled?: boolean): BottomArrival` where `type BottomArrival = { atBottom: boolean; arrival: number }`
  - `noteNavigation(): void` — clears the genuine-input flag and any pending settle timer
  - `getBottomArrivalSnapshot(): BottomArrival` — current store snapshot, for re-baselining outside React state
  - Exported constants: `FIRE_ZONE_PX`, `SETTLE_MS`, `JIGGLE_PX`, `REARM_FRACTION`

**Design constraints the code must honor** (from the spec):
- The `arrival` counter is **monotonic for the module's lifetime** — never reset, not even on full unsubscribe. Consumers hold a baseline ref; resetting the counter on a menu-open/close cycle (which unsubscribes and resubscribes) would strand their baselines above the counter and silently kill the trigger.
- Snapshot object identity must be stable between value changes (`useSyncExternalStore` compares with `Object.is` on every render).
- The settle timer re-checks geometry at fire time — iOS bars move without emitting scroll events.

- [x] **Step 1: Write the failing tests**

Create `hooks/useBottomArrival.test.ts`:

```ts
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  JIGGLE_PX,
  REARM_FRACTION,
  SETTLE_MS,
  noteNavigation,
  useBottomArrival,
} from '@/hooks/useBottomArrival';

/* The events the store watches. React attaches listeners of its own, so
   assertions filter on these rather than on the raw call count. */
const WATCHED_EVENTS = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];

function watched(calls: readonly unknown[][]) {
  return calls.map(([type]) => String(type)).filter((type) => WATCHED_EVENTS.includes(type));
}

/* jsdom reports zero for every scroll dimension, so the page is laid out by
   hand: 2000px of document in an 800px viewport, max scroll 1200. */
const PAGE = { scrollHeight: 2000, clientHeight: 800 };
const MAX_SCROLL = PAGE.scrollHeight - PAGE.clientHeight;
const OVERRIDDEN = ['scrollTop', 'scrollHeight', 'clientHeight'] as const;

function layout(scrollTop: number) {
  const scroller = document.scrollingElement as HTMLElement;
  Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: scrollTop });
  Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: PAGE.scrollHeight });
  Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: PAGE.clientHeight });
}

function scrollTo(scrollTop: number) {
  layout(scrollTop);
  window.dispatchEvent(new Event('scroll'));
}

/* A human gesture — what scroll restoration never produces. */
function gesture() {
  window.dispatchEvent(new Event('wheel'));
}

afterEach(() => {
  cleanup();
  const scroller = document.scrollingElement as HTMLElement;
  OVERRIDDEN.forEach((property) => Reflect.deleteProperty(scroller, property));
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/* The arrival counter is monotonic across the module's lifetime — tests in
   this file share it, so every assertion is relative to a baseline taken
   after render, never against an absolute count. */
describe('useBottomArrival', () => {
  it('registers nothing at all while disabled', () => {
    const added = vi.spyOn(window, 'addEventListener');

    const { result } = renderHook(() => useBottomArrival(false));

    expect(watched(added.mock.calls)).toEqual([]);
    expect(result.current).toEqual({ atBottom: false, arrival: 0 });
  });

  it('counts a settled, genuine arrival at the bottom', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBottomArrival(true));
    const before = result.current.arrival;

    act(() => {
      gesture();
      scrollTo(MAX_SCROLL);
    });
    expect(result.current.atBottom).toBe(true);
    // Not yet: the scroll has to settle first
    expect(result.current.arrival).toBe(before);

    act(() => {
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before + 1);
  });

  it('restarts the settle countdown on every further scroll', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBottomArrival(true));
    const before = result.current.arrival;

    act(() => {
      gesture();
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS - 1);
      scrollTo(MAX_SCROLL - 1);
      vi.advanceTimersByTime(SETTLE_MS - 1);
    });
    expect(result.current.arrival).toBe(before);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.arrival).toBe(before + 1);
  });

  it('treats rubber-band overshoot as the bottom', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBottomArrival(true));
    const before = result.current.arrival;

    act(() => {
      gesture();
      scrollTo(MAX_SCROLL + 30);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before + 1);
  });

  it('ignores scroll restoration — an arrival needs a real gesture first', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBottomArrival(true));
    const before = result.current.arrival;

    act(() => {
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before);

    act(() => {
      gesture();
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before + 1);
  });

  it('does not let input from the previous page validate an arrival', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBottomArrival(true));
    const before = result.current.arrival;

    act(() => {
      gesture();
      noteNavigation();
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before);
  });

  it('re-arms only after rising well above the bottom', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBottomArrival(true));
    const before = result.current.arrival;

    act(() => {
      gesture();
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before + 1);

    // A jiggle at the bottom is not a fresh arrival
    act(() => {
      scrollTo(MAX_SCROLL - 100);
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before + 1);

    // Coming back down from more than half a viewport up is
    act(() => {
      scrollTo(MAX_SCROLL - PAGE.clientHeight * REARM_FRACTION - 1);
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before + 2);
  });

  it('holds atBottom through a jiggle and drops it past the tolerance', () => {
    const { result } = renderHook(() => useBottomArrival(true));

    act(() => {
      scrollTo(MAX_SCROLL);
    });
    expect(result.current.atBottom).toBe(true);

    act(() => {
      scrollTo(MAX_SCROLL - JIGGLE_PX);
    });
    expect(result.current.atBottom).toBe(true);

    act(() => {
      scrollTo(MAX_SCROLL - JIGGLE_PX - 1);
    });
    expect(result.current.atBottom).toBe(false);
  });

  it('re-checks the geometry at fire time', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBottomArrival(true));
    const before = result.current.arrival;

    act(() => {
      gesture();
      scrollTo(MAX_SCROLL);
      // The browser bars moved the page without emitting a scroll event
      layout(MAX_SCROLL - 200);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before);
  });

  it('tears its listeners down again when it is switched off', () => {
    const removed = vi.spyOn(window, 'removeEventListener');

    const { rerender } = renderHook(({ enabled }) => useBottomArrival(enabled), {
      initialProps: { enabled: true },
    });
    rerender({ enabled: false });

    expect(watched(removed.mock.calls).sort()).toEqual([...WATCHED_EVENTS].sort());
  });
});
```

- [x] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run hooks/useBottomArrival.test.ts`
Expected: FAIL — cannot resolve `@/hooks/useBottomArrival`.

- [x] **Step 3: Write the store**

Create `hooks/useBottomArrival.ts`:

```ts
'use client';

import { useCallback, useSyncExternalStore } from 'react';

/* The dot drop's second trigger, next to hooks/useIdle.ts and in its exact
   idiom: a module-level store behind useSyncExternalStore, with `enabled`
   keeping listeners off the page entirely rather than ignoring the result.
   A fresh, settled, genuinely-scrolled arrival at the bottom of the page
   bumps `arrival`; `atBottom` is the level that holds a bottom-triggered
   flight alive. Design:
   docs/superpowers/specs/2026-07-27-bottom-arrival-dot-drop-design.md */

/* How close to max scroll counts as "the bottom" for firing. <= comparisons
   throughout, so iOS rubber-band overshoot (negative remainder) counts. */
export const FIRE_ZONE_PX = 2;
/* Scroll silence required before an arrival counts. A visitor reaching the
   bottom is mid-momentum by definition, and scroll is the idle flight's
   abort signal — firing on the crossing itself would abort on the very
   gesture that triggered it. */
export const SETTLE_MS = 250;
/* Micro-scrolls within this of the bottom keep `atBottom` true, so a
   trackpad twitch cannot abort a flight the visitor is watching. */
export const JIGGLE_PX = 24;
/* Fraction of the viewport the visitor must rise above the bottom before
   the next arrival counts as fresh. */
export const REARM_FRACTION = 0.5;

/* Real gestures. Browser scroll restoration on back-navigation emits
   `scroll` alone; these are the events only a human produces. */
const INPUT_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
const LISTENER_OPTIONS = { passive: true } as const;

export type BottomArrival = {
  /* Within JIGGLE_PX of max scroll. */
  atBottom: boolean;
  /* Bumped once per fresh, settled arrival. Monotonic for the module's
     lifetime — consumers keep a baseline and compare, so it survives the
     store being switched off and on without stranding anyone. */
  arrival: number;
};

/* Also the SSR and disabled snapshot — a shared constant, because
   useSyncExternalStore compares snapshots with Object.is on every render. */
const AT_REST: BottomArrival = { atBottom: false, arrival: 0 };

const listeners = new Set<() => void>();
let snapshot: BottomArrival = AT_REST;
let armed = true;
let genuineInput = false;
let settleTimer: ReturnType<typeof setTimeout> | null = null;

/* Read live, never cached: iOS address-bar collapse moves these without an
   event we could have listened for. */
function remaining() {
  const scroller = document.scrollingElement;
  if (!scroller) return Infinity;
  return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
}

function publish(next: BottomArrival) {
  if (next.atBottom === snapshot.atBottom && next.arrival === snapshot.arrival) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function clearSettle() {
  if (settleTimer !== null) clearTimeout(settleTimer);
  settleTimer = null;
}

function noteInput() {
  genuineInput = true;
}

function onScroll() {
  const scroller = document.scrollingElement;
  if (!scroller) return;
  const left = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;

  if (left > scroller.clientHeight * REARM_FRACTION) armed = true;
  publish({ atBottom: left <= JIGGLE_PX, arrival: snapshot.arrival });

  clearSettle();
  if (!armed || !genuineInput || left > FIRE_ZONE_PX) return;
  settleTimer = setTimeout(() => {
    settleTimer = null;
    // The bars may have moved since the scroll event that scheduled this;
    // an arrival must be true at fire time, not at schedule time
    if (remaining() > FIRE_ZONE_PX) return;
    armed = false;
    publish({ atBottom: snapshot.atBottom, arrival: snapshot.arrival + 1 });
  }, SETTLE_MS);
}

/* Input on the previous page must not validate an arrival on this one — the
   store outlives client-side navigations, and scroll restoration on
   back-navigation would otherwise drop the dot on load. The navbar calls
   this on every pathname change. */
export function noteNavigation() {
  genuineInput = false;
  clearSettle();
}

export function getBottomArrivalSnapshot() {
  return snapshot;
}

export function subscribeToBottomArrival(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (listeners.size === 1) {
    window.addEventListener('scroll', onScroll, LISTENER_OPTIONS);
    INPUT_EVENTS.forEach((event) => window.addEventListener(event, noteInput, LISTENER_OPTIONS));
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size > 0) return;
    window.removeEventListener('scroll', onScroll);
    INPUT_EVENTS.forEach((event) => window.removeEventListener(event, noteInput));
    clearSettle();
    genuineInput = false;
    armed = true;
    // The arrival counter deliberately survives (see BottomArrival)
    snapshot = { atBottom: false, arrival: snapshot.arrival };
  };
}

export function getServerBottomArrivalSnapshot() {
  return AT_REST;
}

export function useBottomArrival(enabled = true): BottomArrival {
  const subscribe = useCallback(
    (onStoreChange: () => void) => (enabled ? subscribeToBottomArrival(onStoreChange) : () => {}),
    [enabled]
  );
  const getSnapshot = useCallback(() => (enabled ? snapshot : AT_REST), [enabled]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerBottomArrivalSnapshot);
}
```

- [x] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run hooks/useBottomArrival.test.ts`
Expected: PASS, all 10 tests. Also run the whole suite to prove nothing else moved: `pnpm vitest run`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add hooks/useBottomArrival.ts hooks/useBottomArrival.test.ts
git commit -m "Bottom-arrival store: settled, fresh, genuine arrivals at the page bottom"
```

---

### Task 2: Wire the trigger into the navbar

**Files:**
- Modify: `components/Navbar.tsx` (imports at top; wiring around lines 120–293 — the drop state block, the pathname effect, the drop effect, the abort branch)
- Test: `components/Navbar.test.tsx`

**Interfaces:**
- Consumes from Task 1: `useBottomArrival(enabled): { atBottom, arrival }`, `noteNavigation()`, `getBottomArrivalSnapshot()`.
- Produces: no new exports. Behavior contract: an unconsumed arrival fires the existing `fly()`; `(idle || atBottom || bottomPending)` is the keep-alive condition; a bottom flight sets `armed` false (idle cooldown consumed); a blocked arrival is consumed, not deferred.

- [x] **Step 1: Write the failing tests**

In `components/Navbar.test.tsx`, make three edits.

First, next to the `idleState` hoisted block (line 14), add:

```ts
/* `enabled` records what the drop's gate passed to useBottomArrival — the
   same suppression contract as useIdle. */
const bottomState = vi.hoisted(() => ({
  atBottom: false,
  arrival: 0,
  enabled: false,
  navigations: 0,
}));
```

Second, next to the `@/hooks/useIdle` mock (line 109), add:

```ts
/* Mirrors the real store's contract: `enabled` false yields the resting
   snapshot, and the arrival counter is what the navbar baselines against. */
vi.mock('@/hooks/useBottomArrival', () => ({
  useBottomArrival: (enabled = true) => {
    bottomState.enabled = enabled;
    return enabled
      ? { atBottom: bottomState.atBottom, arrival: bottomState.arrival }
      : { atBottom: false, arrival: 0 };
  },
  getBottomArrivalSnapshot: () => ({
    atBottom: bottomState.atBottom,
    arrival: bottomState.arrival,
  }),
  noteNavigation: () => {
    bottomState.navigations += 1;
  },
}));
```

Third, in the `afterEach` (line 172), after the `idleState` resets, add:

```ts
  bottomState.atBottom = false;
  bottomState.arrival = 0;
  bottomState.enabled = false;
  bottomState.navigations = 0;
```

Then append a new describe block at the end of the file:

```ts
describe('Navbar bottom-arrival dot drop', () => {
  it('drops the dot on a settled bottom arrival', async () => {
    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });
    expect(dropStart).not.toHaveBeenCalled();

    bottomState.atBottom = true;
    bottomState.arrival = 1;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    expect(dropStart).toHaveBeenCalled();
    expect(dropStart.mock.calls[0][0]).toMatchObject({ y: [0, DROP_DISTANCE] });
  });

  it('fires even while the idle trigger is cooling down', async () => {
    idleState.idle = true;

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });
    // The idle flight has flown (flight + return) and started its 45s cooldown
    expect(dropStart).toHaveBeenCalledTimes(2);

    idleState.idle = false;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    bottomState.atBottom = true;
    bottomState.arrival = 1;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    // A second flight, cooldown notwithstanding
    expect(dropStart).toHaveBeenCalledTimes(4);
  });

  it('puts the idle trigger on its cooldown after a bottom flight', async () => {
    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });

    bottomState.atBottom = true;
    bottomState.arrival = 1;
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).toHaveBeenCalledTimes(2);

    // Sitting at the bottom, idleness sets in — but the flight just flown
    // consumed the idle trigger's once-per-view arming
    idleState.idle = true;
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).toHaveBeenCalledTimes(2);
  });

  it('holds a bottom flight through non-scroll input', async () => {
    deferDropStart();

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });

    bottomState.atBottom = true;
    bottomState.arrival = 1;
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).toHaveBeenCalledTimes(1);

    // Pointer movement mid-flight: idle stays false, atBottom stays true —
    // the flight must neither abort nor restart
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).toHaveBeenCalledTimes(1);
  });

  it('floats the dot home when the visitor scrolls away mid-flight', async () => {
    deferDropStart();

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });

    bottomState.atBottom = true;
    bottomState.arrival = 1;
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).toHaveBeenCalledTimes(1);

    bottomState.atBottom = false;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    expect(dropStart.mock.calls.at(-1)?.[0]).toMatchObject({
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    });
  });

  it('consumes an arrival blocked by an open dialog', async () => {
    const dialog = document.createElement('div');
    dialog.setAttribute('aria-modal', 'true');
    document.body.appendChild(dialog);

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });

    bottomState.atBottom = true;
    bottomState.arrival = 1;
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).not.toHaveBeenCalled();

    // Unlike idleness, which recurs on its own, an arrival is a moment; one
    // blocked here must not fire at whatever later point re-runs the effect
    dialog.remove();
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).not.toHaveBeenCalled();
  });

  it('costs a reduced-motion visitor no scroll listener', async () => {
    motionState.reducedMotion = true;

    await act(async () => {
      renderWithFooterLine();
    });

    expect(bottomState.enabled).toBe(false);
  });
});
```

- [x] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run components/Navbar.test.tsx`
Expected: the new describe block FAILS (no drop fires on arrival); the pre-existing tests still PASS.

- [x] **Step 3: Wire the navbar**

Four edits in `components/Navbar.tsx`.

**(a)** Add the import next to the `useIdle` import (line 15):

```ts
import { getBottomArrivalSnapshot, noteNavigation, useBottomArrival } from '@/hooks/useBottomArrival';
```

**(b)** Below the `useIdle` call (line 138), add:

```ts
  /* Second trigger — a settled arrival at the bottom of the page. Gated the
     same way: while suppressed, the store keeps no scroll listener at all. */
  const { atBottom, arrival } = useBottomArrival(!menuOpen && !reduceMotion);
  /* Arrivals this navbar has already acted on. The store outlives client-side
     navigations, so the baseline starts at the current counter and
     re-baselines on pathname change — never at zero. */
  const consumedArrivalRef = useRef(arrival);
```

**(c)** In the pathname effect (line 159), before `scheduleRearm(0)`, add:

```ts
    // Input on the previous page must not validate an arrival here, and an
    // arrival the dialog guard swallowed there must not fire here
    noteNavigation();
    consumedArrivalRef.current = getBottomArrivalSnapshot().arrival;
```

**(d)** Restructure the drop effect (line 240). The body between the geometry
guards and the abort branch is unchanged; the condition, the arming check and
the consumption are new, and the effect deps gain `arrival` and `atBottom`:

```ts
  useEffect(() => {
    const bottomPending = arrival > consumedArrivalRef.current;
    if ((idle || atBottom || bottomPending) && !menuOpen && !reduceMotion) {
      // Idle respects the cooldown; a fresh bottom arrival does not — its
      // rarity is structural (the visitor must leave the bottom and return)
      if (!((idle && armed) || bottomPending)) return;
      // A blocked bottom arrival is consumed rather than left pending: unlike
      // idleness, which recurs on its own, an arrival held back by the guards
      // below would otherwise fire at whatever later moment re-runs this
      // effect. The idle branch keeps its opposite behaviour (stays armed).
      if (bottomPending) consumedArrivalRef.current = arrival;
      const dot = dotRef.current;
      const wrap = dropWrapRef.current;
      // Absent on 404 and design-system, where the gag silently no-ops
      const line = document.querySelector('[data-footer-line]');
      // Everything outside an open dialog is inert, so a gag sweeping past the
      // brief modal's translucent backdrop is unsolicited motion while the user
      // is mid-form. Deliberately skipped while still armed, so a later idle
      // period on the same page view can still fire it once the dialog closes.
      const modal = document.querySelector('[aria-modal="true"]');
      if (!dot || !wrap || !line || modal) return;
      // Measured at fire time, never cached: both ends are position:fixed and
      // iOS Safari's collapsing bars move them without a scroll or resize we
      // could have listened for
      const dotRect = dot.getBoundingClientRect();
      const distance = line.getBoundingClientRect().top - dotRect.bottom;
      if (distance <= 0) return;

      // The squash has to pivot on the dot's own bottom edge, and the dot's
      // visual bottom is not the wrapper's: the mobile shrink inside it
      // (translateY(-10px) scale(0.8) about the top right, globals.css) lifts
      // the dot ~17px clear of the wrapper's own bottom and pulls it right.
      // Scaling about the wrapper's bottom-centre would move the dot by that
      // offset on every squash — punching it through the hairline and sliding
      // it sideways — so the pivot is measured in wrapper-local px instead.
      // Re-measured per fire because the shrink depends on scroll position.
      const wrapRect = wrap.getBoundingClientRect();
      const impactX = dotRect.left + dotRect.width / 2;
      wrap.style.transformOrigin =
        `${impactX - wrapRect.left}px ${dotRect.bottom - wrapRect.top}px`;

      setArmed(false);
      setDropping(true);
      void fly(distance, impactX);
      return;
    }

    // Input arrived (or the menu opened) mid-flight: float the dot home
    if (!flyingRef.current) return;
    flyingRef.current = false;
    flightRef.current += 1;
    clearImpactTimers();
    scheduleRearm(REARM_DELAY_MS);
    void dropControls
      .start({
        y: 0,
        scaleX: 1,
        scaleY: 1,
        transition: { duration: ABORT_DURATION, ease: SETTLE_EASE },
      })
      // A bottom arrival can start a fresh flight while this abort is still
      // settling (abort animation and settle beat are the same ~250ms);
      // the stale resolution must not strip the new flight's dropping state
      .then(() => {
        if (!flyingRef.current) setDropping(false);
      });
  }, [armed, arrival, atBottom, clearImpactTimers, dropControls, fly, idle, menuOpen, reduceMotion, scheduleRearm]);
```

Note the dialog guard's comment gains no changes for idle — but the *placement* matters: `bottomPending` consumption happens **before** the guards (arrival semantics), while `setArmed(false)` stays **after** them (idle semantics). The existing test `does not drop behind an open dialog, and stays armed for afterwards` enforces the latter.

- [x] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run components/Navbar.test.tsx`
Expected: PASS — all pre-existing cases plus the seven new ones.

- [x] **Step 5: Run the full verification gate**

Run: `pnpm check`
Expected: vitest suites + node tests pass, typecheck clean, lint clean, i18n parity holds, build succeeds.

- [x] **Step 6: Commit**

```bash
git add components/Navbar.tsx components/Navbar.test.tsx
git commit -m "Dot drop on bottom arrival: second trigger through the same flight"
```

---

### Task 3: Browser verification (main thread, not the implementing agent)

Run the dev server and check against the spec's verification list:

- Scroll to the bottom of a long page (`/pl/projekty/dom-w-lesie` or `/pl`), stop → dot drops after the settle beat, bounces on the hairline, returns.
- Scroll away immediately after the drop starts → dot floats home.
- Rise more than half a viewport, return to the bottom, settle → drops again.
- Jiggle at the bottom after a drop → no re-fire.
- `prefers-reduced-motion: reduce` → nothing, and no scroll listeners from the store.
- Back-navigation onto a previously-bottomed page → no drop on load.
- Feel pass on `SETTLE_MS` / `JIGGLE_PX` / `REARM_FRACTION` — tune if the beat feels wrong, and update spec + tests if changed.
