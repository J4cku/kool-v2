import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const navbarSource = readFileSync(new URL('../components/Navbar.tsx', import.meta.url), 'utf8');
const globalsSource = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const imageStripSource = readFileSync(new URL('../components/ImageStrip.tsx', import.meta.url), 'utf8');
const pageTransitionSource = readFileSync(new URL('../components/PageTransition.tsx', import.meta.url), 'utf8');
const homePageSource = readFileSync(new URL('../app/[locale]/page.tsx', import.meta.url), 'utf8');
const plMessages = JSON.parse(readFileSync(new URL('../messages/pl.json', import.meta.url), 'utf8'));
const enMessages = JSON.parse(readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8'));

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

test('homepage reel fills the viewport behind the fixed header with content beneath', () => {
  assert.match(
    imageStripSource,
    /className="relative isolate h-svh .*overflow-hidden bg-dark/
  );
  assert.doesNotMatch(imageStripSource, /fixed inset-0/);
  assert.doesNotMatch(imageStripSource, /DocumentScrollLock/i);
  assert.doesNotMatch(imageStripSource, /Swiper/);
  assert.match(navbarSource, /<nav className="fixed top-0 left-0 right-0 z-50">/);
  assert.match(homePageSource, /<main>/);
  assert.doesNotMatch(homePageSource, /<main className="pt-/);
  assert.match(homePageSource, /<ImageStrip order=\{heroOrder\} \/>/);
  assert.match(homePageSource, /<ManifestoSection \/>/);
  assert.doesNotMatch(globalsSource, /\.hero-swiper|\.home-slide-caption/);
});

test('reel advances on horizontal input while panes reveal vertically', () => {
  assert.match(imageStripSource, /accumulateHorizontalWheel\(/);
  assert.match(
    imageStripSource,
    /queuedProjectStep\.current = step < 0 \? -1 : 1;/
  );
  assert.match(
    imageStripSource,
    /if \(queuedStep !== 0\) changeProjectRef\.current\(queuedStep\);/
  );
  assert.match(
    imageStripSource,
    /addEventListener\('wheel', handleWheel, \{ passive: false \}\)/
  );
  assert.match(imageStripSource, /touchAction: 'pan-y pinch-zoom'/);
  assert.match(imageStripSource, /getHorizontalSwipeStep\(/);
  assert.match(imageStripSource, /const handlePointerMove/);
  assert.match(imageStripSource, /setPointerCapture\(event\.pointerId\)/);
  assert.match(imageStripSource, /releasePointerCapture\(event\.pointerId\)/);
  assert.match(imageStripSource, /onPointerMove=\{handlePointerMove\}/);
  assert.match(imageStripSource, /if \(event\.key === 'ArrowLeft'\) step = -1;/);
  assert.match(imageStripSource, /data-hero-pane=\{side\}/);
  assert.match(imageStripSource, /pendingFocusSide\.current/);
  assert.match(imageStripSource, /focus\(\{ preventScroll: true \}\)/);
  assert.match(
    imageStripSource,
    /direction > 0 \? 'inset\(0% 0% 100% 0%\)' : 'inset\(100% 0% 0% 0%\)'/
  );
  assert.match(imageStripSource, /animate=\{\{ clipPath: REVEALED_CLIP \}\}/);
  assert.match(imageStripSource, /const AUTO_ADVANCE_MS = 5000;/);
  assert.match(imageStripSource, /matches\(':focus-visible'\)/);
  assert.match(
    imageStripSource,
    /reduceMotion \|\| isFocusPaused \|\| !isInView \|\| isPageHidden/
  );
  assert.doesNotMatch(imageStripSource, /isHoverPaused/);
});

test('adjacent panes link to distinct projects and disable native dragging', () => {
  assert.match(imageStripSource, /getProjectWindowIndices\(reel\.active, total\)/);
  assert.match(imageStripSource, /const \[leftIndex, rightIndex\]/);
  assert.match(imageStripSource, /const leftProject = localizedProjects\[leftIndex\]/);
  assert.match(imageStripSource, /const rightProject = localizedProjects\[rightIndex\]/);
  assert.match(imageStripSource, /draggable=\{false\}/);
  assert.equal(imageStripSource.match(/<ProjectPane/g)?.length ?? 0, 2);
});

test('mobile shows one project and uses direction-neutral controls above the footer', () => {
  assert.match(imageStripSource, /relative h-full w-full overflow-hidden/);
  assert.match(
    imageStripSource,
    /hidden w-full overflow-hidden min-\[992px\]:relative min-\[992px\]:block min-\[992px\]:h-full min-\[992px\]:w-1\/2/
  );
  assert.match(
    imageStripSource,
    /bottom-\[calc\(5rem\+env\(safe-area-inset-bottom\)\)\].*min-\[992px\]:bottom-\[calc\(4rem\+env\(safe-area-inset-bottom\)\)\]/
  );
  assert.equal(imageStripSource.match(/aria-live="polite"/g)?.length ?? 0, 2);
  assert.match(imageStripSource, /sr-only min-\[992px\]:hidden/);
  assert.match(imageStripSource, /sr-only hidden min-\[992px\]:block/);
  assert.equal(plMessages.home.scrollHint, 'scroll');
  assert.equal(plMessages.home.swipeHint, 'swipe');
  assert.equal(enMessages.home.scrollHint, 'scroll');
  assert.equal(enMessages.home.swipeHint, 'swipe');
});

test('each project folio is translucent, stable, mirrored, and hover-revealed', () => {
  assert.match(imageStripSource, /h-\[96px\].*min-\[992px\]:h-\[80px\]/);
  assert.match(imageStripSource, /bg-beige\/75.*backdrop-blur-md/);
  assert.match(imageStripSource, /min-\[992px\]:whitespace-nowrap/);
  assert.doesNotMatch(imageStripSource, /border-x border-dark\/15/);
  assert.match(
    imageStripSource,
    /side === 'left' \? 'min-\[992px\]:right-0' : 'min-\[992px\]:left-0'/
  );
  assert.match(imageStripSource, /min-\[992px\]:opacity-0/);
  assert.match(imageStripSource, /min-\[992px\]:group-hover:opacity-100/);
  assert.match(imageStripSource, /min-\[992px\]:group-focus-within:opacity-100/);
  assert.doesNotMatch(imageStripSource, />\s*kool studio\s*</i);
  assert.doesNotMatch(imageStripSource, /maskImage: 'url\(\/logo\.svg\)'/);
});

test('project title aligns to the right edge of the folio', () => {
  assert.match(
    imageStripSource,
    /<p className="[^"]*right-3[^"]*text-right[^"]*">\s*\{project\.title\}/
  );
});
