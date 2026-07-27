'use client';

import Image from 'next/image';
import ProgressiveBlur from './ProgressiveBlur';

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
      {/* Nav legibility. The coral logo, links and dot sit on whatever photo
          the page happens to open with, so the header band gets a blur ramp
          and a whisper of beige — enough to hold the accent colour off any
          highlight, not enough to read as a grey bar. Pinned in its own fixed
          box (Tailwind's .absolute would win over a .fixed passed through
          className regardless of order).

          Deliberately just above the photo rather than above the page: at a
          header-level z-index this turns into a frosted bar that softens every
          image scrolling under it, and on a portfolio the photography has to
          stay crisp. Here it only ever blurs the fixed hero. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[5] h-[calc(var(--nav-header-bottom)+40px)]"
      >
        <ProgressiveBlur position="top" size="100%" layers={4} blur={1.5} tint="rgb(229 221 208 / 0.2)" />
      </div>
      <div
        aria-hidden="true"
        className="h-[calc(var(--nav-header-bottom)+56.25vw)] md:h-screen"
      />
    </>
  );
}
