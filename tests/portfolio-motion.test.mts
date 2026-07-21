import assert from 'node:assert/strict';
import test from 'node:test';
import type { Project } from '../data/projects.js';
import { createScrollLockManager } from '../lib/document-scroll-lock.js';
import {
  STORY_DESKTOP_QUERY,
  buildProjectStoryMedia,
  clampArchiveIntroProgress,
  clampRailIndex,
  getInitialReelScrollTop,
  getPinnedSectionHeight,
  getProjectSuccessors,
  getProjectStoryFrame,
  getRecenteredReelScrollTop,
  getReelFrame,
  getRailFrame,
  getReelSnapTop,
  getSwipeStep,
  shouldShowArchiveIntro,
  shouldShowRouteCurtains,
  type StoryMedia,
} from '../lib/portfolio-motion.js';

test('document scroll lock restores exact overflow values after the final release', () => {
  const root = { style: { overflow: 'clip' } };
  const body = { style: { overflow: 'scroll' } };
  const manager = createScrollLockManager(root, body);

  const releaseFirst = manager.acquire();
  assert.equal(root.style.overflow, 'hidden');
  assert.equal(body.style.overflow, 'hidden');

  const releaseSecond = manager.acquire();
  assert.equal(root.style.overflow, 'hidden');
  assert.equal(body.style.overflow, 'hidden');

  releaseFirst();
  assert.equal(root.style.overflow, 'hidden');
  assert.equal(body.style.overflow, 'hidden');

  releaseFirst();
  assert.equal(root.style.overflow, 'hidden');
  assert.equal(body.style.overflow, 'hidden');

  releaseSecond();
  assert.equal(root.style.overflow, 'clip');
  assert.equal(body.style.overflow, 'scroll');

  releaseSecond();
  assert.equal(root.style.overflow, 'clip');
  assert.equal(body.style.overflow, 'scroll');
});

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'fixture',
    slug: 'fixture',
    title: 'Fixture project',
    location: 'Wrocław',
    category: 'mieszkalne',
    status: 'completed',
    year: 2026,
    area: '80 m²',
    scope: [],
    thumbnail: '/images/fixture/thumb.webp',
    featured: false,
    images: [
      '/images/fixture/hero.webp',
      '/images/fixture/a.webp',
      '/images/fixture/b.webp',
      '/images/fixture/c.webp',
    ],
    description: 'Fixture description',
    en: {
      scope: [],
      description: 'Fixture description',
    },
    ...overrides,
  };
}

test('exports the shared 992px desktop media query', () => {
  assert.equal(STORY_DESKTOP_QUERY, '(min-width: 992px)');
});

test('maps exact and fractional reel positions to current, next, and active projects', () => {
  assert.deepEqual(getReelFrame(200, 100, 5), {
    currentIndex: 2,
    nextIndex: 3,
    activeIndex: 2,
    progress: 0,
  });

  assert.deepEqual(getReelFrame(225, 100, 5), {
    currentIndex: 2,
    nextIndex: 3,
    activeIndex: 2,
    progress: 0.25,
  });

  assert.deepEqual(getReelFrame(275, 100, 5), {
    currentIndex: 2,
    nextIndex: 3,
    activeIndex: 3,
    progress: 0.75,
  });
});

test('wraps negative fractional reel positions without producing negative indices', () => {
  assert.deepEqual(getReelFrame(-25, 100, 5), {
    currentIndex: 4,
    nextIndex: 0,
    activeIndex: 0,
    progress: 0.75,
  });
});

test('maps clamped rail positions to current, next, and midpoint-active projects', () => {
  assert.deepEqual(getRailFrame(1.25, 4), {
    currentIndex: 1,
    nextIndex: 2,
    activeIndex: 1,
    progress: 0.25,
  });
  assert.deepEqual(getRailFrame(1.5, 4), {
    currentIndex: 1,
    nextIndex: 2,
    activeIndex: 2,
    progress: 0.5,
  });
  assert.deepEqual(getRailFrame(1.75, 4), {
    currentIndex: 1,
    nextIndex: 2,
    activeIndex: 2,
    progress: 0.75,
  });
});

test('clamps rail frames at underflow, overflow, and the one-project boundary', () => {
  assert.deepEqual(getRailFrame(-4.5, 3), {
    currentIndex: 0,
    nextIndex: 1,
    activeIndex: 0,
    progress: 0,
  });
  assert.deepEqual(getRailFrame(99, 3), {
    currentIndex: 2,
    nextIndex: 2,
    activeIndex: 2,
    progress: 0,
  });
  assert.deepEqual(getRailFrame(0.75, 1), {
    currentIndex: 0,
    nextIndex: 0,
    activeIndex: 0,
    progress: 0,
  });
});

