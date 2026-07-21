# Mobile Safe Area and Per-Page Social Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the contact-page iOS status area beige and publish deterministic, relevant 1200×630 social images for every static page family.

**Architecture:** Generate source-preserving WebP crops with existing ffmpeg tooling. Keep a typed static-page image map in the metadata helper—never at layout level—so project pages retain their own images. Move the coral contact wipe below the top safe area and translate its orb endpoint into the overlay's local coordinate space.

**Tech Stack:** Next.js 16 metadata API, next-intl, TypeScript, Node test runner, Framer Motion, CSS safe-area variables, ffmpeg/WebP, Chrome CDP, GitHub/Vercel.

---

## File map

- Create `tests/social-metadata.test.ts` for asset and metadata contracts.
- Create `tests/contact-safe-area.test.ts` for safe-area geometry contracts.
- Create five files under `public/images/social/`.
- Modify `lib/metadata.ts`, `app/[locale]/page.tsx`, `messages/pl.json`, and `messages/en.json` for localized social metadata.
- Modify `app/globals.css` and `components/PageTransition.tsx` for the safe area.

### Task 1: Generate and validate social assets

**Files:**
- Create: `tests/social-metadata.test.ts`
- Create: `public/images/social/home-walecznych.webp`
- Create: `public/images/social/projects-dehesa.webp`
- Create: `public/images/social/studio-team.webp`
- Create: `public/images/social/offer-commercial.webp`
- Create: `public/images/social/contact-reel.webp`

- [ ] **Step 1: Write the failing asset contract**

```ts
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import test from 'node:test';

const assets = [
  'home-walecznych.webp',
  'projects-dehesa.webp',
  'studio-team.webp',
  'offer-commercial.webp',
  'contact-reel.webp',
];

test('static social assets exist and are non-empty', () => {
  for (const asset of assets) {
    const url = new URL(`../public/images/social/${asset}`, import.meta.url);
    assert.ok(existsSync(url), `missing ${asset}`);
    assert.ok(statSync(url).size > 10_000, `${asset} is unexpectedly small`);
  }
});
```

- [ ] **Step 2: Verify RED**

Run `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/social-metadata.test.ts`.

Expected: FAIL on the first missing asset.

- [ ] **Step 3: Generate the four still-image crops**

For each mapping below, run the same deterministic center-crop command:

```bash
ffmpeg -y -v error -i <source> -vf "scale=1200:630:force_original_aspect_ratio=increase:flags=lanczos,crop=1200:630" -frames:v 1 -c:v libwebp -quality 90 -compression_level 6 <output>
```

Mappings:

```text
public/images/mieszkanie-walecznych/KOOL_m_walecznych_www_main.webp → public/images/social/home-walecznych.webp
public/images/dehesa/kool_dehesa_04.webp → public/images/social/projects-dehesa.webp
public/images/studio/team.webp → public/images/social/studio-team.webp
public/images/oferta/KOOL_oferta_komercyjne.webp → public/images/social/offer-commercial.webp
```

- [ ] **Step 4: Extract the approved contact frame**

```bash
ffmpeg -y -v error -ss 9.6 -i public/videos/reel.mp4 -vf "crop=360:189:0:225,scale=1200:630:flags=lanczos" -frames:v 1 -c:v libwebp -quality 90 -compression_level 6 public/images/social/contact-reel.webp
```

- [ ] **Step 5: Verify physical outputs**

Run `file` and `sips -g pixelWidth -g pixelHeight` for all five files. Expected: valid WebP, exactly 1200×630. Inspect all five with `view_image`; reject unintended crops or distracting contact softness.

- [ ] **Step 6: Verify GREEN and commit**

Run the focused test; expected PASS 1/1. Commit the test and five assets as `Add per-page social preview assets`.

### Task 2: Wire localized static-page Open Graph and Twitter metadata

**Files:**
- Modify: `tests/social-metadata.test.ts`
- Modify: `lib/metadata.ts`
- Modify: `app/[locale]/page.tsx`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add the failing metadata contract**

Extend the test with `readFileSync` sources for `lib/metadata.ts`, the locale homepage, the project-detail page, and both message JSON files. Add:

```ts
test('static pages declare deterministic localized social images', () => {
  for (const key of ['projekty', 'studio', 'oferta', 'kontakt']) {
    assert.match(metadataSource, new RegExp(`${key}:[\\s\\S]*?/images/social/`));
    assert.equal(typeof pl.meta[key].ogImageAlt, 'string');
    assert.equal(typeof en.meta[key].ogImageAlt, 'string');
  }
  assert.match(metadataSource, /width: 1200/);
  assert.match(metadataSource, /height: 630/);
  assert.match(metadataSource, /images: \[socialImage\]/);
  assert.match(metadataSource, /card: 'summary_large_image'/);
  assert.match(homeSource, /home-walecznych\.webp/);
  assert.match(homeSource, /t\('home\.ogImageAlt'\)/);
});

test('static defaults do not replace project images', () => {
  assert.match(projectSource, /images: project\.images\[0\]/);
  assert.doesNotMatch(projectSource, /staticSocialImages/);
});
```

- [ ] **Step 2: Verify RED**

Run the focused test. Expected: FAIL because the map, static alt keys, and Walecznych path are absent.

- [ ] **Step 3: Add localized alt copy**

