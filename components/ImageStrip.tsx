'use client';

import { useSyncExternalStore } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Mousewheel } from 'swiper/modules';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { localizeProject, projects } from '@/data/projects';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import 'swiper/css';

const baseSlides = projects.map((project) => ({
  src: project.thumbnail,
  slug: project.slug,
}));

function slideAlt(slug: string, locale: string): string {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return 'Kool Studio project';
  const localized = localizeProject(project, locale);
  return `${localized.title} ${localized.location}`;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Client-only random order: the server snapshot keeps the data order so SSR
// markup is deterministic, the client snapshot shuffles once per page load.
let shuffledSlides: typeof baseSlides | null = null;
const emptySubscribe = () => () => {};
function getShuffledSlides() {
  shuffledSlides ??= shuffle(baseSlides);
  return shuffledSlides;
}
function getServerSlides() {
  return baseSlides;
}

export default function ImageStrip() {
  // The key remount keeps Swiper's loop clones in sync once the shuffled
  // order replaces the SSR order at hydration.
  const slides = useSyncExternalStore(emptySubscribe, getShuffledSlides, getServerSlides);
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 80], [1, 0]);

  return (
    <div className="relative flex min-h-[calc(100svh-160px)] w-full items-start md:min-h-[calc(100svh-127px)] md:items-center">
      <Swiper
        key={slides === baseSlides ? 'initial' : 'shuffled'}
        className="hero-swiper w-full"
        modules={[Autoplay, Mousewheel]}
        slidesPerView={1}
        spaceBetween={3}
        breakpoints={{ 768: { slidesPerView: 3 } }}
        loop
        speed={900}
        autoplay={
          reduceMotion
            ? false
            : { delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }
        }
        /* Manual control: swipe on touch, drag on desktop, and horizontal
           trackpad/wheel — one project per gesture; vertical scrolling
           passes through untouched (forceToAxis) */
        mousewheel={{ forceToAxis: true, thresholdDelta: 12 }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.slug}>
            <Link
              href={`/projekty/${slide.slug}`}
              draggable={false}
              className="relative block w-full cursor-pointer aspect-[3/4] md:aspect-square overflow-hidden"
            >
              <Image
                src={slide.src}
                alt={slideAlt(slide.slug, locale)}
                draggable={false}
                fill
                className="object-cover transition-transform duration-[600ms] hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={i === 0}
                loading={i === 0 ? undefined : 'eager'}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Scroll indicator — three animated dots */}
      {/* z-10 keeps the dots above Swiper's z-index:1 when they overlap the images */}
      {!reduceMotion && (
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-coral/60"
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
