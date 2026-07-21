# Mobile Safe Area and Per-Page Social Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the contact-page iOS status area beige and publish deterministic, relevant 1200×630 social images for every static page family.

**Architecture:** Generate source-preserving high-quality JPEG crops with existing ffmpeg tooling. Keep a typed static-page image map in the metadata helper—never at layout level—so project pages retain their own images. Move the coral contact wipe below the top safe area and translate its orb endpoint into the overlay's local coordinate space.

**Tech Stack:** Next.js 16 metadata API, next-intl, TypeScript, Node test runner, Framer Motion, CSS safe-area variables, ffmpeg/MJPEG, Chrome CDP, GitHub/Vercel.

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
- Create: `public/images/social/home-walecznych.jpg`
- Create: `public/images/social/projects-dehesa.jpg`
- Create: `public/images/social/studio-team.jpg`
- Create: `public/images/social/offer-commercial.jpg`
- Create: `public/images/social/contact-reel.jpg`

- [ ] **Step 1: Write the failing asset contract**

```ts
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const assets = [
  'home-walecznych.jpg',
  'projects-dehesa.jpg',
  'studio-team.jpg',
  'offer-commercial.jpg',
  'contact-reel.jpg',
];

function jpegSize(buffer: Buffer) {
  assert.deepEqual([...buffer.subarray(0, 2)], [0xff, 0xd8]);
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset + 2);
    if (sofMarkers.has(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error('JPEG dimensions not found');
}

test('static social assets are non-empty 1200x630 JPEGs', () => {
  for (const asset of assets) {
    const url = new URL(`../public/images/social/${asset}`, import.meta.url);
    assert.ok(existsSync(url), `missing ${asset}`);
    assert.ok(statSync(url).size > 10_000, `${asset} is unexpectedly small`);
    assert.deepEqual(jpegSize(readFileSync(url)), { width: 1200, height: 630 });
  }
});
```

- [ ] **Step 2: Verify RED**

Run `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/social-metadata.test.ts`.

Expected: FAIL on the first missing asset.

- [ ] **Step 3: Generate the four still-image crops**

For each mapping below, run the same deterministic center-crop command:

```bash
ffmpeg -y -v error -i <source> -vf "scale=1200:630:force_original_aspect_ratio=increase:flags=lanczos,crop=1200:630" -frames:v 1 -c:v mjpeg -q:v 2 <output.jpg>
```

Mappings:

```text
public/images/mieszkanie-walecznych/KOOL_m_walecznych_www_main.webp → public/images/social/home-walecznych.jpg
public/images/dehesa/kool_dehesa_04.webp → public/images/social/projects-dehesa.jpg
public/images/studio/team.webp → public/images/social/studio-team.jpg
public/images/oferta/KOOL_oferta_komercyjne.webp → public/images/social/offer-commercial.jpg
```

- [ ] **Step 4: Extract the approved contact frame**

```bash
ffmpeg -y -v error -ss 9.6 -i public/videos/reel.mp4 -vf "crop=360:189:0:225:exact=1,scale=1200:630:flags=lanczos" -frames:v 1 -c:v mjpeg -q:v 2 public/images/social/contact-reel.jpg
```

- [ ] **Step 5: Verify physical outputs**

Run `file` and `sips -g pixelWidth -g pixelHeight` for all five files. Expected: valid JPEG, exactly 1200×630. Inspect all five with `view_image`; reject unintended crops or distracting contact softness.

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
test('static pages declare exact deterministic localized social images', () => {
  const mappings = {
    projekty: '/images/social/projects-dehesa.jpg',
    studio: '/images/social/studio-team.jpg',
    oferta: '/images/social/offer-commercial.jpg',
    kontakt: '/images/social/contact-reel.jpg',
  };
  for (const [key, image] of Object.entries(mappings)) {
    assert.match(metadataSource, new RegExp(`${key}: ['\"]${image}['\"]`));
    assert.equal(typeof pl.meta[key].ogImageAlt, 'string');
    assert.equal(typeof en.meta[key].ogImageAlt, 'string');
  }
  assert.match(metadataSource, /width: 1200/);
  assert.match(metadataSource, /height: 630/);
  assert.match(metadataSource, /alt: t\(`\$\{key\}\.ogImageAlt`\)/);
  assert.match(metadataSource, /openGraph:[\s\S]*images: \[socialImage\]/);
  assert.match(metadataSource, /twitter:[\s\S]*images: \[socialImage\]/);
  assert.match(metadataSource, /images: \[socialImage\]/);
  assert.match(metadataSource, /card: 'summary_large_image'/);
  assert.match(homeSource, /home-walecznych\.jpg/);
  assert.match(homeSource, /t\('home\.ogImageAlt'\)/);
  assert.match(homeSource, /width: 1200/);
  assert.match(homeSource, /height: 630/);
  assert.match(homeSource, /openGraph:[\s\S]*images: \[socialImage\]/);
  assert.match(homeSource, /twitter:[\s\S]*card: 'summary_large_image'[\s\S]*images: \[socialImage\]/);
});

