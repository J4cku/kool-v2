'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';

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
  /** Scroll-in un-mask animation (default true); false renders statically. */
  reveal?: boolean;
  /** Defer the image request until its column is near the viewport. */
  deferUntilVisible?: boolean;
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
  reveal = true,
  deferUntilVisible = false,
}: ColumnImageProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const shouldLoad = !deferUntilVisible || isNearViewport;

  useEffect(() => {
    if (!deferUntilVisible || isNearViewport) return;

    const column = columnRef.current;
    if (!column || !('IntersectionObserver' in window)) {
      const loadTimer = window.setTimeout(() => setIsNearViewport(true), 0);
      return () => window.clearTimeout(loadTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(column);
    return () => observer.disconnect();
  }, [deferUntilVisible, isNearViewport]);

  const image = shouldLoad ? (
    <Image
      src={src}
      alt={alt}
      fill
      className={fit === 'contain' ? 'object-contain' : 'object-cover'}
      sizes={sizes}
      priority={priority}
    />
  ) : (
    <div
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className="absolute inset-0 bg-beige"
    />
  );
  const frame = `relative ${width} ${aspect}`;

  return (
    <div
      ref={columnRef}
      className={`flex ${JUSTIFY[align]} ${valign === 'center' ? 'items-center' : 'items-start'} ${className}`}
    >
      {reveal ? (
        <Reveal className={frame}>{image}</Reveal>
      ) : (
        <div className={`${frame} overflow-hidden`}>{image}</div>
      )}
    </div>
  );
}
