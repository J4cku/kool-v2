# Mersi-Informed Interaction System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the verified Mersi interaction architecture with Kool Studio content: a scroll-driven circular homepage reel, desktop-horizontal/mobile-vertical project stories, FLIP-style archive motion, and paired route curtains.

**Architecture:** Pure functions in `lib/portfolio-motion.ts` own all modular index, snap, recenter, media-normalization, and track geometry logic. Client components render those deterministic states using the existing Framer Motion runtime and native sticky/scroll primitives; server routes keep selecting localized project data. Every responsive interaction has a reduced-motion/static path.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS 4, Framer Motion 12, next-intl, Node test runner.

**Working-tree note:** This workspace already contains the prior rebuild as uncommitted work. The implementation uses test/check checkpoints instead of intermediate commits so unrelated or user-owned changes are not accidentally bundled.

---

### Task 1: Pure interaction contracts

**Files:**
- Create: `tests/portfolio-motion.test.mts`
- Create: `lib/portfolio-motion.ts`
- Modify: `package.json`

- [x] **Step 1: Write the failing reel-frame tests**

Cover exact integer positions, fractional current/next/active indices, negative-safe wrapping, nearest-step snap targets, the center-cycle initial offset, the 10–90 cycle recenter band, a tested 30px swipe threshold, and the shared `(min-width: 992px)` media-query constant.

- [x] **Step 2: Write the failing project-story tests**

Define and exercise the exact union:

```ts
type StoryMedia =
  | { kind: 'image'; src: string; displayIndex: number; fullWidth: boolean; portrait: boolean; small: boolean }
  | { kind: 'reel'; src: string; displayIndex: number; aspect?: string }
  | { kind: 'comparison'; beforeSrc: string; afterSrc: string; displayIndex: number; labels?: [string, string]; aspect?: string; source: 'slider' | 'contained' };
```

Use fixtures that prove hero removal, ascending reel insertion, single and multiple sliders, contained-pair collapse without duplication, presentation-index flags, successor DTO rotation, and track height including the separate rail phase. Rail progress and index behavior are intentionally deferred to Task 3 so their tests can establish a fresh RED state.

- [x] **Step 3: Expand the test command**

Delete only the explicit `.context/test-build` directory, compile `tests/*.test.mts`, the data modules, and imported helpers back into it, then run every emitted test with Node's test runner. Clearing first prevents removed tests from surviving as stale JavaScript.

- [x] **Step 4: Run tests and verify RED**

Run: `pnpm test`

Expected: FAIL because `lib/portfolio-motion.ts` does not exist.

- [x] **Step 5: Implement the minimal helpers**

Export:

```ts
getReelFrame(scrollTop, viewportHeight, projectCount)
getReelSnapTop(scrollTop, viewportHeight)
getInitialReelScrollTop(viewportHeight, projectCount, cycle?)
getRecenteredReelScrollTop(scrollTop, viewportHeight, projectCount)
getSwipeStep(deltaY, threshold?)
buildProjectStoryMedia(project)
getProjectSuccessors(projects, currentSlug)
getPinnedSectionHeight(trackDistance, viewportHeight, railSteps)
```

All invalid dimensions/counts throw clear `RangeError`s.

- [x] **Step 6: Run tests and verify GREEN**

Run: `pnpm test`

Expected: all homepage-curation and portfolio-motion tests PASS.

### Task 2: Scroll-driven homepage reel

**Files:**
- Modify: `components/ImageStrip.tsx`
- Modify: `app/[locale]/page.tsx`
- Modify: `components/Navbar.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`
- Delete: `lib/showcase-playback.ts`
- Modify: `tests/homepage-projects.test.mts`

- [x] **Step 1: Remove obsolete autoplay contract assertions**

Delete the pause/toggle test and its import. Run `pnpm test` to keep the remaining baseline green.

- [x] **Step 2: Replace interval state with virtual scroll state**

Use one passive scroll listener scheduled through `requestAnimationFrame`. Keep the current and next project pair in React state; drive fractional clip paths through Motion values so normal scroll does not re-render the whole tree every frame.

- [x] **Step 3: Add snap and recenter control**

Initialize desktop at cycle 50, preserve the fractional index when recentering, debounce snapping for 500ms, and animate the nearest step for 800ms. Cancel a running snap immediately on wheel, pointer, or keyboard input.

- [x] **Step 4: Add mobile/reduced-motion discrete input and keyboard control**

At `max-width: 991px`, lock both `html` and `body`, treat a vertical 30px pointer gesture as one discrete move, and animate opposing clips for 800ms. Under reduced motion at any width, use the same locked discrete controller without clip or snap interpolation; silent recentering remains desktop-only. Add a non-passive wheel listener that prevents document movement and debounces each wheel gesture into one immediate project step. Save and restore both elements' exact prior inline overflow values so the Navbar menu lock and route cleanup compose safely. Support arrow keys at all widths and retain visible focus.

