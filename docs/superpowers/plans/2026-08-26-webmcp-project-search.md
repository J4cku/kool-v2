# WebMCP Project Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic, localized portfolio search backed by the canonical project catalog and expose it as the read-only native WebMCP tool `kool_find_projects`.

**Architecture:** Search metadata remains authored once in `data/projects.ts`, while client-safe types and a lean projection keep editorial copy and image data out of the browser boundary. A dependency-free validator and pure search function feed a localized tool factory; the existing renderless provider registers it under the existing base WebMCP gate and retains the independently gated debug tool.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, next-intl 4, Vitest/jsdom, Node test runner, native WebMCP imperative API

**Spec:** `docs/superpowers/specs/2026-08-26-webmcp-project-search-design.md`

## Global Constraints

- Implement Phase 2 only; do not open, populate, mutate, or submit the enquiry form.
- `data/projects.ts` remains the only authored project catalog; do not add a generated or hand-maintained second catalog.
- Add only the exact `areaM2`, `projectType`, and `objectiveFeatures` assignments approved by the spec.
- Objective features are curated source facts; never infer them from prose, image data, style, analytics, or user input at runtime.
- Search is exact and deterministic: categorical/location/feature criteria filter, target area orders by absolute difference, and `catalogOrder` breaks ties.
- `features` has AND semantics; zero matches remain zero and filters are never relaxed.
- Tool outputs and reasons are factual; never claim style fit, budget fit, availability, suitability, endorsement, recommendation quality, or project acceptance.
- The tool name is exactly `kool_find_projects` in every locale and its annotation is exactly `{ readOnlyHint: true }`.
- Inputs are validated at runtime even when the schema is present; validation must not coerce values or echo the complete raw input.
- The tool performs no navigation, storage, network request, form mutation, analytics, or logging.
- Client production modules must not import `data/projects.ts` or `project-search-index.server.ts`.
- The result must omit category, project type, status, year, scope, objective-feature arrays, descriptions, images, and galleries.
- Production registration remains disabled by default and requires `NEXT_PUBLIC_WEBMCP_ENABLED=true` at build time; there is no search-specific flag.
- `NEXT_PUBLIC_WEBMCP_DEBUG` continues to affect only `kool_webmcp_debug`.
- Unsupported browsers remain a successful no-op through the existing adapter.
- Do not add a runtime dependency; use the current dependencies and platform APIs.
- Use `@/` imports in application code and preserve Polish/English message-key parity.
- Run `pnpm check` and inspect its exit code before handoff.
- Production deployment and enablement are separate decisions; do not push, deploy, or enable production in this plan.

## File Map

- Create `lib/projects/project-search-types.ts`: locale-neutral enums and all client-safe search/index/result contracts.
- Modify `data/projects.ts`: require and author the approved numeric area, space type, and objective features.
- Modify `tests/project-content.test.ts`: enforce enum validity and the exact 15-row metadata table.
- Create `lib/projects/project-search-index.ts`: pure localized projection into the lean client payload.
- Create `lib/projects/project-search-index.server.ts`: server-only canonical-catalog wrapper.
- Create `tests/project-search.test.ts`: index, source-boundary, validation, ranking, immutability, and integration tests.
- Create `lib/projects/search-projects.ts`: dependency-free validation, normalization, and deterministic search.
- Create `lib/webmcp/tools/find-projects.ts`: exact localized WebMCP schema, metadata, execution, and lean output mapping.
- Create `lib/webmcp/tools/find-projects.test.ts`: localized tool contract, payload budget, output-boundary, and cancellation tests.
- Modify `messages/pl.json`: exact Polish tool copy, labels, and ICU reason messages.
- Modify `messages/en.json`: exact English tool copy, labels, and ICU reason messages.
- Modify `components/WebMcpProvider.tsx`: register search under the base gate and compose all cleanup functions.
- Modify `components/WebMcpProvider.test.tsx`: verify production gates, independent debug behavior, localization, and cleanup.
- Modify `app/[locale]/layout.tsx`: build the server-side localized index and pass it as a serializable provider prop.
- Create `docs/webmcp/evals.md`: record automated evidence and the supported-browser checkpoint without overstating unavailable verification.

---

### Task 1: Add Client-Safe Search Types and Canonical Catalog Metadata

**Files:**
- Create: `lib/projects/project-search-types.ts`
- Modify: `data/projects.ts`
- Modify: `tests/project-content.test.ts`

**Interfaces:**
- Consumes: existing `Project`, `projects`, and `projectDisplayOrder` from `data/projects.ts`
- Produces: `portfolioProjectTypes`, `PortfolioProjectType`, `projectObjectiveFeatures`, `ProjectObjectiveFeature`, `ProjectSearchCategory`, `ProjectIndexEntry`, `ProjectSearchInput`, `ProjectMatchReason`, `ProjectSearchMatch`, and `ProjectSearchResult`; extends every `Project` with required `areaM2`, `projectType`, and `objectiveFeatures`

- [ ] **Step 1: Write the failing metadata-integrity test**

Extend `tests/project-content.test.ts` with these imports, fixtures, and tests:

```ts
import {
  portfolioProjectTypes,
  projectObjectiveFeatures,
} from '../lib/projects/project-search-types.ts';

const expectedSearchMetadata = {
  'dom-dobrzykowice': [180, 'house', ['existing_space_rework']],
  'delikatesy-dehesa': [58, 'retail', ['furniture_design', 'lighting_design', 'visual_identity']],
  'mieszkanie-walecznych': [84, 'apartment', ['pre_war_building', 'furniture_design']],
  'lazienki-warszawa': [8, 'bathroom', ['furniture_design']],
  'pawilon-fandom': [1140, 'service_pavilion', ['existing_space_rework', 'modernist_building', 'furniture_design']],
  'hotel-belmonte': [7100, 'hospitality', ['furniture_design', 'lighting_design']],
  kancelaria: [50, 'office', ['furniture_design']],
  'biblioteka-gdansk': [850, 'public_cultural', ['neurodiversity_support', 'competition_entry', 'furniture_design', 'lighting_design']],
  'winobar-lodz': [311, 'food_and_beverage', ['post_industrial_building']],
  'mieszkanie-midcentury': [58, 'apartment', ['furniture_design']],
  'mieszkanie-strachowicka': [72, 'apartment', ['neurodiversity_support', 'furniture_design']],
  'biuro-dobry-material': [79, 'office', ['existing_space_rework', 'furniture_design']],
  'mieszkanie-gdansk': [46, 'apartment', ['furniture_design']],
  'foodhall-piazza': [340, 'food_and_beverage', ['existing_space_rework', 'furniture_design']],
  'toalety-w-teatrze': [58, 'bathroom', ['competition_entry']],
} as const;

test('projects carry the exact approved WebMCP search metadata', () => {
  assert.equal(projects.length, 15);
  assert.deepEqual(
    Object.fromEntries(projects.map((project) => [
      project.slug,
      [project.areaM2, project.projectType, project.objectiveFeatures],
    ])),
    expectedSearchMetadata,
  );
});

test('project search metadata is valid, integral, and duplicate-free', () => {
  const validTypes = new Set<string>(portfolioProjectTypes);
  const validFeatures = new Set<string>(projectObjectiveFeatures);

  for (const project of projects) {
    assert.ok(Number.isInteger(project.areaM2) && project.areaM2 > 0, project.slug);
    assert.ok(validTypes.has(project.projectType), project.slug);
    assert.equal(new Set(project.objectiveFeatures).size, project.objectiveFeatures.length, project.slug);
    assert.ok(project.objectiveFeatures.every((feature) => validFeatures.has(feature)), project.slug);
  }

  assert.equal(projects.find(({ slug }) => slug === 'hotel-belmonte')?.areaM2, 7100);
});
```

- [ ] **Step 2: Run the Node test and confirm RED**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-content.test.ts
```

Expected: FAIL because `project-search-types.ts` and the three required project properties do not exist.

- [ ] **Step 3: Create the exact client-safe type module**

Create `lib/projects/project-search-types.ts`:

```ts
export const portfolioProjectTypes = [
  'house',
  'apartment',
  'bathroom',
  'retail',
  'food_and_beverage',
  'hospitality',
  'office',
  'public_cultural',
  'service_pavilion',
] as const;

