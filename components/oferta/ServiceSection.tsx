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
  trustedByNames?: string[];
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
  trustedByNames,
}: ServiceSectionProps) {
  return (
    <section className="px-5 md:px-10 lg:px-[68px] py-12 md:pt-24 md:pb-20">
      <div className="max-w-[1400px] mx-auto">
        {/* Always-visible text block */}
        <div>
          <span className="text-[11px] font-[700] uppercase text-dark/50 mb-4 block">
            {label}
          </span>
          <h2
            className="font-[900] text-dark uppercase mb-6 leading-[1.05]"
            style={{ fontSize: 'clamp(24px, 4.5vw, 48px)' }}
          >
            {heading}
          </h2>
          <p className="text-dark/70 text-[14px] md:text-[15px] leading-relaxed max-w-[980px] mb-10 font-[400]">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={onToggle}
              className="text-dark font-[700] text-[11px] uppercase hover:opacity-50 transition-opacity"
            >
              {learnMoreLabel}
            </button>
            <Link
              href={portfolioHref as '/projekty'}
              className="text-dark font-[700] text-[11px] uppercase hover:opacity-50 transition-opacity"
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
              {/* Scope: image + list */}
              <div className="mt-12 md:mt-16 max-w-[920px] mx-auto grid grid-cols-[minmax(104px,34%)_1fr] md:grid-cols-[280px_minmax(0,1fr)] gap-5 md:gap-16 items-start">
                {scopeImageSrc && (
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image
                      src={scopeImageSrc}
                      alt={scopeImageAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 280px, 34vw"
                    />
                  </div>
                )}
                <div className={scopeImageSrc ? '' : 'col-span-full'}>
                  <h3
                    className="font-[900] text-dark uppercase mb-6 leading-[1.05]"
                    style={{ fontSize: 'clamp(20px, 2.5vw, 30px)' }}
                  >
                    {scopeTitle}
                  </h3>
                  <ul className="space-y-1.5">
                    {scopeItems.map((item, i) => (
                      <li key={i} className="text-dark text-[13px] font-[400] flex items-start gap-2">
                        <span className="mt-[7px] w-1 h-1 bg-dark rounded-full flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Slogan + logos */}
              <div className="pt-12 md:pt-16 max-w-[920px]">
                <h3
                  className="font-[900] text-dark uppercase mb-5 leading-[1.05]"
                  style={{ fontSize: 'clamp(24px, 3.5vw, 42px)' }}
                >
                  {sloganHeading}
                </h3>
                <p className="text-dark/70 text-[14px] md:text-[15px] font-[400] leading-relaxed max-w-[720px]">
                  {sloganText}
                </p>
                {trustedByLabel && trustedByNames && (
                  <div className="mt-10">
                    <span className="text-[11px] font-[700] uppercase text-dark/50 mb-5 block">
                      {trustedByLabel}
                    </span>
                    <div className="flex items-center gap-x-8 gap-y-3 flex-wrap">
                      {trustedByNames.map((name, i) => (
                        <span key={i} className="text-dark font-[700] text-[11px] uppercase opacity-60">
                          {name}
                        </span>
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
