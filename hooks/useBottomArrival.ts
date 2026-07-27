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
    // Freshness survives temporary gates such as an open menu. Only rising
    // far enough above the bottom re-arms a consumed arrival.
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
