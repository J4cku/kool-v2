import { act, cleanup, render } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FooterHairline, { buildHairlinePath } from '@/components/FooterHairline';
import { emitDotImpact } from '@/lib/dot-drop';

const motionState = vi.hoisted(() => ({ reducedMotion: false }));

/* Stand-ins for framer's motion values, with the one distinction the
   component depends on made observable: jump() lands immediately, set() only
   states where the value is *heading*. The real spring takes ~250ms to cover
   that ground; here a test says when it arrives, so the bent state can be
   inspected instead of being over before the first assertion. */
const lab = vi.hoisted(() => {
  type Subscriber = (value: number) => void;

  function makeValue(initial: number, instant: boolean) {
    let current = initial;
    let target = initial;
    const subscribers = new Set<Subscriber>();
    const emit = () => subscribers.forEach((subscriber) => subscriber(current));
    return {
      /* Where set() last pointed it. The component's guarantee is that this
         is 0 after every impact, so an interrupted spring can only ever be
         on its way back to flat. */
      get target() {
        return target;
      },
      get: () => current,
      /* Spring values only note where they are heading; plain values arrive. */
      set: (next: number) => {
        target = next;
        if (!instant) return;
        current = next;
        emit();
      },
      jump: (next: number) => {
        current = next;
        emit();
      },
      on: (event: string, callback: Subscriber) => {
        if (event !== 'change') return () => {};
        subscribers.add(callback);
        return () => subscribers.delete(callback);
      },
      /* Test-only: land on `to`, or on wherever set() was pointing. */
      arrive: (to?: number) => {
        current = to ?? target;
        emit();
      },
      changeSubscribers: () => subscribers.size,
    };
  }

  return { makeValue, springs: [] as ReturnType<typeof makeValue>[] };
});

type FakeValue = ReturnType<typeof lab.makeValue>;

function isValue(candidate: unknown): candidate is { get: () => unknown } {
  return typeof candidate === 'object' && candidate !== null && 'get' in candidate;
}

/* One stable component per tag, for the reason documented in Navbar.test.tsx:
   a fresh function per access changes the element type on every render. */
const motionComponents = new Map<string, (props: Record<string, unknown>) => ReactNode>();

function motionComponent(tag: string) {
  const Motion = ({ children, ...props }: Record<string, unknown>) => {
    const resolved: Record<string, unknown> = {};
    Object.entries(props).forEach(([key, value]) => {
      resolved[key] = isValue(value) ? value.get() : value;
    });
    return createElement(tag, resolved, children as ReactNode);
  };
  Motion.displayName = `motion.${tag}`;
  return Motion;
}

/* Real motion values survive a re-render; a fresh one per call would hand the
   test a value the component is no longer holding the moment the bend
   re-renders it. */
vi.mock('framer-motion', async () => {
  const { useRef } = await import('react');
  const useStableValue = (initial: number, instant: boolean) => {
    const ref = useRef<FakeValue | null>(null);
    if (!ref.current) {
      ref.current = lab.makeValue(initial, instant);
      if (!instant) lab.springs.push(ref.current);
    }
    return ref.current;
  };

  return {
    motion: new Proxy({}, {
      get: (_, tag) => {
        const name = String(tag);
        if (!motionComponents.has(name)) motionComponents.set(name, motionComponent(name));
        return motionComponents.get(name);
      },
    }),
    useSpring: (initial: number) => useStableValue(initial, false),
    useMotionValue: (initial: number) => useStableValue(initial, true),
    useTransform: (inputs: FakeValue[], transformer: (latest: number[]) => unknown) => ({
      get: () => transformer(inputs.map((input) => input.get())),
    }),
  };
});

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => motionState.reducedMotion,
}));

/* jsdom reports every rect as zero, which the impact handler reads as "no
   line to strike". Give the svg a 1000px-wide viewport box so the impact's
   viewport x can be mapped onto the viewBox at all. */
Element.prototype.getBoundingClientRect = function () {
  return { top: 0, bottom: 1, left: 0, right: 1000, width: 1000, height: 1 } as DOMRect;
};

const LINE_Y = 6.25;
const MAX_DIP = 6;

