import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ComponentProps, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Navbar from '@/components/Navbar';
import { onDotImpact, type DotImpact } from '@/lib/dot-drop';

type MotionSpanProps = ComponentProps<'span'> & Record<string, unknown>;

const motionPropNames = new Set(['animate', 'exit', 'initial', 'transition', 'whileFocus', 'whileHover']);
const motionState = vi.hoisted(() => ({ reducedMotion: false }));
const pathnameState = vi.hoisted(() => ({ pathname: '/' }));
/* `enabled` records what the drop's gate passed to useIdle, which is the
   difference between a suppressed animation and a hook that never registers
   an input listener or a timer at all (see hooks/useIdle.test.ts). */
const idleState = vi.hoisted(() => ({ idle: false, enabled: false }));
/* `enabled` records what the drop's gate passed to useBottomArrival — the
   same suppression contract as useIdle. */
const bottomState = vi.hoisted(() => ({
  atBottom: false,
  arrival: 0,
  enabled: false,
  navigations: 0,
}));
const dropStart = vi.hoisted(() =>
  vi.fn((target: Record<string, unknown>) => Promise.resolve(target))
);

/* jsdom reports every rect as zero, which the drop reads as "no room to
   fall". Give the dot and the footer line a plausible viewport geometry so
   the idle drop can be observed at all. The dot's rect is deliberately not
   its wrapper's: the mobile shrink displaces it inside the wrapper, and the
   squash pivot has to follow the dot. */
const emptyRect = { top: 0, bottom: 0, left: 0, width: 0, height: 0 } as DOMRect;

Element.prototype.getBoundingClientRect = function (this: Element) {
  if (this.hasAttribute('data-footer-line')) return { ...emptyRect, top: 800 } as DOMRect;
  if (this.classList.contains('nav-dot-shrink')) {
    return { ...emptyRect, bottom: 40, left: 1200, width: 36 } as DOMRect;
  }
  return emptyRect;
};

const DROP_DISTANCE = 760;

/* The bounce the physics has to produce, restated from its two inputs: a
   380ms fall and a single restitution constant. Every airtime and every
   height comes from those, so neither can drift without the other. */
const RESTITUTION = 0.55;
const FALL_DURATION = 0.38;
const HOPS = [1, 2, 3, 4, 5].map((bounce) => ({
  airtime: 2 * RESTITUTION ** bounce * FALL_DURATION,
  peak: DROP_DISTANCE * RESTITUTION ** (2 * bounce),
}));
const CONTACT_TIMES = HOPS.reduce(
  (times, hop) => [...times, times[times.length - 1] + hop.airtime],
  [FALL_DURATION]
);

function renderWithFooterLine() {
  const line = document.createElement('div');
  line.setAttribute('data-footer-line', '');
  document.body.appendChild(line);
  return render(<Navbar />);
}

/* The default mock resolves every leg synchronously, so the whole sequence
   drains inside a single act() and no mid-flight state is ever observable.
   Holding the first leg open freezes the dot in the air. */
function deferDropStart() {
  const deferred: { resolve: () => void } = { resolve: () => {} };
  dropStart.mockImplementationOnce(
    () => new Promise<Record<string, unknown>>((res) => { deferred.resolve = () => res({}); })
  );
  return deferred;
}

/* The live menu button, which must never move. */
function dotButton() {
  return screen.getAllByRole('button', { name: /menu/i })[0] as HTMLElement;
}

/* The wrapper the drop animates — inside the button, around the dot. */
function dropWrapper() {
  return dotButton().firstElementChild as HTMLElement;
}

function jitterLayer() {
  return dotButton().querySelector('.origin-center') as HTMLElement;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
});

vi.mock('next/image', () => ({
  default: () => null,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
  usePathname: () => pathnameState.pathname,
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => motionState.reducedMotion,
}));

