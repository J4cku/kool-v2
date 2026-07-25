'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { onDotImpact } from '@/lib/dot-drop';

/* The coral hairline at the top of FooterBar, and phase B of the idle dot
   drop: the wire the falling dot lands on, which flexes where it is struck.
   Design: docs/superpowers/specs/2026-07-24-idle-dot-drop-design.md

   A background box cannot bend, so the line is drawn inside an SVG — but it
   is on every page for every visitor whether the drop is enabled or not, so
   the resting render has to be the old `h-px bg-coral scaleY(0.5)` box to
   the pixel, and that is the constraint the geometry below is built around.

   The viewBox is 12 units tall inside a 12px-tall SVG offset -6px, so one
   unit is one CSS pixel vertically and unit y = 6 is the top of the h-px
   box. `preserveAspectRatio="none"` stretches x only.

   At rest the line is a <rect> spanning [6, 6.5] — the same half pixel the
   scaled div painted. A <path> is deliberately NOT used at rest: measured in
   Chromium, a filled path or a 0.5px stroke over identical geometry blends
   one 8-bit step lighter than the div (240,134,115 vs 241,135,115 on beige
   at DPR 1), and `vector-effect="non-scaling-stroke"` additionally biases the
   stroke 1/8px upward at DPR 1, spilling ink into the row above. Skia's
   analytic anti-aliasing of an axis-aligned rect is what the div's
   background went through, and it is the only primitive that reproduces it
   exactly at both DPR 1 and DPR 2.

   The bent line is the path, with the constant-width stroke the curve wants;
   its 1/8px bias is irrelevant on a line that is mid-flight, and the swap
   happens on the frame the dot strikes. */

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 12;
/* Top of the h-px box, in viewBox units. */
const LINE_TOP = VIEW_HEIGHT / 2;
const LINE_WEIGHT = 0.5;
/* The path is stroked, so it is centred where the rect's band is. */
const LINE_Y = LINE_TOP + LINE_WEIGHT / 2;
/* Deepest the wire is pushed, at a full-strength impact. */
const MAX_DIP = 6;
/* Below this the bend cannot occupy a device pixel at any DPR, so the line
   goes back to the rect. Nothing waits for the spring to land on exactly
   zero: an interrupted, unmounted or aborted flight settles under this
   within a frame or two and the resting render is restored regardless. */
const MIN_VISIBLE_DIP = 0.02;

const FLAT_PATH = `M0 ${LINE_Y}L${VIEW_WIDTH} ${LINE_Y}`;

/* A struck wire recovers with a little ring rather than easing back, so the
   spring is deliberately under-damped (ζ ≈ 0.68) and quick — the recovery is
   over inside ~250ms, before the next bounce lands. */
const DIP_SPRING = { stiffness: 520, damping: 22, mass: 0.5 } as const;

/* Where each cubic's control points sit along its own half of the line. The
   far pair holds the wire flat past the halfway mark and the near pair sits
   in the last tenth before the strike, so the bend stays local. One
   quadratic across the whole width would instead bow the entire line like a
   skipping rope, which is the wrong read for a taut wire hit at a point. */
const FAR_CONTROL = 0.55;
const NEAR_CONTROL = 0.9;
const NEAR_DIP = 0.72;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/* Three decimals is ~1/300 of a viewBox unit: far below a device pixel at
   any width, and short enough to rewrite the attribute every frame. */
function round(value: number) {
  return Number(value.toFixed(3));
}

/* Two cubics meeting at `x` (in viewBox units), pulled `dip` px down. */
export function buildHairlinePath(dip: number, x: number): string {
  if (!(dip > 0)) return FLAT_PATH;

  const strike = clamp(x, 0, VIEW_WIDTH);
  const rightSpan = VIEW_WIDTH - strike;
  const shoulder = LINE_Y + dip * NEAR_DIP;

  return (
    `M0 ${LINE_Y}` +
    `C${round(strike * FAR_CONTROL)} ${LINE_Y}` +
    ` ${round(strike * NEAR_CONTROL)} ${round(shoulder)}` +
    ` ${round(strike)} ${round(LINE_Y + dip)}` +
    `C${round(strike + rightSpan * (1 - NEAR_CONTROL))} ${round(shoulder)}` +
    ` ${round(strike + rightSpan * (1 - FAR_CONTROL))} ${LINE_Y}` +
    ` ${VIEW_WIDTH} ${LINE_Y}`
  );
}

export default function FooterHairline() {
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const dip = useSpring(0, DIP_SPRING);
  const strikeX = useMotionValue(VIEW_WIDTH / 2);
  const path = useTransform<number, string>(
    [dip, strikeX],
    ([currentDip, currentX]) => buildHairlinePath(currentDip, currentX)
  );
  /* False through SSR, hydration, the whole of a reduced-motion visit and
     every page view where the drop never fires — i.e. the resting render is
     the default, not a state the component has to get back to. */
  const [bent, setBent] = useState(false);
  const bentRef = useRef(false);

  useEffect(() => {
    /* Never subscribed for reduced-motion users, so the line cannot bend for
       them even if something else emits an impact. */
    if (reduceMotion) return;

    const stopWatchingDip = dip.on('change', (value) => {
      const next = value > MIN_VISIBLE_DIP;
      if (next === bentRef.current) return;
      bentRef.current = next;
      setBent(next);
    });

    const unsubscribe = onDotImpact(({ x, strength }) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0) return;

      strikeX.set(clamp(((x - rect.left) / rect.width) * VIEW_WIDTH, 0, VIEW_WIDTH));
      /* The strike itself is instantaneous — the dot arrives at speed — so
         the displacement is a jump and the spring only carries the recovery.
         That also makes the spring's target permanently 0: a flight that is
         interrupted, a component that unmounts and a dot that aborts all
         leave the wire on its way back to flat, never parked bent. */
      dip.jump(MAX_DIP * clamp(strength, 0, 1));
      dip.set(0);
    });

    return () => {
      unsubscribe();
      stopWatchingDip();
      /* Losing the subscription mid-ring would otherwise freeze the bend. */
      dip.jump(0);
      bentRef.current = false;
      setBent(false);
    };
  }, [dip, reduceMotion, strikeX]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute -top-[6px] left-0 h-[12px] w-full overflow-visible text-coral"
    >
      {bent ? (
        <motion.path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={LINE_WEIGHT}
          vectorEffect="non-scaling-stroke"
        />
      ) : (
        <rect x="0" y={LINE_TOP} width={VIEW_WIDTH} height={LINE_WEIGHT} fill="currentColor" />
      )}
    </svg>
  );
}