- [x] **Step 5: Rebuild the folio**

Keep one focusable localized project link. Present title, location, category, year, and `NN / 08`; expose scroll/swipe instructions and announce only snapped/discrete project changes.

- [x] **Step 6: Make the home route reel-only without losing utilities**

Remove `ManifestoSection` and `FooterBanner` from `app/[locale]/page.tsx`, render the fixed `FooterBar` directly, and treat the navbar as hero-on-image for the whole `/` route. Move the navbar's desktop/mobile breakpoint to 992px.

- [x] **Step 7: Verify the slice**

Run: `pnpm test && pnpm typecheck && pnpm check:i18n`

Expected: PASS.

### Task 3: Project-story data and media rendering

**Files:**
- Modify: `tests/portfolio-motion.test.mts`
- Modify: `lib/portfolio-motion.ts`
- Create: `components/project-detail/ProjectMedia.tsx`
- Create: `components/project-detail/NextProjectRail.tsx`
- Modify: `components/BeforeAfterSlider.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

- [x] **Step 1: Write and verify RED rail contracts**

Add tests for fractional rail progress, nearest preview selection, previous/next clamping, and zero/one-project boundaries. Run `pnpm test`; expect FAIL because the rail-frame helper is not implemented yet.

- [x] **Step 2: Implement and verify GREEN rail helpers**

Implement only the tested helpers, run `pnpm test`, and expect PASS.

- [x] **Step 3: Render normalized media variants**

Render images through `next/image`, reels through muted looping inline video, and comparison items through `BeforeAfterSlider`. Accept desktop frame-size and mobile layout classes from the story.

- [x] **Step 4: Build the progress-driven next rail**

Receive an explicit lightweight `{ slug, title, location, category, year, thumbnail }` successor DTO plus rail progress and a `scrollToIndex` callback from the story. Map the separate pinned phase to one active preview at a time, provide visible previous/next and arrow-key controls that scroll to exact rail steps, and keep one active project link. Ordinary vertical scroll naturally releases at the first/last boundary. On mobile/reduced motion, show only the immediate successor.

- [x] **Step 5: Respect reduced motion in comparisons**

Use `useReducedMotion()` in `BeforeAfterSlider` and skip its automatic 50→40→60→50 demonstration when motion is reduced; direct pointer control remains available.

- [x] **Step 6: Verify the slice**

Run: `pnpm test && pnpm typecheck && pnpm check:i18n`

Expected: PASS.

### Task 4: Responsive horizontal project story

**Files:**
- Modify: `tests/portfolio-motion.test.mts`
- Modify: `lib/portfolio-motion.ts`
- Create: `components/project-detail/ProjectStory.tsx`
- Modify: `app/[locale]/projekty/[slug]/page.tsx`
- Modify: `components/Navbar.tsx`

- [x] **Step 1: Write and verify RED piecewise progress tests**

Add tests mapping scroll offset into clamped track X and subsequent rail progress, including zero-distance and viewport-width edge cases. Run `pnpm test`; expect FAIL for the missing helper.

- [x] **Step 2: Implement and verify GREEN progress helpers**

Implement the tested piecewise mapping and run `pnpm test`; expect PASS.

- [x] **Step 3: Build the five-part track**

Compose a `100vw` split hero, `45rem` narrative/meta panel, width-max gallery with `2.5rem` gaps, `100vw` contact panel, and `100vw` next-project panel. Preserve every metadata row and `descriptionBlock` in the narrative panel; make that panel vertically scrollable with normal boundary scroll chaining so long copy is never clipped.

- [x] **Step 4: Measure and pin desktop layout**

Use explicit viewport-relative media widths (a documented fidelity exception to intrinsic source sizing) plus `ResizeObserver` for `track.scrollWidth - viewportRef.clientWidth`. Remeasure when the viewport or track changes and after image/video readiness callbacks. Add `(successorCount - 1) × viewportHeight` for the final rail phase, set the outer height via `getPinnedSectionHeight`, keep the viewport sticky, and map only the first distance segment to `translate3d(-distance, 0, 0)`.

- [x] **Step 5: Add vertical fallback**

At 991px and below, or whenever reduced motion is requested, remove the synthetic height/sticky transform. Reflow hero, narrative, every media item, contact, and next project in DOM order.

- [x] **Step 6: Replace the old detail composition**

The server page selects current project and successors, renders `Navbar`, `ProjectStory`, and the fixed `FooterBar`, and preserves metadata/static params. Keep shared `ProjectHero.tsx` untouched; leave legacy detail-only components unused until a later cleanup.

- [x] **Step 7: Synchronize focus and navbar theme**

Scroll an off-screen gallery/contact/next control into the corresponding pinned position on focus. Publish/clean up a `kool:nav-theme` event as the project hero enters/leaves, and let `Navbar` use the light treatment over that opening panel.

- [x] **Step 8: Verify every content variant builds**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build`

