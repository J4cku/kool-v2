# Homepage Swiper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom homepage reel with a conventional horizontal Swiper, full-slide folio bars, and a three-dot vertical page-scroll cue.

**Architecture:** `ImageStrip` remains the localized client boundary and derives projects from the server-provided slug order. Swiper owns looping, drag, trackpad, keyboard, autoplay, and responsive one/two-slide layout; Framer Motion is retained only for the page-scroll indicator. Obsolete custom gesture helpers are deleted once their source-contract tests have been replaced.

**Tech Stack:** Next.js 16, React 19, TypeScript, Swiper 14, Framer Motion 12, Tailwind CSS 4, next-intl, Node test runner.

## Global Constraints

- Keep the hero at `100svh` behind the fixed header.
- Show one project per viewport on mobile and two projects side by side from 992px.
- Move horizontally one project at a time and loop continuously.
- Keep vertical wheel and touch movement available for scrolling to content below.
- Keep five-second autoplay, but disable it for reduced motion.
- Preserve the server-provided project order.
- Use responsive `next/image` sizes and prioritize the initially visible images.
- Remove the instructional text and its translations.
- Keep the folio translucent and desktop hover/focus revealed, spanning the full image width.
- Run `pnpm check` before handoff.

---

### Task 1: Define the Swiper UI Contract

**Files:**
- Modify: `tests/home-slider-ui.test.ts`
- Modify: `tests/image-quality-policy.test.ts`

**Interfaces:**
- Consumes: source text from `components/ImageStrip.tsx`, `messages/pl.json`, and `messages/en.json`.
- Produces: regression contracts for Swiper configuration, dot cue, responsive image priority, and folio sizing.

- [ ] **Step 1: Replace the custom-reel assertions with failing Swiper assertions**

```ts
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
```

Update the image policy to assert `priority={index < 2}` and `sizes="(max-width: 991px) 100vw, 50vw"` instead of the custom initial-window helper.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/home-slider-ui.test.ts tests/image-quality-policy.test.ts`

Expected: FAIL because `ImageStrip` still contains the custom reel, instructional labels, and constrained folios.

---

### Task 2: Implement the Responsive Swiper Hero

**Files:**
- Modify: `components/ImageStrip.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: `order: string[]`, `curateHomepageProjects()`, `localizeProject()`, `useReducedMotion()`.
- Produces: a full-height looping Swiper with localized project links.

- [ ] **Step 1: Replace the custom state/input machine with Swiper**

Use these module imports and configuration:

```tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import { A11y, Autoplay, Keyboard, Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const { scrollY } = useScroll();
const indicatorOpacity = useTransform(scrollY, [0, 80], [1, 0]);
const swiperRef = useRef<SwiperInstance | null>(null);

<Swiper
  className="h-full w-full"
  modules={[A11y, Autoplay, Keyboard, Mousewheel]}
  slidesPerView={1}
  breakpoints={{ 992: { slidesPerView: 2 } }}
  slidesPerGroup={1}
  spaceBetween={1}
  loop
  speed={800}
  grabCursor
  keyboard={{ enabled: true, onlyInViewport: true, pageUpDown: false }}
  mousewheel={{ forceToAxis: true, thresholdDelta: 12 }}
  autoplay={
    reduceMotion
      ? false
      : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false }
  }
  a11y={{
    containerMessage: t('showcaseLabel'),
    prevSlideMessage: t('previousProject'),
    nextSlideMessage: t('nextProject'),
  }}
  onSwiper={(swiper) => {
    swiperRef.current = swiper;
  }}
  onFocusCapture={() => swiperRef.current?.autoplay.pause()}
  onBlurCapture={(event) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    swiperRef.current?.autoplay.resume();
  }}
>
  {localizedProjects.map((project, index) => (
    <SwiperSlide key={project.slug} className="h-full bg-dark">
      <ProjectPane
        project={project}
        priority={index < 2}
        category={tProjects(project.category)}
        openProjectLabel={t('openProject')}
      />
    </SwiperSlide>
  ))}
</Swiper>
```

