'use client';

import Image from 'next/image';

interface ProjectHeroProps {
  src: string;
  alt: string;
  imageClassName?: string;
  /* Mobile shows the photo at its native 16:9 ratio instead of a
     full-screen vertical crop; pair with an `aspect-video md:h-screen`
     spacer in the page. Desktop stays full-screen either way. */
  mobileKeepAspect?: boolean;
}

export default function ProjectHero({ src, alt, imageClassName = '', mobileKeepAspect = false }: ProjectHeroProps) {
  const frame = mobileKeepAspect
    ? 'fixed top-0 left-0 right-0 aspect-video md:aspect-auto md:h-screen'
    : 'fixed inset-0 h-screen';

  return (
    <div className={`${frame} w-full z-0`}>
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${imageClassName}`}
        sizes="100vw"
        quality={100}
        priority
        unoptimized
      />
    </div>
  );
}
