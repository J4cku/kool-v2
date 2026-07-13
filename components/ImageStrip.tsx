'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

const images = [
  { src: '/images/dobrzykowice.jpg', alt: 'dom Dobrzykowice', slug: 'dom-dobrzykowice' },
  { src: '/images/dehesa.jpg', alt: 'delikatesy Dehesa', slug: 'delikatesy-dehesa' },
  { src: '/images/prs.jpg', alt: 'winobar Łódź', slug: 'winobar-lodz' },
  { src: '/images/belmonte.jpg', alt: 'hotel Belmonte', slug: 'hotel-belmonte' },
  { src: '/images/kancelaria.jpg', alt: 'kancelaria Wrocław', slug: 'kancelaria' },
  { src: '/images/fnd.jpg', alt: 'pawilon Fandom', slug: 'pawilon-fandom' },
];

const COLUMNS = 3;

export default function ImageStrip() {
  // Desktop: each column shows one image; ticks advance a single column at a
  // time (round-robin) to the pool image COLUMNS ahead, so changes happen one
  // by one and every image cycles through.
  const [desktop, setDesktop] = useState({ displayed: [0, 1, 2], tick: 0 });
  const [mobileIndex, setMobileIndex] = useState(0);
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 80], [1, 0]);

  const next = useCallback(() => {
    setDesktop(({ displayed, tick }) => {
      const col = tick % COLUMNS;
      const nextDisplayed = [...displayed];
      nextDisplayed[col] = (nextDisplayed[col] + COLUMNS) % images.length;
      return { displayed: nextDisplayed, tick: tick + 1 };
    });
    setMobileIndex((prev) => (prev + 1) % images.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <div className="relative w-full min-h-[calc(100svh-160px)] flex items-start">
      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid w-full grid-cols-3 gap-[3px]">
        {[0, 1, 2].map((col) => {
          const image = images[desktop.displayed[col]];
          return (
            <div key={col} className="relative aspect-square overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={desktop.displayed[col]}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Link href={`/projekty/${image.slug}`} className="relative block h-full w-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-[600ms] hover:scale-[1.04]"
                      sizes="33vw"
                      priority={col === 0 && desktop.displayed[0] === 0}
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Mobile: single full-width image */}
      <div className="md:hidden w-full relative aspect-[3/4] overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={mobileIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Link href={`/projekty/${images[mobileIndex].slug}`} className="relative block h-full w-full">
              <Image
                src={images[mobileIndex].src}
                alt={images[mobileIndex].alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={mobileIndex === 0}
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll indicator — three animated dots */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-coral/60"
          />
        ))}
      </motion.div>
    </div>
  );
}
