import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
  assert.match(imageStripSource, /<Swiper\b[^>]*\n\s+loop\s*\n[^>]*>/);
  assert.match(imageStripSource, /mousewheel=\{\{ forceToAxis: true/);
  assert.match(imageStripSource, /keyboard=\{\{ enabled: true, onlyInViewport: true, pageUpDown: false \}\}/);
  assert.match(imageStripSource, /delay: 5000/);
  assert.match(imageStripSource, /disableOnInteraction: false/);
  assert.match(imageStripSource, /swiperRef\.current\?\.autoplay\.stop\(\)/);
  assert.match(imageStripSource, /swiperRef\.current\?\.autoplay\.start\(\)/);
  assert.doesNotMatch(imageStripSource, /addEventListener\('wheel'/);
  assert.doesNotMatch(imageStripSource, /onPointerMove=/);
});

test('homepage carousel exposes localized region semantics and announces only manual changes', () => {
  assert.match(imageStripSource, /containerMessage: t\('showcaseLabel'\)/);
  assert.match(imageStripSource, /containerRole: 'region'/);
  assert.match(
    imageStripSource,
    /containerRoleDescriptionMessage: t\('showcaseRole'\)/
  );
  assert.doesNotMatch(imageStripSource, /prevSlideMessage|nextSlideMessage/);
  assert.match(imageStripSource, /aria-live="polite"/);
  assert.match(imageStripSource, /aria-atomic="true"/);
  assert.match(imageStripSource, /t\('projectStatus', \{\s*position:/);
  assert.match(imageStripSource, /onTouchEnd=\{handleTouchEnd\}/);
  assert.match(imageStripSource, /onKeyPress=\{handleKeyPress\}/);
  assert.match(imageStripSource, /onScroll=\{handleManualChange\}/);
  assert.doesNotMatch(imageStripSource, /onSlideChange=|onAutoplay=/);

  assert.equal(plMessages.home.projectStatus, 'projekt {position} z {total}: {title}');
  assert.equal(enMessages.home.projectStatus, 'project {position} of {total}: {title}');
  assert.equal(plMessages.home.previousProject, undefined);
  assert.equal(plMessages.home.nextProject, undefined);
  assert.equal(enMessages.home.previousProject, undefined);
  assert.equal(enMessages.home.nextProject, undefined);
});

test('homepage live status resets around every manual announcement and cancels scheduled work', () => {
  assert.match(
    imageStripSource,
    /const announcementFrameRef = useRef<number \| null>\(null\);/
  );
  assert.match(
    imageStripSource,
    /const announcementClearTimeoutRef = useRef<number \| null>\(null\);/
  );
  assert.match(
    imageStripSource,
    /const cancelPendingAnnouncement = useCallback\(\(\) => \{[\s\S]*?window\.cancelAnimationFrame\(announcementFrameRef\.current\)[\s\S]*?window\.clearTimeout\(announcementClearTimeoutRef\.current\)[\s\S]*?\}, \[\]\);/
  );

  const announceStart = imageStripSource.indexOf('const handleManualChange =');
  const announceEnd = imageStripSource.indexOf('\n  const handleTouchStart =', announceStart);
  assert.notEqual(announceStart, -1);
  assert.notEqual(announceEnd, -1);
  const announceSource = imageStripSource.slice(announceStart, announceEnd);
  const cancelIndex = announceSource.indexOf('cancelPendingAnnouncement();');
  const firstClearIndex = announceSource.indexOf("setProjectStatus('');");
  const frameIndex = announceSource.indexOf(
    'announcementFrameRef.current = window.requestAnimationFrame('
  );
  const insertIndex = announceSource.indexOf('setProjectStatus(nextStatus);');
  const timeoutIndex = announceSource.indexOf(
    'announcementClearTimeoutRef.current = window.setTimeout('
  );
  const finalClearIndex = announceSource.indexOf(
    "setProjectStatus('');",
    firstClearIndex + 1
  );

  assert.ok(cancelIndex >= 0);
  assert.ok(cancelIndex < firstClearIndex);
  assert.ok(firstClearIndex < frameIndex);
  assert.ok(frameIndex < insertIndex);
  assert.ok(insertIndex < timeoutIndex);
  assert.ok(timeoutIndex < finalClearIndex);
  assert.match(
    imageStripSource,
    /useEffect\(\(\) => \(\) => \{\s*cancelPendingAnnouncement\(\);[\s\S]*?\}, \[cancelPendingAnnouncement\]\);/
  );
});

test('homepage announces keyboard input only when its captured real index changed', () => {
  assert.match(
    imageStripSource,
    /const keyboardStartIndexRef = useRef<number \| null>\(null\);/
  );
  assert.match(
    imageStripSource,
    /const handleKeyDownCapture = \(event: KeyboardEvent<HTMLElement>\) => \{\s*if \(event\.key !== 'ArrowLeft' && event\.key !== 'ArrowRight'\) \{\s*keyboardStartIndexRef\.current = null;\s*return;\s*\}\s*keyboardStartIndexRef\.current = swiperRef\.current\?\.realIndex \?\? null;\s*\};/
  );
  assert.match(
    imageStripSource,
    /const handleKeyPress = \(swiper: SwiperInstance, keyCode: string\) => \{\s*const keyboardStartIndex = keyboardStartIndexRef\.current;\s*keyboardStartIndexRef\.current = null;\s*if \(!\['37', '39'\]\.includes\(String\(keyCode\)\)\) return;\s*if \(keyboardStartIndex === null \|\| keyboardStartIndex === swiper\.realIndex\) return;\s*handleManualChange\(swiper\);\s*\};/
  );
  assert.match(imageStripSource, /onKeyDownCapture=\{handleKeyDownCapture\}/);
});

test('homepage disables Swiper autoplay when reduced motion is requested', () => {
  assert.match(
    imageStripSource,
    /autoplay=\{\s*reduceMotion\s*\?\s*false\s*:\s*\{\s*delay: 5000/
  );
});

test('homepage binds named DOM focus handlers to the hero section', () => {
  assert.match(
    imageStripSource,
    /const handleFocusCapture = \(\) => \{\s*focusWithinHeroRef\.current = true;\s*swiperRef\.current\?\.autoplay\.stop\(\);\s*\};/
  );
  assert.match(
    imageStripSource,
    /const handleBlurCapture = \(event: FocusEvent<HTMLElement>\) => \{\s*if \(event\.currentTarget\.contains\(event\.relatedTarget as Node \| null\)\) return;\s*focusWithinHeroRef\.current = false;/
  );
  assert.match(
    imageStripSource,
    /<section\s+className="relative isolate h-svh overflow-hidden bg-dark"\s+onFocusCapture=\{handleFocusCapture\}\s+onBlurCapture=\{handleBlurCapture\}\s+onKeyDownCapture=\{handleKeyDownCapture\}/
  );
});

test('homepage does not pass DOM focus handlers through Swiper event props', () => {
  const swiperStart = imageStripSource.indexOf('<Swiper\n');
  const swiperEnd = imageStripSource.indexOf('\n      >', swiperStart);
  assert.notEqual(swiperStart, -1);
  assert.notEqual(swiperEnd, -1);
  const swiperOpeningTag = imageStripSource.slice(swiperStart, swiperEnd);

  assert.doesNotMatch(swiperOpeningTag, /onFocusCapture|onBlurCapture/);
});

test('homepage never uses transitional Swiper autoplay pause or resume', () => {
  assert.doesNotMatch(imageStripSource, /autoplay\.(?:pause|resume)\(\)/);
});

test('homepage synchronizes Swiper autoplay with hydrated reduced motion state', () => {
  assert.match(
    imageStripSource,
    /useEffect\(\(\) => \{\s*const autoplay = swiperRef\.current\?\.autoplay;\s*if \(!autoplay\) return;\s*if \(reduceMotion\) \{\s*autoplay\.stop\(\);\s*return;\s*\}\s*if \(!focusWithinHeroRef\.current && !autoplay\.running\) autoplay\.start\(\);\s*\}, \[reduceMotion\]\);/
  );
  assert.match(
    imageStripSource,
    /const handleBlurCapture = \(event: FocusEvent<HTMLElement>\) => \{\s*if \(event\.currentTarget\.contains\(event\.relatedTarget as Node \| null\)\) return;\s*focusWithinHeroRef\.current = false;\s*if \(reduceMotion\) return;\s*swiperRef\.current\?\.autoplay\.start\(\);\s*\};/
  );
});

test('homepage renders localized projects in the server-provided order', () => {
  assert.match(
    imageStripSource,
    /const showcaseProjects = useMemo\(\(\) => \{\s*const ordered = order\.flatMap\(\(slug\) => \{\s*const match = curatedProjects\.find\(\(project\) => project\.slug === slug\);\s*return match \? \[match\] : \[\];\s*\}\);\s*return ordered\.length > 1 \? ordered : curatedProjects;\s*\}, \[order\]\);\s*const localizedProjects = useMemo\(\s*\(\) =>\s*showcaseProjects\.map/
  );
  assert.match(
    imageStripSource,
    /\{localizedProjects\.map\(\(project, index\) => \(/
  );
  assert.doesNotMatch(
    imageStripSource,
    /localizedProjects\.(?:sort|reverse|toSorted|toReversed)\(|(?:shuffle|randomize)\(\s*localizedProjects/
  );
});

test('homepage shows full-width folios and an animated vertical page-scroll cue', () => {
  assert.match(
    imageStripSource,
    /className="project-folio[^"]*absolute inset-x-0 bottom-\[calc\(135px\+env\(safe-area-inset-bottom\)\)\][^"]*min-\[992px\]:bottom-\[calc\(117px\+env\(safe-area-inset-bottom\)\)\][^"]*bg-beige\/75[^"]*backdrop-blur-md[^"]*"/
  );
  assert.doesNotMatch(imageStripSource, /project-folio[^"]*bottom-1\/3/);
  assert.doesNotMatch(imageStripSource, /project-folio[^"]*translate-y-1\/2/);
  assert.doesNotMatch(imageStripSource, /min-\[992px\]:opacity-0/);
  assert.match(
    globalsSource,
    /@media \(min-width: 992px\) and \(hover: hover\) and \(pointer: fine\) \{\s*\.project-folio \{\s*opacity: 0;\s*\}\s*\.group:hover \.project-folio,\s*\.group:focus-within \.project-folio \{\s*opacity: 1;\s*\}\s*\}/
  );
  assert.match(imageStripSource, /\[0, 1, 2\]\.map/);
  assert.match(
    imageStripSource,
    /className="pointer-events-none absolute bottom-\[calc\(85px\+env\(safe-area-inset-bottom\)\)\][^"]*min-\[992px\]:bottom-\[calc\(67px\+env\(safe-area-inset-bottom\)\)\][^"]*"/
  );
  assert.doesNotMatch(imageStripSource, /md:bottom-\[calc\((?:67|117)px/);
  assert.doesNotMatch(imageStripSource, /absolute bottom-6 left-1\/2/);
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

test('obsolete image preload helper remains deleted', () => {
  assert.equal(existsSync(new URL('../lib/image-preload.ts', import.meta.url)), false);
});
