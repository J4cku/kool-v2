import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { localizeProject, projectDisplayOrder, projects } from '../data/projects.ts';
import { projectSearchIndexFromLocalizedProjects } from '../lib/projects/project-search-index.ts';
import {
  normalizeProjectLocation,
  searchProjects,
  validateProjectSearchInput,
} from '../lib/projects/search-projects.ts';
import { projectObjectiveFeatures } from '../lib/projects/project-search-types.ts';

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
  assert.deepEqual(index.map(({ catalogOrder }) => catalogOrder), Array.from(projects.keys()));
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
