import { projectDisplayOrder } from './projects.ts';

// The homepage uses the same canonical ordering and thumbnail art direction
// as the projects index. The server shuffles these slugs for each ISR build.
export const homepageProjectSlugs = projectDisplayOrder;

type CuratableProject = {
  slug: string;
  thumbnail: string;
};

export type HomepageProject<T extends CuratableProject> = T & {
  heroImage: string;
};

export function curateHomepageProjects<T extends CuratableProject>(
  projects: readonly T[],
): HomepageProject<T>[] {
  return homepageProjectSlugs.map((slug) => {
    const project = projects.find((candidate) => candidate.slug === slug);

    if (!project) {
      throw new Error(`Homepage project not found: ${slug}`);
    }

    if (!project.thumbnail) {
      throw new Error(`Homepage project needs a thumbnail: ${slug}`);
    }

    return { ...project, heroImage: project.thumbnail };
  });
}

export function getWrappedProjectIndex(index: number, step: number, count: number) {
  if (count <= 0) {
    throw new RangeError('Project count must be positive');
  }

  return ((index + step) % count + count) % count;
}

export function getProjectWindowIndices(
  activeIndex: number,
  count: number,
): [number, number] {
  if (count < 2) {
    throw new RangeError('Homepage reel needs at least two projects');
  }

  return [activeIndex, getWrappedProjectIndex(activeIndex, 1, count)];
}