export type PortfolioProjectType = (typeof portfolioProjectTypes)[number];

export const projectObjectiveFeatures = [
  'existing_space_rework',
  'pre_war_building',
  'modernist_building',
  'post_industrial_building',
  'neurodiversity_support',
  'competition_entry',
  'furniture_design',
  'lighting_design',
  'visual_identity',
] as const;

export type ProjectObjectiveFeature = (typeof projectObjectiveFeatures)[number];

export type ProjectSearchCategory = 'residential' | 'commercial';

export type ProjectIndexEntry = {
  catalogOrder: number;
  slug: string;
  title: string;
  location: string;
  category: ProjectSearchCategory;
  projectType: PortfolioProjectType;
  areaM2: number;
  objectiveFeatures: ProjectObjectiveFeature[];
  url: string;
};

export type ProjectSearchInput = {
  category?: ProjectSearchCategory;
  projectType?: PortfolioProjectType;
  location?: string;
  targetAreaM2?: number;
  features?: ProjectObjectiveFeature[];
  limit?: number;
};

export type ProjectMatchReason =
  | { code: 'category'; value: ProjectSearchCategory }
  | { code: 'project_type'; value: PortfolioProjectType }
  | { code: 'location'; value: string }
  | { code: 'area'; targetAreaM2: number; differenceM2: number }
  | { code: 'feature'; value: ProjectObjectiveFeature };

export type ProjectSearchMatch = {
  project: ProjectIndexEntry;
  matchReasons: ProjectMatchReason[];
};

export type ProjectSearchResult = {
  totalMatches: number;
  matches: ProjectSearchMatch[];
};
```

- [ ] **Step 4: Require the metadata on `Project`**

Add the type-only import at the top of `data/projects.ts`:

```ts
import type {
  PortfolioProjectType,
  ProjectObjectiveFeature,
} from '@/lib/projects/project-search-types';
```

Add these required fields immediately after `area: string` in `Project`:

```ts
  areaM2: number;
  projectType: PortfolioProjectType;
  objectiveFeatures: ProjectObjectiveFeature[];
```

- [ ] **Step 5: Add the exact approved fields to all 15 catalog objects**

Insert the corresponding block immediately after each object's existing `area` field:

```ts
// dom-dobrzykowice
areaM2: 180,
projectType: 'house',
objectiveFeatures: ['existing_space_rework'],

// delikatesy-dehesa
areaM2: 58,
projectType: 'retail',
objectiveFeatures: ['furniture_design', 'lighting_design', 'visual_identity'],

// mieszkanie-walecznych
areaM2: 84,
projectType: 'apartment',
objectiveFeatures: ['pre_war_building', 'furniture_design'],

// lazienki-warszawa
areaM2: 8,
projectType: 'bathroom',
objectiveFeatures: ['furniture_design'],

// pawilon-fandom
areaM2: 1140,
projectType: 'service_pavilion',
objectiveFeatures: ['existing_space_rework', 'modernist_building', 'furniture_design'],

// hotel-belmonte
areaM2: 7100,
projectType: 'hospitality',
objectiveFeatures: ['furniture_design', 'lighting_design'],

// kancelaria
areaM2: 50,
projectType: 'office',
objectiveFeatures: ['furniture_design'],

// biblioteka-gdansk
areaM2: 850,
projectType: 'public_cultural',
objectiveFeatures: ['neurodiversity_support', 'competition_entry', 'furniture_design', 'lighting_design'],

// winobar-lodz
areaM2: 311,
projectType: 'food_and_beverage',
objectiveFeatures: ['post_industrial_building'],

// mieszkanie-midcentury
areaM2: 58,
projectType: 'apartment',
objectiveFeatures: ['furniture_design'],

// mieszkanie-strachowicka
areaM2: 72,
projectType: 'apartment',
objectiveFeatures: ['neurodiversity_support', 'furniture_design'],

// biuro-dobry-material
areaM2: 79,
projectType: 'office',
objectiveFeatures: ['existing_space_rework', 'furniture_design'],

// mieszkanie-gdansk
areaM2: 46,
projectType: 'apartment',
objectiveFeatures: ['furniture_design'],

// foodhall-piazza
areaM2: 340,
projectType: 'food_and_beverage',
objectiveFeatures: ['existing_space_rework', 'furniture_design'],

// toalety-w-teatrze
areaM2: 58,
projectType: 'bathroom',
objectiveFeatures: ['competition_entry'],
```

The comments above identify target objects for the edit; do not add those comments to the catalog.

- [ ] **Step 6: Run focused tests and typecheck to confirm GREEN**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-content.test.ts
pnpm typecheck
```

Expected: both commands exit 0; the 7,100 m² display string is not parsed by search metadata.

- [ ] **Step 7: Commit the canonical metadata**

```bash
git add lib/projects/project-search-types.ts data/projects.ts tests/project-content.test.ts
git commit -m "feat: add canonical project search metadata"
```

---

### Task 2: Build the Lean Localized Project Index

**Files:**
- Create: `lib/projects/project-search-index.ts`
- Create: `lib/projects/project-search-index.server.ts`
- Create: `tests/project-search.test.ts`

**Interfaces:**
- Consumes: `Project` and `localizeProject(project: Project, locale: string): Project` from `data/projects.ts`; `Locale` from `i18n/request.ts`; `ProjectIndexEntry` from `lib/projects/project-search-types.ts`; `BASE_URL` from `lib/site.ts`
- Produces: `projectSearchIndexFromLocalizedProjects(localizedProjects: readonly Project[], locale: Locale, baseUrl: string): ProjectIndexEntry[]` and server-only `getProjectSearchIndex(locale: Locale): ProjectIndexEntry[]`

- [ ] **Step 1: Write failing projection and boundary tests**

Create `tests/project-search.test.ts`:

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { localizeProject, projectDisplayOrder, projects } from '../data/projects.ts';
import { projectSearchIndexFromLocalizedProjects } from '../lib/projects/project-search-index.ts';

const expectedLeanKeys = [
  'areaM2',
  'catalogOrder',
  'category',
  'location',
  'objectiveFeatures',
  'projectType',
  'slug',
  'title',
  'url',
] as const;

function indexFor(locale: 'pl' | 'en') {
  return projectSearchIndexFromLocalizedProjects(
    projects.map((project) => localizeProject(project, locale)),
    locale,
    'https://koolstudio.pl',
  );
}

test('the project index preserves display order and contains only lean fields', () => {
  const index = indexFor('pl');
  assert.deepEqual(index.map(({ slug }) => slug), projectDisplayOrder);
  assert.deepEqual(index.map(({ catalogOrder }) => catalogOrder), [...projects.keys()]);
  for (const entry of index) {
    assert.deepEqual(Object.keys(entry).sort(), [...expectedLeanKeys]);
    assert.equal('description' in entry, false);
    assert.equal('images' in entry, false);
    assert.equal('gallery' in entry, false);
    assert.equal('area' in entry, false);
  }
});

test('the project index localizes text and emits locale-prefixed absolute URLs', () => {
  const polish = indexFor('pl')[0];
  const english = indexFor('en')[0];

  assert.equal(polish.title, 'dom');
  assert.equal(english.title, 'house');
  assert.equal(polish.url, 'https://koolstudio.pl/pl/projekty/dom-dobrzykowice');
  assert.equal(english.url, 'https://koolstudio.pl/en/projekty/dom-dobrzykowice');
  assert.equal(polish.category, 'residential');
  assert.notStrictEqual(polish.objectiveFeatures, projects[0].objectiveFeatures);
});

test('only the server index wrapper runtime-imports the canonical catalog', () => {
  const pureSource = readFileSync('lib/projects/project-search-index.ts', 'utf8');
  const serverSource = readFileSync('lib/projects/project-search-index.server.ts', 'utf8');

  assert.match(pureSource, /import type \{ Project \} from '@\/data\/projects'/);
  assert.doesNotMatch(pureSource, /import \{ Project \} from '@\/data\/projects'|server-only/);
  assert.match(serverSource, /^import 'server-only';/);
  assert.match(serverSource, /@\/data\/projects/);
});
```

- [ ] **Step 2: Run the focused Node test and confirm RED**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-search.test.ts
```

Expected: FAIL because both project-index modules are missing.