test('clamps previous and next rail commands to available projects', () => {
  assert.equal(clampRailIndex(0, -1, 4), 0);
  assert.equal(clampRailIndex(1, 1, 4), 2);
  assert.equal(clampRailIndex(3, 1, 4), 3);
  assert.equal(clampRailIndex(0, 1, 1), 0);
});

test('rejects non-finite rail inputs and invalid rail counts', () => {
  assert.throws(() => getRailFrame(Number.NaN, 3), RangeError);
  assert.throws(() => getRailFrame(Number.POSITIVE_INFINITY, 3), RangeError);
  assert.throws(() => getRailFrame(0, 0), RangeError);
  assert.throws(() => getRailFrame(0, 1.5), RangeError);
  assert.throws(() => clampRailIndex(Number.NaN, 1, 3), RangeError);
  assert.throws(() => clampRailIndex(0, Number.NEGATIVE_INFINITY, 3), RangeError);
  assert.throws(() => clampRailIndex(0, 1, 0), RangeError);
  assert.throws(() => clampRailIndex(0, 1, 2.5), RangeError);
});

test('snaps to the nearest viewport-height step', () => {
  assert.equal(getReelSnapTop(249, 100), 200);
  assert.equal(getReelSnapTop(250, 100), 300);
  assert.equal(getReelSnapTop(251, 100), 300);
});

test('starts the reel at the center cycle by default', () => {
  assert.equal(getInitialReelScrollTop(900, 8), 50 * 8 * 900);
  assert.equal(getInitialReelScrollTop(900, 8, 12), 12 * 8 * 900);
});

test('recenters only outside the inclusive 10-90 cycle safety band', () => {
  const viewportHeight = 100;
  const projectCount = 8;
  const lowerBoundary = 10 * projectCount * viewportHeight;
  const upperBoundary = 90 * projectCount * viewportHeight;

  assert.equal(
    getRecenteredReelScrollTop(lowerBoundary, viewportHeight, projectCount),
    lowerBoundary,
  );
  assert.equal(
    getRecenteredReelScrollTop(upperBoundary, viewportHeight, projectCount),
    upperBoundary,
  );

  const lowScrollTop = (9 * projectCount + 2.25) * viewportHeight;
  const highScrollTop = (91 * projectCount + 6.5) * viewportHeight;

  assert.equal(
    getRecenteredReelScrollTop(lowScrollTop, viewportHeight, projectCount),
    (50 * projectCount + 2.25) * viewportHeight,
  );
  assert.equal(
    getRecenteredReelScrollTop(highScrollTop, viewportHeight, projectCount),
    (50 * projectCount + 6.5) * viewportHeight,
  );
});

test('preserves the exact fractional reel frame when recentering', () => {
  const viewportHeight = 120;
  const projectCount = 5;
  const before = (95 * projectCount + 3.625) * viewportHeight;
  const after = getRecenteredReelScrollTop(before, viewportHeight, projectCount);

  assert.deepEqual(
    getReelFrame(after, viewportHeight, projectCount),
    getReelFrame(before, viewportHeight, projectCount),
  );
});

test('uses a 30px inclusive swipe threshold by default', () => {
  assert.equal(getSwipeStep(29.999), 0);
  assert.equal(getSwipeStep(30), 1);
  assert.equal(getSwipeStep(80), 1);
  assert.equal(getSwipeStep(-29.999), 0);
  assert.equal(getSwipeStep(-30), -1);
  assert.equal(getSwipeStep(-80), -1);
});

test('rejects invalid reel dimensions, counts, thresholds, and rail dimensions', () => {
  assert.throws(() => getReelFrame(0, 0, 5), RangeError);
  assert.throws(() => getReelFrame(0, 100, 0), RangeError);
  assert.throws(() => getReelFrame(0, 100, 1.5), RangeError);
  assert.throws(() => getReelSnapTop(0, -1), RangeError);
  assert.throws(() => getInitialReelScrollTop(100, 0), RangeError);
  assert.throws(() => getRecenteredReelScrollTop(0, 100, 0), RangeError);
  assert.throws(() => getSwipeStep(40, 0), RangeError);
  assert.throws(() => getPinnedSectionHeight(-1, 100, 0), RangeError);
  assert.throws(() => getPinnedSectionHeight(0, 0, 0), RangeError);
  assert.throws(() => getPinnedSectionHeight(0, 100, 1.5), RangeError);
});

test('exports the exact image, reel, and comparison StoryMedia variants', () => {
  const variants: StoryMedia[] = [
    {
      kind: 'image',
      src: '/image.webp',
      displayIndex: 1,
      fullWidth: false,
      portrait: true,
      small: false,
    },
    { kind: 'reel', src: '/reel.mp4', displayIndex: 2, aspect: 'aspect-[2/3]' },
    {
      kind: 'comparison',
      beforeSrc: '/before.webp',
      afterSrc: '/after.webp',
      displayIndex: 3,
      labels: ['przed', 'po'],
      aspect: 'aspect-square',
      source: 'slider',
    },
  ];

  assert.deepEqual(variants.map(({ kind }) => kind), ['image', 'reel', 'comparison']);
});

