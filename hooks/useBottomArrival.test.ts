import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  JIGGLE_PX,
  REARM_FRACTION,
  SETTLE_MS,
  noteNavigation,
  useBottomArrival,
} from '@/hooks/useBottomArrival';

/* jsdom 29 does not implement document.scrollingElement (a real browser, and
   a jsdom that supports it, returns document.documentElement in standards
   mode). The store reads scrollingElement live; without this the geometry the
   tests lay out below has nothing to attach to. No-op where it already
   exists. */
if (!document.scrollingElement) {
  Object.defineProperty(document, 'scrollingElement', {
    configurable: true,
    get: () => document.documentElement,
  });
}

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
  // Preserve the production store across enabled unsubscribe/resubscribe
  // cycles, but leave each test fresh through the same real scroll transition
  // that re-arms it for a visitor.
  act(() => {
    scrollTo(0);
  });
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

  it('stays disarmed across an enabled unsubscribe/resubscribe cycle', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ enabled }) => useBottomArrival(enabled), {
      initialProps: { enabled: true },
    });
    const before = result.current.arrival;

    act(() => {
      gesture();
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.arrival).toBe(before + 1);

    rerender({ enabled: false });
    rerender({ enabled: true });

    act(() => {
      gesture();
      scrollTo(MAX_SCROLL - 1);
      scrollTo(MAX_SCROLL);
      vi.advanceTimersByTime(SETTLE_MS);
    });

    expect(result.current.arrival).toBe(before + 1);
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
