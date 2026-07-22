'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { motion } from 'framer-motion';
import Image, { getImageProps } from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { localizeProject, projects } from '@/data/projects';
import {
  curateHomepageProjects,
  getProjectWindowIndices,
  getWrappedProjectIndex,
} from '@/data/homepage-projects';
import {
  accumulateHorizontalWheel,
  getHorizontalSwipeStep,
  normalizeWheelDelta,
} from '@/lib/hero-reel';
import {
  appendOptimizedImagePreloads,
  shouldPrioritizeInitialProject,
} from '@/lib/image-preload';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const curatedProjects = curateHomepageProjects(projects);
const PROJECT_IMAGE_SIZES = '(max-width: 991px) 100vw, 50vw';
const TRANSITION_SECONDS = 0.8;
const TRANSITION_MS = TRANSITION_SECONDS * 1000;
const AUTO_ADVANCE_MS = 5000;
const transitionEase = [0.76, 0, 0.24, 1] as const;

/* Advancing sweeps the incoming left pane top-down and the incoming right
   pane bottom-up over the static outgoing pair — the panes shear past each
   other vertically even though navigation input is horizontal. */
/* All-percentage inset tokens: framer-motion can only interpolate complex
   strings whose numeric tokens match type-for-type, so '0' and '0%' must not
   be mixed between the start and end poses. */
const REVEALED_CLIP = 'inset(0% 0% 0% 0%)';
const leftEnterClip = (direction: number) =>
  direction > 0 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)';
const rightEnterClip = (direction: number) =>
  direction > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)';

type ShowcaseProject = (typeof curatedProjects)[number];

type ReelState = {
  active: number;
  previous: number | null;
  direction: number;
};

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

function ProjectImage({
  project,
  priority,
}: {
  project: ShowcaseProject;
  priority?: boolean;
}) {
  return (
    <Image
      src={project.heroImage}
      alt=""
      fill
      priority={priority}
      draggable={false}
      className="object-cover"
      sizes={PROJECT_IMAGE_SIZES}
    />
  );
}

