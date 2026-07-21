import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const navbarSource = readFileSync(new URL('../components/Navbar.tsx', import.meta.url), 'utf8');
const globalsSource = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const imageStripSource = readFileSync(new URL('../components/ImageStrip.tsx', import.meta.url), 'utf8');
const pageTransitionSource = readFileSync(new URL('../components/PageTransition.tsx', import.meta.url), 'utf8');

test('navbar uses the compact orb and contact transition targets its center', () => {
  assert.equal(navbarSource.match(/w-\[36px\] h-\[35px\]/g)?.length ?? 0, 3);
  assert.equal(navbarSource.match(/w-\[44px\] h-\[44px\]/g)?.length ?? 0, 2);
  assert.match(navbarSource, /width=\{36\} height=\{35\}/);
  assert.doesNotMatch(navbarSource, /w-\[56px\] h-\[54px\]/);
  assert.doesNotMatch(navbarSource, /width=\{56\} height=\{54\}/);
  assert.doesNotMatch(
    navbarSource,
    /<motion\.button\b[^>]*style=\{\{ scale: dotScale, y: dotY \}\}/
  );
  assert.match(globalsSource, /--nav-orb-center-x: calc\(100% - 34px\);/);
  assert.match(globalsSource, /--nav-orb-center-x: calc\(100% - 42px\);/);
  assert.match(globalsSource, /--nav-orb-center-y: calc\(var\(--nav-top-padding\) \+ 38\.5px\);/);
  assert.match(pageTransitionSource, /var\(--nav-orb-center-x\)/);
  assert.match(pageTransitionSource, /var\(--nav-orb-center-y\)/);
});

test('homepage slider uses one, two, then three responsive slides', () => {
  assert.match(imageStripSource, /slidesPerView=\{1\}/);
  assert.match(
    imageStripSource,
    /breakpoints=\{\{ 768: \{ slidesPerView: 2 \}, 1280: \{ slidesPerView: 3 \} \}\}/
  );
  assert.match(
    imageStripSource,
    /sizes="\(max-width: 767px\) 100vw, \(max-width: 1279px\) 50vw, 33vw"/
  );
});
