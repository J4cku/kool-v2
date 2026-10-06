import assert from 'node:assert/strict';
import test from 'node:test';
import { localizeProject, projectDisplayOrder, projects } from '../data/projects.ts';
import {
  portfolioProjectTypes,
  projectObjectiveFeatures,
} from '../lib/projects/project-search-types.ts';

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
