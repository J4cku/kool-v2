'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* Enough to take the edge off wheel/trackpad steps without the line visibly
   lagging the scroll. */
const DRAW_SPRING = { stiffness: 140, damping: 32, restDelta: 0.001 } as const;

const VIEW_HEIGHT = 100;

interface ScrollSpineProps {
  /** Positioning + vertical span, e.g. `absolute inset-y-0 left-0`. */
  className?: string;
  /** Hairline weight in CSS px; also the width of the element. */
  strokeWidth?: number;
}

/* The SVG stretches to whatever height the caller gives it, so the geometry is
   a fixed-height box with `preserveAspectRatio="none"` and the element is
   exactly `strokeWidth` wide — which keeps the x scale at 1:1, so a vertical
   line's stroke lands on the width it asks for.

   `vector-effect="non-scaling-stroke"` would do the same job for the width, but
   it moves the whole stroke geometry into screen space while `pathLength`
   normalises against user units, and the dash pattern the draw is built on then
   tiles down the line instead of growing. Matching the box to the viewBox is
   the version that does both. */
function Frame({
  children,
  className,
  strokeWidth,
  ref,
}: {
  children: React.ReactNode;
  className: string;
  strokeWidth: number;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ width: `${strokeWidth}px` }}
    >
      <svg
        viewBox={`0 0 ${strokeWidth} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        focusable="false"
        className="block h-full w-full"
      >
        {children}
      </svg>
    </div>
  );
}

function line(strokeWidth: number) {
  return `M${strokeWidth / 2} 0V${VIEW_HEIGHT}`;
}

/* Always visible, so the spine has resting-state presence before anything is
   drawn over it. */
function Rail({ strokeWidth }: { strokeWidth: number }) {
  return (
    <path
      d={line(strokeWidth)}
      fill="none"
      stroke="var(--color-dark)"
      strokeOpacity={0.15}
      strokeWidth={strokeWidth}
    />
  );
}

/* The coral hairline draws itself downward as the spine's own box travels
   through the viewport — it spans its section, so it is its own scroll
   target. */
function DrawnSpine({ className, strokeWidth }: Required<ScrollSpineProps>) {
  const ref = useRef<HTMLDivElement>(null);
  /* Progress 0 when the spine's top edge is 85% of the way down the viewport,
     1 when its bottom edge reaches 62% — so the line finishes drawing as the
     last item settles into reading position, not as the list leaves. */
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 62%'] });
  const drawn = useSpring(scrollYProgress, DRAW_SPRING);

  return (
    <Frame ref={ref} className={className} strokeWidth={strokeWidth}>
      <Rail strokeWidth={strokeWidth} />
      <motion.path
        d={line(strokeWidth)}
        fill="none"
        stroke="var(--color-coral)"
        strokeWidth={strokeWidth}
        style={{ pathLength: drawn }}
      />
    </Frame>
  );
}

/* Reduced motion gets the finished line and no scroll subscription at all —
   the branch is above the hooks, so they are never mounted. */
export default function ScrollSpine({ className = '', strokeWidth = 1 }: ScrollSpineProps) {
  const reduceMotion = useReducedMotion();

  if (!reduceMotion) {
    return <DrawnSpine className={className} strokeWidth={strokeWidth} />;
  }

  return (
    <Frame className={className} strokeWidth={strokeWidth}>
      <Rail strokeWidth={strokeWidth} />
      <path
        d={line(strokeWidth)}
        fill="none"
        stroke="var(--color-coral)"
        strokeWidth={strokeWidth}
      />
    </Frame>
  );
}
