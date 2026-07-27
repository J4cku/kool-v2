'use client';

import { useLocale, useTranslations } from 'next-intl';
import ColumnImage from '@/components/ColumnImage';
import MarqueeEdges from '@/components/MarqueeEdges';
import RevealHeading from '@/components/RevealHeading';
import ScrollWeightHeading from './ScrollWeightHeading';
import StagesTimeline, { type TimelineStage } from './StagesTimeline';
import FaqAccordion, { type FaqItem } from './FaqAccordion';
import ContactBriefCta from './ContactBriefCta';
import WorksGrid from './WorksGrid';
import { projects, localizeProject } from '@/data/projects';

const WORK_SLUGS = ['delikatesy-dehesa', 'biuro-dobry-material', 'winobar-lodz', 'foodhall-piazza'];

/* Expanded body of the commercial offer: what the project covers, when it
   fits, the stage timeline, benefits, selected works and FAQ — the mockup's
   "rozszerzona" state. */
export default function CommercialDetails() {
  const t = useTranslations('oferta.commercial.details');
  const tOferta = useTranslations('oferta');
  const locale = useLocale();

  const fitItems = t.raw('fitItems') as string[];
  const stages = t.raw('stages') as TimelineStage[];
  const benefits = t.raw('benefits') as { title: string; text: string }[];
  const workBlurbs = t.raw('workBlurbs') as Record<string, string>;
  const faqItems = t.raw('faqItems') as FaqItem[];

  const works = WORK_SLUGS.flatMap((slug) => {
    const project = projects.find((p) => p.slug === slug);
    return project ? [localizeProject(project, locale)] : [];
  });

  // Venue types split into categories; the marquee renders each followed by
  // a small, spaced bullet (incl. after the last one) so the loop is seamless
  const marqueeCategories = t('types')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      {/* Projekt wnętrza komercyjnego */}
      <div>
        <RevealHeading
          as="h3"
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
        <p
          className="text-dark font-[400] mt-8 md:mt-10 mb-3 md:mb-4"
          style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
        >
          {t('typesLabel')}
        </p>
        {/* Venue types as a full-bleed coral marquee — bullet-separated,
            slowed for readability; breaks out of the content column to the
            viewport edges. Four identical units → the 50% loop lands on a
            unit boundary, so there is no visible jump. */}
        <div
          className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden whitespace-nowrap"
          aria-hidden="true"
        >
          <div
            className="animate-marquee inline-block motion-reduce:animate-none"
            style={{ animationDuration: '48s' }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="font-[400] uppercase text-coral"
                style={{ fontSize: 'clamp(26px, 4.5vw, 60px)' }}
              >
                {marqueeCategories.map((cat, j) => (
                  <span key={j}>
                    {cat}
                    <span aria-hidden="true" className="mx-[0.6em]">
                      <span className="text-[0.5em] align-middle">•</span>
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </div>
          <MarqueeEdges />
        </div>
        <span className="sr-only">{t('types')}</span>
      </div>

      {/* Ten projekt będzie odpowiedni gdy — extra air below the banner */}
      {/* Same two-column treatment as "Co zyskujesz" below: even tracks, one
          real gutter, photo centred in its column and matched in size */}
      <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
        <ColumnImage
          src="/images/oferta/KOOL_oferta_komercyjne_budowa.webp"
          alt={locale === 'en' ? 'Site visit during construction' : 'Wizyta na budowie'}
          width="w-[74%] md:w-[62%]"
          valign="center"
          sizes="(min-width: 768px) 30vw, 74vw"
          deferUntilVisible
        />
        <div>
          <ScrollWeightHeading
              as="h4"
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

      {/* Etapy projektu — tighter top gap; the pinned timeline anchors its
          own heading near the top, so this block sits close to the section
          above */}
      <div className="mt-6 md:mt-8">
        <StagesTimeline heading={t('stagesHeading')} stages={stages} />
      </div>

      {/* Co zyskujesz */}
      <div className="mt-10 md:mt-14">
        <RevealHeading
          as="h3"
          text={t('benefitsHeading')}
          className="font-[700] text-dark uppercase mb-12 md:mb-16 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        {/* Two even columns with a real gutter (matching the "odpowiedni gdy"
            block above): copy fills the left column, the photo sits centred —
            horizontally and vertically — in the right one, as in the mockup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
          <div className="space-y-8 md:space-y-10">
            {benefits.map((benefit, i) => (
              <div key={i}>
                <ScrollWeightHeading
                  as="h4"
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
            src="/images/oferta/KOOL_oferta_komercyjne_materialy.webp"
            alt={locale === 'en' ? 'Material samples' : 'Próbki materiałów'}
            width="w-[74%] md:w-[62%]"
            align="center"
            valign="center"
            sizes="(min-width: 768px) 30vw, 74vw"
            deferUntilVisible
          />
        </div>
      </div>

      {/* Selected works — headingless by design; the gap absorbs the room the
          old "Wybrane realizacje" display heading occupied */}
      <div className="mt-24 md:mt-40">
        <WorksGrid
          works={works}
          blurbs={workBlurbs}
          workLinkLabel={t('workLink')}
          portfolioLabel={tOferta('portfolio')}
          portfolioHref="/projekty?filter=komercyjne"
        />
      </div>

      {/* FAQ — extra gap after the works "portfolio" link */}
      <div className="mt-16 md:mt-24">
        <RevealHeading
          as="h3"
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
