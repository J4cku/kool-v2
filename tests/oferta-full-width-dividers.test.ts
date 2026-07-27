import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const faqSource = readFileSync(
  new URL('../components/oferta/FaqAccordion.tsx', import.meta.url),
  'utf8'
);
const timelineSource = readFileSync(
  new URL('../components/oferta/StagesTimeline.tsx', import.meta.url),
  'utf8'
);

test('offer FAQ dividers span the viewport while content stays constrained', () => {
  assert.match(
    faqSource,
    /className="relative before:absolute before:left-1\/2 before:w-dvw before:-translate-x-1\/2/
  );
  assert.match(
    faqSource,
    /className="relative after:absolute after:left-1\/2 after:bottom-0 after:w-dvw after:-translate-x-1\/2/
  );
});

test('offer timeline axis spans the viewport independently of its dots', () => {
  assert.match(
    timelineSource,
    /className="absolute left-1\/2 top-1\/2 h-px w-dvw -translate-x-1\/2 bg-coral"/
  );
});
