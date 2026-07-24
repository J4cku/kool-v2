'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ColumnImage from '@/components/ColumnImage';
import ScrollWeightHeading, { ScrollWeightHeadings } from './ScrollWeightHeading';
import StagesTimeline, { type TimelineStage } from './StagesTimeline';
import FaqAccordion, { type FaqItem } from './FaqAccordion';
import ContactBriefCta from './ContactBriefCta';
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

  // Venue types → " • "-separated categories; trailing separator keeps the
  // marquee seamless across the loop point
  const marqueeText =
    t('types')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' • ') + ' • ';

  return (
    <ScrollWeightHeadings>
      {/* Projekt wnętrza komercyjnego */}
      <div>
        <ScrollWeightHeading
          id="project"
          as="h3"
          text={t('projectHeading')}
          className="text-dark uppercase mb-4 md:mb-5 leading-[1.02]"
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
                className="font-[600] uppercase text-coral"
                style={{ fontSize: 'clamp(26px, 4.5vw, 60px)' }}
              >
                {marqueeText}
              </span>
            ))}
          </div>
        </div>
        <span className="sr-only">{t('types')}</span>
      </div>

      {/* Ten projekt będzie odpowiedni gdy */}
      <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-start md:items-center">
        <ColumnImage
          src="/images/oferta/KOOL_oferta_komercyjne_budowa.webp"
          alt={locale === 'en' ? 'Site visit during construction' : 'Wizyta na budowie'}
          width="w-[68%] md:w-[56%]"
          className="md:pr-8 lg:pr-12"
          sizes="(min-width: 768px) 28vw, 68vw"
          deferUntilVisible
        />
        <div className="md:pl-8 lg:pl-12">
          <ScrollWeightHeading
            id="fit"
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

      {/* Etapy projektu */}
      <div className="mt-14 md:mt-20">
        <StagesTimeline headingId="stages" heading={t('stagesHeading')} stages={stages} />
      </div>

      {/* Co zyskujesz */}
      <div className="mt-14 md:mt-20">
        <ScrollWeightHeading
          id="benefits"
          as="h3"
          text={t('benefitsHeading')}
          className="text-dark uppercase mb-4 md:mb-5 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 items-start">
          <div className="space-y-8 md:space-y-10 md:pr-8 lg:pr-12">
            {benefits.map((benefit, i) => (
              <div key={i}>
                <h4
                  className="font-[700] text-dark uppercase mb-3 md:mb-4"
                  style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
                >
                  {benefit.title}
                </h4>
                <p
                  className="text-dark/80 font-[400] leading-[1.5] max-w-[560px]"
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
            align="end"
            className="md:pl-8 lg:pl-12"
            sizes="(min-width: 768px) 30vw, 74vw"
            deferUntilVisible
          />
        </div>
      </div>

      {/* Wybrane realizacje */}
      <div className="mt-14 md:mt-20">
        <ScrollWeightHeading
          id="works"
          as="h3"
          text={t('worksHeading')}
          className="text-dark uppercase mb-4 md:mb-5 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-12 items-stretch">
          {works.map((project) => (
            <div key={project.slug} className="flex flex-col">
              <Link href={`/projekty/${project.slug}`} className="block group">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />
                </div>
              </Link>
              <p className="mt-4 text-[14px] md:text-[15px] font-[700] uppercase leading-[1.15] tracking-[-0.02em] text-dark">
                {project.title} / {project.location}
              </p>
              <p className="mt-1.5 text-[10px] md:text-[11px] font-[500] uppercase tracking-[0.08em] text-muted">
                {project.area} · {project.year}
              </p>
              <p
                className="mt-3 text-dark/80 font-[400] leading-[1.5]"
                style={{ fontSize: 'clamp(14px, 1.2vw, 16px)' }}
              >
                {workBlurbs[project.slug] ?? project.description}
              </p>
              <Link
                href={`/projekty/${project.slug}`}
                className="mt-auto pt-4 text-coral font-[700] uppercase text-[12px] md:text-[13px] tracking-[0.06em] hover:opacity-60 transition-opacity"
              >
                {t('workLink')} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
        <Link
          href={'/projekty?filter=komercyjne' as '/projekty'}
          className="mt-8 md:mt-10 inline-flex items-center gap-3 text-coral font-[700] uppercase text-[13px] md:text-[14px] tracking-[0.06em] hover:opacity-60 transition-opacity"
        >
          {tOferta('portfolio')} <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* FAQ */}
      <div className="mt-14 md:mt-20">
        <ScrollWeightHeading
          id="faq"
          as="h3"
          text={t('faqHeading')}
          className="text-dark uppercase mb-4 md:mb-5 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <FaqAccordion items={faqItems} />
      </div>

      {/* Closing brief CTA — flag-gated, opens the contact brief modal */}
      <ContactBriefCta heading={t('contactHeading')} cta={t('contactCta')} />
    </ScrollWeightHeadings>
  );
}
