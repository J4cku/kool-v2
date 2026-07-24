'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from '@/i18n/navigation';
import ColumnImage from '@/components/ColumnImage';
import RevealHeading from '@/components/RevealHeading';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import 'swiper/css';

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ServiceSectionProps {
  label: string;
  heading: string;
  description: string;
  learnMoreLabel: string;
  portfolioLabel: string;
  portfolioHref: string;
  scopeTitle: string;
  scopeItems: string[];
  scopeImageSrc?: string;
  scopeImageAlt?: string;
  sloganHeading: string;
  sloganText: string;
  trustedByLabel?: string;
  trustedByLogos?: { src: string; alt: string; width: number; height: number; className: string }[];
  /** Expanded offer body revealed by the details CTA (e.g. CommercialDetails). */
  details?: React.ReactNode;
  detailsCta?: string;
}

export default function ServiceSection({
  label,
  heading,
  description,
  learnMoreLabel,
  portfolioLabel,
  portfolioHref,
  scopeTitle,
  scopeItems,
  scopeImageSrc,
  scopeImageAlt = '',
  sloganHeading,
  sloganText,
  trustedByLabel,
  trustedByLogos,
  details,
  detailsCta,
}: ServiceSectionProps) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);
  const pendingScrollRef = useRef(false);

  const hasDetails = Boolean(details && detailsCta);

  const scrollToCta = () => {
    // Hand focus to the details CTA (it carries aria-expanded), so keyboard
    // position follows the viewport instead of staying on the intro button
    ctaButtonRef.current?.focus({ preventScroll: true });
    ctaRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  // "Learn more" scroll must wait for the expansion commit — a smooth scroll
  // started in the same tick is cancelled by the height animation's commit
  useEffect(() => {
    if (!expanded || !pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    const frame = requestAnimationFrame(scrollToCta);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  return (
    <section className="px-5 md:px-10 lg:px-[68px] py-12 md:pt-24 md:pb-20">
      <div className="max-w-[1400px] mx-auto">
        {/* Intro text block */}
        <div>
          <span
            className="font-[400] uppercase text-dark/60 mb-4 md:mb-6 block"
            style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}
          >
            {label}
          </span>
          <RevealHeading
            text={heading}
            className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
            style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
          />
          <p
            className="text-dark/80 leading-[1.5] max-w-[1240px] mb-10 md:mb-14 font-[400]"
            style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
          >
            {description}
          </p>
          <div className={`flex items-center gap-4 ${hasDetails ? 'justify-between' : 'justify-end'}`}>
            {hasDetails && (
              <button
                onClick={() => {
                  if (expanded) {
                    scrollToCta();
                  } else {
                    pendingScrollRef.current = true;
                    setExpanded(true);
                  }
                }}
                className="text-dark font-[400] uppercase hover:opacity-50 transition-opacity"
                style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}
              >
                {learnMoreLabel}
              </button>
            )}
            <Link
              href={portfolioHref as '/projekty'}
              className="text-dark font-[600] uppercase hover:opacity-50 transition-opacity whitespace-nowrap"
              style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}
            >
              [ {portfolioLabel} ]
            </Link>
          </div>
        </div>

        {/* Scope: image + list — split 50/50 down the page middle,
            vertically centred on a shared axis */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-start md:items-center">
          {scopeImageSrc && (
            <ColumnImage
              src={scopeImageSrc}
              alt={scopeImageAlt}
              width="w-[68%] md:w-[56%]"
              className="md:pr-8 lg:pr-12"
              sizes="(min-width: 768px) 28vw, 68vw"
            />
          )}
          <div className={scopeImageSrc ? 'md:pl-8 lg:pl-12' : 'col-span-full'}>
            <h3
              className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.2]"
              style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
            >
              {scopeTitle}
            </h3>
            <ul className="space-y-3.5 md:space-y-[18px]">
              {scopeItems.map((item, i) => (
                <li
                  key={i}
                  className="text-dark font-[400] leading-[1.4] flex items-start gap-3"
                  style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
                >
                  <span className="mt-[0.6em] w-1.5 h-1.5 bg-dark rounded-full flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Slogan + logos */}
        <div className="pt-14 md:pt-20 max-w-[1240px]">
          <RevealHeading
            as="h3"
            text={sloganHeading}
            className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
            style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
          />
          <p
            className="text-dark/80 font-[400] leading-[1.5] max-w-[1080px]"
            style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
          >
            {sloganText}
          </p>
          {trustedByLabel && trustedByLogos && (
            <div className="mt-12 md:mt-16">
              <span
                className="font-[400] uppercase text-dark/60 mb-8 block"
                style={{ fontSize: 'clamp(13px, 1.3vw, 18px)' }}
              >
                {trustedByLabel}
              </span>
              {/* Logos loop as a slider; the list is doubled so Swiper
                  always has enough slides for a seamless loop */}
              <Swiper
                modules={[Autoplay]}
                slidesPerView={2}
                spaceBetween={32}
                breakpoints={{ 768: { slidesPerView: 4, spaceBetween: 64 } }}
                loop
                speed={800}
                autoplay={reduceMotion ? false : { delay: 2000, disableOnInteraction: false }}
              >
                {[...trustedByLogos, ...trustedByLogos].map((logo, i) => (
                  <SwiperSlide key={i}>
                    <div className="flex items-center justify-center h-16 md:h-20">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={logo.width}
                        height={logo.height}
                        className={`w-auto ${logo.className}`}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        {/* Details expander + expanded offer body */}
        {hasDetails && (
          <>
            <div ref={ctaRef} className="mt-14 md:mt-20 scroll-mt-28">
              <button
                ref={ctaButtonRef}
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                className="flex items-center gap-3 md:gap-4 text-left text-dark font-[600] uppercase hover:opacity-50 transition-opacity"
                style={{ fontSize: 'clamp(15px, 1.6vw, 22px)' }}
              >
                {detailsCta}
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: expanded ? 90 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, ease: easeOutExpo }}
                  className="inline-block"
                >
                  →
                </motion.span>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    transition: { duration: reduceMotion ? 0 : 0.6, ease: easeOutExpo },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: { duration: reduceMotion ? 0 : 0.5, ease: easeOutExpo },
                  }}
                  className="overflow-hidden"
                >
                  {details}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
