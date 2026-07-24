'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import ScrollWeightHeading from './ScrollWeightHeading';

const SWIPE_THRESHOLD = 60;
/* Slide width as % of the section — must match the w-[86%] md:w-[62%] on the
   slides; the strip translates by one slide-width per step. */
const SLIDE_W_MOBILE = 86;
const SLIDE_W_DESKTOP = 62;
/* Neighbouring slides dissolve toward both borders. */
const EDGE_MASK =
  'linear-gradient(to right, transparent, rgb(0 0 0) 6%, rgb(0 0 0) 94%, transparent)';
/* Scroll distance (vh) the pin holds per stage — total pin height is
   stages × this. Higher = more scroll per slide. */
const VH_PER_SLIDE = 62;

export interface TimelineStage {
  title: string;
  text: string;
}

interface StagesTimelineProps {
  heading: string;
  stages: TimelineStage[];
  headingId?: string;
}

const pad = (i: number) => String(i + 1).padStart(2, '0');

/* One stage panel — the big number, title and body. `active` drives opacity so
   the centred stage is solid and its neighbours fade toward the edges. */
function StageSlides({ stages, active }: { stages: TimelineStage[]; active: number }) {
  return (
    <>
      {stages.map((stage, i) => {
        const isActive = i === active;
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            /* relative scopes the sr-only span so it can't escape the masked
               container and add horizontal page overflow */
            className={`relative shrink-0 w-[86%] md:w-[62%] pr-10 md:pr-20 select-none transition-opacity duration-500 ${
              isActive ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-0">
              <span
                aria-hidden="true"
                className="font-[700] text-dark leading-[0.8] tabular-nums md:pr-12 lg:pr-16"
                style={{ fontSize: 'clamp(80px, 10vw, 150px)' }}
              >
                {pad(i)}
              </span>
              <div className="md:pt-2">
                <h4
                  className="font-[700] text-dark uppercase mb-4 md:mb-6"
                  style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
                >
                  <span className="sr-only">{pad(i)} </span>
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
    </>
  );
}

/* Coral hairline with one dot per stage; the active dot is filled. */
function DotTrack({
  stages,
  active,
  onDot,
}: {
  stages: TimelineStage[];
  active: number;
  onDot: (i: number) => void;
}) {
  return (
    <div className="relative mt-6 md:mt-10 h-10">
      <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-coral" />
      <div className="absolute inset-x-0 top-0 bottom-0 w-[86%] md:w-[72%] mx-auto flex justify-between items-center">
        {stages.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onDot(i)}
            aria-label={`${pad(i)} — ${s.title}`}
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
  );
}

function TimelineHeading({ id, heading }: { id: string; heading: string }) {
  return (
    <ScrollWeightHeading
      id={id}
      text={heading}
      className="text-dark uppercase mb-10 md:mb-14 leading-[1.02]"
      style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
    />
  );
}

/* Reduced-motion / fallback: a peek carousel navigated by dots, click and
   swipe — no scroll pinning. */
function CarouselTimeline({
  heading,
  headingId,
  stages,
  slideW,
}: {
  heading: string;
  headingId: string;
  stages: TimelineStage[];
  slideW: number;
}) {
  const [active, setActive] = useState(0);
  const goTo = (i: number) => {
    if (i >= 0 && i < stages.length) setActive(i);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(active + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(active - 1);
  };

  return (
    <div>
      <TimelineHeading id={headingId} heading={heading} />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {pad(active)} — {stages[active].title}
      </p>
      <div
        className="overflow-hidden"
        style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={onDragEnd}
          className="flex items-start ml-[7%] md:ml-[19%] cursor-grab active:cursor-grabbing"
          style={{ transform: `translateX(${-active * slideW}%)` }}
        >
          <StageSlides stages={stages} active={active} />
        </motion.div>
      </div>
      <DotTrack stages={stages} active={active} onDot={goTo} />
    </div>
  );
}

/* Scroll-driven: the section pins to the viewport and scroll progress steps
   through the stages until the last, then the page continues. Native
   sticky-scroll (no wheel hijacking) — works on desktop and touch alike. */
function ScrollPinnedTimeline({
  heading,
  headingId,
  stages,
  slideW,
}: {
  heading: string;
  headingId: string;
  stages: TimelineStage[];
  slideW: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const lastIndex = stages.length - 1;

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, (v) => `${-v * lastIndex * slideW}%`);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.max(0, Math.min(lastIndex, Math.round(v * lastIndex)));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  const onDot = (i: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rangePx = el.offsetHeight - window.innerHeight;
    const start = el.getBoundingClientRect().top + window.scrollY;
    const target = lastIndex > 0 ? start + (i / lastIndex) * rangePx : start;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <div ref={wrapRef} style={{ height: `${stages.length * VH_PER_SLIDE}vh` }}>
      <div className="sticky top-0 min-h-screen flex flex-col justify-center py-24">
        <TimelineHeading id={headingId} heading={heading} />
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {pad(active)} — {stages[active].title}
        </p>
        <div
          className="overflow-hidden"
          style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
        >
          <motion.div className="flex items-start ml-[7%] md:ml-[19%]" style={{ x }}>
            <StageSlides stages={stages} active={active} />
          </motion.div>
        </div>
        <DotTrack stages={stages} active={active} onDot={onDot} />
      </div>
    </div>
  );
}

/* Horizontal stage timeline. Under normal motion it pins and advances on
   scroll; under reduced motion it degrades to a dot/swipe carousel. */
export default function StagesTimeline({
  heading,
  stages,
  headingId = 'stages',
}: StagesTimelineProps) {
  const reduceMotion = useReducedMotion();
  const [slideW, setSlideW] = useState(SLIDE_W_DESKTOP);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const apply = () => setSlideW(query.matches ? SLIDE_W_DESKTOP : SLIDE_W_MOBILE);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  if (reduceMotion) {
    return (
      <CarouselTimeline
        heading={heading}
        headingId={headingId}
        stages={stages}
        slideW={slideW}
      />
    );
  }

  return (
    <ScrollPinnedTimeline
      heading={heading}
      headingId={headingId}
      stages={stages}
      slideW={slideW}
    />
  );
}