- [ ] **Step 3: Implement the pure projection**

Create `lib/projects/project-search-index.ts`:

```ts
import type { Project } from '@/data/projects';
import type { Locale } from '@/i18n/request';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';

export function projectSearchIndexFromLocalizedProjects(
  localizedProjects: readonly Project[],
  locale: Locale,
  baseUrl: string,
): ProjectIndexEntry[] {
  return localizedProjects.map((project, catalogOrder) => ({
    catalogOrder,
    slug: project.slug,
    title: project.title,
    location: project.location,
    category: project.category === 'mieszkalne' ? 'residential' : 'commercial',
    projectType: project.projectType,
    areaM2: project.areaM2,
    objectiveFeatures: [...project.objectiveFeatures],
    url: `${baseUrl}/${locale}/projekty/${project.slug}`,
  }));
}
```

The `Project` and `Locale` imports must remain `import type`; this module performs no I/O and has no `server-only` import.

- [ ] **Step 4: Implement the server-only wrapper**

Create `lib/projects/project-search-index.server.ts`:

```ts
import 'server-only';
import { localizeProject, projects } from '@/data/projects';
import type { Locale } from '@/i18n/request';
import { projectSearchIndexFromLocalizedProjects } from '@/lib/projects/project-search-index';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';
import { BASE_URL } from '@/lib/site';

export function getProjectSearchIndex(locale: Locale): ProjectIndexEntry[] {
  const localizedProjects = projects.map((project) => localizeProject(project, locale));
  return projectSearchIndexFromLocalizedProjects(localizedProjects, locale, BASE_URL);
}
```

- [ ] **Step 5: Run the focused test and typecheck to confirm GREEN**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-search.test.ts
pnpm typecheck
```

Expected: both commands exit 0; Polish/English titles and absolute URLs differ only where localization requires it.

- [ ] **Step 6: Commit the index boundary**

```bash
git add lib/projects/project-search-index.ts lib/projects/project-search-index.server.ts tests/project-search.test.ts
git commit -m "feat: derive lean localized project index"
```

---

### Task 3: Validate Inputs and Implement Deterministic Search

**Files:**
- Create: `lib/projects/search-projects.ts`
- Modify: `tests/project-search.test.ts`

**Interfaces:**
- Consumes: `portfolioProjectTypes`, `projectObjectiveFeatures`, `ProjectIndexEntry`, `ProjectSearchInput`, and `ProjectSearchResult` from `lib/projects/project-search-types.ts`
- Produces: `normalizeProjectLocation(value: string): string`, `validateProjectSearchInput(input: unknown): ProjectSearchInput`, and `searchProjects(index: readonly ProjectIndexEntry[], input: ProjectSearchInput): ProjectSearchResult`

- [ ] **Step 1: Add failing validation tests**

Append these imports and tests to `tests/project-search.test.ts`:

```ts
import {
  normalizeProjectLocation,
  searchProjects,
  validateProjectSearchInput,
} from '../lib/projects/search-projects.ts';
import { projectObjectiveFeatures } from '../lib/projects/project-search-types.ts';

test('validation applies defaults and exact location normalization without coercion', () => {
  assert.deepEqual(validateProjectSearchInput({}), { features: [], limit: 5 });
  assert.deepEqual(validateProjectSearchInput({ location: '  WROCŁAW\t ' }), {
    location: 'WROCŁAW',
    features: [],
    limit: 5,
  });
  assert.equal(normalizeProjectLocation(' Wrocław '), 'wroclaw');
  assert.equal(normalizeProjectLocation('wroclaw'), 'wroclaw');
  assert.equal(normalizeProjectLocation('Nowa   Wieś'), 'nowa wies');
});

test('validation rejects every schema boundary violation with a field-specific error', () => {
  const invalidInputs: Array<[unknown, RegExp]> = [
    [null, /input/],
    [[], /input/],
    [{ unknown: true }, /unknown/],
    [{ category: 'mieszkalne' }, /category/],
    [{ projectType: 'villa' }, /projectType/],
    [{ location: '   ' }, /location/],
    [{ location: 'x'.repeat(81) }, /location/],
    [{ targetAreaM2: '84' }, /targetAreaM2/],
    [{ targetAreaM2: Number.NaN }, /targetAreaM2/],
    [{ targetAreaM2: Number.POSITIVE_INFINITY }, /targetAreaM2/],
    [{ targetAreaM2: 0 }, /targetAreaM2/],
    [{ targetAreaM2: 100001 }, /targetAreaM2/],
    [{ features: ['furniture_design', 'furniture_design'] }, /features/],
    [{ features: [...projectObjectiveFeatures, 'visual_identity'] }, /features/],
    [{ features: ['invented_feature'] }, /features/],
    [{ limit: 1.5 }, /limit/],
    [{ limit: 0 }, /limit/],
    [{ limit: 6 }, /limit/],
  ];

  for (const [input, expectedField] of invalidInputs) {
    assert.throws(() => validateProjectSearchInput(input), expectedField);
  }
});
```

- [ ] **Step 2: Add failing deterministic-search tests**

Append:

```ts
test('empty search returns the first five catalog projects with no reasons', () => {
  const index = indexFor('en');
  const result = searchProjects(index, validateProjectSearchInput({}));

  assert.equal(result.totalMatches, 15);
  assert.deepEqual(result.matches.map(({ project }) => project.slug), projectDisplayOrder.slice(0, 5));
  assert.ok(result.matches.every(({ matchReasons }) => matchReasons.length === 0));
});

test('exact filters and area ordering produce factual reasons in stable order', () => {
  const index = indexFor('en');
  const input = validateProjectSearchInput({
    category: 'residential',
    projectType: 'apartment',
    location: ' WROCŁAW ',
    targetAreaM2: 85,
    features: ['pre_war_building'],
  });
  const result = searchProjects(index, input);

  assert.equal(result.totalMatches, 1);
  assert.equal(result.matches[0].project.slug, 'mieszkanie-walecznych');
  assert.deepEqual(result.matches[0].matchReasons, [
    { code: 'category', value: 'residential' },
    { code: 'project_type', value: 'apartment' },
    { code: 'location', value: 'Wrocław' },
    { code: 'area', targetAreaM2: 85, differenceM2: 1 },
    { code: 'feature', value: 'pre_war_building' },
  ]);
});

test('multiple features use AND semantics and incompatible filters never relax', () => {
  const index = indexFor('pl');
  const matching = searchProjects(index, validateProjectSearchInput({
    features: ['furniture_design', 'lighting_design'],
  }));
  assert.ok(matching.matches.every(({ project }) =>
    project.objectiveFeatures.includes('furniture_design') &&
    project.objectiveFeatures.includes('lighting_design')));

  const impossible = searchProjects(index, validateProjectSearchInput({
    projectType: 'hospitality',
    location: 'Gdańsk',
    features: ['pre_war_building'],
  }));
  assert.deepEqual(impossible, { totalMatches: 0, matches: [] });
});

test('area difference orders results and catalog order breaks ties', () => {
  const index = indexFor('en');
  const byArea = searchProjects(index, validateProjectSearchInput({
    projectType: 'apartment',
    targetAreaM2: 65,
    limit: 5,
  }));
  assert.deepEqual(byArea.matches.map(({ project }) => project.areaM2), [58, 72, 84, 46]);
  assert.deepEqual(byArea.matches.slice(0, 2).map(({ project }) => project.slug), [
    'mieszkanie-midcentury',
    'mieszkanie-strachowicka',
  ]);

  const withoutArea = searchProjects(index, validateProjectSearchInput({ projectType: 'apartment' }));
  assert.deepEqual(withoutArea.matches.map(({ project }) => project.catalogOrder),
    [...withoutArea.matches.map(({ project }) => project.catalogOrder)].sort((a, b) => a - b));
});

test('totalMatches precedes limit and search mutates neither input nor index', () => {
  const index = indexFor('en');
  const input = validateProjectSearchInput({ features: ['furniture_design'], limit: 1 });
  const indexBefore = structuredClone(index);
  const inputBefore = structuredClone(input);
  const result = searchProjects(index, input);

  assert.ok(result.totalMatches > result.matches.length);
  assert.equal(result.matches.length, 1);
  assert.deepEqual(index, indexBefore);
  assert.deepEqual(input, inputBefore);
  assert.equal(searchProjects(index, { ...input, limit: 5 }).matches.length, 5);
});
```

The 65 m² tie assertion relies on canonical display order: the 58 m² midcentury apartment precedes the 72 m² Strachowicka apartment at the same 7 m² difference.

- [ ] **Step 3: Run the focused Node test and confirm RED**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-search.test.ts
```

