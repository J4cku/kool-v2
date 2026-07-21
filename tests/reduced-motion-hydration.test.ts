import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const hookPath = 'hooks/useReducedMotion.ts';
const consumers = [
  'components/Reveal.tsx',
  'components/RevealHeading.tsx',
  'components/PageTransition.tsx',
  'components/Navbar.tsx',
  'components/oferta/ProcessSection.tsx',
  'components/ProjectGrid.tsx',
  'components/ImageStrip.tsx',
  'components/oferta/ServiceSection.tsx',
  'app/[locale]/kontakt/KontaktPage.tsx',
] as const;

test('reduced-motion consumers use one hydration-safe media-query store', () => {
  assert.ok(existsSync(hookPath), `${hookPath} must provide the shared hook`);

  const hook = readFileSync(hookPath, 'utf8');
  assert.match(hook, /useSyncExternalStore/);
  assert.match(
    hook,
    /const reducedMotionQuery = ['"]\(prefers-reduced-motion: reduce\)['"];\s*[\s\S]*matchMedia\(reducedMotionQuery\)/
  );
  assert.match(hook, /addEventListener\(['"]change['"]/);
  assert.match(hook, /removeEventListener\(['"]change['"]/);
  assert.match(hook, /function getServerSnapshot\(\)\s*{\s*return false;\s*}/);

  for (const path of consumers) {
    const source = readFileSync(path, 'utf8');
    assert.doesNotMatch(
      source,
      /import\s*{[^}]*\buseReducedMotion\b[^}]*}[\s\S]*?from ['"]framer-motion['"]/,
      `${path} must not use Framer's hydration-unsafe hook directly`
    );
    assert.match(
      source,
      /import { useReducedMotion } from ['"]@\/hooks\/useReducedMotion['"]/,
      `${path} must use the shared hydration-safe hook`
    );
  }
});
