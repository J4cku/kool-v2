#!/usr/bin/env node
/*
 * Submit the site's URLs to IndexNow (Bing, Yandex, Seznam, … via the shared
 * api.indexnow.org endpoint) so search engines re-crawl changed pages quickly.
 *
 * The key is public — it is also served at https://koolstudio.pl/<key>.txt,
 * which is how IndexNow verifies ownership.
 *
 * Usage:
 *   node scripts/indexnow.mjs                 # fetch sitemap, submit every URL
 *   node scripts/indexnow.mjs --dry-run       # print the payload, submit nothing
 *   node scripts/indexnow.mjs <url> [<url>…]  # submit only the given URLs
 */

const KEY = '7405537c5b57c8ca45cd4413230cbbc1';
const HOST = 'koolstudio.pl';
const ORIGIN = `https://${HOST}`;
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function sitemapUrls() {
  const res = await globalThis.fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) {
    throw new Error(`sitemap fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1].trim());
  return [...new Set(urls)];
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const explicitUrls = args.filter((a) => a.startsWith('http'));

  const urlList = explicitUrls.length ? explicitUrls : await sitemapUrls();
  if (urlList.length === 0) {
    console.error('IndexNow: no URLs to submit');
    process.exit(1);
  }

  const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };

  if (dryRun) {
    console.log(`[dry-run] would POST ${urlList.length} URLs to ${ENDPOINT}`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const res = await globalThis.fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  // IndexNow returns 200 (accepted) or 202 (accepted, pending verification).
  console.log(`IndexNow: ${res.status} ${res.statusText} — submitted ${urlList.length} URLs`);
  if (!res.ok) {
    console.error(await res.text());
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
