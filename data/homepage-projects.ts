export const homepageProjectPairs = [
  { slug: 'mieszkanie-walecznych', leftIndex: 0, rightIndex: 1 },
  { slug: 'foodhall-piazza', leftIndex: 0, rightIndex: 2 },
  { slug: 'kancelaria', leftIndex: 0, rightIndex: 1 },
  { slug: 'lazienki-warszawa', leftIndex: 0, rightIndex: 4 },
  { slug: 'mieszkanie-gdansk', leftIndex: 0, rightIndex: 2 },
  { slug: 'biblioteka-gdansk', leftIndex: 0, rightIndex: 2 },
  { slug: 'delikatesy-dehesa', leftIndex: 0, rightIndex: 2 },
  { slug: 'winobar-lodz', leftIndex: 0, rightIndex: 3 },
] as const;

export const homepageProjectSlugs = homepageProjectPairs.map(({ slug }) => slug);

type CuratableProject = {
  slug: string;
  images: string[];
};

export type HomepageProject<T extends CuratableProject> = T & {
  leftImage: string;
  rightImage: string;
};

export function curateHomepageProjects<T extends CuratableProject>(
  projects: readonly T[],
): HomepageProject<T>[] {
  return homepageProjectPairs.map(({ slug, leftIndex, rightIndex }) => {
    const project = projects.find((candidate) => candidate.slug === slug);

    if (!project) {
      throw new Error(`Homepage project not found: ${slug}`);
    }

    const leftImage = project.images[leftIndex];
    const rightImage = project.images[rightIndex];

    if (!leftImage || !rightImage) {
      throw new Error(`Homepage project needs two distinct images: ${slug}`);
    }

    return { ...project, leftImage, rightImage };
  });
}

export function getWrappedProjectIndex(index: number, step: number, count: number) {
  if (count <= 0) {
    throw new RangeError('Project count must be positive');
  }

  return ((index + step) % count + count) % count;
}