Keep the stage as `relative isolate h-svh overflow-hidden bg-dark`. Remove custom reel state, wheel listeners, pointer handlers, manual preload management, manual live regions, and vertical clip transitions.

- [ ] **Step 2: Expand each folio to its entire slide**

Use the existing `ProjectFolio` contents inside this wrapper:

```tsx
<div
  className="pointer-events-none absolute inset-x-0 bottom-1/3 h-[96px] translate-y-1/2 overflow-hidden bg-beige/75 opacity-100 backdrop-blur-md transition-opacity duration-300 min-[992px]:h-[80px] min-[992px]:opacity-0 min-[992px]:group-hover:opacity-100 min-[992px]:group-focus-within:opacity-100"
  aria-hidden="true"
>
  <ProjectFolio project={project} category={category} />
</div>
```

Remove the `side` prop and mirrored fixed-width positioning. Keep the title aligned to the right.

- [ ] **Step 3: Restore the vertical page-scroll cue**

Place this after Swiper inside the hero:

```tsx
<motion.div
  style={{ opacity: indicatorOpacity }}
  className="pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
  aria-hidden="true"
>
  {[0, 1, 2].map((index) => (
    <motion.span
      key={index}
      animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: index * 0.2,
      }}
      className="h-1.5 w-1.5 rounded-full bg-coral/60"
    />
  ))}
</motion.div>
```

- [ ] **Step 4: Remove obsolete copy**

Delete `home.scrollHint` and `home.swipeHint` from both translation files. Add Polish `previousProject: "poprzedni projekt"` and `nextProject: "następny projekt"`, plus English `previousProject: "previous project"` and `nextProject: "next project"`; keep all remaining keys identical between locales.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run: `pnpm test`

Expected: all tests pass.

---

### Task 3: Remove Dead Reel Infrastructure and Verify

**Files:**
- Delete: `lib/hero-reel.ts`
- Delete: `tests/hero-reel.test.ts`
- Create: `tests/homepage-projects.test.ts`
- Modify: `data/homepage-projects.ts`

**Interfaces:**
- Consumes: the repository-wide import graph after Task 2.
- Produces: no dead custom gesture or window-index helpers.

- [ ] **Step 1: Confirm dead exports**

Run: `rg -n "hero-reel|getProjectWindowIndices|getWrappedProjectIndex" --glob '!node_modules'`

Expected: matches only in `lib/hero-reel.ts`, `tests/hero-reel.test.ts`, and the two now-unused exports in `data/homepage-projects.ts`.

- [ ] **Step 2: Delete the dead code**

Delete `lib/hero-reel.ts` and `tests/hero-reel.test.ts`. Create `tests/homepage-projects.test.ts` with the existing `every curated homepage project resolves to one existing thumbnail` test. Remove `getWrappedProjectIndex()` and `getProjectWindowIndices()` from `data/homepage-projects.ts`.

- [ ] **Step 3: Verify browser behavior**

Run the dev server on `$CONDUCTOR_PORT`, then check 1440×900 and 390×844:

- two desktop slides and one mobile slide are visible;
- touch/mouse dragging follows the pointer and advances one project;
- horizontal trackpad input changes slides while vertical wheel input scrolls the page;
- autoplay advances after five seconds;
- desktop folios span the full slide and appear on hover/focus;
- dots animate downward and fade after document scroll;
- project links remain clickable after a drag;
- reduced motion disables autoplay and dot movement.

- [ ] **Step 4: Run the complete verification gate**

Run: `pnpm check`

Expected: tests, typecheck, lint, i18n parity, and the production build all exit 0.

- [ ] **Step 5: Request an independent code review**

Ask a reviewer to inspect `git diff origin/main...HEAD` plus the uncommitted implementation for correctness, accessibility, input handling, and regressions. Resolve every actionable finding and rerun the affected checks.

- [ ] **Step 6: Commit and push**

```bash
git add components/ImageStrip.tsx data/homepage-projects.ts messages/pl.json messages/en.json tests lib docs/superpowers/plans/2026-07-22-homepage-swiper.md
git commit -m "Replace homepage reel with Swiper"
git push origin HEAD
```
