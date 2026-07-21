# Footer and Marquee Visual Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the original beige/coral footer controls and beige marquee surfaces while retaining structural accessibility and performance improvements.

**Architecture:** Make a narrow class-only visual rollback in the existing footer and marquee components. Preserve the expanded interactive wrappers, semantic attributes, component behavior, deferred loading, and all other Lighthouse optimizations.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, pnpm

## Global Constraints

- Keep coral exactly `#FC3117`.
- Retain the 44-by-44-pixel interactive hit areas around the 26-pixel footer circles.
- Retain `aria-label`, `aria-pressed`, locale switching, Instagram behavior, fixed positioning, and hover states.
- Retain all image, video, font, transition, and initial-load performance optimizations.
- Accept the measured Lighthouse contrast regression caused by restoring the original palette.
- Run `pnpm check` before handoff.

---

### Task 1: Restore Footer Controls and Marquee Surfaces

**Files:**
- Modify: `components/FooterBar.tsx`
- Modify: `components/LanguageToggle.tsx`
- Modify: `components/ManifestoSection.tsx`
- Modify: `components/FooterBanner.tsx`
- Modify: `app/[locale]/studio/StudioPage.tsx`

**Interfaces:**
- Consumes: existing `FooterBar`, `LanguageToggle`, homepage/studio marquee class names, Tailwind `coral`, `beige`, and transparent utilities
- Produces: the original visual palette with the current interaction and semantic structure unchanged

- [ ] **Step 1: Confirm the current black/white Lighthouse treatment**

Run:

```bash
rg -n "bg-coral text-dark|bg-white" \
  components/FooterBar.tsx \
  components/LanguageToggle.tsx \
  components/ManifestoSection.tsx \
  components/FooterBanner.tsx \
  'app/[locale]/studio/StudioPage.tsx'
```

Expected: black-on-coral matches in the footer controls and one white-surface match in each marquee component.

- [ ] **Step 2: Restore the Instagram control palette**

In `components/FooterBar.tsx`, keep the outer 44-pixel anchor unchanged and replace only the inner circle color classes:

```tsx
<span className="w-[26px] h-[26px] flex items-center justify-center rounded-full bg-coral text-beige transition-opacity hover:opacity-70">
```

- [ ] **Step 3: Restore both language-control states**

In both buttons in `components/LanguageToggle.tsx`, keep the outer 44-pixel button and `aria-pressed` unchanged. Use:

```tsx
locale === 'pl'
  ? 'bg-coral text-beige'
  : 'bg-transparent text-coral hover:opacity-70'
```

and:

```tsx
locale === 'en'
  ? 'bg-coral text-beige'
  : 'bg-transparent text-coral hover:opacity-70'
```

- [ ] **Step 4: Restore inherited beige marquee surfaces**

Remove only `bg-white` from the marquee wrapper class in each file:

```tsx
// components/ManifestoSection.tsx
<div className="overflow-hidden whitespace-nowrap py-16 md:py-24">

// components/FooterBanner.tsx
<div className="overflow-hidden whitespace-nowrap pt-8 md:pt-12 pb-2">

// app/[locale]/studio/StudioPage.tsx
<section className="overflow-hidden whitespace-nowrap pt-16 pb-8 md:pt-24 md:pb-12">
```

- [ ] **Step 5: Verify the narrow visual diff**

Run:

```bash
git diff --check
rg -n "bg-coral text-dark|bg-white" \
  components/FooterBar.tsx \
  components/LanguageToggle.tsx \
  components/ManifestoSection.tsx \
  components/FooterBanner.tsx \
  'app/[locale]/studio/StudioPage.tsx'
```

Expected: `git diff --check` exits 0; `rg` exits 1 with no matches.

- [ ] **Step 6: Run the project verification gate**

Run: `pnpm check`

Expected: typecheck, ESLint, i18n parity, and production build all exit 0.

- [ ] **Step 7: Verify the rendered treatment**

Run the production server, inspect mobile and desktop widths, and confirm:

- Instagram and active locale glyphs are beige on coral.
- Inactive locale glyphs are coral on the inherited page surface.
- Homepage manifesto, shared footer, and studio marquees inherit beige rather than white.
- Footer controls retain 44-pixel hit areas and locale switching still works.

Run one mobile Lighthouse audit and record the resulting category scores in the handoff.

- [ ] **Step 8: Commit and publish the PR update**

```bash
git add \
  components/FooterBar.tsx \
  components/LanguageToggle.tsx \
  components/ManifestoSection.tsx \
  components/FooterBanner.tsx \
  'app/[locale]/studio/StudioPage.tsx' \
  docs/superpowers/plans/2026-07-21-footer-marquee-visual-restore.md
git commit -m "Restore footer and marquee palette"
git push
```

Expected: the current branch pushes successfully and PR #17 updates.
