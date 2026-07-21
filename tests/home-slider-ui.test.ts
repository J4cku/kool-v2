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

test('homepage slides expose localized captions on hover and focus', () => {
  assert.match(
    imageStripSource,
    /const locale = useLocale\(\);[\s\S]*localizeProject\(project, locale\)\.title/
  );
  assert.match(imageStripSource, /className="home-slide-link/);
  assert.match(imageStripSource, /aria-hidden="true"/);
  assert.match(imageStripSource, /className="home-slide-caption/);
  assert.match(imageStripSource, /home-slide-caption pointer-events-none/);
  assert.match(
    globalsSource,
    /\.home-slide-caption \{[\s\S]*opacity: 0;[\s\S]*transform: translateY\(8px\)/
  );
  assert.match(
    globalsSource,
    /@media \(hover: hover\) and \(pointer: fine\) \{\s*\.home-slide-link:hover \.home-slide-caption \{[^}]*opacity: 1;[^}]*transform: translateY\(0\);[^}]*\}\s*\}/
  );
  assert.match(
    globalsSource,
    /\.home-slide-link:focus-visible \.home-slide-caption \{[^}]*opacity: 1;[^}]*transform: translateY\(0\);[^}]*\}/
  );
  assert.match(
    globalsSource,
    /transition: opacity 220ms cubic-bezier\(0\.22, 1, 0\.36, 1\),\s*transform 220ms cubic-bezier\(0\.22, 1, 0\.36, 1\)/
  );
  assert.match(globalsSource, /transform: translateY\(8px\)/);
  assert.match(
    globalsSource,
    /@media \(prefers-reduced-motion: reduce\) \{\s*\.home-slide-caption \{\s*transform: none;\s*\}\s*\}/
  );
});
