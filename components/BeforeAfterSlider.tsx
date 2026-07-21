'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getComparisonSliderPosition } from '@/lib/comparison-slider';
import { createImagePairLoadTracker } from '@/lib/media-ready';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectClass?: string;
  fill?: boolean;
  sizes?: string;
  onReady?: () => void;
  /** 'overlay' places labels on the image corners (photos); 'above' puts them
      just over the frame (plans/drawings the labels would otherwise cover). */
  labelPosition?: 'overlay' | 'above';
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel,
  afterLabel,
  aspectClass = 'aspect-[3/2]',
  fill = false,
  sizes = '100vw',
  labelPosition = 'overlay',
  onReady,
}: BeforeAfterSliderProps) {
  const t = useTranslations('projectDetail');
  const [position, setPosition] = useState(50);
  const [touched, setTouched] = useState(false);
  const [inView, setInView] = useState(false);
  const sourceKey = `${beforeSrc}\0${afterSrc}`;
  const [activeSourceKey, setActiveSourceKey] = useState(sourceKey);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const imagePairTracker = useRef<{
    key: string;
    tracker: ReturnType<typeof createImagePairLoadTracker>;
  } | null>(null);

  if (activeSourceKey !== sourceKey) {
    setActiveSourceKey(sourceKey);
    setPosition(50);
    setTouched(false);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    dragging.current = false;
  }, [sourceKey]);

  useEffect(() => {
    if (shouldReduceMotion || touched || !inView) return;
    let raf = 0;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const duration = 3000;
      const keyframes = [50, 40, 60, 50];
      const segments = keyframes.length - 1;
      const animate = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const raw = t * segments;
        const seg = Math.min(Math.floor(raw), segments - 1);
        const local = raw - seg;
        const ease = (1 - Math.cos(local * Math.PI)) / 2;
        setPosition(keyframes[seg] + (keyframes[seg + 1] - keyframes[seg]) * ease);
        if (t < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    }, 1500);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [inView, shouldReduceMotion, sourceKey, touched]);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleImageLoad = useCallback((side: 'before' | 'after') => {
    const key = `${beforeSrc}\0${afterSrc}`;
    if (imagePairTracker.current?.key !== key) {
      imagePairTracker.current = {
        key,
        tracker: createImagePairLoadTracker(),
      };
    }

    if (imagePairTracker.current.tracker.markLoaded(side)) onReady?.();
  }, [afterSrc, beforeSrc, onReady]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    setTouched(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onPointerCancel = useCallback(() => {
    dragging.current = false;
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const handledKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];
    if (!handledKeys.includes(event.key)) return;

    event.preventDefault();
    setTouched(true);
    setPosition((current) => getComparisonSliderPosition(current, event.key));
  }, []);

  return (
    <div className={`w-full ${fill ? 'h-full' : ''}`}>
      {labelPosition === 'above' && (beforeLabel || afterLabel) && (
        <div className="flex justify-between mb-2">
          <p className="text-[13px] font-[500] text-dark">{beforeLabel}</p>
          <p className="text-[13px] font-[500] text-dark">{afterLabel}</p>
        </div>
      )}
      <div
        ref={containerRef}
        className={`relative w-full ${aspectClass} cursor-col-resize select-none overflow-hidden`}
        style={{ touchAction: 'pan-y pinch-zoom' }}
        role="slider"
        tabIndex={0}
        aria-label={t('comparisonLabel')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-orientation="horizontal"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
      >
        {/* After (right/full) */}
        <div className="absolute inset-0 bg-beige">
          <Image
            src={afterSrc}
            alt="po"
            fill
            className="object-contain"
            sizes={sizes}
            onLoad={() => handleImageLoad('after')}
          />
        </div>

        {/* Before (left, clipped) */}
        <div
          className="absolute inset-0 bg-beige"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={beforeSrc}
            alt="przed"
            fill
            className="object-contain"
            sizes={sizes}
            onLoad={() => handleImageLoad('before')}
          />
        </div>

        {/* Labels */}
        {labelPosition === 'overlay' && beforeLabel && (
          <p className="absolute top-3 left-4 z-10 text-[13px] font-[500] text-dark">{beforeLabel}</p>
        )}
        {labelPosition === 'overlay' && afterLabel && (
          <p className="absolute top-3 right-4 z-10 text-[13px] font-[500] text-dark">{afterLabel}</p>
        )}

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-coral z-10 -translate-x-1/2"
          style={{ left: `${position}%` }}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-coral flex items-center justify-center"
          style={{ left: `${position}%` }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L1 8L5 13" stroke="#E5DDD0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L15 8L11 13" stroke="#E5DDD0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
