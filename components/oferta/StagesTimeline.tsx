'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SWIPE_THRESHOLD = 60;
/* Slide width as % of the section — must match the w-[86%] md:w-[62%]
   classes on the slides; the track translates by one slide per step */
const SLIDE_W_MOBILE = 86;
const SLIDE_W_DESKTOP = 62;

/* Both edge fades: neighbouring slides dissolve toward the borders */
const EDGE_MASK =
  'linear-gradient(to right, transparent, rgb(0 0 0) 6%, rgb(0 0 0) 94%, transparent)';

export interface TimelineStage {
  title: string;
  text: string;
}

interface StagesTimelineProps {
  heading: string;
  stages: TimelineStage[];
}

/* Horizontal stage timeline as a peek carousel: the active stage sits
   centred while the previous/next stages stay semi-visible at the edges,
   fading out toward the borders — the cue that the timeline continues.
   Navigated by the dot track, swipe/drag, or clicking a peeking slide. */
export default function StagesTimeline({ heading, stages }: StagesTimelineProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [slideW, setSlideW] = useState(SLIDE_W_DESKTOP);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const apply = () => setSlideW(query.matches ? SLIDE_W_DESKTOP : SLIDE_W_MOBILE);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  const goTo = (index: number) => {
    if (index === active || index < 0 || index >= stages.length) return;
    setActive(index);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(active + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(active - 1);
  };

  const number = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <div>
      <h3
        className="font-[700] text-dark uppercase mb-10 md:mb-14 leading-[1.02]"
        style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
      >
        {heading}
      </h3>

      {/* Persistent live region — announces stage changes for screen readers */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {number(active)} — {stages[active].title}
      </p>

      <div
        className="overflow-hidden"
        style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
      >
        {/* Drag shell keeps its rest position at x=0 (elastic stretch only),
            so swipe gestures don't fight the track's slide translation */}
        <motion.div
          drag={reduceMotion ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          {/* The flex track spans the section width, so translating by
              active × slide-width steps exactly one slide; the margin
              centres the active slide */}
          <motion.div
            className="flex items-start ml-[7%] md:ml-[19%]"
            initial={false}
            animate={{ x: `${-active * slideW}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE }}
          >
            {stages.map((stage, i) => {
              const isActive = i === active;
              return (
                <div
                  key={i}
                  aria-hidden={!isActive}
                  onClick={isActive ? undefined : () => goTo(i)}
                  className={`shrink-0 w-[86%] md:w-[62%] pr-10 md:pr-20 select-none transition-opacity duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-30 cursor-pointer hover:opacity-50'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-0">
                    <span
                      aria-hidden="true"
                      className="font-[700] text-dark leading-[0.8] tabular-nums md:pr-12 lg:pr-16"
                      style={{ fontSize: 'clamp(80px, 10vw, 150px)' }}
                    >
                      {number(i)}
                    </span>
                    <div className="md:pt-2">
                      <h4
                        className="font-[700] text-dark uppercase mb-4 md:mb-6"
                        style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
                      >
                        <span className="sr-only">{number(i)} </span>
                        {stage.title}:
                      </h4>
                      <p
                        className="text-dark/80 font-[400] leading-[1.5]"
                        style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
                      >
                        {stage.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Dot track — coral hairline spanning the section, one dot per stage */}
      <div className="relative mt-6 md:mt-10 h-10">
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-coral" />
        <div className="absolute inset-x-0 top-0 bottom-0 w-[86%] md:w-[72%] mx-auto flex justify-between items-center">
          {stages.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${number(i)} — ${s.title}`}
              aria-current={i === active ? 'step' : undefined}
              className="group relative h-10 w-10 -mx-2 flex items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-[18px] h-[18px] bg-coral'
                    : 'w-4 h-4 border-[1.5px] border-coral bg-beige group-hover:bg-coral/20'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
