'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyAutoplayVideoProps {
  src: string;
  label: string;
  className: string;
}

export default function LazyAutoplayVideo({
  src,
  label,
  className,
}: LazyAutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!('IntersectionObserver' in window)) {
      const loadTimer = setTimeout(() => setShouldLoad(true), 0);
      return () => clearTimeout(loadTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !videoRef.current) return;
    videoRef.current.load();
    void videoRef.current.play().catch(() => undefined);
  }, [shouldLoad]);

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      autoPlay={shouldLoad}
      muted
      loop
      playsInline
      preload={shouldLoad ? 'metadata' : 'none'}
      aria-label={label}
      className={className}
    />
  );
}
