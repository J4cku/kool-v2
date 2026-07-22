'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { RelatedService } from '@/data/projects';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ProjectServiceCtaProps {
  // Which service page to cross-link to, and its already-built href.
  serviceKey: RelatedService;
  serviceHref: string;
}

/* Closing block on a project detail page: a problem-specific brief CTA plus a
   descriptive link to the matching service page (the case → service half of
   the internal-linking contract). Anchors describe their destination. */
export default function ProjectServiceCta({ serviceKey, serviceHref }: ProjectServiceCtaProps) {
  const t = useTranslations('caseStudy');
  const reduceMotion = useReducedMotion();

  const fade = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reduceMotion ? 0 : 0.7, ease: EASE },
  };

  return (
    <section className="border-t border-coral/40 px-5 md:px-10 lg:px-12 py-14 md:py-20">
      <motion.div {...fade} className="max-w-content mx-auto">
        <h2
          className="font-[700] text-dark uppercase leading-[1.08] max-w-[900px]"
          style={{ fontSize: 'clamp(22px, 3vw, 40px)' }}
        >
          {t('ctaText')}
        </h2>
        <div className="mt-8 md:mt-10 flex flex-col gap-4 md:gap-5">
          <Link
            href="/kontakt#brief"
            data-analytics="cta_click"
            data-analytics-service={serviceKey === 'oferta' ? undefined : serviceKey}
            data-analytics-position="project-cta"
            data-analytics-cta-text={t('ctaButton')}
            className="inline-flex items-center gap-2 text-coral font-[700] uppercase tracking-[0.06em] hover:opacity-60 transition-opacity"
            style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
          >
            {t('ctaButton')} <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={serviceHref}
            className="inline-flex items-center gap-2 text-dark font-[600] uppercase tracking-[0.06em] hover:text-coral transition-colors"
            style={{ fontSize: 'clamp(13px, 1.2vw, 16px)' }}
          >
            {t(`serviceLinks.${serviceKey}`)} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
