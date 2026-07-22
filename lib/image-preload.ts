export type OptimizedImagePreload = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

type ImagePreloadLink = {
  rel: string;
  as: string;
  href: string;
  imageSrcset: string;
  imageSizes: string;
  remove(): void;
};

export function appendOptimizedImagePreloads<TLink extends ImagePreloadLink>(
  preloads: readonly OptimizedImagePreload[],
  createLink: () => TLink,
  appendLink: (link: TLink) => void,
) {
  const links = preloads.map((preload) => {
    const link = createLink();
    link.rel = 'preload';
    link.as = 'image';

    if (preload.srcSet) {
      link.imageSrcset = preload.srcSet;
      link.imageSizes = preload.sizes ?? '';
    } else {
      link.href = preload.src;
    }

    appendLink(link);
    return link;
  });

  return () => {
    for (const link of links) link.remove();
  };
}

export function shouldPrioritizeInitialProject(
  isInitialRender: boolean,
  projectIndex: number,
) {
  return isInitialRender && projectIndex === 0;
}