/* Mirrors the real hook's contract: `enabled` false keeps it off entirely. */
vi.mock('@/hooks/useIdle', () => ({
  useIdle: (enabled = true) => {
    idleState.enabled = enabled;
    return enabled && idleState.idle;
  },
}));

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

vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}));

function motionComponent(tag: string) {
  const Motion = ({ animate, children, transition, ...props }: MotionSpanProps) => {
    motionPropNames.forEach((propName) => delete props[propName]);
    const y = typeof (animate as { y?: unknown })?.y === 'string'
      ? (animate as { y: string }).y
      : undefined;
    const animation = transition as
      | {
          delay?: number;
          duration?: number;
          ease?: unknown;
          x?: { delay?: number; duration?: number; repeat?: number };
        }
      | undefined;
    return createElement(tag, {
      ...props,
      'data-motion-delay': animation?.delay,
      'data-motion-duration': animation?.duration,
      'data-motion-ease': animation?.ease ? JSON.stringify(animation.ease) : undefined,
      'data-motion-y': y,
      // The x-jitter's own transition, which the drop has to replace rather
      // than reuse
      'data-motion-x-delay': animation?.x?.delay,
      'data-motion-x-duration': animation?.x?.duration,
      'data-motion-x-repeat': animation?.x?.repeat,
    }, children);
  };
  Motion.displayName = `motion.${tag}`;
  return Motion;
}

/* One stable component per tag. A fresh function per property access would
   change the element type on every render, so React would tear the dot down
   and rebuild it — losing refs, DOM identity and anything written to the
   node imperatively, none of which happens in a browser. */
const motionComponents = new Map<string, ReturnType<typeof motionComponent>>();

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: new Proxy({}, {
    get: (_, tag) => {
      const name = String(tag);
      if (!motionComponents.has(name)) motionComponents.set(name, motionComponent(name));
      return motionComponents.get(name);
    },
  }),
  useAnimationControls: () => ({ start: dropStart, set: vi.fn(), stop: vi.fn() }),
  useScroll: () => ({ scrollY: 0 }),
  useSpring: (value: number) => value,
  useTransform: () => 1,
}));

afterEach(() => {
  cleanup();
  document.querySelector('[data-footer-line]')?.remove();
  document.querySelectorAll('[aria-modal="true"]').forEach((dialog) => dialog.remove());
  motionState.reducedMotion = false;
  idleState.idle = false;
  idleState.enabled = false;
  bottomState.atBottom = false;
  bottomState.arrival = 0;
  bottomState.enabled = false;
  bottomState.navigations = 0;
  pathnameState.pathname = '/';
  dropStart.mockClear();
  vi.useRealTimers();
});

describe('Navbar desktop links', () => {
  it('provides one accessible label and two hidden rollover rows', () => {
    render(<Navbar />);

    const projectLink = screen.getByRole('link', { name: 'projekty' });
    const rows = projectLink.querySelectorAll('[aria-hidden="true"]');

    expect(projectLink.getAttribute('aria-label')).toBe('projekty');
    expect(rows).toHaveLength(2);
    expect(rows[0].firstElementChild?.getAttribute('data-motion-duration')).toBe('0.45');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-ease')).toBe('[0.22,1,0.36,1]');
    expect(rows[0].children[1].getAttribute('data-motion-delay')).toBe('0.015');
  });

  it('keeps rollover active until both hover and focus end', () => {
    render(<Navbar />);

    let projectLink = screen.getByRole('link', { name: 'projekty' });
    fireEvent.mouseOver(projectLink);

    projectLink = screen.getByRole('link', { name: 'projekty' });
    let rows = projectLink.querySelectorAll('[aria-hidden="true"]');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-y')).toBe('-100%');

    fireEvent.focus(projectLink);
    projectLink = screen.getByRole('link', { name: 'projekty' });
    fireEvent.mouseOut(projectLink);

    projectLink = screen.getByRole('link', { name: 'projekty' });
    rows = projectLink.querySelectorAll('[aria-hidden="true"]');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-y')).toBe('-100%');
    expect(rows[1].firstElementChild?.getAttribute('data-motion-y')).toBe('0%');

    fireEvent.blur(projectLink);

    projectLink = screen.getByRole('link', { name: 'projekty' });
    rows = projectLink.querySelectorAll('[aria-hidden="true"]');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-y')).toBe('0%');
    expect(rows[1].firstElementChild?.getAttribute('data-motion-y')).toBe('100%');
  });

  it('keeps rollover rows static for reduced-motion users', () => {
    motionState.reducedMotion = true;
    render(<Navbar />);

    const projectLink = screen.getByRole('link', { name: 'projekty' });
    fireEvent.mouseOver(projectLink);

    const rows = projectLink.querySelectorAll('[aria-hidden="true"]');
    expect(rows[0].firstElementChild?.getAttribute('data-motion-y')).toBe('0%');
    expect(rows[1].firstElementChild?.getAttribute('data-motion-y')).toBe('100%');
  });
});

