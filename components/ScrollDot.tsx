'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* Stiffer than a progress bar's spring would need to be: this value is read as
   a position along the full width of the viewport rather than as a scale, so
   the same normalised lag that is invisible on a growing rule shows up here as
   the dot trailing the scroll by tens of pixels. restDelta is ~0.3px on a
   1400px line. */
const TRAVEL_SPRING = { stiffness: 240, damping: 36, restDelta: 0.0002 } as const;

/* The brand dot, not a circle — dot.svg is 36:35, the ratio the navbar renders
   it at, and it is masked rather than drawn so the silhouette is the same
   asymmetric mark in both places. 7px is the smallest size that still reads as
   that mark against a half-pixel hairline; below it the shape collapses into a
   speck. */
const DOT_WIDTH = 7;
const DOT_HEIGHT = (DOT_WIDTH * 35) / 36;

/* FooterHairline paints its half pixel of coral across [0, 0.5] of the h-px
   box it sits in (its viewBox is offset so one unit is one CSS pixel and the
   rect starts at the box's top edge), so the line's centre is a quarter pixel
   down — not the half pixel `top-1/2` would give. */
const LINE_CENTER = 0.25;

const DOT_MASK = {
  maskImage: 'url(/dot.svg)',
  maskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskImage: 'url(/dot.svg)',
  WebkitMaskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
} as const;

/* The dot travels `width - DOT_WIDTH`, so that it is flush inside both ends
   rather than hanging half off them — and it has to do that without measuring
   anything, because [data-footer-line] is the idle drop's landing target and
   nothing here may read or perturb its layout.
   A percentage translate resolves against the element's OWN width, which is
   the wrong 100%. So the travel is handed to a zero-height track that is
   exactly `100% - DOT_WIDTH` wide: translating that track by 100% of itself
   moves the dot pinned at its left edge by exactly the distance wanted, at any
   viewport width, with no ResizeObserver and no layout read. */
function Rider() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, TRAVEL_SPRING);
  const x = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-10 h-0"
      style={{ width: `calc(100% - ${DOT_WIDTH}px)`, x }}
    >
      <div
        className="absolute left-0 bg-coral"
        style={{
          width: `${DOT_WIDTH}px`,
          height: `${DOT_HEIGHT}px`,
          top: `${LINE_CENTER - DOT_HEIGHT / 2}px`,
          ...DOT_MASK,
        }}
      />
    </motion.div>
  );
}

/* Reduced motion gets nothing at all — the branch is above the hooks, so the
   scroll subscription is never mounted. A parked dot has no meaning: unlike a
   spine or a rule it has no resting state to fall back to, and a coral speck
   sitting at the left end of the footer line reads as a stray design element
   rather than as progress. */
export default function ScrollDot() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return <Rider />;
}
