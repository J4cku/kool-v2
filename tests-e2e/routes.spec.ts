import { test, expect, request, type ConsoleMessage } from '@playwright/test';

/* Environment noise that is not an app defect when a production build runs
   outside Vercel with analytics unconfigured: Vercel Analytics / Speed
   Insights only resolve on Vercel, the PostHog proxy is a no-op without a key,
   and the favicon is fetched once per session. */
const IGNORE = ['/_vercel/', 'speed-insights', 'favicon', '/dot/', 'posthog'];
const ignorable = (text: string) =>
  IGNORE.some((needle) => text.toLowerCase().includes(needle));

/* The sitemap is the source of truth for public routes, so QA covers exactly
   what we tell crawlers exists — and drifts with the data automatically. */
async function sitemapRoutes(baseURL: string): Promise<string[]> {
  const ctx = await request.newContext();
  const res = await ctx.get(`${baseURL}/sitemap.xml`);
  expect(res.ok(), 'sitemap.xml should be reachable').toBeTruthy();
  const xml = await res.text();
  await ctx.dispose();
  const paths = Array.from(
    xml.matchAll(/<loc>([^<]+)<\/loc>/g),
    (m) => new URL(m[1]).pathname,
  );
  return Array.from(new Set(paths)).sort();
}

test('every sitemap route returns 200 with no console errors or uncaught exceptions', async ({
  page,
  baseURL,
}) => {
  const routes = await sitemapRoutes(baseURL!);
  expect(routes.length, 'sitemap should list several routes').toBeGreaterThan(5);

  const failures: string[] = [];

  for (const path of routes) {
    const problems: string[] = [];
    const onConsole = (msg: ConsoleMessage) => {
      if (msg.type() === 'error' && !ignorable(msg.text())) {
        problems.push(`console.error: ${msg.text()}`);
      }
    };
    const onPageError = (err: Error) => {
      if (!ignorable(err.message)) problems.push(`pageerror: ${err.message}`);
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    const resp = await page.goto(path, { waitUntil: 'load' });
    // Give hydration a moment so late client-side errors surface.
    await page.waitForTimeout(500);

    page.off('console', onConsole);
    page.off('pageerror', onPageError);

    const status = resp?.status() ?? 0;
    if (status !== 200) failures.push(`${path} → HTTP ${status}`);
    for (const problem of problems) failures.push(`${path} → ${problem}`);
  }

  expect(failures, `\n${failures.join('\n')}\n`).toEqual([]);
});