describe('Navbar idle dot drop', () => {
  it('drops the dot towards the footer line once the page goes idle', async () => {
    idleState.idle = true;

    await act(async () => {
      renderWithFooterLine();
    });

    expect(dropStart).toHaveBeenCalled();
    expect(dropStart.mock.calls[0][0]).toMatchObject({ y: [0, DROP_DISTANCE] });
  });

  it('costs a reduced-motion visitor no timer and no listeners', async () => {
    idleState.idle = true;
    motionState.reducedMotion = true;

    await act(async () => {
      renderWithFooterLine();
    });

    // Closed at the hook rather than at the animation: with `enabled` false
    // useIdle registers no input listeners and starts no timer
    expect(idleState.enabled).toBe(false);
    expect(dropStart).not.toHaveBeenCalled();
  });

  it('never drops the dot for reduced-motion users', async () => {
    idleState.idle = true;
    motionState.reducedMotion = true;

    await act(async () => {
      renderWithFooterLine();
    });

    expect(dropStart).not.toHaveBeenCalled();
  });

  it('does not drop where there is no footer line to land on', async () => {
    idleState.idle = true;

    await act(async () => {
      render(<Navbar />);
    });

    expect(dropStart).not.toHaveBeenCalled();
  });

  it('does not drop behind an open dialog, and stays armed for afterwards', async () => {
    idleState.idle = true;
    const dialog = document.createElement('div');
    dialog.setAttribute('aria-modal', 'true');
    document.body.appendChild(dialog);

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });

    expect(dropStart).not.toHaveBeenCalled();

    // The guard must run before the once-per-page-view flag is set, or
    // closing the dialog would leave the page permanently disarmed
    idleState.idle = false;
    await act(async () => {
      view.rerender(<Navbar />);
    });
    dialog.remove();
    idleState.idle = true;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    expect(dropStart).toHaveBeenCalled();
  });

  it('keeps the menu button parked and displaces only the dot inside it', async () => {
    idleState.idle = true;
    deferDropStart();

    await act(async () => {
      renderWithFooterLine();
    });

    const button = dotButton();
    const wrapper = dropWrapper();

    // Mid-flight, the animated wrapper is strictly inside the live button
    expect(wrapper.className).toContain('origin-bottom');
    expect(button.contains(wrapper)).toBe(true);
    // Nothing takes the button out of hit-testing while the dot is away, and
    // no stand-in button is mounted to catch the taps it would have missed
    expect(button.className).not.toContain('pointer-events-none');
    expect(wrapper.className).not.toContain('pointer-events-none');
    expect(document.querySelectorAll('button[aria-hidden="true"]')).toHaveLength(0);
    expect(screen.getAllByRole('button', { name: /menu/i })).toHaveLength(1);
  });

  it('opens the menu from a tap on the dot home position mid-flight', async () => {
    idleState.idle = true;
    deferDropStart();

    await act(async () => {
      renderWithFooterLine();
    });

    const button = dotButton();
    expect(button.getAttribute('aria-label')).toBe('Open menu');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button.getAttribute('aria-label')).toBe('Close menu');
  });

  it('pivots the squash on the dot bottom-centre, not on the wrapper box', async () => {
    idleState.idle = true;
    deferDropStart();

    await act(async () => {
      renderWithFooterLine();
    });

    // Measured, never assumed: the wrapper's own box bottoms out at y=0 here,
    // while the dot inside it bottoms out at y=40, x=1200..1236
    expect(dropWrapper().style.transformOrigin).toBe('1218px 40px');
  });

  it('flies fall, bounces and squash as a single animation', async () => {
    idleState.idle = true;

    await act(async () => {
      renderWithFooterLine();
    });

    // The flight, then the return. Anything more is a dropped frame per seam
    expect(dropStart).toHaveBeenCalledTimes(2);

    const flight = dropStart.mock.calls[0][0] as {
      y: number[];
      scaleX: number[];
      scaleY: number[];
      transition: {
        y: { duration: number; ease: (progress: number) => number };
        scaleX: { duration: number; times: number[] };
        scaleY: { duration: number; times: number[] };
      };
    };

    expect(flight.y).toEqual([0, DROP_DISTANCE]);
    // Squash and stretch ride the same clock as the fall
    expect(flight.transition.scaleX.duration).toBe(flight.transition.y.duration);
    expect(flight.transition.scaleY.duration).toBe(flight.transition.y.duration);
  });

  it('bounces on one restitution constant, so heights and airtimes agree', async () => {
    idleState.idle = true;

    await act(async () => {
      renderWithFooterLine();
    });

    const { duration, ease } = (
      dropStart.mock.calls[0][0] as {
        transition: { y: { duration: number; ease: (progress: number) => number } };
      }
    ).transition.y;

    // The bounce IS the easing function, not a chain of tweens
    expect(typeof ease).toBe('function');
    // Five bounces, then a last contact too slow to hop; +5ms to recover from it
    expect(duration).toBeCloseTo(CONTACT_TIMES[CONTACT_TIMES.length - 1] + 0.005, 6);

    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);

    // Every contact puts the dot exactly on the line
    CONTACT_TIMES.forEach((contact) => {
      expect(ease(contact / duration)).toBeCloseTo(1, 9);
    });

    // ...and each hop reaches the height its airtime implies
    HOPS.forEach((hop, index) => {
      const apex = CONTACT_TIMES[index] + hop.airtime / 2;
      expect(DROP_DISTANCE * (1 - ease(apex / duration))).toBeCloseTo(hop.peak, 6);
    });

    // The dot never goes through the hairline
    for (let sample = 0; sample <= 1000; sample += 1) {
      expect(ease(sample / 1000)).toBeLessThanOrEqual(1);
    }
  });

  it('scales the squash to impact speed and preserves the dot volume', async () => {
    idleState.idle = true;

    await act(async () => {
      renderWithFooterLine();
    });

    const flight = dropStart.mock.calls[0][0] as {
      scaleX: number[];
      scaleY: number[];
      transition: { scaleY: { duration: number; times: number[] } };
    };
    const { times } = flight.transition.scaleY;

    expect(times).toHaveLength(flight.scaleY.length);
    expect(flight.scaleX).toHaveLength(flight.scaleY.length);
    expect(times[0]).toBe(0);
    expect(times[times.length - 1]).toBe(1);
    expect(times.every((time, index) => index === 0 || time > times[index - 1])).toBe(true);

    // Round at rest, round again at the end
    expect(flight.scaleY[0]).toBe(1);
    expect(flight.scaleY[flight.scaleY.length - 1]).toBe(1);

    // Area-preserving throughout: the dot is a flat mark, so its silhouette
    // area must stay constant or it reads as shrinking on impact
    flight.scaleX.forEach((scaleX, index) => {
      expect(scaleX * flight.scaleY[index]).toBeCloseTo(1, 9);
    });

    // Each contact deforms less than the one before: the first hit is a
    // squash, the last is a tap
    const squashes = flight.scaleY.filter((scale) => scale < 1);
    expect(squashes).toHaveLength(CONTACT_TIMES.length);
    expect(squashes[0]).toBeCloseTo(0.82, 6);
    squashes.forEach((squash, index) => {
      if (index > 0) expect(squash).toBeGreaterThan(squashes[index - 1]);
    });

    // Stretch peaks on the way into the first contact, where speed is highest
    const stretches = flight.scaleY.filter((scale) => scale > 1);
    expect(Math.max(...stretches)).toBeCloseTo(1.11, 2);
  });

  it('holds still on the line before floating home', async () => {
    idleState.idle = true;

    await act(async () => {
      renderWithFooterLine();
    });

    const back = dropStart.mock.calls[1][0] as {
      y: number[];
      scaleX: number;
      scaleY: number;
      transition: Record<string, { delay: number; duration: number }>;
    };

    expect(back).toMatchObject({ y: [DROP_DISTANCE, -4, 0], scaleX: 1, scaleY: 1 });
    // Per property: framer reads a value's own transition instead of merging
    // it with the one around it, so a shared delay here would never apply
    expect(back.transition.y.delay).toBe(0.18);
    expect(back.transition.scaleX.delay).toBe(0.18);
    expect(back.transition.scaleY.delay).toBe(0.18);
    expect(back.transition.y.duration).toBe(0.62);
  });

  it('returns the jitter to its resting column instead of inheriting its delay', async () => {
    idleState.idle = true;
    deferDropStart();

    await act(async () => {
      renderWithFooterLine();
    });

    // Mid-flight: a plain settle to x: 0. Reusing the jitter's transition
    // would park the dot off-column for the 2s delay and then jitter it
    // through the fall
    expect(jitterLayer().getAttribute('data-motion-x-duration')).toBe('0.2');
    expect(jitterLayer().getAttribute('data-motion-x-delay')).toBeNull();
    expect(jitterLayer().getAttribute('data-motion-x-repeat')).toBeNull();

    cleanup();
    idleState.idle = false;
    render(<Navbar />);

    // At rest the jitter keeps its own long-delayed repeat
    expect(jitterLayer().getAttribute('data-motion-x-delay')).toBe('2');
    expect(jitterLayer().getAttribute('data-motion-x-repeat')).toBe('Infinity');
  });

  it('signals every contact, and stops signalling once aborted', async () => {
    vi.useFakeTimers();
    const impacts: DotImpact[] = [];
    const unsubscribe = onDotImpact((impact) => impacts.push(impact));
    idleState.idle = true;
    // Keep the dot in the air: the mock would otherwise resolve the whole
    // flight before its first contact is due
    deferDropStart();

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });

    // Past the first two contacts only
    await act(async () => {
      vi.advanceTimersByTime(CONTACT_TIMES[2] * 1000 - 1);
    });
    expect(impacts.map((impact) => impact.strength)).toEqual([1, RESTITUTION]);
    expect(impacts.every((impact) => impact.x === 1218)).toBe(true);

    idleState.idle = false;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    // The rest of the contacts belong to a flight that is no longer happening
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(impacts).toHaveLength(2);

    unsubscribe();
    vi.useRealTimers();
  });

  it('stops signalling contacts once unmounted mid-flight', async () => {
    vi.useFakeTimers();
    const impacts: DotImpact[] = [];
    const unsubscribe = onDotImpact((impact) => impacts.push(impact));
    idleState.idle = true;
    deferDropStart();

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });
    await act(async () => {
      vi.advanceTimersByTime(CONTACT_TIMES[1] * 1000 - 1);
    });
    expect(impacts).toHaveLength(1);

    view.unmount();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(impacts).toHaveLength(1);

    unsubscribe();
    vi.useRealTimers();
  });

  it('floats the dot home when input arrives mid-flight', async () => {
    idleState.idle = true;
    const fall = deferDropStart();

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });

    idleState.idle = false;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    expect(dropStart.mock.calls.at(-1)?.[0]).toMatchObject({
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    });

    // The abandoned sequence must not resume once its await settles
    const callsAtAbort = dropStart.mock.calls.length;
    await act(async () => {
      fall.resolve();
    });
    expect(dropStart.mock.calls).toHaveLength(callsAtAbort);
  });

  it('floats an idle-owned flight home on input even while still at the bottom', async () => {
    idleState.idle = true;
    bottomState.atBottom = true;
    deferDropStart();

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });
    expect(dropStart).toHaveBeenCalledTimes(1);

    idleState.idle = false;
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
});

