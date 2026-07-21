'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Project } from '@/data/projects';
import {
  STORY_DESKTOP_QUERY,
  buildProjectStoryMedia,
  getPinnedSectionHeight,
  getProjectStoryFrame,
  type ProjectSuccessor,
} from '@/lib/portfolio-motion';
import NextProjectRail from './NextProjectRail';
import ProjectMedia from './ProjectMedia';

type ProjectStoryProps = {
  project: Project;
  successors: ProjectSuccessor[];
};

type StoryGeometry = {
  sectionTop: number;
  horizontalDistance: number;
  viewportHeight: number;
  viewportWidth: number;
  railSteps: number;
};

const emptyGeometry: StoryGeometry = {
  sectionTop: 0,
  horizontalDistance: 0,
  viewportHeight: 1,
  viewportWidth: 1,
  railSteps: 0,
};

function scrollImmediately(top: number) {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo({ top, behavior: 'auto' });
  root.style.scrollBehavior = previousBehavior;
}

export default function ProjectStory({
  project,
  successors,
}: ProjectStoryProps) {
  const t = useTranslations('projectDetail');
  const tProjects = useTranslations('projects');
  const tFooter = useTranslations('footer');
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [isDesktop, setIsDesktop] = useState(false);
  const [sectionHeight, setSectionHeight] = useState<number | null>(null);
  const outerRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const geometryRef = useRef<StoryGeometry>(emptyGeometry);
  const measureRef = useRef<() => void>(() => undefined);
  const navThemeRef = useRef<boolean | null>(null);
  const trackX = useMotionValue(0);
  const railPosition = useMotionValue(0);
  const media = buildProjectStoryMedia(project);
  const staticMode = !isDesktop || shouldReduceMotion;
  const descriptionBlocks = project.descriptionBlocks?.length
    ? project.descriptionBlocks
    : [project.description];
  const displayTitle = project.meta?.title ?? project.title;
  const displayLocation = project.meta?.location ?? project.location;

  const publishNavTheme = useCallback((light: boolean) => {
    if (navThemeRef.current === light) return;
    navThemeRef.current = light;
    window.dispatchEvent(
      new CustomEvent('kool:nav-theme', { detail: { light } }),
    );
  }, []);

  useEffect(() => {
    const query = window.matchMedia(STORY_DESKTOP_QUERY);
    const syncDesktop = () => setIsDesktop(query.matches);

    syncDesktop();
    query.addEventListener('change', syncDesktop);
    return () => query.removeEventListener('change', syncDesktop);
  }, []);

  useEffect(
    () => () => {
      window.dispatchEvent(
        new CustomEvent('kool:nav-theme', { detail: { light: false } }),
      );
    },
    [],
  );

  useEffect(() => {
    if (!staticMode) return;

    geometryRef.current = emptyGeometry;
    trackX.set(0);
    railPosition.set(0);

    let frame = 0;
    const updateTheme = () => {
      frame = 0;
      const bounds = heroRef.current?.getBoundingClientRect();
      publishNavTheme(Boolean(bounds && bounds.top <= 64 && bounds.bottom > 64));
    };
    const scheduleThemeUpdate = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(updateTheme);
    };

    scheduleThemeUpdate();
    window.addEventListener('scroll', scheduleThemeUpdate, { passive: true });
    window.addEventListener('resize', scheduleThemeUpdate);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleThemeUpdate);
      window.removeEventListener('resize', scheduleThemeUpdate);
    };
  }, [publishNavTheme, railPosition, staticMode, trackX]);

  useEffect(() => {
    if (staticMode) {
      measureRef.current = () => undefined;
      return;
    }

    const outer = outerRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!outer || !viewport || !track) return;

    let measureFrame = 0;
    let scrollFrame = 0;

    const updateScroll = () => {
      scrollFrame = 0;
      const geometry = geometryRef.current;
      const localOffset = window.scrollY - geometry.sectionTop;
      const storyFrame = getProjectStoryFrame(
        localOffset,
        geometry.horizontalDistance,
        geometry.viewportHeight,
        geometry.railSteps,
      );

      trackX.set(storyFrame.trackX);
      railPosition.set(storyFrame.railPosition);
      publishNavTheme(
        localOffset >= -64 && localOffset < geometry.viewportWidth,
      );
    };

    const scheduleScrollUpdate = () => {
      if (scrollFrame !== 0) return;
      scrollFrame = window.requestAnimationFrame(updateScroll);
    };

    const measure = () => {
      measureFrame = 0;
      const viewportWidth = viewport.clientWidth;
      const viewportHeight = viewport.clientHeight;
      const horizontalDistance = Math.max(
        track.scrollWidth - viewportWidth,
        0,
      );
      const railSteps = Math.max(successors.length - 1, 0);

      geometryRef.current = {
        sectionTop: outer.getBoundingClientRect().top + window.scrollY,
        horizontalDistance,
        viewportHeight,
        viewportWidth,
        railSteps,
      };
      setSectionHeight(
        getPinnedSectionHeight(
          horizontalDistance,
          viewportHeight,
          railSteps,
        ),
      );
      scheduleScrollUpdate();
    };

    const scheduleMeasure = () => {
      if (measureFrame !== 0) return;
      measureFrame = window.requestAnimationFrame(measure);
    };

    measureRef.current = scheduleMeasure;
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(viewport);
    observer.observe(track);
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    scheduleMeasure();

    return () => {
      measureRef.current = () => undefined;
      observer.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('scroll', scheduleScrollUpdate);
      if (measureFrame !== 0) window.cancelAnimationFrame(measureFrame);
      if (scrollFrame !== 0) window.cancelAnimationFrame(scrollFrame);
    };
  }, [
    publishNavTheme,
    railPosition,
    staticMode,
    successors.length,
    trackX,
  ]);

  const handleMediaReady = useCallback(() => {
    measureRef.current();
  }, []);

  const scrollToRailIndex = useCallback(
    (index: number) => {
      if (staticMode) return;
      const geometry = geometryRef.current;
      const top =
        geometry.sectionTop +
        geometry.horizontalDistance +
        index * geometry.viewportHeight;
      window.scrollTo({ top, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    },
    [shouldReduceMotion, staticMode],
  );

  const handleFocusCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (staticMode) return;
      const track = trackRef.current;
      const focused = event.target as HTMLElement;
      const target = focused.closest<HTMLElement>('[data-story-focus-target]');
      if (!track || !target) return;

      const geometry = geometryRef.current;
      const targetBounds = target.getBoundingClientRect();
      const trackBounds = track.getBoundingClientRect();
      const targetOffset = targetBounds.left - trackBounds.left;
      const centeredOffset =
        targetOffset -
        Math.max((geometry.viewportWidth - targetBounds.width) / 2, 0);
      const horizontalOffset = Math.min(
        Math.max(centeredOffset, 0),
        geometry.horizontalDistance,
      );
      const railOffset =
        target.dataset.storyRail === 'true'
          ? Math.round(railPosition.get()) * geometry.viewportHeight
          : 0;

      scrollImmediately(
        geometry.sectionTop + horizontalOffset + railOffset,
      );
    },
    [railPosition, staticMode],
  );

  const viewportClass = staticMode
    ? 'relative overflow-visible'
    : 'sticky top-0 h-screen overflow-hidden';
  const trackClass = staticMode
    ? 'relative flex w-full flex-col'
    : 'relative flex h-full w-max items-stretch';

  return (
    <section
      ref={outerRef}
      className="relative bg-beige text-dark"
      style={
        staticMode || sectionHeight === null
          ? undefined
          : { height: sectionHeight }
      }
    >
      <div ref={viewportRef} className={viewportClass}>
        <motion.div
          ref={trackRef}
          className={trackClass}
          style={{ x: trackX }}
          onFocusCapture={handleFocusCapture}
        >
          <section
            ref={heroRef}
            data-story-focus-target
            className={
              staticMode
                ? 'grid min-h-[100svh] w-full grid-rows-[62svh_1fr] bg-dark text-beige'
                : 'grid h-full w-screen shrink-0 grid-cols-2 bg-dark text-beige'
            }
            aria-labelledby="project-story-title"
          >
            <div className="relative min-h-0 overflow-hidden bg-dark">
              {project.images[0] && (
                <Image
                  src={project.images[0]}
                  alt={`${displayTitle}, ${displayLocation}`}
                  fill
                  priority
                  sizes={staticMode ? '100vw' : '50vw'}
                  className="object-cover"
                  onLoad={handleMediaReady}
                />
              )}
            </div>
            <div
              className={
                staticMode
                  ? 'flex min-h-0 flex-col justify-end border-t border-beige/25 p-5 pb-16'
                  : 'flex min-h-0 flex-col justify-end border-l border-beige/25 p-10'
              }
            >
              <p className="text-[10px] font-[700] uppercase tracking-[0.16em] text-coral">
                {tProjects(project.category)} / {project.year}
              </p>
              <h1
                id="project-story-title"
                className="mt-4 max-w-[11ch] text-[clamp(2.5rem,6vw,7.5rem)] font-[800] uppercase leading-[0.84] tracking-[-0.065em]"
              >
                {displayTitle}
              </h1>
              <p className="mt-5 text-[11px] font-[600] uppercase tracking-[0.12em] text-beige/70">
                {displayLocation}
              </p>
            </div>
          </section>

          <section
            data-story-focus-target
            tabIndex={0}
            className={
              staticMode
                ? 'w-full border-b border-coral/25 px-5 py-20 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-coral'
                : 'h-full w-[45rem] shrink-0 overflow-y-auto border-r border-coral/25 px-10 pb-16 pt-24 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-coral'
            }
            aria-label={t('projekt')}
          >
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-coral/35 py-6 text-[10px] uppercase tracking-[0.1em]">
              <div className="col-span-2">
                <dt className="text-muted">{t('projekt')}</dt>
                <dd className="mt-1 font-[700]">{displayTitle}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('lokalizacja')}</dt>
                <dd className="mt-1 font-[700]">{displayLocation}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('powierzchnia')}</dt>
                <dd className="mt-1 font-[700]">{project.area}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('rok')}</dt>
                <dd className="mt-1 font-[700] tabular-nums">{project.year}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('category')}</dt>
                <dd className="mt-1 font-[700]">{tProjects(project.category)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">{t('zakres')}</dt>
                <dd className="mt-1 font-[700]">{project.scope.join(' / ')}</dd>
              </div>
              {project.meta?.collaboration && (
                <div className="col-span-2">
                  <dt className="text-muted">{t('wspolpraca')}</dt>
                  <dd className="mt-1 font-[700]">{project.meta.collaboration}</dd>
                </div>
              )}
              {project.meta?.visualizations && (
                <div className="col-span-2">
                  <dt className="text-muted">{t('wizualizacje')}</dt>
                  <dd className="mt-1 font-[700]">{project.meta.visualizations}</dd>
                </div>
              )}
              {project.photoCredit && (
                <div className="col-span-2">
                  <dt className="text-muted">{t('zdjecia')}</dt>
                  <dd className="mt-1 font-[700]">{project.photoCredit}</dd>
                </div>
              )}
            </dl>

            <div className="mt-12 space-y-8 text-[clamp(1rem,1.15vw,1.25rem)] leading-[1.65]">
              {descriptionBlocks.map((block, index) => (
                <p key={`${project.slug}-description-${index}`} className="whitespace-pre-line">
                  {block}
                </p>
              ))}
            </div>
          </section>

          <section
            className={
              staticMode
                ? 'flex w-full flex-col gap-4 py-4'
                : 'flex h-full w-max shrink-0 items-center gap-10 px-10'
            }
            aria-label={t('projekt')}
          >
            {media.map((item, index) => (
              <div
                key={`${item.kind}-${item.displayIndex}`}
                data-story-focus-target
                className={staticMode ? 'w-full' : 'shrink-0'}
              >
                <ProjectMedia
                  media={item}
                  alt={`${displayTitle}, ${displayLocation} — ${index + 1}`}
                  staticMode={staticMode}
                  desktopCadence={
                    (['compact', 'medium', 'full'] as const)[index % 3]
                  }
                  onReady={handleMediaReady}
                />
              </div>
            ))}
          </section>

          <section
            data-story-focus-target
            className={
              staticMode
                ? 'flex min-h-[70svh] w-full flex-col justify-between bg-dark px-5 pb-20 pt-24 text-beige'
                : 'flex h-full w-screen shrink-0 flex-col justify-between bg-dark p-10 pt-24 text-beige'
            }
          >
            <p className="text-[10px] font-[700] uppercase tracking-[0.16em] text-coral">
              kool studio / Wrocław
            </p>
            <div className="max-w-5xl">
              <h2 className="text-[clamp(2.8rem,7vw,8.5rem)] font-[800] uppercase leading-[0.84] tracking-[-0.065em]">
                {t('contactHeading')}
              </h2>
              <a
                href="mailto:hello@koolstudio.pl"
                className="mt-10 inline-flex min-h-11 items-center border-b border-coral text-[12px] font-[700] uppercase tracking-[0.14em] text-beige transition-colors hover:text-coral focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral motion-reduce:transition-none"
              >
                {t('contactAction')} · {tFooter('email')}
              </a>
            </div>
          </section>

          <div
            data-story-focus-target
            data-story-rail="true"
            className={staticMode ? 'w-full' : 'h-full w-screen shrink-0'}
          >
            <NextProjectRail
              projects={successors}
              railPosition={railPosition}
              staticMode={staticMode}
              onSelectIndex={scrollToRailIndex}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