Expected: PASS, including projects with reels, sliders, multiple sliders, and image-only galleries.

### Task 5: Archive FLIP choreography

**Files:**
- Modify: `tests/portfolio-motion.test.mts`
- Modify: `lib/portfolio-motion.ts`
- Create: `components/ProjectsIntro.tsx`
- Modify: `app/[locale]/projekty/page.tsx`
- Modify: `app/[locale]/projekty/ProjectsListing.tsx`
- Modify: `components/FilterTabs.tsx`
- Modify: `components/ProjectGrid.tsx`

- [x] **Step 1: Write and verify RED archive-state tests**

Test the clamped intro progress and the explicit `showIntro = activeFilter === 'wszystkie' && !hasNonDefaultFilterQuery && !reducedMotion` state. Run `pnpm test`; expect FAIL for the missing helper.

- [x] **Step 2: Implement and verify GREEN archive-state helpers**

Implement only the tested helper, rerun `pnpm test`, and expect PASS.

- [x] **Step 3: Add the decorative introductory field**

Render the first ten project thumbnails in a sticky full-viewport composition. Drive scale, Y, and opacity from its scroll progress; mark the duplicate imagery `aria-hidden` and make it noninteractive. Omit the intro only for a non-default filter query or reduced motion, and complete its handoff before card focus order begins.

- [x] **Step 4: Scope the archive layout group**

Wrap filters and grid in one `LayoutGroup`, animate a shared active-filter underline with `layoutId`, and switch cards to `layout="position"` so typography is not scale-distorted.

- [x] **Step 5: Keep semantic filtering intact**

Preserve `aria-pressed`, URL-derived initial filter, stable project keys, typed project links, and reduced-motion static rendering.

- [x] **Step 6: Verify the slice**

Run: `pnpm typecheck && pnpm lint`

Expected: PASS.

### Task 6: Route curtains and global motion finish

**Files:**
- Modify: `tests/portfolio-motion.test.mts`
- Modify: `lib/portfolio-motion.ts`
- Modify: `components/PageTransition.tsx`
- Modify: `components/Reveal.tsx`
- Modify: `components/RevealHeading.tsx`
- Modify: `app/globals.css`

- [x] **Step 1: Write and verify RED curtain-state tests**

Test that first paint and reduced motion suppress curtains while subsequent pathname changes enable them. Run `pnpm test`; expect FAIL for the missing state helper.

- [x] **Step 2: Implement and verify GREEN curtain-state helper**

Implement only the tested helper, rerun `pnpm test`, and expect PASS.

- [x] **Step 3: Generalize route arrival curtains**

Key two fixed dark half-screen curtain panels with a one-pixel coral seam by pathname. Reveal the new route in roughly one second without transforming or keying the page subtree. Skip first paint and all animation under reduced motion; never use coral as a full-panel fill.

- [x] **Step 4: Tighten reveal cadence**

Reduce image overscale and reveal duration; reduce heading word stagger while preserving the current one-shot viewport trigger.

- [x] **Step 5: Remove conflicting/dead global rules**

Remove global smooth scrolling and unused nav scroll-timeline helpers. Add a reduced-motion block that disables marquee animation and nonessential transitions.

- [x] **Step 6: Verify the slice**

Run: `pnpm typecheck && pnpm lint && pnpm check:i18n`

Expected: PASS.

### Task 7: Full verification and independent review

**Files:**
- Modify implementation files only when evidence exposes a defect.

- [x] **Step 1: Run the repository gate**

Run: `pnpm check`

Expected: tests, typecheck, lint, i18n parity, and production build all PASS.

- [x] **Step 2: Run production route QA**

Start `PORT=4173 pnpm start` after the production build. Request `/pl`, `/en`, the four additional static routes in both locales, and every localized project route generated from `data/projects.ts`; expect exactly 40 public `200` responses. Request `/pl/design-system` and `/en/design-system`; expect exactly two `404` responses.

- [x] **Step 3: Run visual QA if the required browser exists**

Invoke `.claude/skills/verify-site/SKILL.md` and use the in-app browser at 1440×900, 1024×768, 768×1024, and 390×844. Check homepage wheel/snap/recenter and swipe; at least one image-only, reel, slider, and multiple-slider detail; archive intro/filter; menu focus; and reduced motion.

- [x] **Step 4: Request independent code review**

Review `git status --short` and `git diff origin/main --` for correctness, performance, accessibility, and accidental scope. Fix every blocking issue and rerun the smallest affected check plus `pnpm check`.

- [x] **Step 5: Report evidence honestly**

Summarize delivered interactions, exact passing checks, route count, and any unavailable visual gate in no more than four lines.