describe('Navbar bottom-arrival dot drop', () => {
  it('notes navigation and discards arrivals from the previous pathname', async () => {
    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });

    bottomState.atBottom = true;
    bottomState.arrival = 1;
    pathnameState.pathname = '/studio';
    await act(async () => {
      view.rerender(<Navbar />);
    });

    expect(bottomState.navigations).toBe(1);
    expect(dropStart).not.toHaveBeenCalled();
  });

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

  it('keeps the idle cooldown disarmed when a bottom flight starts just before expiry', async () => {
    vi.useFakeTimers();
    idleState.idle = true;

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });
    expect(dropStart).toHaveBeenCalledTimes(2);

    idleState.idle = false;
    await act(async () => {
      view.rerender(<Navbar />);
      vi.advanceTimersByTime(45_000 - 1);
    });

    deferDropStart();
    bottomState.atBottom = true;
    bottomState.arrival = 1;
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).toHaveBeenCalledTimes(3);

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    idleState.idle = true;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    expect(dropStart).toHaveBeenCalledTimes(3);
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

  it('floats a bottom flight home when a dialog is inserted mid-flight', async () => {
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

    const dialog = document.createElement('div');
    dialog.setAttribute('aria-modal', 'true');
    await act(async () => {
      document.body.appendChild(dialog);
      await Promise.resolve();
    });

    expect(dropStart.mock.calls.at(-1)?.[0]).toMatchObject({
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    });
  });

  it('keeps watching for dialogs when a fresh flight starts before an abort settles', async () => {
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

    // Keep the first abort unresolved, so `dropping` stays true while the
    // next bottom arrival starts a fresh flight.
    deferDropStart();
    const firstDialog = document.createElement('div');
    firstDialog.setAttribute('aria-modal', 'true');
    await act(async () => {
      document.body.appendChild(firstDialog);
      await Promise.resolve();
    });
    expect(dropStart).toHaveBeenCalledTimes(2);
    expect(dropStart.mock.calls.at(-1)?.[0]).toMatchObject({ y: 0 });

    firstDialog.remove();
    deferDropStart();
    bottomState.arrival = 2;
    await act(async () => {
      view.rerender(<Navbar />);
    });
    expect(dropStart).toHaveBeenCalledTimes(3);

    const secondDialog = document.createElement('div');
    secondDialog.setAttribute('aria-modal', 'true');
    await act(async () => {
      document.body.appendChild(secondDialog);
      await Promise.resolve();
    });

    expect(dropStart).toHaveBeenCalledTimes(4);
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

  it('does not replay a live arrival when reduced motion is switched off', async () => {
    bottomState.atBottom = true;
    bottomState.arrival = 1;
    motionState.reducedMotion = true;

    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = renderWithFooterLine();
    });
    expect(bottomState.enabled).toBe(false);

    motionState.reducedMotion = false;
    await act(async () => {
      view.rerender(<Navbar />);
    });

    expect(bottomState.enabled).toBe(true);
    expect(dropStart).not.toHaveBeenCalled();
  });
});
