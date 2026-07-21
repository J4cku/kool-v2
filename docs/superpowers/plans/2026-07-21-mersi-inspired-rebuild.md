# Mersi-Inspired Site Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Kool Studio's public portfolio around a responsive split-screen project showcase and compact editorial chrome inspired by mersi-architecture.com.

**Architecture:** Keep the existing App Router, project data, localization, palette, and Poppins font. Add one tested curation/helper module, rewrite the homepage showcase and global navigation, then extend the folio treatment to archive cards while leaving proven inner-page content structures intact.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, next-intl, Node test runner.

---

### Task 1: Curated homepage project model

**Files:**
- Create: `tests/homepage-projects.test.mts`
- Create: `data/homepage-projects.ts`

- [ ] Write a test that requires a unique curated project set, two valid images per item, and wrapping previous/next indices.
- [ ] Run `pnpm test` and confirm it fails because the module is absent.
- [ ] Implement the smallest typed curation module over `data/projects.ts`.
- [ ] Encode the exact eight slug/image-index pairs from the design spec and throw a clear error for missing projects or images.
- [ ] Re-run the test and confirm it passes.

### Task 2: Split-screen homepage showcase

**Files:**
- Modify: `components/ImageStrip.tsx`
- Modify: `app/[locale]/page.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

- [ ] Replace the shuffled Swiper strip with synchronized left/right project media and a centered linked folio.
- [ ] Implement desktop geometry as two `50vw × 100svh` fields with a `37.5vw` folio clamped to `520–640px`; implement mobile as two `100vw × 50svh` fields with a viewport-inset, two-by-two folio.
- [ ] Add six-second timed navigation, previous/next controls, hover/focus pause, Left/Right keyboard support, an `aria-live` project announcement, and reduced-motion handling.
- [ ] Add localized showcase labels and confirm `pnpm check:i18n` passes.
- [ ] Acceptance: at `1440×900` the image seam and folio are centered; at `390×844` neither folio text nor controls overflow; all eight project links resolve.

### Task 3: Compact reference-led global navigation

**Files:**
- Modify: `components/Navbar.tsx`
- Modify: `components/LanguageToggle.tsx` only if needed for compact placement.

- [ ] Preserve typed localized links and active states.
- [ ] Use a fixed `64px` bar with `20px` insets; show the full compact route list on desktop.
- [ ] Provide localized open/close labels and a full-screen mobile menu with body scroll lock, focus trap, Escape close, and opener-focus restoration.
- [ ] Acceptance: keyboard-only navigation can open, traverse, and close the menu; active route remains distinguishable without relying on color alone.

### Task 4: Editorial continuation and archive consistency

**Files:**
- Modify: `components/ManifestoSection.tsx`
- Modify: `components/ProjectCard.tsx`
- Modify: `components/ProjectGrid.tsx`
- Modify: `components/FilterTabs.tsx`
- Modify: `app/globals.css`

- [ ] Restyle manifesto imagery and copy using the approved token system.
- [ ] Apply a consistent metadata folio to project cards and tune grid rhythm.
- [ ] Add only global motion/focus helpers that cannot be expressed cleanly in component classes.
- [ ] Acceptance: archive is three tight columns at `1440px`, one column at `390px`, filter controls remain horizontally usable, and every image retains a meaningful alt.

### Task 5: Verification and refinement

**Files:**
- Modify implementation files only when a check exposes a defect.

- [ ] Run the focused Node tests.
- [ ] Run `pnpm check` and inspect the exit code.
- [ ] Run `.claude/skills/verify-site`: start `pnpm dev` on `$CONDUCTOR_PORT`; status-check every PL/EN static and project route; collect console errors; capture full-page desktop and mobile screenshots under `.context/verify-site/`.
- [ ] If the in-app browser is unavailable, record that as an incomplete visual gate and do not substitute an unapproved browser backend.
- [ ] Review the git diff against `origin/main` for accidental or unrelated changes.