Expected: FAIL because `search-projects.ts` is missing.

- [ ] **Step 4: Implement strict validation and normalization**

Create `lib/projects/search-projects.ts` with these imports, constants, helpers, and validator:

```ts
import {
  portfolioProjectTypes,
  projectObjectiveFeatures,
  type PortfolioProjectType,
  type ProjectIndexEntry,
  type ProjectObjectiveFeature,
  type ProjectSearchCategory,
  type ProjectSearchInput,
  type ProjectSearchResult,
} from './project-search-types.ts';

const allowedKeys = new Set([
  'category',
  'projectType',
  'location',
  'targetAreaM2',
  'features',
  'limit',
]);
const categories = new Set<ProjectSearchCategory>(['residential', 'commercial']);
const projectTypes = new Set<string>(portfolioProjectTypes);
const objectiveFeatures = new Set<string>(projectObjectiveFeatures);

function invalid(field: string, constraint: string): never {
  throw new TypeError(`${field}: ${constraint}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

function normalizeRawLocation(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/gu, ' ');
}

export function normalizeProjectLocation(value: string): string {
  return normalizeRawLocation(value)
    .normalize('NFKD')
    .toLocaleLowerCase('pl-PL')
    .replace(/[łŁ]/gu, 'l')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/gu, ' ');
}

export function validateProjectSearchInput(input: unknown): ProjectSearchInput {
  if (!isPlainObject(input)) invalid('input', 'must be a plain object');

  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) invalid(key, 'unknown property');
  }

  const output: ProjectSearchInput = { features: [], limit: 5 };

  if (input.category !== undefined) {
    if (typeof input.category !== 'string' || !categories.has(input.category as ProjectSearchCategory)) {
      invalid('category', 'must be residential or commercial');
    }
    output.category = input.category as ProjectSearchCategory;
  }

  if (input.projectType !== undefined) {
    if (typeof input.projectType !== 'string' || !projectTypes.has(input.projectType)) {
      invalid('projectType', 'must be an allowed project type');
    }
    output.projectType = input.projectType as PortfolioProjectType;
  }

  if (input.location !== undefined) {
    if (typeof input.location !== 'string' ||
      Array.from(input.location).length < 1 ||
      Array.from(input.location).length > 80 ||
      !/\S/u.test(input.location)) {
      invalid('location', 'must contain 1–80 Unicode code points and non-whitespace text');
    }
    output.location = normalizeRawLocation(input.location);
  }

  if (input.targetAreaM2 !== undefined) {
    if (typeof input.targetAreaM2 !== 'number' ||
      !Number.isFinite(input.targetAreaM2) ||
      input.targetAreaM2 < 1 ||
      input.targetAreaM2 > 100000) {
      invalid('targetAreaM2', 'must be a finite number from 1 through 100000');
    }
    output.targetAreaM2 = input.targetAreaM2;
  }

  if (input.features !== undefined) {
    if (!Array.isArray(input.features) || input.features.length > 9 ||
      input.features.some((feature) => typeof feature !== 'string' || !objectiveFeatures.has(feature))) {
      invalid('features', 'must contain at most nine allowed feature codes');
    }
    if (new Set(input.features).size !== input.features.length) {
      invalid('features', 'must not contain duplicates');
    }
    output.features = [...input.features] as ProjectObjectiveFeature[];
  }

  if (input.limit !== undefined) {
    if (typeof input.limit !== 'number' || !Number.isInteger(input.limit) || input.limit < 1 || input.limit > 5) {
      invalid('limit', 'must be an integer from 1 through 5');
    }
    output.limit = input.limit;
  }

  return output;
}
```

- [ ] **Step 5: Implement the pure search function in the same file**

Append:

```ts
export function searchProjects(
  index: readonly ProjectIndexEntry[],
  input: ProjectSearchInput,
): ProjectSearchResult {
  const features = input.features ?? [];
  const normalizedLocation = input.location === undefined
    ? undefined
    : normalizeProjectLocation(input.location);

  const filtered = index.filter((project) =>
    (input.category === undefined || project.category === input.category) &&
    (input.projectType === undefined || project.projectType === input.projectType) &&
    (normalizedLocation === undefined || normalizeProjectLocation(project.location) === normalizedLocation) &&
    features.every((feature) => project.objectiveFeatures.includes(feature)));

  const ordered = [...filtered].sort((left, right) => {
    if (input.targetAreaM2 !== undefined) {
      const difference = Math.abs(left.areaM2 - input.targetAreaM2) -
        Math.abs(right.areaM2 - input.targetAreaM2);
      if (difference !== 0) return difference;
    }
    return left.catalogOrder - right.catalogOrder;
  });

  const matches = ordered.slice(0, input.limit ?? 5).map((project) => {
    const matchReasons: ProjectSearchResult['matches'][number]['matchReasons'] = [];
    if (input.category !== undefined) {
      matchReasons.push({ code: 'category', value: input.category });
    }
    if (input.projectType !== undefined) {
      matchReasons.push({ code: 'project_type', value: input.projectType });
    }
    if (input.location !== undefined) {
      matchReasons.push({ code: 'location', value: project.location });
    }
    if (input.targetAreaM2 !== undefined) {
      matchReasons.push({
        code: 'area',
        targetAreaM2: input.targetAreaM2,
        differenceM2: Math.abs(project.areaM2 - input.targetAreaM2),
      });
    }
    for (const feature of features) {
      matchReasons.push({ code: 'feature', value: feature });
    }
    return { project, matchReasons };
  });

  return { totalMatches: filtered.length, matches };
}
```

- [ ] **Step 6: Run focused verification to confirm GREEN**

Run:

```bash
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-search.test.ts
pnpm typecheck
```

Expected: both commands exit 0; invalid values reject, exact filters do not relax, tie order is stable, and inputs remain unchanged.

- [ ] **Step 7: Commit validation and search**

```bash
git add lib/projects/search-projects.ts tests/project-search.test.ts
git commit -m "feat: add deterministic project search"
```

---

### Task 4: Create the Localized Read-Only WebMCP Tool

**Files:**
- Create: `lib/webmcp/tools/find-projects.ts`
- Create: `lib/webmcp/tools/find-projects.test.ts`
- Modify: `messages/pl.json`
- Modify: `messages/en.json`

**Interfaces:**
- Consumes: `Locale`, `ProjectIndexEntry`, `ProjectMatchReason`, `portfolioProjectTypes`, `projectObjectiveFeatures`, `validateProjectSearchInput(input: unknown): ProjectSearchInput`, `searchProjects(index, input): ProjectSearchResult`, and existing `WebMcpTool`
- Produces: `FindProjectsToolCopy`, `FindProjectsToolResult`, the exact inferred schema from `createFindProjectsInputSchema(copy: FindProjectsToolCopy)`, and `createFindProjectsTool(locale: Locale, index: readonly ProjectIndexEntry[], copy: FindProjectsToolCopy): FindProjectsWebMcpTool`

- [ ] **Step 1: Add the exact matching translation subtree in both locales**

Add this top-level object to `messages/pl.json`:

```json
"webmcp": {
  "projectSearch": {
    "title": "Znajdź projekty kool studio",
    "description": "Wyszukaj opublikowane projekty kool studio według kategorii, typu, lokalizacji, powierzchni i kuratorowanych cech obiektywnych. Zwraca wyłącznie fakty z portfolio; nie ocenia stylu, budżetu, dostępności ani przyjęcia projektu.",
    "properties": {
      "category": "Kategoria projektu.",
      "projectType": "Typ projektowanej przestrzeni.",
      "location": "Dokładna miejscowość (1–80 znaków); wielkość liter i polskie znaki nie wpływają na dopasowanie.",
      "targetAreaM2": "Docelowa powierzchnia w metrach kwadratowych; wpływa na kolejność, ale nie odrzuca wyników.",
      "features": "Wymagane kuratorowane cechy obiektywne; wynik musi zawierać wszystkie.",
      "limit": "Maksymalna liczba zwróconych projektów, od 1 do 5."
    },
    "categories": {
      "residential": "mieszkalne",
      "commercial": "komercyjne"
    },
    "projectTypes": {
      "house": "dom",
      "apartment": "mieszkanie",
      "bathroom": "łazienki",
      "retail": "handel detaliczny",
      "food_and_beverage": "gastronomia",
      "hospitality": "hotelarstwo",
      "office": "biuro",
      "public_cultural": "przestrzeń publiczna lub kulturalna",
      "service_pavilion": "pawilon usługowy"
    },
    "features": {
      "existing_space_rework": "rearanżacja istniejącej przestrzeni",
      "pre_war_building": "przedwojenny budynek",
      "modernist_building": "modernistyczny budynek",
      "post_industrial_building": "postindustrialny budynek",
      "neurodiversity_support": "wsparcie neuroróżnorodności",
      "competition_entry": "projekt konkursowy",
      "furniture_design": "projekt mebli",
      "lighting_design": "projekt oświetlenia",
      "visual_identity": "identyfikacja wizualna"
    },
    "reasons": {
      "category": "ta sama kategoria: {label}",
      "projectType": "ten sam typ projektu: {label}",
      "location": "ta sama lokalizacja: {location}",
      "areaSame": "{areaM2, plural, one {ta sama powierzchnia: # m²} few {ta sama powierzchnia: # m²} many {ta sama powierzchnia: # m²} other {ta sama powierzchnia: # m²}}",
      "areaDifference": "{differenceM2, plural, one {powierzchnia różni się o # m²} few {powierzchnia różni się o # m²} many {powierzchnia różni się o # m²} other {powierzchnia różni się o # m²}}",
      "feature": "cecha: {label}"
    }
  }
}
```

Add this matching top-level object to `messages/en.json`:

```json
"webmcp": {
  "projectSearch": {
    "title": "Find kool studio projects",
    "description": "Search published kool studio projects by category, type, location, floor area, and curated objective features. Returns portfolio facts only; it does not assess style, budget, availability, or project acceptance.",
    "properties": {
      "category": "Project category.",
      "projectType": "Type of space designed.",
      "location": "Exact city or town (1–80 characters); matching ignores case and Polish diacritics.",
      "targetAreaM2": "Target floor area in square metres; affects ordering but does not exclude results.",
      "features": "Required curated objective features; a result must contain all of them.",
      "limit": "Maximum number of projects to return, from 1 to 5."
    },
    "categories": {
      "residential": "residential",
      "commercial": "commercial"
    },
    "projectTypes": {
      "house": "house",
      "apartment": "apartment",
      "bathroom": "bathrooms",
      "retail": "retail",
      "food_and_beverage": "food and beverage",
      "hospitality": "hospitality",
      "office": "office",
      "public_cultural": "public or cultural space",
      "service_pavilion": "service pavilion"
    },
    "features": {
      "existing_space_rework": "existing-space rework",
      "pre_war_building": "pre-war building",
      "modernist_building": "modernist building",
      "post_industrial_building": "post-industrial building",
      "neurodiversity_support": "neurodiversity support",
      "competition_entry": "competition entry",
      "furniture_design": "furniture design",
      "lighting_design": "lighting design",
      "visual_identity": "visual identity"
    },
    "reasons": {
      "category": "same category: {label}",
      "projectType": "same project type: {label}",
      "location": "same location: {location}",
      "areaSame": "{areaM2, plural, one {same floor area: # m²} other {same floor area: # m²}}",
      "areaDifference": "{differenceM2, plural, one {floor area differs by # m²} other {floor area differs by # m²}}",
      "feature": "feature: {label}"
    }
  }
}
```

- [ ] **Step 2: Write failing schema and localized metadata tests**

Create `lib/webmcp/tools/find-projects.test.ts` with the fixture imports and schema assertions:

```ts
import { describe, expect, it } from 'vitest';
import { localizeProject, projects } from '@/data/projects';
import type { Locale } from '@/i18n/request';
import { projectSearchIndexFromLocalizedProjects } from '@/lib/projects/project-search-index';
import {
  portfolioProjectTypes,
  projectObjectiveFeatures,
} from '@/lib/projects/project-search-types';
import {
  createFindProjectsInputSchema,
  createFindProjectsTool,
  type FindProjectsToolCopy,
} from '@/lib/webmcp/tools/find-projects';
import enMessages from '@/messages/en.json';
import plMessages from '@/messages/pl.json';

