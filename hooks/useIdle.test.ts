import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IDLE_DELAY_MS, useIdle } from '@/hooks/useIdle';

/* The events the hook watches. React attaches listeners of its own, so
   assertions filter on these rather than on the raw call count. */
const IDLE_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart', 'focus'];

function idleListeners(calls: readonly unknown[][]) {
  return calls.map(([type]) => String(type)).filter((type) => IDLE_EVENTS.includes(type));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useIdle', () => {
  it('registers nothing at all while disabled', () => {
    const added = vi.spyOn(window, 'addEventListener');
    const scheduled = vi.spyOn(globalThis, 'setTimeout');

    const { result } = renderHook(() => useIdle(false));

    // This is what the 'dot-drop' launch gate buys: an unlaunched easter egg
    // costs a visitor no listeners and no timer, not merely a suppressed
    // animation
    expect(idleListeners(added.mock.calls)).toEqual([]);
    expect(scheduled).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it('watches for input and reports idleness once enabled', () => {
    vi.useFakeTimers();
    const added = vi.spyOn(window, 'addEventListener');

    const { result } = renderHook(() => useIdle(true));

    expect(idleListeners(added.mock.calls).sort()).toEqual([...IDLE_EVENTS].sort());
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(IDLE_DELAY_MS);
    });
    expect(result.current).toBe(true);

    // Any watched event restarts the countdown
    act(() => {
      window.dispatchEvent(new Event('pointermove'));
    });
    expect(result.current).toBe(false);
  });

  it('tears its listeners down again when it is switched off', () => {
    const removed = vi.spyOn(window, 'removeEventListener');

    const { rerender } = renderHook(({ enabled }) => useIdle(enabled), {
      initialProps: { enabled: true },
    });
    rerender({ enabled: false });

    expect(idleListeners(removed.mock.calls).sort()).toEqual([...IDLE_EVENTS].sort());
  });
});
