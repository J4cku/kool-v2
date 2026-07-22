'use client';

import Image from 'next/image';

interface ProjectHeroProps {
  src: string;
  alt: string;
  imageClassName?: string;
}

export default function ProjectHero({ src, alt, imageClassName = '' }: ProjectHeroProps) {
  return (
    <>
      <div className="fixed inset-x-0 top-[var(--nav-header-bottom)] z-0 aspect-video w-full md:inset-0 md:top-0 md:aspect-auto md:h-screen">
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover ${imageClassName}`}
          sizes="100vw"
          quality={90}
          priority
        />
      </div>
      <div
        aria-hidden="true"
        className="h-[calc(var(--nav-header-bottom)+56.25vw)] md:h-screen"
      />
    </>
  );
}
