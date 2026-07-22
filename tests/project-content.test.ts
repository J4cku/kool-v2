import assert from 'node:assert/strict';
import test from 'node:test';
import { localizeProject, projectDisplayOrder, projects } from '../data/projects.ts';

const expectedOrder = [
  'dom-dobrzykowice',
  'delikatesy-dehesa',
  'mieszkanie-walecznych',
  'lazienki-warszawa',
  'pawilon-fandom',
  'hotel-belmonte',
  'kancelaria',
  'biblioteka-gdansk',
  'winobar-lodz',
  'mieszkanie-midcentury',
  'mieszkanie-strachowicka',
  'biuro-dobry-material',
  'mieszkanie-gdansk',
  'foodhall-piazza',
  'toalety-w-teatrze',
] as const;

test('projects use the approved display order', () => {
  assert.deepEqual(projectDisplayOrder, expectedOrder);
  assert.deepEqual(projects.map(({ slug }) => slug), expectedOrder);
});

test('every project renders non-Polish English detail copy', () => {
  for (const project of projects) {
    const english = localizeProject(project, 'en');
    assert.ok(english.description.trim().length > 0, project.slug);
    assert.notEqual(english.description, project.description, project.slug);
    assert.equal(english.descriptionBlocks?.length ?? 0, project.descriptionBlocks?.length ?? 0, project.slug);
  }
});
