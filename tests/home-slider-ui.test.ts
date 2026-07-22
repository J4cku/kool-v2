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
  assert.match(navbarSource, /<nav className="fixed top-0 left-0 right-0 z-50">/);
  assert.match(homePageSource, /<main>/);
  assert.doesNotMatch(homePageSource, /<main className="pt-/);
  assert.match(homePageSource, /<ImageStrip order=\{heroOrder\} \/>/);
  assert.match(homePageSource, /<ManifestoSection \/>/);
  assert.doesNotMatch(globalsSource, /\.hero-swiper|\.home-slide-caption/);
});

test('homepage uses a looping horizontal Swiper without blocking vertical page scroll', () => {
  assert.match(imageStripSource, /import \{ Swiper, SwiperSlide \} from 'swiper\/react';/);
  assert.match(imageStripSource, /modules=\{\[A11y, Autoplay, Keyboard, Mousewheel\]\}/);
  assert.match(imageStripSource, /slidesPerView=\{1\}/);
  assert.match(imageStripSource, /breakpoints=\{\{ 992: \{ slidesPerView: 2 \} \}\}/);
  assert.match(imageStripSource, /slidesPerGroup=\{1\}/);
  assert.match(imageStripSource, /loop/);
  assert.match(imageStripSource, /mousewheel=\{\{ forceToAxis: true/);
  assert.match(imageStripSource, /keyboard=\{\{ enabled: true, onlyInViewport: true, pageUpDown: false \}\}/);
  assert.match(imageStripSource, /delay: 5000/);
  assert.match(imageStripSource, /disableOnInteraction: false/);
  assert.match(imageStripSource, /swiperRef\.current\?\.autoplay\.pause\(\)/);
  assert.match(imageStripSource, /swiperRef\.current\?\.autoplay\.resume\(\)/);
  assert.match(imageStripSource, /prevSlideMessage: t\('previousProject'\)/);
  assert.match(imageStripSource, /nextSlideMessage: t\('nextProject'\)/);
  assert.doesNotMatch(imageStripSource, /addEventListener\('wheel'/);
  assert.doesNotMatch(imageStripSource, /onPointerMove=/);
});

test('homepage shows full-width folios and an animated vertical page-scroll cue', () => {
  assert.match(imageStripSource, /absolute inset-x-0 bottom-1\/3/);
  assert.match(imageStripSource, /min-\[992px\]:opacity-0/);
  assert.match(imageStripSource, /group-hover:opacity-100/);
  assert.match(imageStripSource, /group-focus-within:opacity-100/);
  assert.match(imageStripSource, /\[0, 1, 2\]\.map/);
  assert.match(imageStripSource, /animate=\{reduceMotion \? undefined : \{ y: \[0, 8, 0\] \}\}/);
  assert.doesNotMatch(imageStripSource, /t\('scrollHint'\)/);
  assert.doesNotMatch(imageStripSource, /t\('swipeHint'\)/);
  assert.equal(plMessages.home.scrollHint, undefined);
  assert.equal(plMessages.home.swipeHint, undefined);
  assert.equal(enMessages.home.scrollHint, undefined);
  assert.equal(enMessages.home.swipeHint, undefined);
});

test('project title aligns to the right edge of the folio', () => {
  assert.match(
    imageStripSource,
    /<p className="[^"]*right-3[^"]*text-right[^"]*">\s*\{project\.title\}/
  );
});
