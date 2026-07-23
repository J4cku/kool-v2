import assert from 'node:assert/strict';
import test from 'node:test';
import {
  curateHomepageProjects,
  homepageProjectSlugs,
} from '../data/homepage-projects.ts';
import { projects } from '../data/projects.ts';

test('every curated homepage project resolves to one existing thumbnail', () => {
  const curated = curateHomepageProjects(projects);
  assert.equal(curated.length, homepageProjectSlugs.length);
  assert.ok(curated.length > 1);

  for (const project of curated) {
    assert.ok(project.heroImage.startsWith('/images/'));
    assert.equal(project.heroImage, project.thumbnail);
  }
});
