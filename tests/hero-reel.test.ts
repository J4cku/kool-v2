import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HORIZONTAL_SWIPE_THRESHOLD,
  HORIZONTAL_WHEEL_THRESHOLD,
  accumulateHorizontalWheel,
  getHorizontalSwipeStep,
  getHorizontalWheelStep,
  isHorizontalWheelIntent,
  normalizeWheelDelta,
} from '../lib/hero-reel.ts';
import {
  curateHomepageProjects,
  getProjectWindowIndices,
  getWrappedProjectIndex,
  homepageProjectSlugs,
} from '../data/homepage-projects.ts';
import { projects } from '../data/projects.ts';

test('vertical-dominant wheel input never advances the reel', () => {
  assert.equal(getHorizontalWheelStep(10, 40), 0);
  assert.equal(getHorizontalWheelStep(-30, -30), 0);
  assert.equal(isHorizontalWheelIntent(10, 40), false);
  assert.equal(isHorizontalWheelIntent(30, 30), false);
});

test('horizontal wheel input steps one project per direction', () => {
  assert.equal(getHorizontalWheelStep(HORIZONTAL_WHEEL_THRESHOLD, 0), 1);
  assert.equal(getHorizontalWheelStep(-HORIZONTAL_WHEEL_THRESHOLD, 0), -1);
  assert.equal(getHorizontalWheelStep(HORIZONTAL_WHEEL_THRESHOLD - 1, 0), 0);
  assert.equal(isHorizontalWheelIntent(3, 0), true);
  assert.equal(isHorizontalWheelIntent(1, 0), false);
});

test('small horizontal trackpad deltas accumulate into one deliberate step', () => {
  let gesture = { deltaX: 0, step: 0, handled: false };

  for (const deltaX of [3, 4, 5]) {
    gesture = accumulateHorizontalWheel(gesture.deltaX, deltaX, 0);
  }

  assert.equal(gesture.handled, true);
  assert.equal(gesture.step, 1);
  assert.equal(gesture.deltaX, 0);

  gesture = accumulateHorizontalWheel(6, 2, 8);
  assert.deepEqual(gesture, { deltaX: 0, step: 0, handled: false });
});

test('line and page wheel deltas normalize before gesture accumulation', () => {
  assert.equal(normalizeWheelDelta(1, 0, 900), 1);
  assert.equal(normalizeWheelDelta(1, 1, 900), 16);
  assert.equal(normalizeWheelDelta(-1, 2, 900), -900);
});

test('swipes advance only when clearly horizontal and past the threshold', () => {
  assert.equal(getHorizontalSwipeStep(HORIZONTAL_SWIPE_THRESHOLD, 0), 1);
  assert.equal(getHorizontalSwipeStep(-HORIZONTAL_SWIPE_THRESHOLD, 0), -1);
  assert.equal(getHorizontalSwipeStep(HORIZONTAL_SWIPE_THRESHOLD - 1, 0), 0);
  assert.equal(getHorizontalSwipeStep(60, 80), 0);
});

test('project index wraps around in both directions', () => {
  assert.equal(getWrappedProjectIndex(0, -1, 8), 7);
  assert.equal(getWrappedProjectIndex(7, 1, 8), 0);
  assert.equal(getWrappedProjectIndex(3, 1, 8), 4);
  assert.throws(() => getWrappedProjectIndex(0, 1, 0), RangeError);
});

test('one step advances the two-project window by exactly one project', () => {
  assert.deepEqual(getProjectWindowIndices(2, 8), [2, 3]);
  assert.deepEqual(getProjectWindowIndices(3, 8), [3, 4]);
  assert.deepEqual(getProjectWindowIndices(7, 8), [7, 0]);
  assert.throws(() => getProjectWindowIndices(0, 1), RangeError);
});

test('every curated homepage project resolves to one existing thumbnail', () => {
  const curated = curateHomepageProjects(projects);
  assert.equal(curated.length, homepageProjectSlugs.length);
  assert.ok(curated.length > 1);

  for (const project of curated) {
    assert.ok(project.heroImage.startsWith('/images/'));
    assert.equal(project.heroImage, project.thumbnail);
  }
});
