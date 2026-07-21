'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import Image, { getImageProps } from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { localizeProject, projects } from '@/data/projects';
import {
  curateHomepageProjects,
  getWrappedProjectIndex,
} from '@/data/homepage-projects';
import {
  STORY_DESKTOP_QUERY,
  getInitialReelScrollTop,
  getRecenteredReelScrollTop,
  getReelFrame,
  getReelSnapTop,
  getSwipeStep,
} from '@/lib/portfolio-motion';
import { acquireDocumentScrollLock } from '@/lib/document-scroll-lock';
import {
  appendOptimizedImagePreloads,
  shouldPrioritizeInitialProject,
} from '@/lib/image-preload';

const showcaseProjects = curateHomepageProjects(projects);
const PROJECT_IMAGE_SIZES = '(max-width: 991px) 100vw, 50vw';
const VIRTUAL_CYCLES = 100;
const SNAP_IDLE_MS = 500;
const SNAP_DURATION_MS = 800;
const DISCRETE_DURATION_SECONDS = 0.8;
const transitionEase = [0.76, 0, 0.24, 1] as const;

const discreteLeftVariants = {
  enter: (direction: number) => ({
    clipPath: direction > 0 ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)',
  }),
  center: { clipPath: 'inset(0 0 0 0)' },
  exit: (direction: number) => ({
    clipPath: direction > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)',
  }),
};

const discreteRightVariants = {
  enter: (direction: number) => ({
    clipPath: direction > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)',
  }),
  center: { clipPath: 'inset(0 0 0 0)' },
  exit: (direction: number) => ({
    clipPath: direction > 0 ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)',
  }),
};

type ShowcaseProject = (typeof showcaseProjects)[number];

function ProjectFolio({
  project,
  index,
  category,
}: {
  project: ShowcaseProject;
  index: number;
  category: string;
}) {
  return (
    <div className="grid h-full min-h-[126px] grid-cols-[minmax(0,1.35fr)_minmax(108px,0.65fr)] grid-rows-2 p-4 text-dark min-[992px]:min-h-[120px] min-[992px]:grid-cols-[1.25fr_0.75fr_1fr] min-[992px]:p-5">
      <div className="row-span-2 flex min-w-0 flex-col justify-between pr-4 min-[992px]:pr-5">
        <span className="text-[9px] font-[700] uppercase tracking-[0.14em] text-dark/55 min-[992px]:text-[10px]">
          kool studio
        </span>
        <div>
          <p className="text-balance text-[clamp(20px,2vw,30px)] font-[800] leading-[0.96] tracking-[-0.045em]">
            {project.title}
          </p>
          <p className="mt-1 text-[10px] font-[500] uppercase tracking-[0.08em] text-dark/65 min-[992px]:text-[11px]">
            {project.location}
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hidden items-center justify-center border-x border-dark/15 min-[992px]:row-span-2 min-[992px]:flex"
      >
        <div
          className="h-[44px] w-[108px] bg-dark/10"
          style={{
            maskImage: 'url(/logo.svg)',
            WebkitMaskImage: 'url(/logo.svg)',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
          }}
        />
      </div>

      <div className="flex items-start justify-between border-l border-dark/15 pl-4 min-[992px]:pl-5">
        <span className="text-[9px] font-[700] uppercase tracking-[0.1em] min-[992px]:text-[10px]">
          {category}
        </span>
        <span className="text-[9px] font-[600] tabular-nums text-dark/60 min-[992px]:text-[10px]">
          {project.year}
        </span>
      </div>

      <div className="flex items-end justify-between border-l border-dark/15 pl-4 min-[992px]:pl-5">
        <span className="text-[9px] font-[700] uppercase tracking-[0.12em] min-[992px]:text-[10px]">
          {String(index + 1).padStart(2, '0')} / {String(showcaseProjects.length).padStart(2, '0')}
        </span>
        <span aria-hidden="true" className="text-[20px] leading-none">
          ↗
        </span>
      </div>
    </div>
  );
}

function ProjectImage({
  project,
  side,
  priority,
}: {
  project: ShowcaseProject;
  side: 'left' | 'right';
  priority?: boolean;
}) {
  return (
    <Image
      src={side === 'left' ? project.leftImage : project.rightImage}
      alt=""
      fill
      priority={priority}
      className="object-cover"
      sizes={PROJECT_IMAGE_SIZES}
    />
  );
}

