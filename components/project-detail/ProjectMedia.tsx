'use client';

import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import type { StoryMedia } from '@/lib/portfolio-motion';

type ProjectMediaProps = {
  media: StoryMedia;
  alt?: string;
  staticMode?: boolean;
  desktopCadence?: 'compact' | 'medium' | 'full';
  onReady?: () => void;
};

type FrameSize = 'full' | 'portrait' | 'small' | 'normal';

const desktopFrameClasses: Record<FrameSize, string> = {
  full: 'min-[992px]:h-[82vh] min-[992px]:w-[88vw]',
  portrait: 'min-[992px]:h-[80vh] min-[992px]:w-[53vh]',
  small: 'min-[992px]:h-[58vh] min-[992px]:w-[42vw]',
  normal: 'min-[992px]:h-[72vh] min-[992px]:w-[68vw]',
};

const desktopImageSizes: Record<FrameSize, string> = {
  full: '88vw',
  portrait: '53vh',
  small: '42vw',
  normal: '68vw',
};

const cadenceFrameClasses: Record<
  NonNullable<ProjectMediaProps['desktopCadence']>,
  Record<FrameSize, string>
> = {
  compact: {
    full: 'min-[992px]:h-[60vh] min-[992px]:w-[54vw]',
    portrait: 'min-[992px]:h-[60vh] min-[992px]:w-[40vh]',
    small: 'min-[992px]:h-[60vh] min-[992px]:w-[42vw]',
    normal: 'min-[992px]:h-[60vh] min-[992px]:w-[52vw]',
  },
  medium: {
    full: 'min-[992px]:h-[80vh] min-[992px]:w-[82vw]',
    portrait: 'min-[992px]:h-[80vh] min-[992px]:w-[53vh]',
    small: 'min-[992px]:h-[80vh] min-[992px]:w-[54vw]',
    normal: 'min-[992px]:h-[80vh] min-[992px]:w-[68vw]',
  },
  full: {
    full: 'min-[992px]:h-[100vh] min-[992px]:w-[94vw]',
    portrait: 'min-[992px]:h-[100vh] min-[992px]:w-[66vh]',
    small: 'min-[992px]:h-[100vh] min-[992px]:w-[68vw]',
    normal: 'min-[992px]:h-[100vh] min-[992px]:w-[92vw]',
  },
};

const cadenceImageSizes: Record<
  NonNullable<ProjectMediaProps['desktopCadence']>,
  Record<FrameSize, string>
> = {
  compact: { full: '54vw', portrait: '40vh', small: '42vw', normal: '52vw' },
  medium: { full: '82vw', portrait: '53vh', small: '54vw', normal: '68vw' },
  full: { full: '94vw', portrait: '66vh', small: '68vw', normal: '92vw' },
};

function getFrameSize(media: StoryMedia): FrameSize {
  if (media.kind === 'image') {
    if (media.fullWidth) return 'full';
    if (media.portrait) return 'portrait';
    if (media.small) return 'small';
    return 'normal';
  }

  if (media.kind === 'reel') return 'portrait';
  return 'normal';
}

function getMobileAspect(media: StoryMedia) {
  if (media.kind === 'reel') return media.aspect ?? 'aspect-[9/16]';
  if (media.kind === 'comparison') return media.aspect ?? 'aspect-[3/2]';
  if (media.portrait) return 'aspect-[2/3]';
  if (media.fullWidth) return 'aspect-[16/10]';
  return 'aspect-[4/3]';
}

export default function ProjectMedia({
  media,
  alt = '',
  staticMode = false,
  desktopCadence,
  onReady,
}: ProjectMediaProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const staticLayout = staticMode || shouldReduceMotion;
  const frameSize = getFrameSize(media);
  const mobileAspect = getMobileAspect(media);
  const frameClass = staticLayout
    ? `w-full ${mobileAspect}`
    : `w-full ${mobileAspect} min-[992px]:aspect-auto ${
        desktopCadence
          ? cadenceFrameClasses[desktopCadence][frameSize]
          : desktopFrameClasses[frameSize]
      }`;
  const imageSizes = staticLayout
    ? '100vw'
    : `(max-width: 991px) 100vw, ${
        desktopCadence
          ? cadenceImageSizes[desktopCadence][frameSize]
          : desktopImageSizes[frameSize]
      }`;

  return (
    <figure
      className={`relative shrink-0 overflow-hidden bg-dark/5 ${frameClass}`}
      data-media-kind={media.kind}
    >
      {media.kind === 'image' && (
        <Image
          src={media.src}
          alt={alt}
          fill
          sizes={imageSizes}
          className={media.small ? 'object-contain' : 'object-cover'}
          onLoad={onReady}
        />
      )}

      {media.kind === 'reel' && (
        <video
          className="h-full w-full object-cover"
          src={media.src}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          onLoadedMetadata={onReady}
        />
      )}

      {media.kind === 'comparison' && (
        <BeforeAfterSlider
          beforeSrc={media.beforeSrc}
          afterSrc={media.afterSrc}
          beforeLabel={media.labels?.[0]}
          afterLabel={media.labels?.[1]}
          aspectClass="h-full"
          fill
          sizes={imageSizes}
          onReady={onReady}
        />
      )}
    </figure>
  );
}
