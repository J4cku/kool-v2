import type { Project, ProjectFilter } from '../data/projects.js';

export const STORY_DESKTOP_QUERY = '(min-width: 992px)';

export type ArchiveFilter = ProjectFilter;

type ReelFrame = {
  currentIndex: number;
  nextIndex: number;
  activeIndex: number;
  progress: number;
};

export type StoryMedia =
  | {
      kind: 'image';
      src: string;
      displayIndex: number;
      fullWidth: boolean;
      portrait: boolean;
      small: boolean;
    }
  | {
      kind: 'reel';
      src: string;
      displayIndex: number;
      aspect?: string;
    }
  | {
      kind: 'comparison';
      beforeSrc: string;
      afterSrc: string;
      displayIndex: number;
      labels?: [string, string];
      aspect?: string;
      source: 'slider' | 'contained';
    };

type PendingMedia =
  | { kind: 'image'; src: string }
  | { kind: 'reel'; src: string; aspect?: string }
  | {
      kind: 'comparison';
      beforeSrc: string;
      afterSrc: string;
      labels?: [string, string];
      aspect?: string;
      source: 'slider';
    };

export type ProjectSuccessor = Pick<
  Project,
  'slug' | 'title' | 'location' | 'category' | 'year' | 'thumbnail'
>;

function assertFinite(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite`);
  }
}

export function clampArchiveIntroProgress(progress: number) {
  assertFinite(progress, 'progress');
  return Math.min(Math.max(progress, 0), 1);
}

export function shouldShowArchiveIntro(
  activeFilter: ArchiveFilter,
  hasNonDefaultFilterQuery: boolean,
  reducedMotion: boolean,
) {
  return activeFilter === 'wszystkie'
    && !hasNonDefaultFilterQuery
    && !reducedMotion;
}

export function shouldShowRouteCurtains(
  previousPathname: string | null,
  pathname: string,
  reducedMotion: boolean,
) {
  return previousPathname !== null
    && previousPathname !== pathname
    && !reducedMotion;
}

function assertPositive(value: number, name: string) {
  assertFinite(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be positive`);
  }
}

