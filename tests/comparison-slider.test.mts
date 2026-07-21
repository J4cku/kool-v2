import assert from 'node:assert/strict';
import test from 'node:test';

import { getComparisonSliderPosition } from '../lib/comparison-slider.js';

test('maps comparison-slider arrow keys to five-point steps', () => {
  assert.equal(getComparisonSliderPosition(50, 'ArrowLeft'), 45);
  assert.equal(getComparisonSliderPosition(50, 'ArrowDown'), 45);
  assert.equal(getComparisonSliderPosition(50, 'ArrowRight'), 55);
  assert.equal(getComparisonSliderPosition(50, 'ArrowUp'), 55);
  assert.equal(getComparisonSliderPosition(50, 'ArrowRight', 10), 60);
});

test('maps Home and End to the comparison boundaries', () => {
  assert.equal(getComparisonSliderPosition(63, 'Home'), 0);
  assert.equal(getComparisonSliderPosition(37, 'End'), 100);
});

test('clamps comparison-slider keyboard steps and ignores unrelated keys', () => {
  assert.equal(getComparisonSliderPosition(2, 'ArrowLeft'), 0);
  assert.equal(getComparisonSliderPosition(98, 'ArrowRight'), 100);
  assert.equal(getComparisonSliderPosition(42, 'Enter'), 42);
});

test('rejects non-finite positions and non-positive or non-finite steps', () => {
  assert.throws(
    () => getComparisonSliderPosition(Number.NaN, 'ArrowRight'),
    RangeError,
  );
  assert.throws(
    () => getComparisonSliderPosition(Number.POSITIVE_INFINITY, 'Home'),
    RangeError,
  );
  assert.throws(() => getComparisonSliderPosition(50, 'ArrowRight', 0), RangeError);
  assert.throws(() => getComparisonSliderPosition(50, 'ArrowRight', -1), RangeError);
  assert.throws(
    () => getComparisonSliderPosition(50, 'ArrowRight', Number.POSITIVE_INFINITY),
    RangeError,
  );
});
