import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const assets = [
  'home-walecznych.jpg',
  'projects-dehesa.jpg',
  'studio-team.jpg',
  'offer-commercial.jpg',
  'contact-reel.jpg',
];

const metadataSource = readFileSync(new URL('../lib/metadata.ts', import.meta.url), 'utf8');
const homeSource = readFileSync(new URL('../app/[locale]/page.tsx', import.meta.url), 'utf8');
const projectSource = readFileSync(
  new URL('../app/[locale]/projekty/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const pl = JSON.parse(readFileSync(new URL('../messages/pl.json', import.meta.url), 'utf8'));
const en = JSON.parse(readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8'));

function jpegSize(buffer: Buffer) {
  assert.deepEqual(Array.from(buffer.subarray(0, 2)), [0xff, 0xd8]);
  const sofMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset + 2);
    if (sofMarkers.has(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  throw new Error('JPEG dimensions not found');
}

test('static social assets are non-empty 1200x630 JPEGs', () => {
  for (const asset of assets) {
    const url = new URL(`../public/images/social/${asset}`, import.meta.url);
    assert.ok(existsSync(url), `missing ${asset}`);
    assert.ok(statSync(url).size > 10_000, `${asset} is unexpectedly small`);
    assert.deepEqual(jpegSize(readFileSync(url)), { width: 1200, height: 630 });
  }
});

test('static pages declare exact deterministic localized social images', () => {
  const mappings = {
    projekty: '/images/social/projects-dehesa.jpg',
    studio: '/images/social/studio-team.jpg',
    oferta: '/images/social/offer-commercial.jpg',
    kontakt: '/images/social/contact-reel.jpg',
  };
  for (const [key, socialImage] of Object.entries(mappings)) {
    assert.match(metadataSource, new RegExp(`${key}: ['"]${socialImage}['"]`));
    assert.equal(typeof pl.meta[key].ogImageAlt, 'string');
    assert.equal(typeof en.meta[key].ogImageAlt, 'string');
  }
  assert.match(metadataSource, /width: 1200/);
  assert.match(metadataSource, /height: 630/);
  assert.match(metadataSource, /alt: t\(`\$\{key\}\.ogImageAlt`\)/);
  assert.match(metadataSource, /openGraph:[\s\S]*images: \[socialImage\]/);
  assert.match(metadataSource, /twitter:[\s\S]*images: \[socialImage\]/);
  assert.match(metadataSource, /card: 'summary_large_image'/);
  assert.match(homeSource, /home-walecznych\.jpg/);
  assert.match(homeSource, /t\('home\.ogImageAlt'\)/);
  assert.match(homeSource, /width: 1200/);
  assert.match(homeSource, /height: 630/);
  assert.match(homeSource, /openGraph:[\s\S]*images: \[socialImage\]/);
  assert.match(
    homeSource,
    /twitter:[\s\S]*card: 'summary_large_image'[\s\S]*images: \[socialImage\]/,
  );
});

test('static defaults do not replace project images', () => {
  assert.match(projectSource, /images: project\.images\[0\]/);
  assert.doesNotMatch(projectSource, /staticSocialImages|images\/social\//);
});
