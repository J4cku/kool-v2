#!/usr/bin/env node
// Compares the leaf-key trees of messages/pl.json and messages/en.json.
// Usage: node scripts/check-i18n.mjs [messagesDir]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'messages';
const locales = ['pl', 'en'];

function leafKeys(node, prefix = '') {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === 'object'
      ? leafKeys(value, path)
      : [path];
  });
}

const keySets = new Map(
  locales.map((locale) => {
    const tree = JSON.parse(readFileSync(join(dir, `${locale}.json`), 'utf8'));
    return [locale, new Set(leafKeys(tree))];
  }),
);

let failed = false;
for (const locale of locales) {
  const own = keySets.get(locale);
  for (const [otherLocale, otherKeys] of keySets) {
    if (otherLocale === locale) continue;
    for (const key of otherKeys) {
      if (!own.has(key)) {
        console.error(`missing in ${locale}.json: ${key}`);
        failed = true;
      }
    }
  }
}

if (failed) process.exit(1);
console.log(`i18n OK: ${keySets.get('pl').size} keys match across ${locales.join(', ')}`);
