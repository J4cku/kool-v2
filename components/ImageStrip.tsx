'use client';

import { useEffect, useMemo, useRef, useState, type FocusEvent } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type { Swiper as SwiperInstance } from 'swiper';
import { A11y, Autoplay, Keyboard, Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Link } from '@/i18n/navigation';
import { localizeProject, projects } from '@/data/projects';
import { curateHomepageProjects } from '@/data/homepage-projects';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const curatedProjects = curateHomepageProjects(projects);

type ShowcaseProject = (typeof curatedProjects)[number];

function ProjectFolio({
  project,
  category,
}: {
  project: ShowcaseProject;
  category: string;
}) {
  return (
    <div className="relative h-full text-dark">
      <div className="absolute top-3 bottom-3 left-3 flex flex-col justify-between text-left min-[992px]:top-[13px] min-[992px]:bottom-[12px] min-[992px]:left-4">
        <span className="text-[9px] font-[500] uppercase tracking-[-0.01em] text-dark/60 min-[992px]:text-[10px]">
          {category}
        </span>
        <span className="text-[9px] font-[650] uppercase tracking-[-0.01em] text-dark/60 min-[992px]:text-[10px]">
          {project.area}
        </span>
      </div>

      <p className="absolute left-[82px] right-3 top-1/3 line-clamp-2 -translate-y-1/2 text-right text-[15px] font-[800] uppercase leading-[0.94] tracking-[-0.04em] min-[992px]:right-4 min-[992px]:left-[92px] min-[992px]:line-clamp-none min-[992px]:whitespace-nowrap min-[992px]:text-[clamp(20px,1.65vw,26px)]">
        {project.title}
      </p>

      <span className="absolute right-3 bottom-3 text-right text-[9px] font-[500] uppercase tracking-[-0.01em] text-dark/60 min-[992px]:right-4 min-[992px]:bottom-[12px] min-[992px]:text-[10px]">
        {project.location}
      </span>
    </div>
  );
}

function ProjectPane({
  project,
  priority,
  category,
  openProjectLabel,
}: {
  project: ShowcaseProject;
  priority: boolean;
  category: string;
  openProjectLabel: string;
}) {
  return (
    <Link
      href={`/projekty/${project.slug}`}
      className="group absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral"
      aria-label={`${openProjectLabel}: ${project.title}, ${project.location}`}
      draggable={false}
    >
      <Image
        src={project.heroImage}
        alt=""
        fill
        priority={priority}
        draggable={false}
        className="object-cover"
        sizes="(max-width: 991px) 100vw, 50vw"
      />
      <div
        className="project-folio pointer-events-none absolute inset-x-0 bottom-1/3 h-[96px] translate-y-1/2 overflow-hidden bg-beige/75 backdrop-blur-md transition-opacity duration-300 min-[992px]:h-[80px]"
        aria-hidden="true"
      >
        <ProjectFolio project={project} category={category} />
      </div>
      <span className="sr-only">
        {project.title}, {project.location}, {project.area}
      </span>
    </Link>
  );
}

/* Slide order comes from the server (shuffled per ISR regeneration in the
   homepage route) so SSR markup, hydration, and the LCP preload all agree on
   the same first slide — never reorder client-side. */
export default function ImageStrip({ order }: { order: string[] }) {
  const locale = useLocale();
  const t = useTranslations('home');
  const tProjects = useTranslations('projects');
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 80], [1, 0]);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const focusWithinHeroRef = useRef(false);
  const dragStartIndexRef = useRef<number | null>(null);
  const [projectStatus, setProjectStatus] = useState('');

  const showcaseProjects = useMemo(() => {
    const ordered = order.flatMap((slug) => {
      const match = curatedProjects.find((project) => project.slug === slug);
      return match ? [match] : [];
    });
    return ordered.length > 1 ? ordered : curatedProjects;
  }, [order]);
  const localizedProjects = useMemo(
    () =>
      showcaseProjects.map((project) => ({
        ...project,
        ...localizeProject(project, locale),
      })),
    [locale, showcaseProjects],
  );

  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay;
    if (!autoplay) return;

    if (reduceMotion) {
      autoplay.stop();
      return;
    }

    if (!focusWithinHeroRef.current && !autoplay.running) autoplay.start();
  }, [reduceMotion]);

  const handleFocusCapture = () => {
    focusWithinHeroRef.current = true;
    swiperRef.current?.autoplay.stop();
  };

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;

    focusWithinHeroRef.current = false;
    if (reduceMotion) return;
    swiperRef.current?.autoplay.start();
  };

  const handleManualChange = (swiper: SwiperInstance) => {
    const project = localizedProjects[swiper.realIndex];
    if (!project) return;

    setProjectStatus(
      t('projectStatus', {
        position: swiper.realIndex + 1,
        total: localizedProjects.length,
        title: project.title,
      }),
    );
  };

  const handleTouchStart = (swiper: SwiperInstance) => {
    dragStartIndexRef.current = swiper.realIndex;
  };

  const handleTouchEnd = (swiper: SwiperInstance) => {
    const dragStartIndex = dragStartIndexRef.current;
    dragStartIndexRef.current = null;

    window.requestAnimationFrame(() => {
      if (dragStartIndex === null || dragStartIndex === swiper.realIndex) return;
      handleManualChange(swiper);
    });
  };

  const handleKeyPress = (swiper: SwiperInstance, keyCode: string) => {
    if (!['37', '39'].includes(String(keyCode))) return;
    handleManualChange(swiper);
  };

  return (
    <section
      className="relative isolate h-svh overflow-hidden bg-dark"
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <Swiper
        className="h-full w-full"
        modules={[A11y, Autoplay, Keyboard, Mousewheel]}
        slidesPerView={1}
        breakpoints={{ 992: { slidesPerView: 2 } }}
        slidesPerGroup={1}
        spaceBetween={1}
        loop
        speed={800}
        grabCursor
        keyboard={{ enabled: true, onlyInViewport: true, pageUpDown: false }}
        mousewheel={{ forceToAxis: true, thresholdDelta: 12 }}
        autoplay={
          reduceMotion
            ? false
            : {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }
        }
        a11y={{
          containerMessage: t('showcaseLabel'),
          containerRole: 'region',
          containerRoleDescriptionMessage: t('showcaseRole'),
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyPress={handleKeyPress}
        onScroll={handleManualChange}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {localizedProjects.map((project, index) => (
          <SwiperSlide key={project.slug} className="h-full bg-dark">
            <ProjectPane
              project={project}
              priority={index === 0}
              category={tProjects(project.category)}
              openProjectLabel={t('openProject')}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {projectStatus}
      </p>

      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-hidden="true"
      >
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2,
            }}
            className="h-1.5 w-1.5 rounded-full bg-coral/60"
          />
        ))}
      </motion.div>
    </section>
  );
}
