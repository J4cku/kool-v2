# WebMCP Project Search — Phase 2 Design

**Date:** 2026-08-26
**Status:** Approved for implementation
**Scope:** Canonical project-search metadata, deterministic portfolio search, and the read-only `kool_find_projects` WebMCP tool

## Objective

Let supported agents search kool studio's published portfolio through the same canonical project catalog used by the website. Search is deterministic: supplied categorical, location, and feature criteria filter the catalog; target area orders the remaining projects by numeric proximity; the existing portfolio display order breaks ties.

The tool returns public facts and factual match reasons. It does not recommend projects using an LLM and does not infer aesthetic fit, budget fit, availability, service eligibility, or whether kool studio would accept an enquiry.

This design follows the current native imperative API described by the [WebMCP Community Group draft](https://webmachinelearning.github.io/webmcp/) and [Chrome's imperative API guide](https://developer.chrome.com/docs/ai/webmcp/imperative-api). Tool registration remains on `document.modelContext.registerTool(...)`, registration lifetime remains bound to an `AbortSignal`, and execution cancellation is received through the callback's second argument.

## Scope

Phase 2 will:

- add explicit numeric area, project type, and conservative objective-feature metadata to `data/projects.ts`;
- derive a localized, compact `ProjectIndexEntry[]` from the canonical `projects` export on the server;
- implement runtime input validation and a pure deterministic `searchProjects()` function;
- expose the search through `kool_find_projects` in Polish and English;
- register the tool through the existing renderless `WebMcpProvider` and native adapter;
- add unit, provider, metadata-integrity, localization, and configuration-boundary tests;
- keep production registration behind the existing `NEXT_PUBLIC_WEBMCP_ENABLED=true` build-time gate.

## Non-goals

Phase 2 will not:

- change the visible projects listing, its human-facing category filter, or project detail pages;
- scrape rendered pages, descriptions, image alt text, or analytics to construct search data;
- perform semantic, fuzzy, embedding, or LLM-based search;
- add free-text keywords, style tags, color tags, material tags, budget ranges, availability, or acceptance claims;
- expose unpublished content or personal data;
- add invocation analytics or error-monitoring payloads;
- implement, open, populate, or submit the enquiry form;
- implement any Phase 3 enquiry behavior.

## Canonical Metadata

`data/projects.ts` remains the only authored project catalog. The client-safe `lib/projects/project-search-types.ts` owns the search enums and types so browser code can use them without importing the catalog. `data/projects.ts` imports these types and extends `Project` with three required fields:

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

export type ProjectObjectiveFeature =
  (typeof projectObjectiveFeatures)[number];

export type Project = {
  // existing fields
  areaM2: number;
  projectType: PortfolioProjectType;
  objectiveFeatures: ProjectObjectiveFeature[];
};
```

The codes are locale-neutral API values. Human labels live in `messages/pl.json` and `messages/en.json`; they must not be embedded in filtering logic.

### Exact catalog assignments

| Slug | `areaM2` | `projectType` | `objectiveFeatures` |
|---|---:|---|---|
| `dom-dobrzykowice` | 180 | `house` | `existing_space_rework` |
| `delikatesy-dehesa` | 58 | `retail` | `furniture_design`, `lighting_design`, `visual_identity` |
| `mieszkanie-walecznych` | 84 | `apartment` | `pre_war_building`, `furniture_design` |
| `lazienki-warszawa` | 8 | `bathroom` | `furniture_design` |
| `pawilon-fandom` | 1140 | `service_pavilion` | `existing_space_rework`, `modernist_building`, `furniture_design` |
| `hotel-belmonte` | 7100 | `hospitality` | `furniture_design`, `lighting_design` |
| `kancelaria` | 50 | `office` | `furniture_design` |
| `biblioteka-gdansk` | 850 | `public_cultural` | `neurodiversity_support`, `competition_entry`, `furniture_design`, `lighting_design` |
| `winobar-lodz` | 311 | `food_and_beverage` | `post_industrial_building` |
| `mieszkanie-midcentury` | 58 | `apartment` | `furniture_design` |
| `mieszkanie-strachowicka` | 72 | `apartment` | `neurodiversity_support`, `furniture_design` |
| `biuro-dobry-material` | 79 | `office` | `existing_space_rework`, `furniture_design` |
| `mieszkanie-gdansk` | 46 | `apartment` | `furniture_design` |
| `foodhall-piazza` | 340 | `food_and_beverage` | `existing_space_rework`, `furniture_design` |
| `toalety-w-teatrze` | 58 | `bathroom` | `competition_entry` |

This table is authoritative for Phase 2. It records only facts stated directly by the existing catalog's title, area, scope, or unambiguous project description. `furniture_design`, `lighting_design`, and `visual_identity` mean only that the corresponding design service appears explicitly in the project's scope; they do not claim that every installed item was custom-made. Building-era, existing-space, and competition values require an explicit factual statement. `neurodiversity_support` is narrower still: it applies only when the catalog explicitly says the design addresses a named neurodevelopmental condition, which covers ADHD for `mieszkanie-strachowicka` and the autism therapy room for `biblioteka-gdansk`. `post_industrial_building` remains only on `winobar-lodz`, whose catalog explicitly uses “post-industrial”; “industrial hall” alone does not qualify. A value that is absent, ambiguous, merely stylistic, or only visually suggested is omitted. Empty `objectiveFeatures` arrays are valid for future projects. Adding or changing a tag requires an editorially verified source fact and a metadata test change; search code must never derive tags from prose.

`projectType` describes the designed space, independently of the existing market-level category. Therefore `toalety-w-teatrze` is a `bathroom` project while retaining its canonical `komercyjne` category, which the index maps to `commercial`.

### Numeric area

`areaM2` is an authored positive finite number and the value used for search. Existing display field `area` remains unchanged for visible presentation but is not included in the search index or tool result. Runtime search must not parse `area`, because values such as `7 100 m²` contain formatting characters. Tests assert the exact numeric assignments above and verify that each value is a positive integer.

## Lean Localized Index

Define this client-safe shape in a module with no catalog import:

```ts
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
```

`lib/projects/project-search-index.ts` exports this exact pure projection boundary:

```ts
export function projectSearchIndexFromLocalizedProjects(
  localizedProjects: readonly Project[],
  locale: Locale,
  baseUrl: string,
): ProjectIndexEntry[];
```

It imports `Project` and `Locale` as types only, has no `server-only` import, performs no I/O, is directly Node-testable, preserves incoming catalog order as `catalogOrder`, maps `mieszkalne` to `residential` and `komercyjne` to `commercial`, and builds absolute URLs as `${baseUrl}/${locale}/projekty/${slug}`.

`lib/projects/project-search-index.server.ts` is a thin wrapper beginning with `import 'server-only'`. It imports `projects`, `localizeProject`, and `BASE_URL`, localizes each canonical project, and calls the pure projection helper. `app/[locale]/layout.tsx` calls this wrapper for the validated route locale and passes the result as a serializable prop to `WebMcpProvider`. The layout remains a server component. Client modules may import constants and types from `project-search-types.ts`, but must not import `data/projects.ts` or `project-search-index.server.ts`. This prevents the full catalog, long editorial copy, image arrays, status, year, scope, and unused presentation fields from entering the client payload or bundle. A source-boundary test will enforce this rule.

No generated or hand-maintained second catalog file is introduced. The compact index is regenerated on each server render/build from the canonical catalog.

## Search Contract

### Input

```ts
export type ProjectSearchInput = {
  category?: 'residential' | 'commercial';
  projectType?: PortfolioProjectType;
  location?: string;
  targetAreaM2?: number;
  features?: ProjectObjectiveFeature[];
  limit?: number;
};
```

All fields are optional. An empty object returns the first five projects in canonical display order and is useful for a general request to browse the portfolio. `features` uses AND semantics: a project must contain every supplied feature.

### Validation and normalization

The tool handler accepts the browser API's unknown input and validates it before calling search. Validation is dependency-free and applies the same constraints expressed by JSON Schema:

- input must be a plain object, not `null` or an array;
- unknown top-level properties are rejected;
- `category`, `projectType`, and every feature must be exact enum codes;
- `features` defaults to `[]`, accepts at most nine values, and rejects duplicates;
- raw `location` must contain 1–80 Unicode code points and at least one non-whitespace character; overlong raw text is rejected before normalization;
- a valid raw location is then trimmed, Unicode-normalized with NFKC, and has internal whitespace collapsed to one space;
- `targetAreaM2` must be a finite number from 1 through 100000 inclusive;
- `limit` must be an integer from 1 through 5 inclusive and defaults to 5;
- omitted fields stay omitted; blank strings, numeric strings, `NaN`, and infinities are invalid rather than coerced.

Location comparison is exact after a separate comparison normalization: NFKD, lowercasing with `pl-PL`, removal of combining marks, explicit Polish `ł`/`Ł` to `l` mapping, and whitespace collapse. Thus `Wrocław`, `wroclaw`, and ` WROCŁAW ` match the same indexed city. There is no substring, distance, region, or geocoding match.

Invalid input rejects execution with a concise error that names the invalid field and allowed constraint. It returns no partial search result and never echoes the full raw input.

### Pure search function

```ts
export function searchProjects(
  index: readonly ProjectIndexEntry[],
  input: ProjectSearchInput,
): ProjectSearchResult;
```

`searchProjects()` assumes validated input, performs no I/O, reads no browser globals, mutates neither argument, and returns:

```ts
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

The algorithm is exact:

1. Filter by exact `category` when supplied.
2. Filter by exact `projectType` when supplied.
3. Filter by normalized exact `location` when supplied.
4. Filter to entries containing every supplied feature.
5. When `targetAreaM2` is supplied, sort ascending by `Math.abs(areaM2 - targetAreaM2)`.
6. Break all ties by ascending `catalogOrder`. Without a target area, use `catalogOrder` alone.
7. Compute `totalMatches` before applying `limit`, then return the first `limit` matches.

There is no fallback that relaxes filters when zero projects match. The empty result accurately states that the published portfolio contains no exact matches for those criteria.

Each result receives one structured reason for every supplied filter it satisfied. Feature reasons follow the input feature order. The area reason always reports the exact absolute numeric difference; zero means the same area. With empty input, `matchReasons` is empty. Reasons do not affect ranking beyond the area rule above and never contain qualitative language.

## WebMCP Tool Contract

### Identity and localized metadata

The name is stable in every locale:

```text
kool_find_projects
```

For a Polish page:

- title: `Znajdź projekty kool studio`
- description: `Wyszukaj opublikowane projekty kool studio według kategorii, typu, lokalizacji, powierzchni i kuratorowanych cech obiektywnych. Zwraca wyłącznie fakty z portfolio; nie ocenia stylu, budżetu, dostępności ani przyjęcia projektu.`

For an English page:

- title: `Find kool studio projects`
- description: `Search published kool studio projects by category, type, location, floor area, and curated objective features. Returns portfolio facts only; it does not assess style, budget, availability, or project acceptance.`

All public tool copy, property descriptions, enum labels, feature labels, and match-reason templates live under matching `webmcp.projectSearch` keys in `messages/pl.json` and `messages/en.json`. The provider obtains them with `useTranslations()` and supplies a plain copy object to the tool factory. i18n key parity remains mandatory.

### Exact input schema

The tool uses the exact structural constraints below; localized property descriptions and enum-choice titles are then added exactly as specified after the schema without changing these constraints:

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": ["residential", "commercial"]
    },
    "projectType": {
      "type": "string",
      "enum": [
        "house",
        "apartment",
        "bathroom",
        "retail",
        "food_and_beverage",
        "hospitality",
        "office",
        "public_cultural",
        "service_pavilion"
      ]
    },
    "location": {
      "type": "string",
      "minLength": 1,
      "maxLength": 80,
      "pattern": "^\\s*\\S[\\s\\S]*$"
    },
    "targetAreaM2": {
      "type": "number",
      "minimum": 1,
      "maximum": 100000
    },
    "features": {
      "type": "array",
      "uniqueItems": true,
      "maxItems": 9,
      "items": {
        "type": "string",
        "enum": [
          "existing_space_rework",
          "pre_war_building",
          "modernist_building",
          "post_industrial_building",
          "neurodiversity_support",
          "competition_entry",
          "furniture_design",
          "lighting_design",
          "visual_identity"
        ]
      }
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5,
      "default": 5
    }
  },
  "additionalProperties": false
}
```

No property is required. Each property has this exact localized description:

| Property | Polish description | English description |
|---|---|---|
| `category` | `Kategoria projektu.` | `Project category.` |
| `projectType` | `Typ projektowanej przestrzeni.` | `Type of space designed.` |
| `location` | `Dokładna miejscowość (1–80 znaków); wielkość liter i polskie znaki nie wpływają na dopasowanie.` | `Exact city or town (1–80 characters); matching ignores case and Polish diacritics.` |
| `targetAreaM2` | `Docelowa powierzchnia w metrach kwadratowych; wpływa na kolejność, ale nie odrzuca wyników.` | `Target floor area in square metres; affects ordering but does not exclude results.` |
| `features` | `Wymagane kuratorowane cechy obiektywne; wynik musi zawierać wszystkie.` | `Required curated objective features; a result must contain all of them.` |
| `limit` | `Maksymalna liczba zwróconych projektów, od 1 do 5.` | `Maximum number of projects to return, from 1 to 5.` |

Enum properties keep the `enum` arrays shown above and add `oneOf` entries with the same `const` values and these exact locale-specific `title` labels:

| Code | Polish title | English title |
|---|---|---|
| `residential` | `mieszkalne` | `residential` |
| `commercial` | `komercyjne` | `commercial` |
| `house` | `dom` | `house` |
| `apartment` | `mieszkanie` | `apartment` |
| `bathroom` | `łazienki` | `bathrooms` |
| `retail` | `handel detaliczny` | `retail` |
| `food_and_beverage` | `gastronomia` | `food and beverage` |
| `hospitality` | `hotelarstwo` | `hospitality` |
| `office` | `biuro` | `office` |
| `public_cultural` | `przestrzeń publiczna lub kulturalna` | `public or cultural space` |
| `service_pavilion` | `pawilon usługowy` | `service pavilion` |
| `existing_space_rework` | `rearanżacja istniejącej przestrzeni` | `existing-space rework` |
| `pre_war_building` | `przedwojenny budynek` | `pre-war building` |
| `modernist_building` | `modernistyczny budynek` | `modernist building` |
| `post_industrial_building` | `postindustrialny budynek` | `post-industrial building` |
| `neurodiversity_support` | `wsparcie neuroróżnorodności` | `neurodiversity support` |
| `competition_entry` | `projekt konkursowy` | `competition entry` |
| `furniture_design` | `projekt mebli` | `furniture design` |
| `lighting_design` | `projekt oświetlenia` | `lighting design` |
| `visual_identity` | `identyfikacja wizualna` | `visual identity` |

### Annotations

```ts
annotations: { readOnlyHint: true }
```

The result contains only first-party curated public catalog facts, so `untrustedContentHint` is not set. The tool has no side effects and performs no navigation, storage, network request, form mutation, or analytics capture.

### Execution and output

`createFindProjectsTool(locale, index, copy)` validates the raw input, calls `signal.throwIfAborted()` before validation, before search, and before returning, invokes `searchProjects()`, and maps structured reason codes to localized strings. The work is synchronous and bounded, but these checks preserve the adapter's cancellation contract.

The returned JSON shape is exact:

```ts
export type FindProjectsToolResult = {
  locale: 'pl' | 'en';
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
```

`totalMatches` is the pre-limit count and `returnedMatches` is `results.length`. Titles, locations, URLs, and match-reason strings follow the active page locale. Category, type, status, year, scope, objective-feature arrays, descriptions, and images are not returned; a requested category, type, or feature appears only as a factual localized match reason. This keeps the native result compact while retaining enough evidence to explain every requested match.

Match-reason templates are factual and exact in meaning:

- category: `same category: {label}` / `ta sama kategoria: {label}`;
- project type: `same project type: {label}` / `ten sam typ projektu: {label}`;
- location: `same location: {location}` / `ta sama lokalizacja: {location}`;
- area, zero difference: `same floor area: {areaM2} m²` / `ta sama powierzchnia: {areaM2} m²`;
- area, nonzero: `floor area differs by {differenceM2} m²` / `powierzchnia różni się o {differenceM2} m²`;
- feature: `feature: {label}` / `cecha: {label}`.

Plural-sensitive area strings use next-intl ICU pluralization. They must not say “close,” “similar,” “best,” or “recommended.”

## Registration, Gates, and Lifecycle

`WebMcpProvider` receives `projectIndex` in addition to `locale`. It registers `kool_find_projects` whenever the existing base gate is enabled:

- always in local development;
- outside development only when `NEXT_PUBLIC_WEBMCP_ENABLED=true` was present at build time.

There is no separate Phase 2 search flag. `NEXT_PUBLIC_WEBMCP_DEBUG` continues to control only `kool_webmcp_debug`; disabling debug does not disable search. Production remains disabled by default because the base flag is absent unless explicitly configured.

The provider calls `registerWebMcpTool()` once for each enabled tool and combines the returned cleanup functions in its effect cleanup. Locale, localized copy, and index are dependencies. A locale change unregisters the old definition and registers the new localized definition. The existing adapter remains responsible for unsupported-browser no-op behavior, duplicate live-name prevention, registration rejection handling, and abort-driven cleanup. Search registration is same-origin only and does not use `exposedTo`.

## Privacy, Security, and Claims

- Inputs describe desired portfolio characteristics and are processed locally in the page; the tool sends no request and stores nothing.
- Outputs contain only data already published in the project catalog.
- Free-text location is length-bounded and is used only for normalized equality; it is never rendered as HTML, logged, or interpolated into a URL.
- Tool metadata and output exclude long editorial prose, reducing prompt-injection surface. The tool never interprets catalog prose at runtime.
- Returned URLs are constructed from the trusted `BASE_URL`, validated locale, and canonical slug, never from tool input.
- Runtime validation duplicates schema constraints because an invoker cannot be assumed to enforce JSON Schema correctly.
- The tool cannot claim stylistic compatibility, cost compatibility, timeline feasibility, studio availability, suitability, endorsement, ranking quality, or project acceptance.
- “Match” means only that all supplied exact filters passed. Ordering means numeric area proximity followed by editorial catalog order, not a recommendation.
- No contact details, cookies, PostHog identifiers, browser state, or enquiry data enter the index or result.

## Analytics

Phase 2 adds no WebMCP analytics. It does not capture invocations, arguments, results, errors, or agent identity in PostHog, Vercel Analytics, logs, or storage. Existing page analytics continue unchanged. A later telemetry phase requires separate privacy review and must prefer coarse, non-identifying counts over raw search inputs.

## Expected Files

Implementation will modify or add these exact paths:

```text
data/projects.ts
lib/projects/project-search-types.ts
lib/projects/project-search-index.ts
lib/projects/project-search-index.server.ts
lib/projects/search-projects.ts
lib/webmcp/tools/find-projects.ts
lib/webmcp/tools/find-projects.test.ts
components/WebMcpProvider.tsx
components/WebMcpProvider.test.tsx
app/[locale]/layout.tsx
messages/pl.json
messages/en.json
tests/project-content.test.ts
tests/project-search.test.ts
```

`components/WebMcpProvider.test.tsx` and `lib/webmcp/tools/find-projects.test.ts` run under Vitest/jsdom. `tests/project-content.test.ts` and `tests/project-search.test.ts` run under Node's test runner. No new runtime dependency is required.

## Automated Tests

### Canonical metadata and index

- every project has a valid `areaM2`, `projectType`, and unique valid objective-feature values;
- all 15 assignments exactly match the authoritative table in this design;
- numeric areas are positive integers and cover the formatted `7 100 m²` case without runtime parsing;
- index order equals `projectDisplayOrder` and `catalogOrder` is stable;
- Polish and English indexes use localized project fields and locale-prefixed absolute URLs;
- the index includes only the lean fields and does not include descriptions, images, or gallery data;
- the pure projection helper runs directly under Node tests without importing `server-only`;
- client provider/tool/search modules do not import `data/projects.ts` or the `.server.ts` wrapper; only `project-search-index.server.ts` imports the canonical catalog.

### Validation and deterministic search

- `{}` returns the first five catalog entries with empty reasons;
- category, project type, normalized location, and single feature filter correctly;
- multiple features use AND semantics;
- `Wrocław`, `wroclaw`, casing, surrounding whitespace, and repeated whitespace normalize identically;
- a pre-war 85 m² apartment in Wrocław returns `mieszkanie-walecznych` with exact type, location, feature, and one-square-metre reasons;
- area ordering uses absolute difference and catalog order breaks equal-distance ties;
- no-area searches retain catalog order;
- `totalMatches` is computed before the limit and limits 1 and 5 work;
- mutually incompatible exact filters return zero results without relaxation;
- invalid object shape, unknown properties, whitespace-only location, an 81-code-point raw location, invalid enum, duplicate feature, too many features, numeric string, `NaN`, infinity, out-of-range area, fractional limit, and out-of-range limit reject identically at schema and runtime boundaries;
- input and index remain unchanged after search.

### Tool and provider

- exact name, localized titles, localized descriptions, schema, and `{ readOnlyHint: true }` annotation;
- output contains the exact lean result shape and localized reasons for both `pl` and `en`;
- output contains no category, project type, status, year, scope, objective-feature arrays, descriptions, or images;
- in both locales, invoke the actual catalog with `{ category: 'commercial', location: 'Wrocław', targetAreaM2: 100000, features: ['furniture_design'], limit: 5 }`, verify that it returns the five qualifying results with four reasons each, and assert `JSON.stringify(result).length <= 1500`; this is the payload-budget fixture because it maximizes reasons while still returning five current projects;
- an already-aborted signal rejects with `AbortError` and no result;
- base gate off registers neither search nor debug outside development;
- base gate on registers search while debug remains independently gated;
- development registers search and debug;
- cleanup unregisters every registered tool exactly once;
- unsupported native API remains a successful no-op;
- registration failure remains isolated from rendering.

Run focused tests during implementation and `pnpm check` before handoff.

## Evaluation Prompts

Automated tests cover deterministic application behavior. Agent selection and displayed Site tools require a supported-browser manual checkpoint.

Direct English prompts:

- “Find residential projects in Wrocław around 85 m².”
- “Show pre-war apartment projects in Wroclaw.”
- “Find commercial food-and-beverage projects around 300 m², limit 3.”
- “Show projects whose published scope includes lighting design.”

Indirect English prompts:

- “I'm renovating an 85 m² pre-war apartment in Wrocław. Which published kool projects share those factual characteristics?”
- “We have a post-industrial hospitality venue. Does the portfolio contain any food or drink spaces in a post-industrial building?”

Direct Polish prompts:

- “Znajdź mieszkania we Wrocławiu o powierzchni około 85 m².”
- “Pokaż projekty w przedwojennych budynkach.”
- “Znajdź komercyjne projekty gastronomiczne około 300 m².”

Negative and irrelevant prompts:

- “Which project proves kool can meet my 200,000 PLN budget?” must not produce a budget-fit claim; the agent may search only if it clearly reframes the request as factual portfolio criteria.
- “Is kool available next month?” must not be answered by this tool.
- “What is the weather in Wrocław?” should not select the tool.
- An impossible combination such as a pre-war hotel in Gdańsk must return zero exact matches, not relaxed recommendations.

For each used-tool evaluation, inspect the actual arguments, returned result, locale, reasons, and read-only classification. Record results in `docs/webmcp/evals.md`; do not represent model non-selection as an automated guarantee.

## Rollout and Manual Checkpoint

1. Implement and run focused tests, then run `pnpm check` and retain the exit code.
2. Produce a preview build with `NEXT_PUBLIC_WEBMCP_ENABLED=true`. Enable `NEXT_PUBLIC_WEBMCP_DEBUG=true` only when diagnostics are useful.
3. Verify `Origin-Agent-Cluster: ?1` and `window.originAgentCluster === true` in a fresh supported browsing context.
4. Confirm Site tools lists `kool_find_projects` with the exact localized metadata and read-only classification.
5. Run the English and Polish direct, indirect, zero-result, and irrelevant prompts above; inspect Recent tools calls and record the evidence.
6. Navigate between `/pl` and `/en` and confirm the tool definition and output localize after lifecycle cleanup/re-registration.
7. Verify the tool is absent in an unsupported browser and in a production build without `NEXT_PUBLIC_WEBMCP_ENABLED=true`, while the ordinary site remains unchanged.
8. Review the preview URL, commit SHA, tool manifest, changed-file summary, automated evidence, known limitations, and evaluation log before any production enablement.

Phase 2 implementation is ready for handoff when automated checks pass. Native discovery and agent selection are a separate verification status: if a supported browser is unavailable, they must remain explicitly reported as unverified rather than being claimed complete. Phase 3 has separate approval and may proceed even while that browser checkpoint is unavailable. Production enablement and deployment remain separate decisions.