test('removes the hero and applies hero-inclusive presentation flags to images', () => {
  const media = buildProjectStoryMedia(makeProject({
    fullWidthIndices: [2],
    portraitIndices: [1],
    smallIndices: [3],
  }));

  assert.deepEqual(media, [
    {
      kind: 'image',
      src: '/images/fixture/a.webp',
      displayIndex: 1,
      fullWidth: false,
      portrait: true,
      small: false,
    },
    {
      kind: 'image',
      src: '/images/fixture/b.webp',
      displayIndex: 2,
      fullWidth: true,
      portrait: false,
      small: false,
    },
    {
      kind: 'image',
      src: '/images/fixture/c.webp',
      displayIndex: 3,
      fullWidth: false,
      portrait: false,
      small: true,
    },
  ]);
  assert.equal(media.some((item) => item.kind === 'image' && item.src.endsWith('/hero.webp')), false);
});

test('inserts a reel and a single slider in ascending hero-inclusive display order', () => {
  const media = buildProjectStoryMedia(makeProject({
    reel: { src: '/videos/reel.mp4', index: 2, aspect: 'aspect-[9/16]' },
    slider: {
      beforeSrc: '/images/fixture/before.webp',
      afterSrc: '/images/fixture/after.webp',
      labels: ['przed', 'po'],
      index: 3,
      aspect: 'aspect-square',
    },
    fullWidthIndices: [4],
    portraitIndices: [1],
    smallIndices: [5],
  }));

  assert.deepEqual(media, [
    {
      kind: 'image',
      src: '/images/fixture/a.webp',
      displayIndex: 1,
      fullWidth: false,
      portrait: true,
      small: false,
    },
    { kind: 'reel', src: '/videos/reel.mp4', displayIndex: 2, aspect: 'aspect-[9/16]' },
    {
      kind: 'comparison',
      beforeSrc: '/images/fixture/before.webp',
      afterSrc: '/images/fixture/after.webp',
      displayIndex: 3,
      labels: ['przed', 'po'],
      aspect: 'aspect-square',
      source: 'slider',
    },
    {
      kind: 'image',
      src: '/images/fixture/b.webp',
      displayIndex: 4,
      fullWidth: true,
      portrait: false,
      small: false,
    },
    {
      kind: 'image',
      src: '/images/fixture/c.webp',
      displayIndex: 5,
      fullWidth: false,
      portrait: false,
      small: true,
    },
  ]);
});

test('sorts multiple sliders by display index before inserting them', () => {
  const media = buildProjectStoryMedia(makeProject({
    slider: [
      {
        beforeSrc: '/images/fixture/high-before.webp',
        afterSrc: '/images/fixture/high-after.webp',
        index: 4,
      },
      {
        beforeSrc: '/images/fixture/low-before.webp',
        afterSrc: '/images/fixture/low-after.webp',
        index: 2,
      },
    ],
  }));

  assert.deepEqual(
    media.map((item) => item.kind === 'comparison' ? item.beforeSrc : item.src),
    [
      '/images/fixture/a.webp',
      '/images/fixture/low-before.webp',
      '/images/fixture/b.webp',
      '/images/fixture/high-before.webp',
      '/images/fixture/c.webp',
    ],
  );
  assert.deepEqual(media.map(({ displayIndex }) => displayIndex), [1, 2, 3, 4, 5]);
});

test('collapses contained image pairs into one comparison without duplicate images', () => {
  const media = buildProjectStoryMedia(makeProject({
    images: [
      '/images/fixture/hero.webp',
      '/images/fixture/a.webp',
      '/images/fixture/b.webp',
      '/images/fixture/c.webp',
      '/images/fixture/d.webp',
    ],
    containedPairs: [{
      indices: [2, 3],
      labels: ['przed', 'po'],
      aspect: 'aspect-[3/2]',
    }],
    smallIndices: [4],
  }));

  assert.deepEqual(media, [
    {
      kind: 'image',
      src: '/images/fixture/a.webp',
      displayIndex: 1,
      fullWidth: false,
      portrait: false,
      small: false,
    },
    {
      kind: 'comparison',
      beforeSrc: '/images/fixture/b.webp',
      afterSrc: '/images/fixture/c.webp',
      displayIndex: 2,
      labels: ['przed', 'po'],
      aspect: 'aspect-[3/2]',
      source: 'contained',
    },
    {
      kind: 'image',
      src: '/images/fixture/d.webp',
      displayIndex: 4,
      fullWidth: false,
      portrait: false,
      small: true,
    },
  ]);
});

