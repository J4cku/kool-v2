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
