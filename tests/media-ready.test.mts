import assert from 'node:assert/strict';
import test from 'node:test';

import { createImagePairLoadTracker } from '../lib/media-ready.js';

test('reports an image pair ready exactly once after both distinct loads', () => {
  const tracker = createImagePairLoadTracker();
  let readyCalls = 0;
  const markLoaded = (side: 'before' | 'after') => {
    if (tracker.markLoaded(side)) readyCalls += 1;
  };

  markLoaded('before');
  markLoaded('before');
  assert.equal(readyCalls, 0);

  markLoaded('after');
  markLoaded('after');
  markLoaded('before');
  assert.equal(readyCalls, 1);
});

test('starts with an independent count after remount', () => {
  const firstMount = createImagePairLoadTracker();
  firstMount.markLoaded('before');

  const remount = createImagePairLoadTracker();
  assert.equal(remount.markLoaded('after'), false);
  assert.equal(remount.markLoaded('before'), true);
});
