'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ColumnImage from '@/components/ColumnImage';
import RevealHeading from '@/components/RevealHeading';
import StagesTimeline, { type TimelineStage } from './StagesTimeline';
import FaqAccordion, { type FaqItem } from './FaqAccordion';
import { projects, localizeProject } from '@/data/projects';

const WORK_SLUGS = ['delikatesy-dehesa', 'biuro-dobry-material', 'winobar-lodz'];

/* Expanded body of the commercial offer: what the project covers, when it
   fits, the stage timeline, benefits, selected works and FAQ — the mockup's
   "rozszerzona" state. */
export default function CommercialDetails() {
  const t = useTranslations('oferta.commercial.details');
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

  return (
    <div>
      {/* Projekt wnętrza komercyjnego */}
      <div className="pt-16 md:pt-24">
        <RevealHeading
          as="h3"
          text={t('projectHeading')}
          className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <p
          className="text-dark/80 font-[400] leading-[1.5] max-w-[1240px]"
          style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
        >
          {t('projectDescription')}
        </p>
        <p
          className="text-dark font-[400] mt-8 md:mt-10 mb-2"
          style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
        >
          {t('typesLabel')}
        </p>
        <p
          className="text-dark font-[600] uppercase leading-[1.5]"
          style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}
        >
          {t('types')}
        </p>
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
          <h4
            className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.2]"
            style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
          >
            {t('fitTitle')}
          </h4>
          <ol className="space-y-4 md:space-y-5">
            {fitItems.map((item, i) => (
              <li
                key={i}
                className="text-dark font-[400] leading-[1.45] flex items-start gap-3"
                style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
              >
                <span className="font-[700] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Etapy projektu */}
      <div className="mt-16 md:mt-24">
        <StagesTimeline heading={t('stagesHeading')} stages={stages} />
      </div>

      {/* Co zyskujesz */}
      <div className="mt-16 md:mt-24">
        <RevealHeading
          as="h3"
          text={t('benefitsHeading')}
          className="font-[700] text-dark uppercase mb-10 md:mb-14 leading-[1.02]"
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
      <div className="mt-16 md:mt-24">
        <RevealHeading
          as="h3"
          text={t('worksHeading')}
          className="font-[700] text-dark uppercase mb-10 md:mb-14 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 lg:gap-x-10 gap-y-12 items-stretch border-b border-coral">
          {works.map((project) => (
            <div key={project.slug} className="flex flex-col pb-4">
              <Link href={`/projekty/${project.slug}`} className="block group">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 33vw"
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
                {workBlurbs[project.slug]}
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
      </div>

      {/* FAQ */}
      <div className="mt-16 md:mt-24">
        <RevealHeading
          as="h3"
          text={t('faqHeading')}
          className="font-[700] text-dark uppercase mb-8 md:mb-10 leading-[1.02]"
          style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
        />
        <FaqAccordion items={faqItems} />
      </div>
    </div>
  );
}