function copy(locale: Locale): FindProjectsToolCopy {
  return (locale === 'pl' ? plMessages : enMessages).webmcp.projectSearch as FindProjectsToolCopy;
}

function indexFor(locale: Locale) {
  return projectSearchIndexFromLocalizedProjects(
    projects.map((project) => localizeProject(project, locale)),
    locale,
    'https://koolstudio.pl',
  );
}

describe.each([
  ['pl', 'Znajdź projekty kool studio'],
  ['en', 'Find kool studio projects'],
] as const)('kool_find_projects on %s pages', (locale, title) => {
  it('has exact localized read-only metadata and schema boundaries', () => {
    const tool = createFindProjectsTool(locale, indexFor(locale), copy(locale));
    const schema = createFindProjectsInputSchema(copy(locale));

    expect(tool.name).toBe('kool_find_projects');
    expect(tool.title).toBe(title);
    expect(tool.description).toBe(copy(locale).description);
    expect(tool.annotations).toEqual({ readOnlyHint: true });
    expect(tool).not.toHaveProperty('exposedTo');
    expect(tool.inputSchema).toEqual(schema);
    expect(schema).toMatchObject({
      type: 'object',
      additionalProperties: false,
      properties: {
        category: {
          type: 'string',
          enum: ['residential', 'commercial'],
          description: copy(locale).properties.category,
        },
        projectType: {
          type: 'string',
          enum: [...portfolioProjectTypes],
          description: copy(locale).properties.projectType,
        },
        location: {
          type: 'string',
          minLength: 1,
          maxLength: 80,
          pattern: '^\\s*\\S[\\s\\S]*$',
          description: copy(locale).properties.location,
        },
        targetAreaM2: {
          type: 'number',
          minimum: 1,
          maximum: 100000,
          description: copy(locale).properties.targetAreaM2,
        },
        features: {
          type: 'array',
          uniqueItems: true,
          maxItems: 9,
          items: { type: 'string', enum: [...projectObjectiveFeatures] },
          description: copy(locale).properties.features,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 5,
          default: 5,
          description: copy(locale).properties.limit,
        },
      },
    });
    expect(schema).not.toHaveProperty('required');
  });
});
```

Also assert each enum's localized `oneOf` titles without repeating production mapping logic:

```ts
it.each([
  ['pl', ['mieszkalne', 'komercyjne'], [
    'dom', 'mieszkanie', 'łazienki', 'handel detaliczny', 'gastronomia',
    'hotelarstwo', 'biuro', 'przestrzeń publiczna lub kulturalna', 'pawilon usługowy',
  ], [
    'rearanżacja istniejącej przestrzeni', 'przedwojenny budynek',
    'modernistyczny budynek', 'postindustrialny budynek',
    'wsparcie neuroróżnorodności', 'projekt konkursowy', 'projekt mebli',
    'projekt oświetlenia', 'identyfikacja wizualna',
  ]],
  ['en', ['residential', 'commercial'], [
    'house', 'apartment', 'bathrooms', 'retail', 'food and beverage',
    'hospitality', 'office', 'public or cultural space', 'service pavilion',
  ], [
    'existing-space rework', 'pre-war building', 'modernist building',
    'post-industrial building', 'neurodiversity support', 'competition entry',
    'furniture design', 'lighting design', 'visual identity',
  ]],
] as const)('adds exact %s enum-choice titles while retaining enum arrays',
  (locale, categoryTitles, projectTypeTitles, featureTitles) => {
    const schema = createFindProjectsInputSchema(copy(locale));
    expect(schema.properties.category.oneOf).toEqual(
      ['residential', 'commercial'].map((value, index) => ({
        const: value,
        title: categoryTitles[index],
      })),
    );
    expect(schema.properties.projectType.oneOf).toEqual(
      portfolioProjectTypes.map((value, index) => ({
        const: value,
        title: projectTypeTitles[index],
      })),
    );
    expect(schema.properties.features.items.oneOf).toEqual(
      projectObjectiveFeatures.map((value, index) => ({
        const: value,
        title: featureTitles[index],
      })),
    );
  });
