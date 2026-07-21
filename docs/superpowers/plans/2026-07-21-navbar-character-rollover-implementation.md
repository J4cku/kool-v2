# Navbar Character Rollover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Mersi-inspired, character-by-character hover and focus rollover to Kool Studio’s desktop navigation links.

**Architecture:** Keep the change local to `components/Navbar.tsx`. A small presentational helper renders two `aria-hidden` character rows; each existing link receives an explicit `aria-label`. Local active-label state, driven by native link hover and focus handlers, provides Framer Motion's animation state without changing the typed `next-intl` link. Mobile markup and menu choreography stay intact.

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion, Tailwind CSS v4.

---

## File structure

- Modify: `components/Navbar.tsx` — local character-row helper and the five desktop label integrations.
- Modify: `package.json`, `pnpm-lock.yaml` — only if the user authorizes adding a minimal unit-test runner; the project currently has no test command or test framework.
- Create: a focused component test beside `Navbar.tsx` only if a runner is authorized.

### Task 1: Establish a regression test seam

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (only with authorization)
- Create: `components/Navbar.test.tsx` (only with authorization)

- [ ] **Step 1: Add a minimal React unit-test runner only after approval**

Add the smallest compatible test dependency set and a `test` script. Do not modify production code.

- [ ] **Step 2: Write the failing test**

Assert that a desktop rollover label exposes one accessible name, renders both visual rows as `aria-hidden`, and applies the duplicate text characters.

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test -- Navbar.test.tsx`

Expected: FAIL because the rollover helper does not exist.

- [ ] **Step 4: Commit the test setup and failing test**

```bash
git add package.json pnpm-lock.yaml components/Navbar.test.tsx
git commit -m "test: cover navbar rollover labels"
```

### Task 2: Implement the rollover label

**Files:**
- Modify: `components/Navbar.tsx:14-154`
- Test: `components/Navbar.test.tsx`

- [ ] **Step 1: Add `NavLinkLabel` beside `navLinks`**

Accept `label: string` and `isActive: boolean`; map `Array.from(label)` into two motion character rows. Preserve spaces as non-breaking spaces. Mark both visual rows `aria-hidden` and give their parent a clipped one-line layout.

- [ ] **Step 2: Animate the two rows minimally**

Add one nullable active-label key in `Navbar`, set by `onMouseEnter`/`onFocus` on each existing typed link and reset by `onMouseLeave`/`onBlur`. Pass whether its key is active to `NavLinkLabel`. Move the original row to `y: '-100%'` and the duplicate row to `y: '0%'`; use `duration: 0.45`, `delay: index * 0.015`, and `ease: [0.22, 1, 0.36, 1]`. Use `useReducedMotion()` to keep the original row at `0%` and the duplicate row at `100%` for reduced-motion users.

- [ ] **Step 3: Integrate the helper into desktop internal links and Instagram**

Replace only the desktop plain label text. Add `aria-label={label}` to each existing desktop link so its accessible name is exposed exactly once. Keep the destination, active font weight, opacity hover class, comma separators, and server-mounted links. Delete the existing underline motion element.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `pnpm test -- Navbar.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the implementation**

```bash
git add components/Navbar.tsx components/Navbar.test.tsx
git commit -m "feat: animate navbar labels on hover"
```

### Task 3: Verify the live interaction

**Files:**
- Modify: none

- [ ] **Step 1: Run static verification**

Run: `pnpm check`

Expected: exit code 0.

- [ ] **Step 2: Manually verify in the browser**

Run the Conductor-safe development server with `pnpm dev`. At desktop width, verify each Polish and English inline nav label rolls per character on hover and keyboard focus, Instagram does the same, active weight remains, and reduced-motion keeps labels static. At mobile width, confirm the overlay is unchanged.

- [ ] **Step 3: Inspect the final diff**

Run: `git diff origin/main... -- components/Navbar.tsx package.json pnpm-lock.yaml components/Navbar.test.tsx`

Expected: only the approved desktop rollover and any explicitly authorized test setup.
