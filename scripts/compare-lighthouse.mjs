import fs from 'node:fs';

const [baselinePath, outputPath, ...runPaths] = process.argv.slice(2);

if (!baselinePath || !outputPath || runPaths.length !== 5) {
  throw new Error('Usage: node scripts/compare-lighthouse.mjs BASELINE OUTPUT RUN1 RUN2 RUN3 RUN4 RUN5');
}

const readReport = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const median = (values) => [...values].sort((a, b) => a - b)[2];

function summarize(report) {
  const requests = report.audits['network-requests'].details.items;
  const categoryScore = (id) => Math.round(report.categories[id].score * 100);
  const metric = (id) => report.audits[id].numericValue;
  const requestCount = (predicate) => requests.filter(predicate).length;

  return {
    scores: {
      performance: categoryScore('performance'),
      accessibility: categoryScore('accessibility'),
      bestPractices: categoryScore('best-practices'),
      seo: categoryScore('seo'),
    },
    metrics: {
      fcpMs: metric('first-contentful-paint'),
      lcpMs: metric('largest-contentful-paint'),
      tbtMs: metric('total-blocking-time'),
      cls: metric('cumulative-layout-shift'),
      speedIndexMs: metric('speed-index'),
    },
    resources: {
      transferBytes: requests.reduce((sum, request) => sum + request.transferSize, 0),
      images: requestCount((request) => request.resourceType === 'Image'),
      fonts: requestCount((request) => request.resourceType === 'Font'),
      media: requestCount((request) => request.resourceType === 'Media'),
      routePrefetches: requestCount((request) => request.mimeType === 'text/x-component'),
    },
    environment: {
      lighthouseVersion: report.lighthouseVersion,
      chromeUserAgent: report.environment.hostUserAgent,
      benchmarkIndex: report.environment.benchmarkIndex,
      fetchTime: report.fetchTime,
    },
    failedWeightedAudits: Object.entries(report.categories).flatMap(([categoryId, category]) =>
      category.auditRefs
        .filter(({ id, weight }) => weight > 0 && (report.audits[id].score ?? 1) < 1)
        .map(({ id, weight }) => ({ categoryId, id, weight, score: report.audits[id].score }))
    ),
  };
}

const baseline = summarize(readReport(baselinePath));
const runs = runPaths.map((path) => summarize(readReport(path)));
const scoreKeys = Object.keys(baseline.scores);
const metricKeys = Object.keys(baseline.metrics);
const resourceKeys = Object.keys(baseline.resources);

const comparison = {
  commit: process.env.GIT_COMMIT ?? null,
  baseline,
  runs,
  median: {
    scores: Object.fromEntries(scoreKeys.map((key) => [key, median(runs.map((run) => run.scores[key]))])),
    metrics: Object.fromEntries(metricKeys.map((key) => [key, median(runs.map((run) => run.metrics[key]))])),
    resources: Object.fromEntries(resourceKeys.map((key) => [key, median(runs.map((run) => run.resources[key]))])),
  },
};

fs.writeFileSync(outputPath, `${JSON.stringify(comparison, null, 2)}\n`);
