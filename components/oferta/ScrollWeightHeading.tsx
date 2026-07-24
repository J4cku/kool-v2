'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* Scroll-spy typographic emphasis: section headings sit at Medium and the one
   whose section is currently being read cross-fades to Bold. "Being read" =
   the last heading whose top has scrolled above the activation line (a band
   ~a third down the viewport). Poppins is a static font, so a CSS transition
   on font-weight would snap; instead each heading stacks a Medium and a Bold
   copy in one grid cell (identical width → identical wrapping, no reflow) and
   cross-fades their opacity. */

type Ctx = {
  register: (id: string, el: HTMLElement | null) => void;
  activeId: string | null;
};

const ScrollWeightContext = createContext<Ctx | null>(null);

const ACTIVATION = 0.32; // fraction of viewport height from the top

export function ScrollWeightHeadings({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const elsRef = useRef<Map<string, HTMLElement>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) elsRef.current.set(id, el);
    else elsRef.current.delete(id);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      const line = window.innerHeight * ACTIVATION;
      let best: string | null = null;
      let bestTop = -Infinity;
      elsRef.current.forEach((el, id) => {
        const top = el.getBoundingClientRect().top;
        if (top <= line && top > bestTop) {
          bestTop = top;
          best = id;
        }
      });
      setActiveId(best);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <ScrollWeightContext.Provider value={{ register, activeId }}>
      {children}
    </ScrollWeightContext.Provider>
  );
}

const TAGS = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4' } as const;

interface ScrollWeightHeadingProps {
  /** Stable id used by the scroll-spy to track which heading is active. */
  id: string;
  text: string;
  as?: keyof typeof TAGS;
  /** Size / colour / leading / casing — must NOT set a font weight. */
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollWeightHeading({
  id,
  text,
  as = 'h3',
  className = '',
  style,
}: ScrollWeightHeadingProps) {
  const ctx = useContext(ScrollWeightContext);
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = TAGS[as];
  const lines = text.split('\n');

  useEffect(() => {
    if (reduceMotion || !ctx) return;
    const el = ref.current;
    ctx.register(id, el);
    return () => ctx.register(id, null);
  }, [ctx, id, reduceMotion]);

  // No motion (or rendered outside a provider): a single static Bold heading.
  if (reduceMotion || !ctx) {
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

  const active = ctx.activeId === id;

  return (
    <Tag
      ref={ref}
      className={`grid grid-cols-1 ${className}`}
      style={style}
      aria-label={text}
    >
      <span
        aria-hidden="true"
        className="[grid-area:1/1] font-[500] transition-opacity duration-[450ms] ease-out"
        style={{ opacity: active ? 0 : 1 }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
      <span
        aria-hidden="true"
        className="[grid-area:1/1] font-[700] transition-opacity duration-[450ms] ease-out"
        style={{ opacity: active ? 1 : 0 }}
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
