import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import * as reducedMotionModule from '../hooks/useReducedMotion.ts';

type ReducedMotionStore = {
  REDUCED_MOTION_QUERY: string;
  subscribeToReducedMotion: (onStoreChange: () => void) => () => void;
  getReducedMotionSnapshot: () => boolean;
  getServerReducedMotionSnapshot: () => false;
  useReducedMotion: () => boolean;
};

const store = reducedMotionModule as unknown as ReducedMotionStore;
const consumers = [
  'components/Reveal.tsx',
  'components/RevealHeading.tsx',
  'components/PageTransition.tsx',
  'components/Navbar.tsx',
  'components/oferta/ProcessSection.tsx',
  'components/ProjectGrid.tsx',
  'components/ImageStrip.tsx',
  'components/oferta/ServiceSection.tsx',
  'app/[locale]/kontakt/KontaktPage.tsx',
] as const;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

test('reduced-motion store uses browser state after a false hydration snapshot', () => {
  assert.equal(store.REDUCED_MOTION_QUERY, '(prefers-reduced-motion: reduce)');
  assert.equal(typeof store.subscribeToReducedMotion, 'function');
  assert.equal(typeof store.getReducedMotionSnapshot, 'function');
  assert.equal(typeof store.getServerReducedMotionSnapshot, 'function');

  const queries: string[] = [];
  let addedListener: EventListener | undefined;
  let removedListener: EventListener | undefined;
  const mediaQuery = {
    matches: true,
    addEventListener(type: string, listener: EventListener) {
      assert.equal(type, 'change');
      addedListener = listener;
    },
    removeEventListener(type: string, listener: EventListener) {
      assert.equal(type, 'change');
      removedListener = listener;
    },
  };
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      matchMedia(query: string) {
        queries.push(query);
        return mediaQuery as unknown as MediaQueryList;
      },
    },
  });

  try {
    assert.equal(store.getReducedMotionSnapshot(), true);
    mediaQuery.matches = false;
    assert.equal(store.getReducedMotionSnapshot(), false);
    assert.equal(store.getServerReducedMotionSnapshot(), false);

    const onStoreChange = () => {};
    const unsubscribe = store.subscribeToReducedMotion(onStoreChange);
    assert.equal(addedListener, onStoreChange);
    unsubscribe();
    assert.equal(removedListener, onStoreChange);
    assert.deepEqual(queries, [
      store.REDUCED_MOTION_QUERY,
      store.REDUCED_MOTION_QUERY,
      store.REDUCED_MOTION_QUERY,
    ]);

    mediaQuery.matches = true;
    const Probe = () => {
      return createElement('span', null, store.useReducedMotion() ? 'reduce' : 'full');
    };
    assert.equal(renderToString(createElement(Probe)), '<span>full</span>');
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('app and components never import Framer useReducedMotion directly', () => {
  for (const path of [...sourceFiles('app'), ...sourceFiles('components')]) {
    const source = readFileSync(path, 'utf8');
    const framerImports = /import\s*{([^}]*)}\s*from\s*['"]framer-motion['"]/g;
    let match: RegExpExecArray | null;
    while ((match = framerImports.exec(source)) !== null) {
      assert.doesNotMatch(
        match[1],
        /\buseReducedMotion\b/,
        `${path} must not use Framer's hydration-unsafe hook directly`
      );
    }
  }
});

test('all existing reduced-motion consumers use the shared hook', () => {
  for (const path of consumers) {
    assert.match(
      readFileSync(path, 'utf8'),
      /import { useReducedMotion } from ['"]@\/hooks\/useReducedMotion['"]/,
      `${path} must use the shared hydration-safe hook`
    );
  }
});
