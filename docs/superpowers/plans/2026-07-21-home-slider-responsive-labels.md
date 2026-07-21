# Home Slider Responsive Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the compact menu orb and make the homepage project slider more informative and balanced across desktop widths.

**Architecture:** Keep `Navbar` as the owner of orb rendering and shared CSS variables as the contact-transition geometry contract. Extend the existing `ImageStrip` slide rendering with locale-derived captions and declarative Swiper breakpoints; place interaction and reduced-motion rules in global CSS so hover-capable input and keyboard focus are explicit.

**Tech Stack:** Next.js 16, React 19, TypeScript, next-intl, Swiper, Tailwind CSS/global CSS, Node test runner, Chrome CDP QA.

---

## File map

- Create `tests/home-slider-ui.test.ts`: persistent source-contract coverage for compact orb geometry, responsive Swiper configuration, localization, caption accessibility, and motion CSS.
- Modify `components/Navbar.tsx`: restore both orb controls and their artwork to 36×35 px.
- Modify `app/globals.css`: align contact-transition geometry with the smaller orb and define caption hover/focus/reduced-motion states.
- Modify `components/ImageStrip.tsx`: add localized visual captions, responsive 1/2/3 slide breakpoints, and matching image `sizes`.

### Task 1: Restore compact orb geometry

**Files:**
- Create: `tests/home-slider-ui.test.ts`
- Modify: `components/Navbar.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Write the failing orb contract test**

Create `tests/home-slider-ui.test.ts` with shared source loading and this test:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const navbar = readFileSync(new URL('../components/Navbar.tsx', import.meta.url), 'utf8');
const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const imageStrip = readFileSync(new URL('../components/ImageStrip.tsx', import.meta.url), 'utf8');

test('navbar uses the compact orb and contact transition targets its center', () => {
  assert.equal((navbar.match(/w-\[36px\] h-\[35px\]/g) ?? []).length, 3);
  assert.match(navbar, /width=\{36\} height=\{35\}/);
  assert.doesNotMatch(navbar, /w-\[56px\] h-\[54px\]|width=\{56\} height=\{54\}/);
  assert.match(globals, /--nav-orb-center-x: calc\(100% - 34px\)/);
  assert.match(globals, /--nav-orb-center-x: calc\(100% - 42px\)/);
  assert.match(globals, /--nav-orb-center-y: calc\(var\(--nav-top-padding\) \+ 38\.5px\)/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/home-slider-ui.test.ts
```

Expected: FAIL because `Navbar.tsx` still contains 56×54 geometry and the shared horizontal center offsets are 44/52 px.

- [ ] **Step 3: Implement the compact orb**

In both closed and open menu controls in `components/Navbar.tsx`:

```tsx
className="w-[36px] h-[35px] cursor-pointer ..."
```

Use 36×35 for the `Image` and mobile masked dot as well. In `app/globals.css`, change only the horizontal shared geometry:

```css
:root {
  --nav-orb-center-x: calc(100% - 34px);
}

@media (width >= 768px) {
  :root {
    --nav-orb-center-x: calc(100% - 42px);
  }
}
```

Keep `--nav-orb-center-y` unchanged.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the Step 2 command.

Expected: PASS, 1/1.

- [ ] **Step 5: Commit**

```bash
git add tests/home-slider-ui.test.ts components/Navbar.tsx app/globals.css
git commit -m "Restore compact navigation orb"
```

### Task 2: Add responsive 1/2/3 slide counts

**Files:**
- Modify: `tests/home-slider-ui.test.ts`
- Modify: `components/ImageStrip.tsx`

- [ ] **Step 1: Add the failing responsive slider test**

Append:

```ts
test('homepage slider uses one, two, then three responsive slides', () => {
  assert.match(
    imageStrip,
    /breakpoints=\{\{\s*768: \{ slidesPerView: 2 \},\s*1280: \{ slidesPerView: 3 \}\s*\}\}/s,
  );
  assert.match(
    imageStrip,
    /sizes="\(max-width: 767px\) 100vw, \(max-width: 1279px\) 50vw, 33vw"/,
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run the Task 1 Step 2 command.

Expected: FAIL because the existing slider jumps directly from one to three slides at 768 px.

- [ ] **Step 3: Implement the responsive breakpoints and image hint**

In `components/ImageStrip.tsx`:

```tsx
breakpoints={{
  768: { slidesPerView: 2 },
  1280: { slidesPerView: 3 },
}}
```

Set the image hint to:

```tsx
sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Expected: PASS, 2/2.

