'use client';

import Image from 'next/image';

interface ProjectHeroProps {
  src: string;
  alt: string;
  imageClassName?: string;
}

export default function ProjectHero({ src, alt, imageClassName = '' }: ProjectHeroProps) {
  return (
    <div className="fixed inset-0 w-full h-screen z-0">
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
