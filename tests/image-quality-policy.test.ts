import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readSource = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const nextConfigSource = readSource('next.config.mjs');
const imageStripSource = readSource('components/ImageStrip.tsx');
const projectCardSource = readSource('components/ProjectCard.tsx');
const projectHeroSource = readSource('components/ProjectHero.tsx');
const projectContentSource = readSource('components/ProjectContent.tsx');

test('image quality tiers preserve fidelity without inflating navigation imagery', () => {
  assert.match(nextConfigSource, /qualities:\s*\[75,\s*90\]/);
  assert.match(projectHeroSource, /sizes="100vw"\s+quality=\{90\}/);
  assert.match(
    projectContentSource,
    /function FullImage[\s\S]*?sizes="\(max-width: 768px\) 100vw, 50vw" quality=\{90\}/
  );
  assert.match(
    projectContentSource,
    /<ParallaxImage[\s\S]*?sizes="100vw" quality=\{90\}/
  );
  assert.match(
    imageStripSource,
    /sizes="\(max-width: 767px\) 100vw, \(max-width: 1279px\) 50vw, 33vw"\s+loading=\{i === 0 \? 'eager' : 'lazy'\}/
  );
  assert.match(
    imageStripSource,
    /fetchPriority=\{i === 0 \? 'high' : undefined\}/
  );
  assert.match(
    projectCardSource,
    /sizes="\(max-width: 768px\) 100vw, \(max-width: 1024px\) 50vw, 33vw"/
  );
  assert.doesNotMatch(projectCardSource, /\bloading\s*=/);
  assert.doesNotMatch(imageStripSource, /\bquality\s*=/);
  assert.doesNotMatch(projectCardSource, /\bquality\s*=/);
});
