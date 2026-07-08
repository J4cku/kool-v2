'use client';

import Image from 'next/image';

type Fit = 'cover' | 'contain';
type Align = 'start' | 'center' | 'end';

interface ColumnImageProps {
  src: string;
  alt: string;
  /** Portrait aspect-ratio utility for the frame (default "aspect-[2/3]"). */
  aspect?: string;
  /** Frame width within its column — smaller = more breathing room (default "w-[70%] md:w-[58%]"). */
  width?: string;
  /** How the image fills its frame (default "cover"). */
  fit?: Fit;
  /** Horizontal placement of the frame inside the column (default "center"). */
  align?: Align;
  /** Vertical placement of the frame inside the column (default "start"). */
  valign?: 'start' | 'center';
  /** Extra classes on the column wrapper (e.g. "md:w-1/2", breathing-room padding). */
  className?: string;
  /** next/image sizes hint (default "(min-width: 768px) 30vw, 70vw"). */
  sizes?: string;
  priority?: boolean;
}

const JUSTIFY: Record<Align, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

/**
 * A portrait image sized to sit inside a (typically half-width) column with
 * breathing room, rather than filling the whole slot. Extracted from the
 * project-page "small" image pattern so any page can reuse the same treatment.
 */
export default function ColumnImage({
  src,
  alt,
  aspect = 'aspect-[2/3]',
  width = 'w-[70%] md:w-[58%]',
  fit = 'cover',
  align = 'center',
  valign = 'start',
  className = '',
  sizes = '(min-width: 768px) 30vw, 70vw',
  priority,
}: ColumnImageProps) {
  return (
    <div className={`flex ${JUSTIFY[align]} ${valign === 'center' ? 'items-center' : 'items-start'} ${className}`}>
      <div className={`relative ${width} ${aspect} overflow-hidden`}>
        <Image
          src={src}
          alt={alt}
          fill
          className={fit === 'contain' ? 'object-contain' : 'object-cover'}
          sizes={sizes}
          priority={priority}
        />
      </div>
    </div>
  );
}