function ProjectPane({
  project,
  side,
  priority,
  category,
  openProjectLabel,
  onProjectClick,
}: {
  project: ShowcaseProject;
  side: 'left' | 'right';
  priority: boolean;
  category: string;
  openProjectLabel: string;
  onProjectClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const desktopPosition =
    side === 'left' ? 'min-[992px]:right-0' : 'min-[992px]:left-0';

  return (
    <Link
      href={`/projekty/${project.slug}`}
      className="group absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral"
      aria-label={`${openProjectLabel}: ${project.title}, ${project.location}`}
      data-hero-pane={side}
      draggable={false}
      onClick={onProjectClick}
    >
      <ProjectImage project={project} priority={priority} />
      <div
        className={`pointer-events-none absolute inset-x-4 bottom-1/3 h-[96px] translate-y-1/2 overflow-hidden bg-beige/75 opacity-100 backdrop-blur-md transition-opacity duration-300 min-[992px]:inset-x-auto min-[992px]:h-[80px] min-[992px]:w-[min(560px,calc(100%-32px))] min-[992px]:opacity-0 min-[992px]:group-hover:opacity-100 min-[992px]:group-focus-within:opacity-100 ${desktopPosition}`}
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
  const total = showcaseProjects.length;

  const [reel, setReel] = useState<ReelState>({
    active: 0,
    previous: null,
    direction: 1,
  });
  const [settledIndex, setSettledIndex] = useState(0);
  const [isInitialPriorityRender, setIsInitialPriorityRender] = useState(true);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isPageHidden, setIsPageHidden] = useState(false);

  const stageRef = useRef<HTMLElement>(null);
  const initialPriorityActive = useRef(true);
  const activeIndexRef = useRef(0);
  const transitionLocked = useRef(false);
  const queuedProjectStep = useRef(0);
  const changeProjectRef = useRef<(step: number) => void>(() => {});
  const transitionUnlockTimer = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const pendingFocusSide = useRef<'left' | 'right' | null>(null);
  const suppressProjectClick = useRef(false);
  const suppressProjectClickTimer = useRef<number | null>(null);

  const [leftIndex, rightIndex] = getProjectWindowIndices(reel.active, total);
  const leftProject = localizedProjects[leftIndex];
  const rightProject = localizedProjects[rightIndex];
  const previousWindow =
    reel.previous === null
      ? null
      : getProjectWindowIndices(reel.previous, total);
  const previousLeftProject = previousWindow
    ? localizedProjects[previousWindow[0]]
    : null;
  const previousRightProject = previousWindow
    ? localizedProjects[previousWindow[1]]
    : null;
  const prioritizeInitialWindow = shouldPrioritizeInitialProject(
    isInitialPriorityRender,
    reel.active,
  );

  useLayoutEffect(() => {
    if (!initialPriorityActive.current) return;

    initialPriorityActive.current = false;
    setIsInitialPriorityRender(false);
  }, []);

  const announceAfterTransition = useCallback(
    (index: number) => {
      if (settleTimer.current !== null) {
        window.clearTimeout(settleTimer.current);
      }

      if (reduceMotion) {
        setSettledIndex(index);
        settleTimer.current = null;
        return;
      }

      settleTimer.current = window.setTimeout(() => {
        setSettledIndex(index);
        settleTimer.current = null;
      }, TRANSITION_MS);
    },
    [reduceMotion],
  );

  const changeProject = useCallback(
    (step: number) => {
      if (!reduceMotion && transitionLocked.current) {
        queuedProjectStep.current = step < 0 ? -1 : 1;
        return;
      }

      if (!reduceMotion) {
        transitionLocked.current = true;
        if (transitionUnlockTimer.current !== null) {
          window.clearTimeout(transitionUnlockTimer.current);
        }
        transitionUnlockTimer.current = window.setTimeout(() => {
          transitionLocked.current = false;
          transitionUnlockTimer.current = null;
          const queuedStep = queuedProjectStep.current;
          queuedProjectStep.current = 0;
          if (queuedStep !== 0) changeProjectRef.current(queuedStep);
        }, TRANSITION_MS);
      }

      const current = activeIndexRef.current;
      const next = getWrappedProjectIndex(current, step, total);
      activeIndexRef.current = next;
      setReel({
        active: next,
        previous: reduceMotion ? null : current,
        direction: step < 0 ? -1 : 1,
      });
      announceAfterTransition(next);
    },
    [announceAfterTransition, reduceMotion, total],
  );

  useLayoutEffect(() => {
    changeProjectRef.current = changeProject;
  }, [changeProject]);

  useLayoutEffect(() => {
    const side = pendingFocusSide.current;
    if (!side) return;

    const pane = stageRef.current?.querySelector<HTMLAnchorElement>(
      `[data-hero-pane="${side}"]`,
    );
    if (!pane) return;

    pendingFocusSide.current = null;
    setIsFocusPaused(true);
    pane.focus({ preventScroll: true });
  }, [reel.active]);

  /* Drop the covered outgoing pair once the incoming sweep has finished. */
  const releasePreviousPair = useCallback(() => {
    setReel((current) =>
      current.previous === null ? current : { ...current, previous: null },
    );
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimer.current !== null) {
        window.clearTimeout(settleTimer.current);
      }
      if (transitionUnlockTimer.current !== null) {
        window.clearTimeout(transitionUnlockTimer.current);
      }
      if (suppressProjectClickTimer.current !== null) {
        window.clearTimeout(suppressProjectClickTimer.current);
      }
      transitionLocked.current = false;
      queuedProjectStep.current = 0;
      suppressProjectClick.current = false;
    };
  }, []);

  /* Auto-advance pauses for keyboard focus, off-screen stages, hidden tabs,
     and reduced motion. Hover remains purely visual so a resting pointer over
     either full-screen pane never stalls the reel. */
  useEffect(() => {
    if (reduceMotion || isFocusPaused || !isInView || isPageHidden) {
      return;
    }

    const timer = window.setTimeout(() => {
      changeProject(1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    reel.active,
    changeProject,
    isFocusPaused,
    isInView,
    isPageHidden,
    reduceMotion,
  ]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setIsPageHidden(document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  /* Horizontal trackpad/wheel gestures drive the reel; vertical deltas are
     left alone so the page scrolls normally. Non-passive so deliberate
     horizontal swipes can't trigger browser history navigation. The unlock
     timer resets on every horizontal event, so one continuous gesture with
     momentum advances exactly one project. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let wheelLocked = false;
    let wheelUnlockTimer = 0;
    let accumulatedDeltaX = 0;

    const handleWheel = (event: WheelEvent) => {
      /* Mice map horizontal scrolling to shift+wheel, which browsers report
         through deltaY — treat that as the horizontal axis. */
      const normalizedDeltaX = normalizeWheelDelta(
        event.deltaX,
        event.deltaMode,
        window.innerHeight,
      );
      const normalizedDeltaY = normalizeWheelDelta(
        event.deltaY,
        event.deltaMode,
        window.innerHeight,
      );
      const deltaX =
        event.shiftKey && Math.abs(normalizedDeltaY) > Math.abs(normalizedDeltaX)
          ? normalizedDeltaY
          : normalizedDeltaX;
      const deltaY = event.shiftKey ? 0 : normalizedDeltaY;
      const gesture = accumulateHorizontalWheel(accumulatedDeltaX, deltaX, deltaY);
      accumulatedDeltaX = gesture.deltaX;
      if (!gesture.handled) return;

      event.preventDefault();

      if (wheelUnlockTimer !== 0) {
        window.clearTimeout(wheelUnlockTimer);
      }
      wheelUnlockTimer = window.setTimeout(() => {
        wheelLocked = false;
        accumulatedDeltaX = 0;
        wheelUnlockTimer = 0;
      }, 180);

      if (wheelLocked || gesture.step === 0) return;

      wheelLocked = true;
      changeProject(gesture.step);
    };

    stage.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      stage.removeEventListener('wheel', handleWheel);
      if (wheelUnlockTimer !== 0) window.clearTimeout(wheelUnlockTimer);
    };
  }, [changeProject, reduceMotion]);

  /* The current window already loads active and active+1. Preload the two
     images that could enter next so either navigation direction is instant. */
  useEffect(() => {
    const adjacentProjects = [-1, 2].map(
      (step) => showcaseProjects[getWrappedProjectIndex(reel.active, step, total)],
    );

    const preloads = adjacentProjects.map((project) => {
      const { src, srcSet, sizes } = getImageProps({
        src: project.heroImage,
        alt: '',
        fill: true,
        sizes: PROJECT_IMAGE_SIZES,
      }).props;

      return { src, srcSet, sizes };
    });

    return appendOptimizedImagePreloads(
      preloads,
      () => document.createElement('link'),
      (link) => document.head.append(link),
    );
  }, [reel.active, showcaseProjects, total]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    let step = 0;
    if (event.key === 'ArrowLeft') step = -1;
    if (event.key === 'ArrowRight') step = 1;
    if (step === 0) return;

    event.preventDefault();
    const focusedPane = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-hero-pane]',
    );
    const side = focusedPane?.dataset.heroPane;
    if (side === 'left' || side === 'right') {
      pendingFocusSide.current = side;
    }
    changeProject(step);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!event.isPrimary) return;
    pendingFocusSide.current = null;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const start = pointerStart.current;
    if (!event.isPrimary || start === null) return;

    const deltaX = start.x - event.clientX;
    const deltaY = start.y - event.clientY;
    if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 8) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const start = pointerStart.current;
    pointerStart.current = null;
    if (start === null) return;

    const step = getHorizontalSwipeStep(
      start.x - event.clientX,
      start.y - event.clientY,
    );
    if (step === 0) return;

    event.preventDefault();
    suppressProjectClick.current = true;
    if (suppressProjectClickTimer.current !== null) {
      window.clearTimeout(suppressProjectClickTimer.current);
    }
    suppressProjectClickTimer.current = window.setTimeout(() => {
      suppressProjectClick.current = false;
      suppressProjectClickTimer.current = null;
    }, 400);
    changeProject(step);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerStart.current = null;
  };

  const handleProjectClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!suppressProjectClick.current) return;

    suppressProjectClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsFocusPaused(false);
  };

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    setIsFocusPaused((event.target as HTMLElement).matches(':focus-visible'));
  };

  const paneTransition = {
    duration: reduceMotion ? 0 : TRANSITION_SECONDS,
    ease: transitionEase,
  };
  const isSweeping = previousWindow !== null;

  return (
    <section
      ref={stageRef}
      className="relative isolate h-svh cursor-grab overflow-hidden bg-dark active:cursor-grabbing"
      style={{ touchAction: 'pan-y pinch-zoom', overscrollBehaviorX: 'none' }}
      aria-label={t('showcaseLabel')}
      aria-roledescription={t('showcaseRole')}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className="flex h-full flex-col min-[992px]:flex-row">
        <div className="relative h-full w-full overflow-hidden min-[992px]:w-1/2 min-[992px]:border-r min-[992px]:border-beige/70">
          {previousLeftProject && (
            <div className="absolute inset-0">
              <ProjectImage project={previousLeftProject} />
            </div>
          )}
          <motion.div
            key={`${leftProject.slug}-left`}
            className="absolute inset-0"
            initial={
              isSweeping ? { clipPath: leftEnterClip(reel.direction) } : false
            }
            animate={{ clipPath: REVEALED_CLIP }}
            transition={paneTransition}
            onAnimationComplete={releasePreviousPair}
          >
            <ProjectPane
              project={leftProject}
              side="left"
              priority={prioritizeInitialWindow}
              category={tProjects(leftProject.category)}
              openProjectLabel={t('openProject')}
              onProjectClick={handleProjectClick}
            />
          </motion.div>
        </div>

        <div className="hidden w-full overflow-hidden min-[992px]:relative min-[992px]:block min-[992px]:h-full min-[992px]:w-1/2">
          {previousRightProject && (
            <div className="absolute inset-0">
              <ProjectImage project={previousRightProject} />
            </div>
          )}
          <motion.div
            key={`${rightProject.slug}-right`}
            className="absolute inset-0"
            initial={
              isSweeping ? { clipPath: rightEnterClip(reel.direction) } : false
            }
            animate={{ clipPath: REVEALED_CLIP }}
            transition={paneTransition}
            onAnimationComplete={releasePreviousPair}
          >
            <ProjectPane
              project={rightProject}
              side="right"
              priority={prioritizeInitialWindow}
              category={tProjects(rightProject.category)}
              openProjectLabel={t('openProject')}
              onProjectClick={handleProjectClick}
            />
          </motion.div>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap bg-dark/45 px-2 py-1 text-center text-[9px] font-[600] uppercase tracking-[0.14em] text-beige backdrop-blur-sm min-[992px]:bottom-[calc(4rem+env(safe-area-inset-bottom))] min-[992px]:block">
        {t('scrollHint')}
      </p>
      <p className="pointer-events-none absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap bg-dark/45 px-2 py-1 text-center text-[9px] font-[600] uppercase tracking-[0.14em] text-beige backdrop-blur-sm min-[992px]:bottom-[calc(4rem+env(safe-area-inset-bottom))] min-[992px]:hidden">
        {t('swipeHint')}
      </p>

      <p
        className="sr-only min-[992px]:hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        {localizedProjects[settledIndex].title},{' '}
        {localizedProjects[settledIndex].location}
      </p>
      <p
        className="sr-only hidden min-[992px]:block"
        aria-live="polite"
        aria-atomic="true"
      >
        {localizedProjects[settledIndex].title},{' '}
        {localizedProjects[settledIndex].location};{' '}
        {
          localizedProjects[
            getWrappedProjectIndex(settledIndex, 1, total)
          ].title
        }
        ,{' '}
        {
          localizedProjects[
            getWrappedProjectIndex(settledIndex, 1, total)
          ].location
        }
      </p>
    </section>
  );
}