export default function ImageStrip() {
  const locale = useLocale();
  const t = useTranslations('home');
  const tProjects = useTranslations('projects');
  const localizedShowcaseProjects = useMemo(
    () =>
      showcaseProjects.map((project) => ({
        ...project,
        ...localizeProject(project, locale),
      })),
    [locale],
  );
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [isDesktop, setIsDesktop] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollFrame, setScrollFrame] = useState(() =>
    getReelFrame(0, 1, showcaseProjects.length),
  );
  const [discreteIndex, setDiscreteIndex] = useState(0);
  const [discreteDirection, setDiscreteDirection] = useState(1);
  const [settledIndex, setSettledIndex] = useState(0);
  const [isInitialPriorityRender, setIsInitialPriorityRender] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const initialPriorityActive = useRef(true);
  const discreteIndexRef = useRef(0);
  const discreteTransitionLocked = useRef(false);
  const discreteUnlockTimer = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const suppressProjectClick = useRef(false);
  const suppressProjectClickTimer = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const scrollStepCommand = useRef<(step: number) => void>(() => undefined);
  const cancelScrollAnimation = useRef<() => void>(() => undefined);
  const revealProgress = useMotionValue(0);
  const leftRevealClip = useTransform(
    revealProgress,
    (value) => `inset(0 0 ${(1 - value) * 100}% 0)`,
  );
  const rightRevealClip = useTransform(
    revealProgress,
    (value) => `inset(${(1 - value) * 100}% 0 0 0)`,
  );
  const currentFolioOpacity = useTransform(
    revealProgress,
    [0, 0.42, 0.58, 1],
    [1, 1, 0, 0],
  );
  const nextFolioOpacity = useTransform(
    revealProgress,
    [0, 0.42, 0.58, 1],
    [0, 0, 1, 1],
  );

  const isScrollMode = isDesktop && !shouldReduceMotion;
  const activeIndex = isScrollMode ? scrollFrame.activeIndex : discreteIndex;
  const previousScrollMode = useRef(isScrollMode);
  const activeProject = localizedShowcaseProjects[activeIndex];
  const currentProject = localizedShowcaseProjects[scrollFrame.currentIndex];
  const nextProject = localizedShowcaseProjects[scrollFrame.nextIndex];
  const prioritizeInitialPair = shouldPrioritizeInitialProject(
    isInitialPriorityRender,
    activeIndex,
  );

  useEffect(() => {
    const query = window.matchMedia(STORY_DESKTOP_QUERY);
    const update = () => {
      setIsDesktop(query.matches);
      setViewportHeight(window.innerHeight);
    };

    update();
    query.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      query.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useLayoutEffect(() => {
    if (!initialPriorityActive.current) return;

    initialPriorityActive.current = false;
    setIsInitialPriorityRender(false);
  }, []);

  useLayoutEffect(() => {
    const wasScrollMode = previousScrollMode.current;
    if (wasScrollMode === isScrollMode) return;

    if (wasScrollMode) {
      const index = scrollFrame.activeIndex;
      discreteIndexRef.current = index;
      setDiscreteIndex(index);
      setSettledIndex(index);
    } else {
      const index = discreteIndexRef.current;
      const height = viewportHeight || window.innerHeight;
      setScrollFrame(getReelFrame(index * height, height, showcaseProjects.length));
      setSettledIndex(index);
      revealProgress.set(0);
    }

    previousScrollMode.current = isScrollMode;
  }, [isScrollMode, revealProgress, scrollFrame.activeIndex, viewportHeight]);

  useEffect(() => {
    if (isScrollMode) return;

    const adjacentProjects = [-1, 1].map(
      (step) =>
        showcaseProjects[
          getWrappedProjectIndex(discreteIndex, step, showcaseProjects.length)
        ],
    );

    const preloads = adjacentProjects.flatMap((project) =>
      [project.leftImage, project.rightImage].map((source) => {
        const { src, srcSet, sizes } = getImageProps({
          src: source,
          alt: '',
          fill: true,
          sizes: PROJECT_IMAGE_SIZES,
        }).props;

        return { src, srcSet, sizes };
      }),
    );

    return appendOptimizedImagePreloads(
      preloads,
      () => document.createElement('link'),
      (link) => document.head.append(link),
    );
  }, [discreteIndex, isScrollMode]);

  const announceAfterTransition = useCallback(
    (index: number) => {
      if (settleTimer.current !== null) {
        window.clearTimeout(settleTimer.current);
      }

      if (shouldReduceMotion) {
        setSettledIndex(index);
        settleTimer.current = null;
        return;
      }

      settleTimer.current = window.setTimeout(() => {
        setSettledIndex(index);
        settleTimer.current = null;
      }, SNAP_DURATION_MS);
    },
    [shouldReduceMotion],
  );

  const changeDiscreteProject = useCallback(
    (step: number) => {
      if (!shouldReduceMotion && discreteTransitionLocked.current) return;

      if (!shouldReduceMotion) {
        discreteTransitionLocked.current = true;
        if (discreteUnlockTimer.current !== null) {
          window.clearTimeout(discreteUnlockTimer.current);
        }
        discreteUnlockTimer.current = window.setTimeout(() => {
          discreteTransitionLocked.current = false;
          discreteUnlockTimer.current = null;
        }, SNAP_DURATION_MS);
      }

      const next = getWrappedProjectIndex(
        discreteIndexRef.current,
        step,
        showcaseProjects.length,
      );
      discreteIndexRef.current = next;
      setDiscreteDirection(step < 0 ? -1 : 1);
      setDiscreteIndex(next);
      announceAfterTransition(next);
    },
    [announceAfterTransition, shouldReduceMotion],
  );

  useEffect(() => {
    return () => {
      if (settleTimer.current !== null) {
        window.clearTimeout(settleTimer.current);
      }
      if (discreteUnlockTimer.current !== null) {
        window.clearTimeout(discreteUnlockTimer.current);
      }
      if (suppressProjectClickTimer.current !== null) {
        window.clearTimeout(suppressProjectClickTimer.current);
      }
      discreteTransitionLocked.current = false;
      suppressProjectClick.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isScrollMode) return;

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const previousRestoration = window.history.scrollRestoration;
    let viewportHeight = window.innerHeight;
    let scrollFrameRequest = 0;
    let snapTimerId = 0;
    let animationFrameId = 0;
    let animating = false;

    root.style.scrollBehavior = 'auto';
    window.history.scrollRestoration = 'manual';

    const updateFromTop = (top: number) => {
      const nextFrame = getReelFrame(top, viewportHeight, showcaseProjects.length);
      revealProgress.set(nextFrame.progress);
      setScrollFrame((current) =>
        current.currentIndex === nextFrame.currentIndex &&
        current.nextIndex === nextFrame.nextIndex &&
        current.activeIndex === nextFrame.activeIndex
          ? current
          : nextFrame,
      );
      return nextFrame;
    };

    const clearSnapTimer = () => {
      if (snapTimerId !== 0) {
        window.clearTimeout(snapTimerId);
        snapTimerId = 0;
      }
    };

    const stopAnimation = () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
      animating = false;
    };

    const finishAt = (top: number) => {
      window.scrollTo(0, top);
      const finalFrame = updateFromTop(top);
      setSettledIndex(finalFrame.activeIndex);
      animating = false;
      animationFrameId = 0;
    };

    const animateTo = (targetTop: number) => {
      clearSnapTimer();
      stopAnimation();

      const startTop = window.scrollY;
      const distance = targetTop - startTop;
      if (Math.abs(distance) < 0.5) {
        finishAt(targetTop);
        return;
      }

      const startedAt = performance.now();
      animating = true;

      const tick = (now: number) => {
        const elapsed = Math.min((now - startedAt) / SNAP_DURATION_MS, 1);
        const eased = 1 - (1 - elapsed) ** 2;
        window.scrollTo(0, startTop + distance * eased);

        if (elapsed < 1) {
          animationFrameId = window.requestAnimationFrame(tick);
        } else {
          finishAt(targetTop);
        }
      };

      animationFrameId = window.requestAnimationFrame(tick);
    };

    const scheduleSnap = () => {
      clearSnapTimer();
      if (animating) return;
      snapTimerId = window.setTimeout(() => {
        snapTimerId = 0;
        animateTo(getReelSnapTop(window.scrollY, viewportHeight));
      }, SNAP_IDLE_MS);
    };

    const readScroll = () => {
      scrollFrameRequest = 0;
      let top = window.scrollY;
      const recentered = getRecenteredReelScrollTop(
        top,
        viewportHeight,
        showcaseProjects.length,
      );

      if (Math.abs(recentered - top) > 0.5) {
        top = recentered;
        window.scrollTo(0, top);
      }

      updateFromTop(top);
      if (!animating) scheduleSnap();
    };

    const handleScroll = () => {
      if (scrollFrameRequest === 0) {
        scrollFrameRequest = window.requestAnimationFrame(readScroll);
      }
    };

    const cancelForInput = () => {
      clearSnapTimer();
      stopAnimation();
    };

    const handleResize = () => {
      const oldFrame = getReelFrame(
        window.scrollY,
        viewportHeight,
        showcaseProjects.length,
      );
      viewportHeight = window.innerHeight;
      const top =
        (50 * showcaseProjects.length + oldFrame.currentIndex + oldFrame.progress) *
        viewportHeight;
      cancelForInput();
      window.scrollTo(0, top);
      updateFromTop(top);
    };

    scrollStepCommand.current = (step: number) => {
      cancelForInput();
      const currentSnap = getReelSnapTop(window.scrollY, viewportHeight);
      animateTo(currentSnap + step * viewportHeight);
    };
    cancelScrollAnimation.current = cancelForInput;

    const initialTop = getInitialReelScrollTop(
      viewportHeight,
      showcaseProjects.length,
    ) + discreteIndexRef.current * viewportHeight;
    window.scrollTo(0, initialTop);
    updateFromTop(initialTop);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', cancelForInput, { passive: true });
    window.addEventListener('pointerdown', cancelForInput, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      clearSnapTimer();
      stopAnimation();
      if (scrollFrameRequest !== 0) {
        window.cancelAnimationFrame(scrollFrameRequest);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', cancelForInput);
      window.removeEventListener('pointerdown', cancelForInput);
      window.removeEventListener('resize', handleResize);
      root.style.scrollBehavior = previousScrollBehavior;
      window.history.scrollRestoration = previousRestoration;
      scrollStepCommand.current = () => undefined;
      cancelScrollAnimation.current = () => undefined;
    };
  }, [isScrollMode, revealProgress]);

  useEffect(() => {
    if (isScrollMode) return;

    const releaseScrollLock = acquireDocumentScrollLock();
    const stage = stageRef.current;
    let wheelLocked = false;
    let wheelUnlockTimer = 0;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (wheelUnlockTimer !== 0) {
        window.clearTimeout(wheelUnlockTimer);
      }
      wheelUnlockTimer = window.setTimeout(() => {
        wheelLocked = false;
        wheelUnlockTimer = 0;
      }, shouldReduceMotion ? 250 : SNAP_DURATION_MS);

      if (wheelLocked || Math.abs(event.deltaY) < 2) return;

      wheelLocked = true;
      changeDiscreteProject(event.deltaY > 0 ? 1 : -1);
    };

    stage?.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      stage?.removeEventListener('wheel', handleWheel);
      if (wheelUnlockTimer !== 0) window.clearTimeout(wheelUnlockTimer);
      releaseScrollLock();
    };
  }, [changeDiscreteProject, isScrollMode, shouldReduceMotion]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (isScrollMode) {
      cancelScrollAnimation.current();
    }

    let step = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') step = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') step = 1;
    if (step === 0) return;

    event.preventDefault();
    if (isScrollMode) {
      scrollStepCommand.current(step);
    } else {
      changeDiscreteProject(step);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (isScrollMode || !event.isPrimary) return;
    pointerStartY.current = event.clientY;
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const startY = pointerStartY.current;
    pointerStartY.current = null;
    if (isScrollMode || startY === null) return;

    const step = getSwipeStep(startY - event.clientY);
    if (step === 0) return;

    event.preventDefault();
    event.stopPropagation();
    suppressProjectClick.current = true;
    if (suppressProjectClickTimer.current !== null) {
      window.clearTimeout(suppressProjectClickTimer.current);
    }
    suppressProjectClickTimer.current = window.setTimeout(() => {
      suppressProjectClick.current = false;
      suppressProjectClickTimer.current = null;
    }, 0);
    changeDiscreteProject(step);
  };

  const discreteTransition = {
    duration: shouldReduceMotion ? 0 : DISCRETE_DURATION_SECONDS,
    ease: transitionEase,
  };

  return (
    <section
      className="relative bg-dark"
      style={{
        height: isScrollMode
          ? VIRTUAL_CYCLES * showcaseProjects.length * viewportHeight
          : '100svh',
      }}
      aria-label={t('showcaseLabel')}
      aria-roledescription="project reel"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStartY.current = null;
      }}
    >
      <div
        ref={stageRef}
        className="fixed inset-0 h-[100svh] overflow-hidden bg-dark outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-beige"
        style={{ touchAction: isScrollMode ? 'auto' : 'pan-x pinch-zoom' }}
        onKeyDown={handleKeyDown}
      >
        <div className="flex h-full flex-col min-[992px]:flex-row">
          <div className="relative h-1/2 w-full overflow-hidden border-b border-beige/70 min-[992px]:h-full min-[992px]:w-1/2 min-[992px]:border-r min-[992px]:border-b-0">
            {isScrollMode ? (
              <>
                <div className="absolute inset-0">
                  <ProjectImage
                    project={currentProject}
                    side="left"
                    priority={prioritizeInitialPair && scrollFrame.currentIndex === 0}
                  />
                </div>
                <motion.div className="absolute inset-0" style={{ clipPath: leftRevealClip }}>
                  <ProjectImage project={nextProject} side="left" />
                </motion.div>
              </>
            ) : (
              <AnimatePresence initial={false} custom={discreteDirection}>
                <motion.div
                  key={`${activeProject.slug}-left`}
                  className="absolute inset-0"
                  custom={discreteDirection}
                  variants={discreteLeftVariants}
                  initial={shouldReduceMotion ? false : 'enter'}
                  animate="center"
                  exit={shouldReduceMotion ? undefined : 'exit'}
                  transition={discreteTransition}
                >
                  <ProjectImage
                    project={activeProject}
                    side="left"
                    priority={prioritizeInitialPair}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <div className="relative h-1/2 w-full overflow-hidden min-[992px]:h-full min-[992px]:w-1/2">
            {isScrollMode ? (
              <>
                <div className="absolute inset-0">
                  <ProjectImage
                    project={currentProject}
                    side="right"
                    priority={prioritizeInitialPair && scrollFrame.currentIndex === 0}
                  />
                </div>
                <motion.div className="absolute inset-0" style={{ clipPath: rightRevealClip }}>
                  <ProjectImage project={nextProject} side="right" />
                </motion.div>
              </>
            ) : (
              <AnimatePresence initial={false} custom={discreteDirection}>
                <motion.div
                  key={`${activeProject.slug}-right`}
                  className="absolute inset-0"
                  custom={discreteDirection}
                  variants={discreteRightVariants}
                  initial={shouldReduceMotion ? false : 'enter'}
                  animate="center"
                  exit={shouldReduceMotion ? undefined : 'exit'}
                  transition={discreteTransition}
                >
                  <ProjectImage
                    project={activeProject}
                    side="right"
                    priority={prioritizeInitialPair}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-[0.12] mix-blend-soft-light"
        >
          <filter id="homepage-reel-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#homepage-reel-grain)" />
        </svg>
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-dark/25 via-transparent to-dark/25" />

        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-5">
          <Link
            href={`/projekty/${activeProject.slug}`}
            className="group pointer-events-auto relative block w-full overflow-hidden bg-beige outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-[992px]:w-[37.5vw] min-[992px]:min-w-[520px] min-[992px]:max-w-[640px]"
            aria-label={`${t('openProject')}: ${activeProject.title}, ${activeProject.location}`}
            onClick={(event) => {
              if (!suppressProjectClick.current) return;

              suppressProjectClick.current = false;
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {isScrollMode ? (
              <>
                <motion.div aria-hidden="true" style={{ opacity: currentFolioOpacity }}>
                  <ProjectFolio
                    project={currentProject}
                    index={scrollFrame.currentIndex}
                    category={tProjects(currentProject.category)}
                  />
                </motion.div>
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 bg-beige"
                  style={{ opacity: nextFolioOpacity }}
                >
                  <ProjectFolio
                    project={nextProject}
                    index={scrollFrame.nextIndex}
                    category={tProjects(nextProject.category)}
                  />
                </motion.div>
              </>
            ) : (
              <div aria-hidden="true">
                <ProjectFolio
                  project={activeProject}
                  index={activeIndex}
                  category={tProjects(activeProject.category)}
                />
              </div>
            )}
            <span className="sr-only">
              {activeProject.title}, {activeProject.location}, {activeIndex + 1} / {showcaseProjects.length}
            </span>
          </Link>
        </div>

        <p className="pointer-events-none absolute bottom-12 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap bg-dark/45 px-2 py-1 text-center text-[9px] font-[600] uppercase tracking-[0.14em] text-beige backdrop-blur-sm">
          {isDesktop ? t('scrollHint') : t('swipeHint')}
        </p>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {localizedShowcaseProjects[settledIndex].title},{' '}
          {localizedShowcaseProjects[settledIndex].location},{' '}
          {settledIndex + 1} / {showcaseProjects.length}
        </p>
      </div>
    </section>
  );
}
