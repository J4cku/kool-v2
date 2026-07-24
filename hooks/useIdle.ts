'use client';

import { useCallback, useSyncExternalStore } from 'react';

export const IDLE_DELAY_MS = 10_000;

/* Any of these restarts the countdown. They double as the abort signal for
   whatever runs while idle: consumers watch the flag flip back to false
   instead of duplicating this list. */
const IDLE_RESET_EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'scroll',
  'wheel',
  'touchstart',
  'focus',
] as const;

/* Capture, because focus and scroll do not bubble — without it, tabbing to a
   control or scrolling a nested container would read as continued idleness. */
const LISTENER_OPTIONS = { capture: true, passive: true } as const;

const listeners = new Set<() => void>();
let idle = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function setIdle(next: boolean) {
  if (idle === next) return;
  idle = next;
  listeners.forEach((listener) => listener());
}

function schedule() {
  if (timer !== null) clearTimeout(timer);
  timer = null;
  // A hidden tab emits no input events, so it would otherwise go idle a few
  // seconds after being backgrounded and fire the moment it comes back.
  if (document.visibilityState !== 'visible') return;
  timer = setTimeout(() => setIdle(true), IDLE_DELAY_MS);
}

function reset() {
  setIdle(false);
  schedule();
}

export function subscribeToIdle(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (listeners.size === 1) {
    IDLE_RESET_EVENTS.forEach((event) => window.addEventListener(event, reset, LISTENER_OPTIONS));
    document.addEventListener('visibilitychange', reset);
    schedule();
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size > 0) return;
    IDLE_RESET_EVENTS.forEach((event) => window.removeEventListener(event, reset, LISTENER_OPTIONS));
    document.removeEventListener('visibilitychange', reset);
    if (timer !== null) clearTimeout(timer);
    timer = null;
    idle = false;
  };
}

export function getIdleSnapshot() {
  return idle;
}

export function getServerIdleSnapshot() {
  return false;
}

/* True after IDLE_DELAY_MS without user input in a visible tab. `enabled`
   false keeps the listeners and the timer off the page entirely rather than
   merely ignoring the result. */
export function useIdle(enabled = true) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => (enabled ? subscribeToIdle(onStoreChange) : () => {}),
    [enabled]
  );
  const getSnapshot = useCallback(() => (enabled ? getIdleSnapshot() : false), [enabled]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerIdleSnapshot);
}
