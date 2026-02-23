'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel, afterLabel }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [touched, setTouched] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

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
    if (touched || !inView) return;
    let raf: number;
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
  }, [touched, inView]);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
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

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/2] cursor-col-resize select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* After (right/full) */}
        <div className="absolute inset-0 bg-beige">
          <Image src={afterSrc} alt="po" fill className="object-contain" sizes="100vw" />
        </div>

        {/* Before (left, clipped) */}
        <div
          className="absolute inset-0 bg-beige"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image src={beforeSrc} alt="przed" fill className="object-contain" sizes="100vw" />
        </div>

        {/* Labels */}
        {beforeLabel && (
          <p className="absolute top-3 left-4 z-10 text-[13px] font-[500] text-dark">{beforeLabel}</p>
        )}
        {afterLabel && (
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
