# Centered Homepage Slider Caption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage slider's bottom coral caption bar with an exactly centered beige title on a compact translucent dark rectangle.

**Architecture:** Keep the existing localized title and hover/focus visibility state. Change the caption to a full-slide centering layer containing a compact visual label; retain the existing CSS motion contract on the outer layer so reduced-motion behavior remains unchanged.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Node test runner, Chrome CDP.

## Global Constraints

- Use existing `dark` (`#1A1A1A`) and `beige` (`#E5DDD0`) tokens only.
- The rectangle uses exactly 45% dark opacity, 2px backdrop blur, sharp corners, and no border or shadow.
- Keep localized titles, link URLs, slide behavior, responsive counts, image scaling, hover, focus-visible, and reduced-motion behavior unchanged.
- Touch behavior remains unchanged.

---

### Task 1: Center and restyle the slider caption

**Files:**
- Modify: `tests/home-slider-ui.test.ts`
- Modify: `components/ImageStrip.tsx`

**Interfaces:**
- Consumes: the existing `title` string and `.home-slide-caption` hover/focus/reduced-motion CSS contract.
- Produces: a pointer-transparent full-slide centering layer with one compact visual label.

- [ ] **Step 1: Write the failing caption-layout contract**

Replace the caption-specific markup assertions in `tests/home-slider-ui.test.ts` with:

```ts
assert.match(
  imageStripSource,
  /home-slide-caption pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4/,
);
assert.match(
  imageStripSource,
  /max-w-\[85%\] bg-dark\/45 px-4 py-\[10px\] text-center text-sm font-\[600\] uppercase tracking-\[0\.08em\] text-beige backdrop-blur-\[2px\]/,
);
assert.doesNotMatch(
  imageStripSource,
  /home-slide-caption[^"\n]*(?:bottom-0|bg-coral)/,
);
```

Keep the existing localization, `aria-hidden`, hover, focus-visible, transition, and reduced-motion assertions.

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/home-slider-ui.test.ts
```

Expected: FAIL because the caption still uses `inset-x-0 bottom-0 bg-coral` and has no compact centered label.

- [ ] **Step 3: Implement the centered label**

Replace the existing caption span in `components/ImageStrip.tsx` with:

```tsx
<span
  aria-hidden="true"
  className="home-slide-caption pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4"
>
  <span className="max-w-[85%] bg-dark/45 px-4 py-[10px] text-center text-sm font-[600] uppercase tracking-[0.08em] text-beige backdrop-blur-[2px]">
    {title}
  </span>
</span>
```

Do not modify `app/globals.css`; its opacity, hover, focus-visible, transition, and reduced-motion rules continue to target the outer `.home-slide-caption` layer.

- [ ] **Step 4: Verify GREEN and repository health**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/home-slider-ui.test.ts
pnpm check
git diff --check
```

Expected: focused tests pass, all repository checks pass, 48 static pages build, and the diff has no whitespace errors.

- [ ] **Step 5: Verify rendered interaction**

At a desktop viewport, hover and keyboard-focus representative light and dark slider images. Capture screenshots and confirm the rectangle is compact, the title is exactly centered, beige text remains readable, the entire image stays clickable, and reduced-motion removes translation.

- [ ] **Step 6: Commit**

```bash
git add components/ImageStrip.tsx tests/home-slider-ui.test.ts
git commit -m "Center homepage slider captions"
```