test('static defaults do not replace project images', () => {
  assert.match(projectSource, /images: project\.images\[0\]/);
  assert.doesNotMatch(projectSource, /staticSocialImages|images\/social\//);
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
  projekty: '/images/social/projects-dehesa.jpg',
  studio: '/images/social/studio-team.jpg',
  oferta: '/images/social/offer-commercial.jpg',
  kontakt: '/images/social/contact-reel.jpg',
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

Change only the homepage social-image URL to `/images/social/home-walecznych.jpg`; keep 1200×630 and the localized home alt lookup.

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
- Verification artifacts only under ignored `.context/`.

- [ ] **Step 1: Run the repository gate**

Run `pnpm check`, `git diff origin/main...HEAD --check`, `git merge-tree --write-tree origin/main HEAD`, and `git status --short`. Expected: pass and clean tracked status.

- [ ] **Step 2: Verify rendered metadata locally**

Start the production server in terminal A and keep it running while terminal B executes the verifier; stop it with Ctrl-C after local QA:

Terminal A:

```bash
PORT=55050 pnpm start
```

Terminal B:

```bash
curl -sS -D .context/root-headers.txt -o /dev/null http://localhost:55050/
```

Assert the root status is 307/308 and `Location` targets `/pl`. Create ignored `.context/verify-social-metadata.mjs` using built-in `fetch`. Implement `meta(html, property)` by matching `<meta>` tags regardless of attribute order and reading either `property` or `name`; implement `links(html, rel)` the same way for canonical links. Use this exact route matrix:

```js
const routes = {
  '/pl': ['pl_PL', '/images/social/home-walecznych.jpg'],
  '/en': ['en_US', '/images/social/home-walecznych.jpg'],
  '/pl/projekty': ['pl_PL', '/images/social/projects-dehesa.jpg'],
  '/en/projekty': ['en_US', '/images/social/projects-dehesa.jpg'],
  '/pl/studio': ['pl_PL', '/images/social/studio-team.jpg'],
  '/en/studio': ['en_US', '/images/social/studio-team.jpg'],
  '/pl/oferta': ['pl_PL', '/images/social/offer-commercial.jpg'],
  '/en/oferta': ['en_US', '/images/social/offer-commercial.jpg'],
  '/pl/kontakt': ['pl_PL', '/images/social/contact-reel.jpg'],
  '/en/kontakt': ['en_US', '/images/social/contact-reel.jpg'],
};
```

For every route, use `assert.equal()`/`assert.ok()` to require HTTP 200; exactly one `og:image`; an absolute image whose URL ends with the mapped suffix; `og:image:width=1200`; `og:image:height=630`; non-empty `og:image:alt`; `twitter:card=summary_large_image`; a Twitter image equal to the Open Graph image; an absolute canonical URL; and the mapped Open Graph locale. Fetch `/pl/projekty/mieszkanie-walecznych` and `/en/projekty/mieszkanie-walecznych`, then assert each `og:image` is absolute, contains `/images/mieszkanie-walecznych/`, and does not contain `/images/social/`. Exit nonzero on any failed assertion.

Run:

```bash
node .context/verify-social-metadata.mjs http://localhost:55050
```

Expected: every route and assertion passes with exit code 0.

- [ ] **Step 3: Verify safe-area behavior**

Copy the reusable CDP client/event-capture helpers from the existing ignored `.context/verify-site/cdp-qa.mjs` into `.context/verify-safe-area.mjs`; set its base URL from `process.argv[2]`. Launch Chrome explicitly in terminal C, run the verifier from terminal B, then stop Chrome with Ctrl-C:

Terminal C:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9223 --user-data-dir="$PWD/.context/chrome-safe-area" about:blank
```

Terminal B:

```bash
node .context/verify-safe-area.mjs http://localhost:55050
```

In the verifier, use `Emulation.setDeviceMetricsOverride` with 390×844/mobile and `Emulation.setSafeAreaInsetsOverride` with `{insets: {top: 47, left: 0, bottom: 34, right: 0}}` when the protocol supports it. Check direct `/pl/kontakt`, client navigation from `/pl` into contact during the wipe, and the open mobile menu. Use `Runtime.evaluate` plus `assert` to require: computed `html` and `body` backgrounds are `rgb(229, 221, 208)`; the contact transition overlay bounding rect starts at Y=47; its inline/computed clip path is centered at the navbar orb after subtracting the inset; the menu overlay bounding rect starts at Y=0 and is `rgb(252, 49, 23)`; the transition ends at zero radius; and normal/reduced-motion runs collect zero console exceptions or failed network responses. Save `safe-area-contact-direct.png`, `safe-area-contact-wipe.png`, and `safe-area-menu-open.png` under `.context/verify-site/`. If `Emulation.setSafeAreaInsetsOverride` is unavailable, record that explicitly and use the 47px CSS emulation fallback before applying the same assertions.

Chrome cannot fully reproduce Safari's physical status-bar composition. After deployment, perform the final acceptance check on a notched iPhone in Mobile Safari: load contact directly, navigate into contact, and open/close the menu. The status area must remain beige except while the intentionally full-screen coral menu is open. Do not declare the device-specific issue fully closed until this manual check is confirmed.

- [ ] **Step 4: Inspect assets and request final review**

Inspect all five images together at full and typical card size. Then request independent spec and code-quality review; resolve Critical/Important findings and repeat affected checks.

- [ ] **Step 5: Push and verify draft PR #19**

Push and wait for checks:

```bash
git push origin poprawki-ui-i-mobile
gh pr checks 19 --watch
gh pr view 19 --json headRefOid,statusCheckRollup,url
```

Use the stable branch preview URL already published by the Vercel PR comment:

```bash
node .context/verify-social-metadata.mjs https://kool-v2-git-poprawki-ui-i-mobile-j4ckus-projects.vercel.app
```

Confirm PR #19 includes the implementation commits and the preview serves the expected absolute image URLs before testing third-party caches. Note that OpenGraph.xyz/social platforms may require a re-scrape.