test('rotates lightweight successor DTOs after the current project', () => {
  const projects = [
    makeProject({ id: 'a', slug: 'a', title: 'A', location: 'A city', thumbnail: '/a.webp' }),
    makeProject({ id: 'b', slug: 'b', title: 'B', location: 'B city', category: 'komercyjne', year: 2024, thumbnail: '/b.webp' }),
    makeProject({ id: 'c', slug: 'c', title: 'C', location: 'C city', year: 2025, thumbnail: '/c.webp' }),
    makeProject({ id: 'd', slug: 'd', title: 'D', location: 'D city', thumbnail: '/d.webp' }),
  ];

  assert.deepEqual(getProjectSuccessors(projects, 'c'), [
    { slug: 'd', title: 'D', location: 'D city', category: 'mieszkalne', year: 2026, thumbnail: '/d.webp' },
    { slug: 'a', title: 'A', location: 'A city', category: 'mieszkalne', year: 2026, thumbnail: '/a.webp' },
    { slug: 'b', title: 'B', location: 'B city', category: 'komercyjne', year: 2024, thumbnail: '/b.webp' },
  ]);
  assert.throws(() => getProjectSuccessors(projects, 'missing'), RangeError);
});

test('includes one viewport, horizontal track distance, and the separate rail phase', () => {
  assert.equal(getPinnedSectionHeight(1500, 800, 3), 4700);
  assert.equal(getPinnedSectionHeight(0, 800, 0), 800);
});

test('maps story scroll piecewise across the horizontal track and rail phase', () => {
  assert.deepEqual(getProjectStoryFrame(-120, 1200, 800, 3), {
    trackX: 0,
    railPosition: 0,
  });
  assert.deepEqual(getProjectStoryFrame(450, 1200, 800, 3), {
    trackX: -450,
    railPosition: 0,
  });
  assert.deepEqual(getProjectStoryFrame(1200, 1200, 800, 3), {
    trackX: -1200,
    railPosition: 0,
  });
  assert.deepEqual(getProjectStoryFrame(1600, 1200, 800, 3), {
    trackX: -1200,
    railPosition: 0.5,
  });
  assert.deepEqual(getProjectStoryFrame(9999, 1200, 800, 3), {
    trackX: -1200,
    railPosition: 3,
  });
});

test('starts the rail immediately for a zero-distance track and clamps zero steps', () => {
  assert.deepEqual(getProjectStoryFrame(800, 0, 800, 2), {
    trackX: 0,
    railPosition: 1,
  });
  assert.deepEqual(getProjectStoryFrame(800, 0, 800, 0), {
    trackX: 0,
    railPosition: 0,
  });
});

test('rejects invalid project-story geometry', () => {
  assert.throws(
    () => getProjectStoryFrame(Number.NaN, 100, 800, 1),
    RangeError,
  );
  assert.throws(() => getProjectStoryFrame(0, -1, 800, 1), RangeError);
  assert.throws(() => getProjectStoryFrame(0, 100, 0, 1), RangeError);
  assert.throws(() => getProjectStoryFrame(0, 100, 800, -1), RangeError);
  assert.throws(() => getProjectStoryFrame(0, 100, 800, 1.5), RangeError);
});

test('clamps archive intro progress to the inclusive unit interval', () => {
  assert.equal(clampArchiveIntroProgress(-0.25), 0);
  assert.equal(clampArchiveIntroProgress(0), 0);
  assert.equal(clampArchiveIntroProgress(0.375), 0.375);
  assert.equal(clampArchiveIntroProgress(1), 1);
  assert.equal(clampArchiveIntroProgress(1.25), 1);
  assert.throws(() => clampArchiveIntroProgress(Number.NaN), RangeError);
});

test('shows the archive intro only for an unfiltered motion-enabled entry', () => {
  assert.equal(shouldShowArchiveIntro('wszystkie', false, false), true);
  assert.equal(shouldShowArchiveIntro('mieszkalne', false, false), false);
  assert.equal(shouldShowArchiveIntro('komercyjne', false, false), false);
  assert.equal(shouldShowArchiveIntro('wszystkie', true, false), false);
  assert.equal(shouldShowArchiveIntro('wszystkie', false, true), false);
});

test('suppresses route curtains on first paint and under reduced motion', () => {
  assert.equal(shouldShowRouteCurtains(null, '/studio', false), false);
  assert.equal(shouldShowRouteCurtains('/studio', '/projekty', true), false);
});

test('enables route curtains only for subsequent pathname changes', () => {
  assert.equal(shouldShowRouteCurtains('/studio', '/projekty', false), true);
  assert.equal(shouldShowRouteCurtains('/projekty', '/projekty', false), false);
});