- [ ] **Step 5: Commit**

```bash
git add tests/home-slider-ui.test.ts components/ImageStrip.tsx
git commit -m "Balance homepage slider breakpoints"
```

### Task 3: Add localized hover and keyboard captions

**Files:**
- Modify: `tests/home-slider-ui.test.ts`
- Modify: `components/ImageStrip.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add the failing caption contract test**

Append:

```ts
test('homepage slides expose localized captions on hover and focus', () => {
  assert.match(imageStrip, /localizeProject\(project, locale\)\.title/);
  assert.match(imageStrip, /className="home-slide-link/);
  assert.match(imageStrip, /aria-hidden="true"/);
  assert.match(imageStrip, /className="home-slide-caption/);
  assert.match(globals, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(globals, /\.home-slide-link:hover \.home-slide-caption/);
  assert.match(globals, /\.home-slide-link:focus-visible \.home-slide-caption/);
  assert.match(globals, /transition: opacity 220ms cubic-bezier\(0\.22, 1, 0\.36, 1\),\s*transform 220ms cubic-bezier\(0\.22, 1, 0\.36, 1\)/s);
  assert.match(globals, /transform: translateY\(8px\)/);
  assert.match(globals, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.home-slide-caption[\s\S]*transform: none/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Expected: FAIL because captions and their interaction CSS do not exist.

- [ ] **Step 3: Implement localized caption rendering**

Inside the slide mapping, resolve the project after `const locale = useLocale()` is available:

```tsx
const project = projects.find((candidate) => candidate.slug === slide.slug);
const title = project ? localizeProject(project, locale).title : '';
```

Add `home-slide-link` to the project link. Inside it, after the image, render only when a title exists:

```tsx
{title && (
  <span
    aria-hidden="true"
    className="home-slide-caption absolute inset-x-0 bottom-0 z-10 bg-coral px-4 py-3 text-sm font-[600] uppercase tracking-[0.08em] text-dark"
  >
    {title}
  </span>
)}
```

- [ ] **Step 4: Implement hover, focus, and reduced-motion CSS**

In `app/globals.css`:

```css
.home-slide-caption {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (hover: hover) and (pointer: fine) {
  .home-slide-link:hover .home-slide-caption {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-slide-link:focus-visible .home-slide-caption {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .home-slide-caption {
    transform: none;
  }
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Expected: PASS, 3/3.

- [ ] **Step 6: Commit**

```bash
git add tests/home-slider-ui.test.ts components/ImageStrip.tsx app/globals.css
git commit -m "Add localized homepage slide captions"
```

### Task 4: Integrated verification and visual QA

**Files:**
- Verify only; screenshots and reports belong under ignored `.context/verify-site/`.

- [ ] **Step 1: Run the full repository gate**

Run:

```bash
pnpm check
git diff origin/main...HEAD --check
git status --short
```

Expected: both Vitest and node:test suites pass, typecheck/lint/i18n/build pass, diff check is silent, and status is clean.

- [ ] **Step 2: Run desktop breakpoint QA**

Start the dev server with `CONDUCTOR_PORT` and use Chrome CDP to inspect 767, 768, 1024, 1279, and 1280 px widths. Assert visible slide counts of 1, 2, 2, 2, and 3 respectively; capture screenshots under `.context/verify-site/`.

- [ ] **Step 3: Verify interaction and accessibility states**

At desktop width, verify hover and keyboard `:focus-visible` each reveal the correct localized title. Emulate touch input and confirm the caption does not remain visible. Emulate reduced motion and confirm the caption has no translation. Confirm the homepage has no overflow, hydration errors, failed requests, or console errors.

- [ ] **Step 4: Verify orb and contact geometry**

At mobile and desktop widths, assert the orb artwork is 36×35 px and the contact wipe target matches its computed center. Capture the homepage and contact route at mobile width.

- [ ] **Step 5: Request independent final review**

Review `origin/main...HEAD` against the approved spec and this plan. Resolve any Critical or Important findings and repeat the affected checks.
