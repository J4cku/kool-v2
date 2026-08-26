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
