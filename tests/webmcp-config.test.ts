import assert from 'node:assert/strict';
import test from 'node:test';
import nextConfig from '../next.config.mjs';

test('all application responses request an origin-keyed agent cluster', async () => {
  assert.equal(typeof nextConfig.headers, 'function');
  const rules = await nextConfig.headers!();
  const catchAll = rules.find((rule) => rule.source === '/:path*');

  assert.ok(catchAll, 'missing catch-all response-header rule');
  assert.deepEqual(catchAll.headers, [
    { key: 'Origin-Agent-Cluster', value: '?1' },
  ]);
});
