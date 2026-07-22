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
