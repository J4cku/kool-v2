import assert from 'node:assert/strict';
import test from 'node:test';

import {
  appendOptimizedImagePreloads,
  shouldPrioritizeInitialProject,
} from '../lib/image-preload.js';

test('adds optimizer-responsive image preloads and removes only its own links', () => {
  const appended: FakeLink[] = [];
  const links: FakeLink[] = [];

  class FakeLink {
    rel = '';
    as = '';
    href = '';
    imageSrcset = '';
    imageSizes = '';
    removed = false;

    remove() {
      this.removed = true;
    }
  }

  const cleanup = appendOptimizedImagePreloads(
    [
      {
        src: '/_next/image?url=%2Fproject.webp&w=3840&q=75',
        srcSet: '/_next/image?url=%2Fproject.webp&w=640&q=75 640w',
        sizes: '(max-width: 991px) 100vw, 50vw',
      },
    ],
    () => {
      const link = new FakeLink();
      links.push(link);
      return link;
    },
    (link) => appended.push(link),
  );

  assert.equal(appended.length, 1);
  assert.equal(appended[0].rel, 'preload');
  assert.equal(appended[0].as, 'image');
  assert.equal(appended[0].href, '');
  assert.equal(
    appended[0].imageSrcset,
    '/_next/image?url=%2Fproject.webp&w=640&q=75 640w',
  );
  assert.equal(appended[0].imageSizes, '(max-width: 991px) 100vw, 50vw');

  cleanup();
  assert.equal(links[0].removed, true);
});

test('prioritizes only project zero during the initial render', () => {
  assert.equal(shouldPrioritizeInitialProject(true, 0), true);
  assert.equal(shouldPrioritizeInitialProject(true, 1), false);
  assert.equal(shouldPrioritizeInitialProject(false, 0), false);
});
