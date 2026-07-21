import assert from 'node:assert/strict';
import test from 'node:test';

test('curates a unique, image-ready homepage sequence with wrapping navigation', async () => {
  let homepageModule: typeof import('../data/homepage-projects.js');

  try {
    homepageModule = await import('../data/homepage-projects.js');
  } catch {
    assert.fail('homepage project curation module exists');
  }

  const { projects } = await import('../data/projects.js');
  const { curateHomepageProjects, getWrappedProjectIndex, homepageProjectSlugs } = homepageModule;
  const curated = curateHomepageProjects(projects);

  assert.equal(curated.length, homepageProjectSlugs.length);
  assert.ok(curated.length >= 5);
  assert.equal(new Set(curated.map((project) => project.slug)).size, curated.length);

  for (const project of curated) {
    assert.ok(project.leftImage.startsWith('/images/'));
    assert.ok(project.rightImage.startsWith('/images/'));
    assert.notEqual(project.leftImage, project.rightImage);
  }

  assert.equal(getWrappedProjectIndex(0, -1, curated.length), curated.length - 1);
  assert.equal(getWrappedProjectIndex(curated.length - 1, 1, curated.length), 0);
  assert.equal(getWrappedProjectIndex(2, 1, curated.length), 3);

  const expectedPairs = [
    { slug: 'mieszkanie-walecznych', rightIndex: 1 },
    { slug: 'foodhall-piazza', rightIndex: 2 },
    { slug: 'kancelaria', rightIndex: 1 },
    { slug: 'lazienki-warszawa', rightIndex: 4 },
    { slug: 'mieszkanie-gdansk', rightIndex: 2 },
    { slug: 'biblioteka-gdansk', rightIndex: 2 },
    { slug: 'delikatesy-dehesa', rightIndex: 2 },
    { slug: 'winobar-lodz', rightIndex: 3 },
  ].map(({ slug, rightIndex }) => {
    const project = projects.find((candidate) => candidate.slug === slug);
    assert.ok(project, `expected project exists: ${slug}`);

    return {
      slug,
      leftImage: project.images[0],
      rightImage: project.images[rightIndex],
    };
  });

  assert.deepEqual(
    curated.map(({ slug, leftImage, rightImage }) => ({ slug, leftImage, rightImage })),
    expectedPairs,
  );
});
