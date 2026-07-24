'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* Section sub-headings sit at Medium and snap to Bold the first time they
   reach the top third of the viewport — then STAY bold (the latch never
   reverts). Poppins is a static font, so a CSS font-weight transition would
   snap; instead a Medium and a Bold copy are stacked in one grid cell
   (identical width → identical wrapping, no reflow) and their opacity
   cross-fades on a gentle ease so the weight reads as a gradual thickening. */

const TAGS = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4' } as const;

interface ScrollWeightHeadingProps {
  text: string;
  as?: keyof typeof TAGS;
  /** Size / colour / leading / casing — must NOT set a font weight. */
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollWeightHeading({
  text,
  as = 'h3',
  className = '',
  style,
}: ScrollWeightHeadingProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const [bold, setBold] = useState(false);
  const Tag = TAGS[as];
  const lines = text.split('\n');

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    // Fire as soon as the heading enters the lower quarter of the viewport
    // (top 75%), then latch — so it bolds early on the way up, not near the top.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBold(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -25% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <Tag className={`font-[700] ${className}`} style={style}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`grid grid-cols-1 ${className}`}
      style={style}
      aria-label={text}
    >
      <span
        aria-hidden="true"
        className="[grid-area:1/1] font-[500] transition-opacity duration-[550ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
        style={{ opacity: bold ? 0 : 1 }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
      <span
        aria-hidden="true"
        className="[grid-area:1/1] font-[700] transition-opacity duration-[550ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
        style={{ opacity: bold ? 1 : 0 }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
    </Tag>
  );
}