function hairline() {
  return document.querySelector('[data-hairline] svg') as SVGSVGElement;
}

function renderHairline() {
  return render(
    <div data-hairline>
      <FooterHairline />
    </div>
  );
}

function spring() {
  return lab.springs[lab.springs.length - 1];
}

function strike(detail: { x: number; strength: number }) {
  act(() => {
    emitDotImpact(detail);
  });
}

/* The numbers in a path's `d`, in order: the move-to, then six per cubic.
   `M0 6.25 C far near strike C near far end` puts the strike at [6, 8). */
function coordinates(d: string) {
  return (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
}

const START = 0;
const LEFT_FAR = 2;
const LEFT_NEAR = 4;
const STRIKE = 6;
const RIGHT_NEAR = 8;
const RIGHT_FAR = 10;
const END = 12;

afterEach(() => {
  cleanup();
  motionState.reducedMotion = false;
  lab.springs.length = 0;
});

describe('FooterHairline path', () => {
  it('is a straight line at rest, whatever the last strike point was', () => {
    expect(buildHairlinePath(0, 50)).toBe('M0 6.25L100 6.25');
    expect(buildHairlinePath(0, 0)).toBe('M0 6.25L100 6.25');
    expect(buildHairlinePath(0, 100)).toBe('M0 6.25L100 6.25');
    // A spring that undershoots must not invent an upward bulge
    expect(buildHairlinePath(-2, 50)).toBe('M0 6.25L100 6.25');
    expect(buildHairlinePath(Number.NaN, 50)).toBe('M0 6.25L100 6.25');
  });

  it('bends as two cubics meeting at the strike, not one bow across the width', () => {
    const d = buildHairlinePath(MAX_DIP, 62);

    // Two cubics — a single quadratic (or one cubic) across the full width
    // would bow the whole line like a skipping rope
    expect(d.match(/C/g)).toHaveLength(2);
    expect(d).not.toContain('Q');

    const points = coordinates(d);
    // Anchored flat at both ends
    expect(points.slice(START, START + 2)).toEqual([0, LINE_Y]);
    expect(points.slice(END)).toEqual([100, LINE_Y]);
    // ...and at its lowest exactly at the strike
    expect(points.slice(STRIKE, STRIKE + 2)).toEqual([62, LINE_Y + MAX_DIP]);
  });

  it('keeps the bend local to the strike rather than lifting the far end', () => {
    const points = coordinates(buildHairlinePath(MAX_DIP, 50));
    // The outermost control point on each side sits past the halfway mark of
    // its own span and stays on the resting line, so the wire is still flat
    // there — a bow across the whole width is what this rules out
    expect(points[LEFT_FAR]).toBeGreaterThan(50 * 0.5);
    expect(points[LEFT_FAR + 1]).toBe(LINE_Y);
    expect(points[RIGHT_FAR]).toBeLessThan(50 + 50 * 0.5);
    expect(points[RIGHT_FAR + 1]).toBe(LINE_Y);
    // ...while the inner pair is deep, and inside the last tenth of its span
    expect(points[LEFT_NEAR]).toBeGreaterThan(50 * 0.85);
    expect(points[LEFT_NEAR + 1]).toBeGreaterThan(LINE_Y + MAX_DIP * 0.5);
  });

  it('is symmetric about a strike in the middle', () => {
    const points = coordinates(buildHairlinePath(MAX_DIP, 50));
    expect(points[LEFT_FAR]).toBeCloseTo(100 - points[RIGHT_FAR], 6);
    expect(points[LEFT_NEAR]).toBeCloseTo(100 - points[RIGHT_NEAR], 6);
    expect(points[LEFT_NEAR + 1]).toBeCloseTo(points[RIGHT_NEAR + 1], 6);
  });

  it('clamps a strike outside the line to its ends', () => {
    const past = coordinates(buildHairlinePath(MAX_DIP, 400));
    const before = coordinates(buildHairlinePath(MAX_DIP, -80));
    expect(past.slice(STRIKE, STRIKE + 2)).toEqual([100, LINE_Y + MAX_DIP]);
    expect(before.slice(STRIKE, STRIKE + 2)).toEqual([0, LINE_Y + MAX_DIP]);
  });
});

describe('FooterHairline rendering', () => {
  it('rests as the half-pixel rect the shipped hairline painted', () => {
    renderHairline();
    const svg = hairline();

    // One viewBox unit is one CSS pixel vertically, so the rect covers
    // [6, 6.5] — the same half pixel the old scaleY(0.5) box did
    expect(svg.getAttribute('viewBox')).toBe('0 0 100 12');
    expect(svg.getAttribute('preserveAspectRatio')).toBe('none');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('class')).toContain('pointer-events-none');

    const rect = svg.querySelector('rect');
    expect(rect?.getAttribute('y')).toBe('6');
    expect(rect?.getAttribute('height')).toBe('0.5');
    expect(rect?.getAttribute('width')).toBe('100');

    // Measured in Chromium, a path over identical geometry blends one 8-bit
    // step lighter than the old background box, and a non-scaling stroke
    // additionally lands 1/8px high at DPR 1. The resting line is on every
    // page for every visitor, so it is never a path
    expect(svg.querySelector('path')).toBeNull();
  });

  it('bends where it is struck, with a constant-width stroke', () => {
    renderHairline();
    strike({ x: 620, strength: 1 });

    const path = hairline().querySelector('path');
    expect(path).not.toBeNull();
    expect(path?.getAttribute('stroke-width')).toBe('0.5');
    // Without this the stroke would be scaled by the viewBox's 12.8x
    // horizontal stretch
    expect(path?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    expect(path?.getAttribute('fill')).toBe('none');

    // The strike lands at 62% of the 1000px-wide line, i.e. 62 viewBox units
    const points = coordinates(path?.getAttribute('d') ?? '');
    expect(points.slice(STRIKE, STRIKE + 2)).toEqual([62, LINE_Y + MAX_DIP]);
    expect(hairline().querySelector('rect')).toBeNull();
  });

  it('dips in proportion to the force of that particular bounce', () => {
    renderHairline();

    strike({ x: 500, strength: 1 });
    expect(spring().get()).toBe(MAX_DIP);

    spring().arrive();
    strike({ x: 500, strength: 0.25 });
    expect(spring().get()).toBe(MAX_DIP * 0.25);

    spring().arrive();
    strike({ x: 500, strength: 4 });
    expect(spring().get()).toBe(MAX_DIP);
  });

  it('always leaves the spring pointed at flat, so it cannot settle bent', () => {
    renderHairline();

    [1, 0.55, 0.3, 0.16].forEach((strength) => {
      strike({ x: 500, strength });
      // Displaced by the strike, but already heading home before a single
      // frame of the recovery has run
      expect(spring().get()).toBeGreaterThan(0);
      expect(spring().target).toBe(0);
    });
  });

  it('returns to the resting rect as soon as the bend is sub-pixel', () => {
    renderHairline();
    strike({ x: 500, strength: 1 });
    expect(hairline().querySelector('path')).not.toBeNull();

    // Deliberately not exactly 0: the resting render must not depend on the
    // spring landing on its target to the last decimal
    act(() => spring().arrive(0.004));

    expect(hairline().querySelector('rect')).not.toBeNull();
    expect(hairline().querySelector('path')).toBeNull();
  });

  it('never bends for reduced-motion users', () => {
    motionState.reducedMotion = true;
    renderHairline();

    expect(spring().changeSubscribers()).toBe(0);
    strike({ x: 620, strength: 1 });

    expect(spring().get()).toBe(0);
    expect(hairline().querySelector('rect')).not.toBeNull();
    expect(hairline().querySelector('path')).toBeNull();
  });

  it('drops both subscriptions and flattens when unmounted mid-ring', () => {
    const view = renderHairline();
    strike({ x: 620, strength: 1 });
    const dip = spring();
    expect(dip.get()).toBe(MAX_DIP);

    view.unmount();

    // Flattened on the way out, and deaf to anything that follows
    expect(dip.get()).toBe(0);
    expect(dip.changeSubscribers()).toBe(0);
    emitDotImpact({ x: 620, strength: 1 });
    expect(dip.get()).toBe(0);
  });
});