function assertPositiveInteger(value: number, name: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

function assertNonNegative(value: number, name: string) {
  assertFinite(value, name);
  if (value < 0) {
    throw new RangeError(`${name} must be non-negative`);
  }
}

function assertNonNegativeInteger(value: number, name: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export function getReelFrame(
  scrollTop: number,
  viewportHeight: number,
  projectCount: number,
): ReelFrame {
  assertFinite(scrollTop, 'scrollTop');
  assertPositive(viewportHeight, 'viewportHeight');
  assertPositiveInteger(projectCount, 'projectCount');

  const projectPosition = scrollTop / viewportHeight;
  const wholePosition = Math.floor(projectPosition);
  const progress = projectPosition - wholePosition;
  const currentIndex = positiveModulo(wholePosition, projectCount);
  const nextIndex = (currentIndex + 1) % projectCount;

  return {
    currentIndex,
    nextIndex,
    activeIndex: progress >= 0.5 ? nextIndex : currentIndex,
    progress,
  };
}

export function getRailFrame(position: number, projectCount: number): ReelFrame {
  assertFinite(position, 'position');
  assertPositiveInteger(projectCount, 'projectCount');

  const clampedPosition = Math.min(Math.max(position, 0), projectCount - 1);
  const currentIndex = Math.floor(clampedPosition);
  const nextIndex = Math.min(currentIndex + 1, projectCount - 1);
  const progress = clampedPosition - currentIndex;

  return {
    currentIndex,
    nextIndex,
    activeIndex: progress >= 0.5 ? nextIndex : currentIndex,
    progress,
  };
}

export function clampRailIndex(
  index: number,
  delta: number,
  projectCount: number,
) {
  assertFinite(index, 'index');
  assertFinite(delta, 'delta');
  assertPositiveInteger(projectCount, 'projectCount');

  return Math.min(Math.max(index + delta, 0), projectCount - 1);
}

export function getReelSnapTop(scrollTop: number, viewportHeight: number) {
  assertFinite(scrollTop, 'scrollTop');
  assertPositive(viewportHeight, 'viewportHeight');

  return Math.floor(scrollTop / viewportHeight + 0.5) * viewportHeight;
}

export function getInitialReelScrollTop(
  viewportHeight: number,
  projectCount: number,
  centerCycle = 50,
) {
  assertPositive(viewportHeight, 'viewportHeight');
  assertPositiveInteger(projectCount, 'projectCount');
  assertNonNegativeInteger(centerCycle, 'centerCycle');

  return centerCycle * projectCount * viewportHeight;
}

export function getRecenteredReelScrollTop(
  scrollTop: number,
  viewportHeight: number,
  projectCount: number,
) {
  assertFinite(scrollTop, 'scrollTop');
  assertPositive(viewportHeight, 'viewportHeight');
  assertPositiveInteger(projectCount, 'projectCount');

  const cycleDistance = projectCount * viewportHeight;
  const cyclePosition = scrollTop / cycleDistance;

  if (cyclePosition >= 10 && cyclePosition <= 90) {
    return scrollTop;
  }

  const projectPosition = scrollTop / viewportHeight;
  const positionWithinCycle = positiveModulo(projectPosition, projectCount);

  return (50 * projectCount + positionWithinCycle) * viewportHeight;
}

export function getSwipeStep(delta: number, threshold = 30) {
  assertFinite(delta, 'delta');
  assertPositive(threshold, 'threshold');

  if (delta >= threshold) return 1;
  if (delta <= -threshold) return -1;
  return 0;
}

export function buildProjectStoryMedia(project: Project): StoryMedia[] {
  const pending: PendingMedia[] = project.images
    .slice(1)
    .map((src) => ({ kind: 'image', src }));

  const insertions: { index: number; media: PendingMedia }[] = [];

  if (project.reel) {
    insertions.push({
      index: project.reel.index,
      media: {
        kind: 'reel',
        src: project.reel.src,
        ...(project.reel.aspect ? { aspect: project.reel.aspect } : {}),
      },
    });
  }

  const sliders = project.slider
    ? Array.isArray(project.slider)
      ? project.slider
      : [project.slider]
    : [];

  for (const slider of sliders) {
    insertions.push({
      index: slider.index,
      media: {
        kind: 'comparison',
        beforeSrc: slider.beforeSrc,
        afterSrc: slider.afterSrc,
        ...(slider.labels ? { labels: slider.labels } : {}),
        ...(slider.aspect ? { aspect: slider.aspect } : {}),
        source: 'slider',
      },
    });
  }

  insertions.sort((left, right) => left.index - right.index);

  for (const insertion of insertions) {
    const zeroBasedIndex = Math.min(
      Math.max(insertion.index - 1, 0),
      pending.length,
    );
    pending.splice(zeroBasedIndex, 0, insertion.media);
  }

  const fullWidthIndices = new Set(project.fullWidthIndices ?? []);
  const portraitIndices = new Set(project.portraitIndices ?? []);
  const smallIndices = new Set(project.smallIndices ?? []);
  const containedStarts = new Map(
    (project.containedPairs ?? []).map((pair) => [pair.indices[0], pair]),
  );
  const consumedContainedIndices = new Set<number>();
  const media: StoryMedia[] = [];

  for (let pendingIndex = 0; pendingIndex < pending.length; pendingIndex += 1) {
    const displayIndex = pendingIndex + 1;

    if (consumedContainedIndices.has(displayIndex)) continue;

    const item = pending[pendingIndex];
    const containedPair = containedStarts.get(displayIndex);

    if (containedPair) {
      const afterDisplayIndex = containedPair.indices[1];
      const afterItem = pending[afterDisplayIndex - 1];

      if (item.kind === 'image' && afterItem?.kind === 'image') {
        consumedContainedIndices.add(afterDisplayIndex);
        media.push({
          kind: 'comparison',
          beforeSrc: item.src,
          afterSrc: afterItem.src,
          displayIndex,
          ...(containedPair.labels ? { labels: containedPair.labels } : {}),
          ...(containedPair.aspect ? { aspect: containedPair.aspect } : {}),
          source: 'contained',
        });
        continue;
      }
    }

    if (item.kind === 'image') {
      media.push({
        kind: 'image',
        src: item.src,
        displayIndex,
        fullWidth: fullWidthIndices.has(displayIndex),
        portrait: portraitIndices.has(displayIndex),
        small: smallIndices.has(displayIndex),
      });
      continue;
    }

    if (item.kind === 'reel') {
      media.push({
        kind: 'reel',
        src: item.src,
        displayIndex,
        ...(item.aspect ? { aspect: item.aspect } : {}),
      });
      continue;
    }

    media.push({ ...item, displayIndex });
  }

  return media;
}

export function getProjectSuccessors(
  projects: readonly Project[],
  currentSlug: string,
): ProjectSuccessor[] {
  const currentIndex = projects.findIndex((project) => project.slug === currentSlug);

  if (currentIndex < 0) {
    throw new RangeError(`Unknown current project: ${currentSlug}`);
  }

  const successors = [
    ...projects.slice(currentIndex + 1),
    ...projects.slice(0, currentIndex),
  ];

  return successors.map(({ slug, title, location, category, year, thumbnail }) => ({
    slug,
    title,
    location,
    category,
    year,
    thumbnail,
  }));
}

export function getPinnedSectionHeight(
  horizontalDistance: number,
  viewportHeight: number,
  railSteps: number,
) {
  assertNonNegative(horizontalDistance, 'horizontalDistance');
  assertPositive(viewportHeight, 'viewportHeight');
  assertNonNegativeInteger(railSteps, 'railSteps');

  return viewportHeight + horizontalDistance + railSteps * viewportHeight;
}

export function getProjectStoryFrame(
  scrollOffset: number,
  horizontalDistance: number,
  viewportHeight: number,
  railSteps: number,
) {
  assertFinite(scrollOffset, 'scrollOffset');
  assertNonNegative(horizontalDistance, 'horizontalDistance');
  assertPositive(viewportHeight, 'viewportHeight');
  assertNonNegativeInteger(railSteps, 'railSteps');

  const horizontalOffset = Math.min(
    Math.max(scrollOffset, 0),
    horizontalDistance,
  );
  const railPosition = Math.min(
    Math.max(scrollOffset - horizontalDistance, 0) / viewportHeight,
    railSteps,
  );

  return {
    trackX: horizontalOffset === 0 ? 0 : -horizontalOffset,
    railPosition,
  };
}
