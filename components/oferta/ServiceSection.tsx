'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ServiceSectionProps {
  label: string;
  heading: string;
  description: string;
  learnMoreLabel: string;
  portfolioLabel: string;
  portfolioHref: string;
  expanded: boolean;
  onToggle: () => void;
  scopeTitle: string;
  scopeItems: string[];
  scopeImageSrc?: string;
  scopeImageAlt?: string;
  sloganHeading: string;
  sloganText: string;
  trustedByLabel?: string;
  trustedByLogos?: { src: string; alt: string; width: number; height: number; className: string }[];
}

export default function ServiceSection({
  label,
  heading,
  description,
  learnMoreLabel,
  portfolioLabel,
  portfolioHref,
  expanded,
  onToggle,
  scopeTitle,
  scopeItems,
  scopeImageSrc,
  scopeImageAlt = '',
  sloganHeading,
  sloganText,
  trustedByLabel,
  trustedByLogos,
}: ServiceSectionProps) {
  return (
    <section className="px-5 md:px-10 lg:px-[68px] py-12 md:pt-24 md:pb-20">
      <div className="max-w-[1400px] mx-auto">
        {/* Always-visible text block */}
        <div>
          <span
            className="font-[400] uppercase text-dark/60 mb-4 md:mb-6 block"
            style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}
          >
            {label}
          </span>
          <h2
            className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
            style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
          >
            {heading}
          </h2>
          <p
            className="text-dark/80 leading-[1.5] max-w-[1240px] mb-10 md:mb-14 font-[400]"
            style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
          >
            {description}
          </p>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onToggle}
              className="text-dark font-[400] uppercase hover:opacity-50 transition-opacity"
              style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}
            >
              {learnMoreLabel}
            </button>
            <Link
              href={portfolioHref as '/projekty'}
              className="text-dark font-[600] uppercase hover:opacity-50 transition-opacity whitespace-nowrap"
              style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}
            >
              [ {portfolioLabel} ]
            </Link>
          </div>
        </div>

        {/* Single animated container for all expanded content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1, transition: { duration: 0.5, ease: easeOutExpo, opacity: { delay: 0.1 } } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.4, ease: easeOutExpo, height: { delay: 0.15 } } }}
              className="overflow-hidden"
            >
              {/* Scope: image + list — split 50/50 down the page middle */}
              <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-start">
                {scopeImageSrc && (
                  <div className="flex justify-center md:pr-8 lg:pr-12">
                    <div className="relative w-[78%] md:w-[72%] aspect-[2/3] overflow-hidden">
                      <Image
                        src={scopeImageSrc}
                        alt={scopeImageAlt}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 34vw, 78vw"
                      />
                    </div>
                  </div>
                )}
                <div className={scopeImageSrc ? 'md:pl-8 lg:pl-12' : 'col-span-full'}>
                  <h3
                    className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
                    style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
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
                <h3
                  className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
                  style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
                >
                  {sloganHeading}
                </h3>
                <p
                  className="text-dark/80 font-[400] leading-[1.5] max-w-[1080px]"
                  style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
                >
                  {sloganText}
                </p>
                {trustedByLabel && trustedByLogos && (
                  <div className="mt-12 md:mt-16">
                    <span
                      className="font-[400] uppercase text-dark/60 mb-8 block text-center"
                      style={{ fontSize: 'clamp(13px, 1.3vw, 18px)' }}
                    >
                      {trustedByLabel}
                    </span>
                    <div className="flex items-center justify-center gap-x-12 md:gap-x-20 gap-y-8 flex-wrap">
                      {trustedByLogos.map((logo, i) => (
                        <Image
                          key={i}
                          src={logo.src}
                          alt={logo.alt}
                          width={logo.width}
                          height={logo.height}
                          className={`w-auto opacity-70 ${logo.className}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