```

- [ ] **Step 3: Add failing execution, output-boundary, payload-budget, and cancellation tests**

Append to `lib/webmcp/tools/find-projects.test.ts`:

```ts
describe.each(['pl', 'en'] as const)('localized execution for %s', (locale) => {
  it('returns only lean localized facts and one reason per supplied criterion', async () => {
    const tool = createFindProjectsTool(locale, indexFor(locale), copy(locale));
    const signal = new AbortController().signal;
    const result = await tool.execute({
      projectType: 'apartment',
      location: 'Wroclaw',
      targetAreaM2: 85,
      features: ['pre_war_building'],
      limit: 5,
    }, { signal });

    expect(result).toMatchObject({ locale, totalMatches: 1, returnedMatches: 1 });
    expect(Object.keys(result.results[0]).sort()).toEqual([
      'areaM2', 'location', 'matchReasons', 'slug', 'title', 'url',
    ]);
    expect(result.results[0].slug).toBe('mieszkanie-walecznych');
    expect(result.results[0].matchReasons).toEqual(locale === 'pl' ? [
      'ten sam typ projektu: mieszkanie',
      'ta sama lokalizacja: Wrocław',
      'powierzchnia różni się o 1 m²',
      'cecha: przedwojenny budynek',
    ] : [
      'same project type: apartment',
      'same location: Wrocław',
      'floor area differs by 1 m²',
      'feature: pre-war building',
    ]);
    expect(JSON.stringify(result)).not.toMatch(
      /"(?:objectiveFeatures|projectType|category|status|year|scope|description|images|gallery)"\s*:/,
    );
  });

  it('keeps the maximal current five-result catalog fixture within 1500 characters', async () => {
    const tool = createFindProjectsTool(locale, indexFor(locale), copy(locale));
    const result = await tool.execute({
      category: 'commercial',
      location: 'Wrocław',
      targetAreaM2: 100000,
      features: ['furniture_design'],
      limit: 5,
    }, { signal: new AbortController().signal });

    expect(result.totalMatches).toBe(5);
    expect(result.returnedMatches).toBe(5);
    expect(result.results.map(({ slug }) => slug)).toEqual([
      'pawilon-fandom',
      'foodhall-piazza',
      'biuro-dobry-material',
      'delikatesy-dehesa',
      'kancelaria',
    ]);
    expect(result.results.every((match) => match.matchReasons.length === 4)).toBe(true);
    expect(JSON.stringify(result).length).toBeLessThanOrEqual(1500);
  });

  it('uses the exact same-area reason at zero difference', async () => {
    const tool = createFindProjectsTool(locale, indexFor(locale), copy(locale));
    const result = await tool.execute({ targetAreaM2: 58, limit: 1 }, {
      signal: new AbortController().signal,
    });

    expect(result.results[0].matchReasons).toEqual([
      locale === 'pl' ? 'ta sama powierzchnia: 58 m²' : 'same floor area: 58 m²',
    ]);
  });
});

it('rejects invalid invocations at runtime even when a caller bypasses schema validation', async () => {
  const tool = createFindProjectsTool('en', indexFor('en'), copy('en'));
  await expect(tool.execute({ limit: 6 }, {
    signal: new AbortController().signal,
  })).rejects.toThrow(/limit/);
});

it('honors an already-aborted execution signal', async () => {
  const tool = createFindProjectsTool('en', indexFor('en'), copy('en'));
  const controller = new AbortController();
  controller.abort(new DOMException('Cancelled', 'AbortError'));

  await expect(tool.execute({}, { signal: controller.signal })).rejects.toMatchObject({
    name: 'AbortError',
  });
});
```

- [ ] **Step 4: Run the focused Vitest file and confirm RED**

Run:

```bash
pnpm exec vitest run lib/webmcp/tools/find-projects.test.ts
```

Expected: FAIL because `find-projects.ts` is missing.

- [ ] **Step 5: Implement exact schema construction and copy types**

Create `lib/webmcp/tools/find-projects.ts`:

```ts
import { createTranslator } from 'next-intl';
import type { Locale } from '@/i18n/request';
import {
  portfolioProjectTypes,
  projectObjectiveFeatures,
  type PortfolioProjectType,
  type ProjectIndexEntry,
  type ProjectMatchReason,
  type ProjectObjectiveFeature,
  type ProjectSearchCategory,
} from '@/lib/projects/project-search-types';
import { searchProjects, validateProjectSearchInput } from '@/lib/projects/search-projects';
import type { WebMcpTool } from '@/lib/webmcp/model-context';

export type FindProjectsToolCopy = {
  title: string;
  description: string;
  properties: Record<'category' | 'projectType' | 'location' | 'targetAreaM2' | 'features' | 'limit', string>;
  categories: Record<ProjectSearchCategory, string>;
  projectTypes: Record<PortfolioProjectType, string>;
  features: Record<ProjectObjectiveFeature, string>;
  reasons: {
    category: string;
    projectType: string;
    location: string;
    areaSame: string;
    areaDifference: string;
    feature: string;
  };
};

export type FindProjectsToolResult = {
  locale: Locale;
  totalMatches: number;
  returnedMatches: number;
  results: Array<{
    slug: string;
    title: string;
    location: string;
    areaM2: number;
    url: string;
    matchReasons: string[];
  }>;
};

export type FindProjectsWebMcpTool = Omit<WebMcpTool, 'execute'> & {
  execute: (
    ...args: Parameters<WebMcpTool['execute']>
  ) => Promise<FindProjectsToolResult>;
};

function choices<T extends string>(values: readonly T[], labels: Record<T, string>) {
  return values.map((value) => ({ const: value, title: labels[value] }));
}

