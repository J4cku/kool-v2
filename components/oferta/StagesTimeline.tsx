'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SWIPE_THRESHOLD = 60;

export interface TimelineStage {
  title: string;
  text: string;
}

interface StagesTimelineProps {
  heading: string;
  stages: TimelineStage[];
}

/* Horizontal stage timeline: one stage shown at a time, navigated by the
   dot track, swipe/drag, or the ghost number of the next stage dissolving
   into the right edge — the fade is the cue that the timeline continues. */
export default function StagesTimeline({ heading, stages }: StagesTimelineProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index: number) => {
    if (index === active || index < 0 || index >= stages.length) return;
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(active + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(active - 1);
  };

  const stage = stages[active];
  const number = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <div>
      <h3
        className="font-[700] text-dark uppercase mb-10 md:mb-14 leading-[1.02]"
        style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
      >
        {heading}
      </h3>

      {/* Persistent live region — announces stage changes; must live outside
          AnimatePresence or the remount swallows the announcement */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {number(active)} — {stage.title}
      </p>

      {/* Stage panel — fixed floor height so the dot track doesn't jump.
          Right padding reserves the ghost number's strip so it never sits
          over the stage text (text is width-capped from xl up). */}
      <div className="relative overflow-hidden min-h-[300px] md:min-h-[280px]">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ x: reduceMotion ? 0 : 44 * dir, opacity: 0 }),
              center: {
                x: 0,
                opacity: 1,
                transition: { duration: reduceMotion ? 0 : 0.45, ease: EASE },
              },
              exit: (dir: number) => ({
                x: reduceMotion ? 0 : -44 * dir,
                opacity: 0,
                transition: { duration: reduceMotion ? 0 : 0.3, ease: EASE },
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            drag={reduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={onDragEnd}
            className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-0 cursor-grab active:cursor-grabbing select-none pr-14 md:pr-36 xl:pr-0"
          >
            <span
              aria-hidden="true"
              className="font-[700] text-dark leading-[0.8] tabular-nums md:pr-16 lg:pr-24"
              style={{ fontSize: 'clamp(88px, 11vw, 170px)' }}
            >
              {number(active)}
            </span>
            <div className="max-w-[860px] md:pt-2">
              <h4
                className="font-[700] text-dark uppercase mb-4 md:mb-6"
                style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
              >
                <span className="sr-only">{number(active)} </span>
                {stage.title}:
              </h4>
              <p
                className="text-dark/80 font-[400] leading-[1.5]"
                style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
              >
                {stage.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next stage's number ghosting into the right border — the
            gradual fade signals there is more timeline to the right */}
        {active < stages.length - 1 && (
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => goTo(active + 1)}
            className="absolute right-0 top-0 translate-x-[38%] font-[700] text-dark leading-[0.8] tabular-nums opacity-30 hover:opacity-50 transition-opacity"
            style={{
              fontSize: 'clamp(88px, 11vw, 170px)',
              maskImage: 'linear-gradient(to right, rgb(0 0 0), transparent 78%)',
              WebkitMaskImage: 'linear-gradient(to right, rgb(0 0 0), transparent 78%)',
            }}
          >
            {number(active + 1)}
          </button>
        )}
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