Add `ogImageAlt` under `meta.home`, `meta.projekty`, `meta.studio`, `meta.oferta`, and `meta.kontakt` in both message files. Describe the actual Walecznych apartment, Dehesa interior, studio team, commercial interior, and material-palette reel frame in natural Polish and English.

- [ ] **Step 4: Add the typed static-page map**

In `lib/metadata.ts`:

```ts
const staticSocialImages = {
  projekty: '/images/social/projects-dehesa.webp',
  studio: '/images/social/studio-team.webp',
  oferta: '/images/social/offer-commercial.webp',
  kontakt: '/images/social/contact-reel.webp',
} as const satisfies Record<MetaPageKey, string>;
```

Inside `pageMetadata()` create:

```ts
const socialImage = {
  url: staticSocialImages[key],
  width: 1200,
  height: 630,
  alt: t(`${key}.ogImageAlt`),
};
```

Add `images: [socialImage]` to Open Graph and:

```ts
twitter: {
  card: 'summary_large_image',
  title: `${title} | kool studio`,
  description,
  images: [socialImage],
},
```

- [ ] **Step 5: Switch the homepage image**

Change only the homepage social-image URL to `/images/social/home-walecznych.webp`; keep 1200×630 and the localized home alt lookup.

- [ ] **Step 6: Verify GREEN and commit**

Run the focused test and `pnpm check:i18n`. Expected: all tests pass and PL/EN key counts match. Commit as `Add localized social images to static pages`.

### Task 3: Keep the contact wipe below the iOS safe area

**Files:**
- Create: `tests/contact-safe-area.test.ts`
- Modify: `app/globals.css`
- Modify: `components/PageTransition.tsx`

- [ ] **Step 1: Write the failing safe-area contract**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const transition = readFileSync(new URL('../components/PageTransition.tsx', import.meta.url), 'utf8');
const navbar = readFileSync(new URL('../components/Navbar.tsx', import.meta.url), 'utf8');

test('contact wipe leaves the iOS status safe area beige', () => {
  assert.match(globals, /html,\s*body\s*\{[^}]*background-color: #E5DDD0;/);
  assert.match(transition, /top-\[env\(safe-area-inset-top\)\]/);
  assert.match(transition, /calc\(var\(--nav-orb-center-y\) - env\(safe-area-inset-top\)\)/);
  assert.match(transition, /fixed inset-x-0 bottom-0/);
  assert.doesNotMatch(transition, /fixed inset-0 z-\[90\] bg-coral/);
  assert.match(navbar, /fixed inset-x-0 top-0 h-dvh z-\[100\] bg-coral/);
});
```

- [ ] **Step 2: Verify RED**

Run the focused test. Expected: FAIL because the wipe uses `inset-0` and the canvas rule is body-only.

- [ ] **Step 3: Make the canvas beige**

Replace the body-only rule in `app/globals.css` with:

```css
html,
body {
  background-color: #E5DDD0;
}
```

- [ ] **Step 4: Use safe-area-local wipe coordinates**

In `PageTransition.tsx`:

```ts
const orbCenter = [
  'var(--nav-orb-center-x)',
  'calc(var(--nav-orb-center-y) - env(safe-area-inset-top))',
].join(' ');
```

Change the sheet to:

```tsx
className="pointer-events-none fixed inset-x-0 bottom-0 top-[env(safe-area-inset-top)] z-[90] bg-coral"
```

Do not change reduced-motion branching or the full-screen coral mobile menu.

- [ ] **Step 5: Verify GREEN and commit**

Run the focused test and `pnpm test`; expected all suites pass. Commit as `Keep contact transition below iOS safe area`.

### Task 4: Integrated verification and draft-PR deployment

**Files:**
- Verification artifacts only under ignored `.context/verify-site/`.

- [ ] **Step 1: Run the repository gate**

Run `pnpm check`, `git diff origin/main...HEAD --check`, `git merge-tree --write-tree origin/main HEAD`, and `git status --short`. Expected: pass and clean tracked status.

- [ ] **Step 2: Verify rendered metadata locally**

Start with `CONDUCTOR_PORT=55050`. Verify `/` redirects to `/pl`, then inspect `/pl`, `/en`, and both locales of projects/studio/offer/contact. Assert one absolute `og:image`, 1200×630, localized alt, `summary_large_image`, matching Twitter image, canonical, and locale. On representative project details assert only that their project image remains independent.

- [ ] **Step 3: Verify safe-area behavior**

Use Chrome CDP with a mobile viewport and safe-area emulation when supported; otherwise combine computed CSS geometry with screenshots. Check direct contact load, navigation into contact during the wipe, and open mobile menu. Contact/status remains beige, wipe ends at the orb, menu remains full-screen coral, and normal/reduced motion produce zero console/runtime/network errors.

- [ ] **Step 4: Inspect assets and request final review**

Inspect all five images together at full and typical card size. Then request independent spec and code-quality review; resolve Critical/Important findings and repeat affected checks.

- [ ] **Step 5: Push and verify draft PR #19**

Push `poprawki-ui-i-mobile`, confirm PR #19 includes the commits, wait for Vercel, and fetch deployment HTML to verify absolute `og:image` output before testing third-party caches. Note that OpenGraph.xyz/social platforms may require a re-scrape.
