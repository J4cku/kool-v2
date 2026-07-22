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
    /\{\s*source: ['"]\/:locale\(pl\|en\)\/projekty\/mieszkanie-widmo['"],\s*destination: ['"]\/:locale\/projekty\/mieszkanie-midcentury['"],\s*permanent: true,\s*\}/,
  );
});
