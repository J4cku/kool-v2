'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const imageSets = [
  [
    { src: '/images/dobrzykowice.jpg', alt: 'dom Dobrzykowice' },
    { src: '/images/dehesa.jpg', alt: 'delikatesy Dehesa' },
    { src: '/images/prs.jpg', alt: 'winobar Łódź' },
  ],
  [
    { src: '/images/belmonte.jpg', alt: 'hotel Belmonte' },
    { src: '/images/kancelaria.jpg', alt: 'kancelaria Wrocław' },
    { src: '/images/fnd.jpg', alt: 'pawilon Fandom' },
  ],
];

const allImages = imageSets.flat();

export default function ImageStrip() {
  const [activeSet, setActiveSet] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 80], [1, 0]);

  const next = useCallback(() => {
    setActiveSet((prev) => (prev + 1) % imageSets.length);
    setMobileIndex((prev) => (prev + 1) % allImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <div className="relative w-full min-h-[calc(100svh-200px)] flex items-start">
      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid w-full grid-cols-3 gap-[3px]">
        {[0, 1, 2].map((col) => (
          <div key={col} className="relative aspect-square overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeSet}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 1.2, delay: col * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={imageSets[activeSet][col].src}
                  alt={imageSets[activeSet][col].alt}
                  fill
                  className="object-cover transition-transform duration-[600ms] hover:scale-[1.04]"
                  sizes="33vw"
                  priority={activeSet === 0 && col === 0}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
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
            <Image
              src={allImages[mobileIndex].src}
              alt={allImages[mobileIndex].alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={mobileIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-5 bg-coral/40" style={{ width: '0.5px' }}
        />
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-coral/50"
        />
      </motion.div>
    </div>
  );
}