export function createFindProjectsInputSchema(copy: FindProjectsToolCopy) {
  return {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string' as const,
        enum: ['residential', 'commercial'],
        oneOf: choices(['residential', 'commercial'], copy.categories),
        description: copy.properties.category,
      },
      projectType: {
        type: 'string' as const,
        enum: [...portfolioProjectTypes],
        oneOf: choices(portfolioProjectTypes, copy.projectTypes),
        description: copy.properties.projectType,
      },
      location: {
        type: 'string' as const,
        minLength: 1,
        maxLength: 80,
        pattern: '^\\s*\\S[\\s\\S]*$',
        description: copy.properties.location,
      },
      targetAreaM2: {
        type: 'number' as const,
        minimum: 1,
        maximum: 100000,
        description: copy.properties.targetAreaM2,
      },
      features: {
        type: 'array' as const,
        uniqueItems: true,
        maxItems: 9,
        items: {
          type: 'string' as const,
          enum: [...projectObjectiveFeatures],
          oneOf: choices(projectObjectiveFeatures, copy.features),
        },
        description: copy.properties.features,
      },
      limit: {
        type: 'integer' as const,
        minimum: 1,
        maximum: 5,
        default: 5,
        description: copy.properties.limit,
      },
    },
    additionalProperties: false,
  };
}
```

- [ ] **Step 6: Implement localized execution and lean output mapping**

Append to `lib/webmcp/tools/find-projects.ts`:

```ts
export function createFindProjectsTool(
  locale: Locale,
  index: readonly ProjectIndexEntry[],
  copy: FindProjectsToolCopy,
): FindProjectsWebMcpTool {
  const t = createTranslator({ locale, messages: { projectSearch: copy }, namespace: 'projectSearch' });
  const reasonText = (reason: ProjectMatchReason): string => {
    switch (reason.code) {
      case 'category':
        return t('reasons.category', { label: copy.categories[reason.value] });
      case 'project_type':
        return t('reasons.projectType', { label: copy.projectTypes[reason.value] });
      case 'location':
        return t('reasons.location', { location: reason.value });
      case 'area':
        return reason.differenceM2 === 0
          ? t('reasons.areaSame', { areaM2: reason.targetAreaM2 })
          : t('reasons.areaDifference', { differenceM2: reason.differenceM2 });
      case 'feature':
        return t('reasons.feature', { label: copy.features[reason.value] });
    }
  };

  return {
    name: 'kool_find_projects',
    title: copy.title,
    description: copy.description,
    inputSchema: createFindProjectsInputSchema(copy),
    annotations: { readOnlyHint: true },
    async execute(rawInput, { signal }): Promise<FindProjectsToolResult> {
      signal.throwIfAborted();
      const input = validateProjectSearchInput(rawInput);
      signal.throwIfAborted();
      const result = searchProjects(index, input);
      const output: FindProjectsToolResult = {
        locale,
        totalMatches: result.totalMatches,
        returnedMatches: result.matches.length,
        results: result.matches.map(({ project, matchReasons }) => ({
          slug: project.slug,
          title: project.title,
          location: project.location,
          areaM2: project.areaM2,
          url: project.url,
          matchReasons: matchReasons.map(reasonText),
        })),
      };
      signal.throwIfAborted();
      return output;
    },
  };
}
```

- [ ] **Step 7: Run localized tool verification to confirm GREEN**

Run:

```bash
pnpm exec vitest run lib/webmcp/tools/find-projects.test.ts
pnpm check:i18n
pnpm typecheck
```

Expected: all commands exit 0; both locale fixtures stay at or below 1,500 serialized characters and ICU formats area reasons.

- [ ] **Step 8: Commit the localized tool**

```bash
git add lib/webmcp/tools/find-projects.ts lib/webmcp/tools/find-projects.test.ts messages/pl.json messages/en.json
git commit -m "feat: add localized WebMCP project search tool"
```

---

### Task 5: Integrate Search Registration into the Provider and Locale Layout

**Files:**
- Modify: `components/WebMcpProvider.tsx`
- Modify: `components/WebMcpProvider.test.tsx`
- Modify: `app/[locale]/layout.tsx`
- Modify: `tests/project-search.test.ts`

**Interfaces:**
- Consumes: `getProjectSearchIndex(locale: Locale): ProjectIndexEntry[]`, `ProjectIndexEntry`, `FindProjectsToolCopy`, `createFindProjectsTool(locale, index, copy): WebMcpTool`, `registerWebMcpTool(tool, options): () => void`, `isWebMcpEnabled`, and `isWebMcpDebugEnabled`
- Produces: `WebMcpProvider({ locale, projectIndex }: { locale: Locale; projectIndex: readonly ProjectIndexEntry[] }): null`; layout supplies a lean serializable `projectIndex` for its validated locale

- [ ] **Step 1: Update provider tests to supply localized messages and an index**

In `components/WebMcpProvider.test.tsx`, add imports and helpers:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';
import enMessages from '@/messages/en.json';
import plMessages from '@/messages/pl.json';

const projectIndex: ProjectIndexEntry[] = [{
  catalogOrder: 0,
  slug: 'mieszkanie-walecznych',
  title: 'apartment',
  location: 'Wrocław',
  category: 'residential',
  projectType: 'apartment',
  areaM2: 84,
  objectiveFeatures: ['pre_war_building', 'furniture_design'],
  url: 'https://koolstudio.pl/en/projekty/mieszkanie-walecznych',
}];

function renderProvider(locale: 'pl' | 'en' = 'pl') {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'pl' ? plMessages : enMessages}
    >
      <WebMcpProvider locale={locale} projectIndex={projectIndex} />
    </NextIntlClientProvider>,
  );
}

function registeredNames() {
  return vi.mocked(registerWebMcpTool).mock.calls.map(([tool]) => tool.name);
}
```

Replace each direct `<WebMcpProvider locale="…" />` render with `renderProvider(locale)` and update gate expectations to the Phase 2 lifecycle:

```tsx
it('registers neither tool when the production base gate is disabled', () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'false');
  renderProvider('pl');
  expect(registerWebMcpTool).not.toHaveBeenCalled();
});

it('registers search but not debug when only the production base gate is enabled', () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'true');
  vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'false');
  renderProvider('en');
  expect(registeredNames()).toEqual(['kool_find_projects']);
});

it('registers search and debug in development and unregisters each exactly once', () => {
  vi.stubEnv('NODE_ENV', 'development');
  const view = renderProvider('pl');

  expect(registeredNames()).toEqual(['kool_find_projects', 'kool_webmcp_debug']);
  view.unmount();
  expect(unregister).toHaveBeenCalledTimes(2);
});

it('registers search and debug in production only when both public gates are enabled', () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'true');
  vi.stubEnv('NEXT_PUBLIC_WEBMCP_DEBUG', 'true');
  renderProvider('pl');
  expect(registeredNames()).toEqual(['kool_find_projects', 'kool_webmcp_debug']);
});

it('re-registers localized search metadata after a locale change', () => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_WEBMCP_ENABLED', 'true');

  const first = renderProvider('pl');
  expect(vi.mocked(registerWebMcpTool).mock.calls[0][0].title)
    .toBe('Znajdź projekty kool studio');
  first.unmount();

  renderProvider('en');
  expect(vi.mocked(registerWebMcpTool).mock.calls[1][0].title)
    .toBe('Find kool studio projects');
  expect(unregister).toHaveBeenCalledOnce();
});
```

Retain the existing direct debug-tool metadata and cancellation tests; they continue to protect Phase 1 behavior.

- [ ] **Step 2: Run the focused provider test and confirm RED**

Run:

```bash
pnpm exec vitest run components/WebMcpProvider.test.tsx
```

Expected: FAIL because `WebMcpProvider` does not accept `projectIndex` and does not register `kool_find_projects`.

- [ ] **Step 3: Register both tools with independent gates and combined cleanup**

Replace `components/WebMcpProvider.tsx` with:

```tsx
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/request';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';
import { isWebMcpDebugEnabled, isWebMcpEnabled } from '@/lib/webmcp/flags';
import { registerWebMcpTool } from '@/lib/webmcp/model-context';
import { createWebMcpDebugTool } from '@/lib/webmcp/tools/debug';
import {
  createFindProjectsTool,
  type FindProjectsToolCopy,
} from '@/lib/webmcp/tools/find-projects';

type WebMcpProviderProps = {
  locale: Locale;
  projectIndex: readonly ProjectIndexEntry[];
};

export default function WebMcpProvider({ locale, projectIndex }: WebMcpProviderProps) {
  const t = useTranslations('webmcp');
  const enabled = isWebMcpEnabled(
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_WEBMCP_ENABLED,
  );
  const debugEnabled = isWebMcpDebugEnabled(
    process.env.NODE_ENV,
    process.env.NEXT_PUBLIC_WEBMCP_DEBUG,
  );

  useEffect(() => {
    if (!enabled) return;

    const onError = process.env.NODE_ENV === 'development'
      ? (error: unknown) => console.warn('WebMCP registration failed', error)
      : undefined;
    const cleanups = [
      registerWebMcpTool(
        createFindProjectsTool(
          locale,
          projectIndex,
          t.raw('projectSearch') as FindProjectsToolCopy,
        ),
        { onError },
      ),
    ];

    if (debugEnabled) {
      cleanups.push(registerWebMcpTool(createWebMcpDebugTool(locale, document), { onError }));
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [debugEnabled, enabled, locale, projectIndex, t]);

  return null;
}
```

- [ ] **Step 4: Build the localized index in the server layout**

Add this import to `app/[locale]/layout.tsx`:

```ts
import { getProjectSearchIndex } from '@/lib/projects/project-search-index.server';
```

After locale validation, create one typed value and use it consistently:

```ts
  const validatedLocale = locale as Locale;
  const messages = await getMessages(validatedLocale);
  const tMeta = await getTranslations({ locale: validatedLocale, namespace: 'meta' });
  const projectIndex = getProjectSearchIndex(validatedLocale);
```

Pass the lean data into the provider:

```tsx
<WebMcpProvider locale={validatedLocale} projectIndex={projectIndex} />
```

Use `validatedLocale` for `<html lang>`, `NextIntlClientProvider`, and the existing translation call so the layout has one validated locale boundary. Keep the layout a server component.

- [ ] **Step 5: Expand the source-boundary test across every client production module**

Append to `tests/project-search.test.ts`:

