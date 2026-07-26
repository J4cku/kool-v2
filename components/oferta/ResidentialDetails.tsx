'use client';

import { useLocale, useTranslations } from 'next-intl';
import ColumnImage from '@/components/ColumnImage';
import RevealHeading from '@/components/RevealHeading';
import ScrollWeightHeading from './ScrollWeightHeading';
import StagesTimeline, { type TimelineStage } from './StagesTimeline';
import FaqAccordion, { type FaqItem } from './FaqAccordion';
import ContactBriefCta from './ContactBriefCta';
import WorksGrid from './WorksGrid';
import { projects, localizeProject } from '@/data/projects';

const WORK_SLUGS = {
  apartments: ['mieszkanie-walecznych', 'mieszkanie-strachowicka', 'mieszkanie-gdansk', 'mieszkanie-midcentury'],
  houses: ['dom-dobrzykowice', 'lazienki-warszawa', 'mieszkanie-walecznych', 'mieszkanie-strachowicka'],
};

const PORTFOLIO_HREF = '/projekty?filter=mieszkalne';

/* Expanded body of a residential offer subpage: what the project covers, when
   it fits, the stage timeline, benefits, selected works, an SEO text block and
   FAQ. Mirrors CommercialDetails minus the venue-types marquee. */
export default function ResidentialDetails({ variant }: { variant: 'apartments' | 'houses' }) {
  const t = useTranslations(`oferta.residential.${variant}`);
  const tOferta = useTranslations('oferta');
  const locale = useLocale();

  const fitItems = t.raw('fitItems') as string[];
  const stages = t.raw('stages') as TimelineStage[];
  const benefits = t.raw('benefits') as { title: string; text: string }[];
  const faqItems = t.raw('faqItems') as FaqItem[];

  const works = WORK_SLUGS[variant].flatMap((slug) => {
    const project = projects.find((p) => p.slug === slug);
    return project ? [localizeProject(project, locale)] : [];
  });

  return (
    <>
      {/* Projekt wnętrz mieszkania / domu */}
      <div>
        <RevealHeading
          as="h1"
          text={t('projectHeading')}
          className="font-[700] text-dark uppercase mb-8 md:mb-12 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <p
          className="text-dark/80 font-[400] leading-[1.5] max-w-[1240px]"
          style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
        >
          {t('projectDescription')}
        </p>
      </div>

      {/* Kiedy warto… — photo left, ScrollWeightHeading + bullet list right */}
      <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
        <ColumnImage
          src="/images/oferta/KOOL_oferta_mieszkalne_stolarka.webp"
          alt={
            locale === 'en'
              ? 'Custom joinery during construction'
              : 'Autorska zabudowa stolarska w trakcie realizacji'
          }
          width="w-[74%] md:w-[62%]"
          valign="center"
          sizes="(min-width: 768px) 30vw, 74vw"
          deferUntilVisible
        />
        <div>
          <ScrollWeightHeading
            as="h2"
            text={t('fitTitle')}
            className="text-dark uppercase mb-4 md:mb-5 leading-[1.2]"
            style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
          />
          <ul className="space-y-5 md:space-y-6">
            {fitItems.map((item, i) => (
              <li
                key={i}
                className="text-dark font-[400] leading-[1.45] flex items-start gap-3.5"
                style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.6em] w-1.5 h-1.5 bg-dark rounded-full flex-shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Etapy projektu */}
      <div className="mt-6 md:mt-8">
        <StagesTimeline heading={t('stagesHeading')} stages={stages} />
      </div>

      {/* Dlaczego projekt kompleksowy? */}
      <div className="mt-10 md:mt-14">
        <RevealHeading
          as="h2"
          text={t('benefitsHeading')}
          className="font-[700] text-dark uppercase mb-12 md:mb-16 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
          <div className="space-y-8 md:space-y-10">
            {benefits.map((benefit, i) => (
              <div key={i}>
                <ScrollWeightHeading
                  as="h3"
                  text={benefit.title}
                  className="text-dark uppercase mb-3 md:mb-4"
                  style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
                />
                <p
                  className="text-dark/80 font-[400] leading-[1.5]"
                  style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
                >
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>
          <ColumnImage
            src="/images/oferta/KOOL_oferta_mieszkalne_targi.webp"
            alt={
              locale === 'en'
                ? 'kool studio architects at a design fair'
                : 'Architektki kool studio na targach wnętrzarskich'
            }
            width="w-[74%] md:w-[62%]"
            align="center"
            valign="center"
            sizes="(min-width: 768px) 30vw, 74vw"
            deferUntilVisible
          />
        </div>
      </div>

      {/* Wybrane realizacje */}
      <div className="mt-10 md:mt-14">
        <RevealHeading
          as="h2"
          text={t('worksHeading')}
          className="font-[700] text-dark uppercase mb-8 md:mb-12 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <WorksGrid
          works={works}
          workLinkLabel={t('workLink')}
          portfolioLabel={tOferta('portfolio')}
          portfolioHref={PORTFOLIO_HREF}
        />
      </div>

      {/* SEO text block — sits between the portfolio link and the FAQ */}
      <div className="mt-16 md:mt-24">
        <RevealHeading
          as="h2"
          text={t('seoHeading')}
          className="font-[700] text-dark uppercase mb-8 md:mb-12 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <p
          className="text-dark/80 font-[400] leading-[1.5] max-w-[1240px]"
          style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
        >
          {t('seoText')}
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-16 md:mt-24">
        <RevealHeading
          as="h2"
          text={t('faqHeading')}
          className="font-[700] text-dark uppercase mb-8 md:mb-12 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <FaqAccordion items={faqItems} />
      </div>

      {/* Closing brief CTA — flag-gated, opens the contact brief modal */}
      <ContactBriefCta heading={t('contactHeading')} cta={t('contactCta')} />
    </>
  );
}
