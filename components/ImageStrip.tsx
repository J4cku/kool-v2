'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from '@/i18n/navigation';
import { projects } from '@/data/projects';

import 'swiper/css';

const slides = projects.map((project) => ({
  src: project.thumbnail,
  alt: `${project.title} ${project.location}`,
  slug: project.slug,
}));

export default function ImageStrip() {
  const { scrollY } = useScroll();
  const indicatorOpacity = useTransform(scrollY, [0, 80], [1, 0]);

  return (
    <div className="relative w-full min-h-[calc(100svh-160px)] flex items-start">
      <Swiper
        className="hero-swiper w-full"
        modules={[Autoplay]}
        slidesPerView={1}
        spaceBetween={3}
        breakpoints={{ 768: { slidesPerView: 3 } }}
        loop
        speed={900}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={slide.slug}>
            <Link
              href={`/projekty/${slide.slug}`}
              className="relative block w-full aspect-[3/4] md:aspect-square overflow-hidden"
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-cover transition-transform duration-[600ms] hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={i === 0}
                loading={i === 0 ? undefined : 'eager'}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Scroll indicator — three animated dots */}
      {/* z-10 keeps the dots above Swiper's z-index:1 when they overlap the images */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
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