```ts
test('client search modules cannot cross the canonical catalog boundary', () => {
  const clientModules = [
    'components/WebMcpProvider.tsx',
    'lib/projects/project-search-types.ts',
    'lib/projects/search-projects.ts',
    'lib/webmcp/tools/find-projects.ts',
  ];

  for (const file of clientModules) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /from ['"]@\/data\/projects|project-search-index\.server/, file);
  }

  const serverSource = readFileSync('lib/projects/project-search-index.server.ts', 'utf8');
  assert.match(serverSource, /from ['"]@\/data\/projects/);
});

test('the locale layout passes only the projected index into the client provider', () => {
  const source = readFileSync('app/[locale]/layout.tsx', 'utf8');
  assert.match(source, /getProjectSearchIndex\(validatedLocale\)/);
  assert.match(source, /<WebMcpProvider locale=\{validatedLocale\} projectIndex=\{projectIndex\}/);
});
```

- [ ] **Step 6: Run focused provider, Node, i18n, and type checks to confirm GREEN**

Run:

```bash
pnpm exec vitest run components/WebMcpProvider.test.tsx lib/webmcp/tools/find-projects.test.ts lib/webmcp/model-context.test.ts
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --experimental-strip-types --test tests/project-content.test.ts tests/project-search.test.ts
pnpm check:i18n
pnpm typecheck
```

Expected: all commands exit 0; production base-only registration contains search but not debug, development contains both, and cleanup runs once per live tool.

- [ ] **Step 7: Commit provider and layout integration**

```bash
git add components/WebMcpProvider.tsx components/WebMcpProvider.test.tsx app/'[locale]'/layout.tsx tests/project-search.test.ts
git commit -m "feat: register project search with WebMCP provider"
```

---

### Task 6: Complete Automated Verification and the Native-Browser Checkpoint

**Files:**
- Create: `docs/webmcp/evals.md`

**Interfaces:**
- Consumes: the complete Phase 2 branch, `pnpm check`, existing `Origin-Agent-Cluster: ?1`, the two production build-time gates, and the approved evaluation prompts
- Produces: an evidence log that distinguishes automated pass status from native discovery/agent-selection status; no runtime interface

- [ ] **Step 1: Run the full repository gate**

Run:

```bash
pnpm check
```

Expected: exit 0 from tests, typecheck, lint, i18n parity, and production build. Stop and fix any failure before continuing.

- [ ] **Step 2: Confirm Phase 2 added no runtime dependency and inspect the complete diff**

Run:

```bash
git diff --check origin/main...HEAD
git diff --name-status origin/main...HEAD
git diff origin/main...HEAD -- package.json pnpm-lock.yaml
git status --short
```

Expected: `git diff --check` exits 0; the dependency diff contains the existing Phase 1 development-only `webmcp-types` addition and no Phase 2 runtime dependency; status contains no unintended files.

- [ ] **Step 3: Build and start the enabled production checkpoint in the background**

Run the build as a background-capable long operation and inspect its exit code:

```bash
NEXT_PUBLIC_WEBMCP_ENABLED=true NEXT_PUBLIC_WEBMCP_DEBUG=false pnpm build
```

Then start the server on the workspace-safe port and retain its process ID:

```bash
PORT=${CONDUCTOR_PORT:-8080} pnpm start > .context/webmcp-phase2-server.log 2>&1 &
WEBMCP_PHASE2_SERVER_PID=$!
```

Poll `http://127.0.0.1:${CONDUCTOR_PORT:-8080}/pl` until it responds, with an upper bound of 60 seconds. Do not start a second server if the selected port is already occupied.

- [ ] **Step 4: Verify HTTP isolation and ordinary routes**

Run:

```bash
curl -fsSI "http://127.0.0.1:${CONDUCTOR_PORT:-8080}/pl" | tr -d '\r' | rg -i '^origin-agent-cluster: \?1$'
curl -fsS -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:${CONDUCTOR_PORT:-8080}/pl"
curl -fsS -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:${CONDUCTOR_PORT:-8080}/en/projekty"
curl -sS -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:${CONDUCTOR_PORT:-8080}/pl/route-that-does-not-exist"
```

Expected: header command exits 0; localized routes return `200`; the unknown route returns `404`.

- [ ] **Step 5: Attempt the supported-browser WebMCP evaluation**

In a fresh supported browsing context, verify `window.originAgentCluster === true`, open Site tools, and inspect `kool_find_projects`. Confirm exact localized title/description/schema, read-only classification, arguments, locale, output, reasons, and cleanup/re-registration while navigating `/pl` to `/en`.

Run these exact prompts:

```text
Find residential projects in Wrocław around 85 m².
Show pre-war apartment projects in Wroclaw.
Find commercial food-and-beverage projects around 300 m², limit 3.
Show projects whose published scope includes lighting design.
I'm renovating an 85 m² pre-war apartment in Wrocław. Which published kool projects share those factual characteristics?
We have a post-industrial hospitality venue. Does the portfolio contain any food or drink spaces in a post-industrial building?
Znajdź mieszkania we Wrocławiu o powierzchni około 85 m².
Pokaż projekty w przedwojennych budynkach.
Znajdź komercyjne projekty gastronomiczne około 300 m².
Which project proves kool can meet my 200,000 PLN budget?
Is kool available next month?
What is the weather in Wrocław?
Find a pre-war hotel in Gdańsk.
```

For every prompt where the tool is used, record the exact tool arguments and returned JSON. For the budget and availability prompts, verify that no unsupported claim is made. For weather, verify that the tool is not selected. For the impossible combination, verify zero results and no relaxed alternative. Agent non-selection is observation evidence, not an automated guarantee.

The current workspace has no connected supported native-WebMCP browser. If that remains true, do not substitute jsdom or ordinary Chromium for native discovery; record the checkpoint as explicitly unverified and continue with Phase 3 as permitted by the spec.

- [ ] **Step 6: Stop the preview server and verify the default-off build**

Stop only the retained Phase 2 server process:

```bash
kill "$WEBMCP_PHASE2_SERVER_PID"
wait "$WEBMCP_PHASE2_SERVER_PID" 2>/dev/null || true
```

Run the default-off production build as a background-capable long operation:

```bash
NEXT_PUBLIC_WEBMCP_ENABLED=false NEXT_PUBLIC_WEBMCP_DEBUG=false pnpm build
```

Expected: build exits 0. In a supported browser, Site tools contains neither search nor debug. If no supported browser is connected, record production tool absence as unverified; the automated provider test remains the build-gate evidence.

- [ ] **Step 7: Write the evaluation record from observed evidence**

Create `docs/webmcp/evals.md` with these sections and only observed facts:

```markdown
# WebMCP Evaluation Log

## Phase 2 automated evidence

- Full repository gate: command, date, exit code, and test counts.
- Enabled production build: command and exit code.
- Default-off production build: command and exit code.
- HTTP checks: `Origin-Agent-Cluster` value and localized/404 status codes.
- Payload budget: Polish and English serialized byte/character counts from the catalog fixture.

## Native browser status

- Browser/context used, or the exact statement: `Unverified — no supported native-WebMCP browser context was connected.`
- `window.originAgentCluster` observation, when available.
- Site tools manifest and read-only classification, when available.
- `/pl` to `/en` cleanup and re-registration observation, when available.

## Prompt evaluations

- For each executed prompt: prompt text, selected tool or no selection, exact arguments, result summary, locale, and factual-reason assessment.
- For prompts not executable without native support: `Not run — native discovery and agent selection remain unverified.`

## Rollout status

- Commit SHA tested.
- Production enablement: not performed.
- Deployment: not performed.
- Known limitation: native discovery and agent selection remain unverified unless evidence is recorded above.
```

Replace the descriptive list items with the concrete command outputs and observations collected in this task; never mark unavailable native checks as passing.

- [ ] **Step 8: Commit the verified evaluation record**

```bash
git add docs/webmcp/evals.md
git commit -m "docs: record WebMCP project search verification"
```

- [ ] **Step 9: Run the final clean-tree gate after the documentation commit**

Run:

```bash
pnpm check
git diff --check origin/main...HEAD
git status --short
git log --oneline --decorate -8
```

Expected: `pnpm check` and `git diff --check` exit 0; status is clean; the log shows one focused commit for each completed implementation task. Report the native-browser checkpoint separately as passed or unverified, never infer it from automated tests.
