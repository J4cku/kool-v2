'use client';

import Image from 'next/image';

interface ProjectHeroProps {
  src: string;
  alt: string;
}

export default function ProjectHero({ src, alt }: ProjectHeroProps) {
  return (
    <div className="fixed inset-0 w-full h-screen z-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        quality={100}
        priority
      />
    </div>
  );
}
