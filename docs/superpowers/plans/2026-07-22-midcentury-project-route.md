# Midcentury Project Route Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the project at `mieszkanie-midcentury` and permanently redirect both localized `mieszkanie-widmo` URLs to the new canonical route.

**Architecture:** Change the project catalog slug so every generated consumer adopts the new URL. Add one pre-render Next.js configuration redirect with a captured PL/EN locale, while leaving the internal image directory unchanged.

**Tech Stack:** Next.js 16 App Router, TypeScript, Node test runner, next-intl, Vercel.

## Global Constraints

- Canonical slug: `mieszkanie-midcentury`.
- Legacy slug: `mieszkanie-widmo`.
- The legacy PL/EN page routes return HTTP 308 and preserve the locale and query string.
- `/images/mieszkanie-widmo/` remains the internal asset path.
- Project content, order position, translations, images, and presentation remain unchanged.

---

### Task 1: Rename the canonical slug and add the permanent redirect

**Files:**
- Create: `tests/project-route.test.ts`
- Modify: `tests/project-content.test.ts`
- Modify: `data/projects.ts`
- Modify: `next.config.mjs`

**Interfaces:**
- Consumes: `Project.slug`, `projectDisplayOrder`, and Next.js `redirects()` configuration.
- Produces: canonical localized routes at `/[locale]/projekty/mieszkanie-midcentury` and a locale-preserving 308 from the old route.

- [ ] **Step 1: Write the failing route contract**

Create `tests/project-route.test.ts`:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { projectDisplayOrder, projects } from '../data/projects.ts';

const nextConfigSource = readFileSync(new URL('../next.config.mjs', import.meta.url), 'utf8');

test('midcentury project uses the new canonical slug without renaming assets', () => {
  const project = projects.find(({ id }) => id === '7');
  const displayOrder: readonly string[] = projectDisplayOrder;
  assert.ok(project);
  assert.equal(project.slug, 'mieszkanie-midcentury');
  assert.ok(displayOrder.includes('mieszkanie-midcentury'));
  assert.ok(!displayOrder.includes('mieszkanie-widmo'));
  assert.match(project.thumbnail, /^\/images\/mieszkanie-widmo\//);
  assert.ok(project.images.every((image) => image.startsWith('/images/mieszkanie-widmo/')));
});

test('legacy localized routes permanently redirect to the new slug', () => {
  assert.match(
    nextConfigSource,
    /source: ['"]\/:locale\(pl\|en\)\/projekty\/mieszkanie-widmo['"]/,
  );
  assert.match(
    nextConfigSource,
    /destination: ['"]\/:locale\/projekty\/mieszkanie-midcentury['"]/,
  );
  assert.match(nextConfigSource, /permanent: true/);
});
```

In `tests/project-content.test.ts`, replace only the expected display-order entry `'mieszkanie-widmo'` with `'mieszkanie-midcentury'`.

- [ ] **Step 2: Run the focused tests to verify RED**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-route.test.ts tests/project-content.test.ts
```

Expected: FAIL because project ID `7` and the display order still use `mieszkanie-widmo`, and no redirect exists.

- [ ] **Step 3: Change the active project slug and display order**

In `data/projects.ts`, change exactly these two active slug values:

```ts
slug: 'mieszkanie-midcentury',
```

```ts
'mieszkanie-midcentury',
```

Do not change any `/images/mieszkanie-widmo/` strings.

- [ ] **Step 4: Add the pre-render permanent redirect**

Add to the `nextConfig` object in `next.config.mjs`:

```js
async redirects() {
  return [
    {
      source: '/:locale(pl|en)/projekty/mieszkanie-widmo',
      destination: '/:locale/projekty/mieszkanie-midcentury',
      permanent: true,
    },
  ];
},
```

- [ ] **Step 5: Verify GREEN and repository health**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-route.test.ts tests/project-content.test.ts
pnpm check
git diff --check
```

Expected: focused tests pass, all repository checks pass, the production build generates the new PL/EN project paths, and the diff has no whitespace errors.

- [ ] **Step 6: Verify production routing and generated discovery URLs**

After `pnpm check`, start the production server in terminal A:

```bash
PORT=55052 pnpm start
```

Create ignored `.context/verify-midcentury-route.mjs`:

```js
import assert from 'node:assert/strict';

const baseUrl = process.argv[2];
assert.ok(baseUrl);

for (const locale of ['pl', 'en']) {
  const newPath = `/${locale}/projekty/mieszkanie-midcentury`;
  const oldPath = `/${locale}/projekty/mieszkanie-widmo?source=legacy`;
  const canonicalUrl = `https://koolstudio.pl${newPath}`;

  const current = await fetch(new URL(newPath, baseUrl));
  assert.equal(current.status, 200);
  const html = await current.text();
  assert.ok(html.includes(`<link rel="canonical" href="${canonicalUrl}"`));
  assert.ok(html.includes(`${canonicalUrl}#project`));

  const legacy = await fetch(new URL(oldPath, baseUrl), { redirect: 'manual' });
  assert.equal(legacy.status, 308);
  assert.equal(
    new URL(legacy.headers.get('location'), baseUrl).pathname,
    newPath,
  );
  assert.equal(new URL(legacy.headers.get('location'), baseUrl).search, '?source=legacy');
}

for (const path of ['/sitemap.xml', '/llms.txt']) {
  const response = await fetch(new URL(path, baseUrl));
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.ok(body.includes('/projekty/mieszkanie-midcentury'));
  assert.ok(!body.includes('/projekty/mieszkanie-widmo'));
}

console.log('Verified localized midcentury routes, redirects, sitemap, and llms.txt');
```

Run in terminal B:

```bash
node .context/verify-midcentury-route.mjs http://127.0.0.1:55052
```

Expected: exit code 0 and the verification message.

- [ ] **Step 7: Commit**

```bash
git add data/projects.ts next.config.mjs tests/project-content.test.ts tests/project-route.test.ts
git commit -m "Rename midcentury project route"
```
