'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { CaseStudy } from '@/data/projects';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface CaseStudySectionProps {
  caseStudy: CaseStudy;
}

/* Structured case block for a project detail page: a real problem → design
   decisions → result arc, restated from the project's own published copy.
   Editorial dark type on beige, small coral labels, subtle fade-in. Rendered
   only when a project carries a caseStudy, so pages without one are unchanged. */
export default function CaseStudySection({ caseStudy }: CaseStudySectionProps) {
  const t = useTranslations('caseStudy');
  const reduceMotion = useReducedMotion();

  const fade = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reduceMotion ? 0 : 0.7, ease: EASE },
  };

  return (
    <section className="border-t border-coral/40">
      <div className="max-w-content mx-auto px-5 md:px-10 lg:px-12 py-14 md:py-20">
        <span
          className="font-[600] uppercase text-coral tracking-[0.14em] block"
          style={{ fontSize: 'clamp(12px, 1.1vw, 14px)' }}
        >
          {t('sectionLabel')}
        </span>

        <div className="mt-8 md:mt-12 flex flex-col divide-y divide-dark/10">
          {/* Challenge — the real starting constraint, as published */}
          <motion.div
            {...fade}
            className="grid gap-4 md:gap-10 md:grid-cols-[minmax(160px,0.26fr)_1fr] py-8 md:py-10 first:pt-0"
          >
            <h2
              className="font-[700] uppercase text-dark tracking-[0.06em] leading-[1.2]"
              style={{ fontSize: 'clamp(13px, 1.2vw, 16px)' }}
            >
              {t('challenge')}
            </h2>
            <p
              className="text-dark font-[400] leading-[1.6] max-w-[820px]"
              style={{ fontSize: 'clamp(15px, 1.35vw, 18px)' }}
            >
              {caseStudy.problem}
            </p>
          </motion.div>

          {/* Design decisions — each traceable to a published sentence */}
          <motion.div
            {...fade}
            className="grid gap-4 md:gap-10 md:grid-cols-[minmax(160px,0.26fr)_1fr] py-8 md:py-10"
          >
            <h2
              className="font-[700] uppercase text-dark tracking-[0.06em] leading-[1.2]"
              style={{ fontSize: 'clamp(13px, 1.2vw, 16px)' }}
            >
              {t('decisions')}
            </h2>
            <ol className="flex flex-col gap-4 md:gap-5 max-w-[820px]">
              {caseStudy.decisions.map((decision, i) => (
                <li key={i} className="flex items-start gap-4 md:gap-5">
                  <span
                    className="text-coral font-[700] tabular-nums shrink-0 leading-[1.5]"
                    style={{ fontSize: 'clamp(13px, 1.2vw, 16px)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-dark font-[400] leading-[1.6]"
                    style={{ fontSize: 'clamp(15px, 1.35vw, 18px)' }}
                  >
                    {decision}
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Result — the outcome as published (qualitative) */}
          <motion.div
            {...fade}
            className="grid gap-4 md:gap-10 md:grid-cols-[minmax(160px,0.26fr)_1fr] py-8 md:py-10 last:pb-0"
          >
            <h2
              className="font-[700] uppercase text-dark tracking-[0.06em] leading-[1.2]"
              style={{ fontSize: 'clamp(13px, 1.2vw, 16px)' }}
            >
              {t('result')}
            </h2>
            <p
              className="text-dark font-[400] leading-[1.6] max-w-[820px]"
              style={{ fontSize: 'clamp(15px, 1.35vw, 18px)' }}
            >
              {caseStudy.result}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
