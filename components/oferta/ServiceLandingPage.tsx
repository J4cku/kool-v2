'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import ProjectHero from '@/components/ProjectHero';
import ColumnImage from '@/components/ColumnImage';
import RevealHeading from '@/components/RevealHeading';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import FaqAccordion from '@/components/oferta/FaqAccordion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ServiceFaq, ServiceLine } from '@/data/services';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type ProofCard = {
  slug: string;
  title: string;
  location: string;
  area: string;
  year: number;
  thumbnail: string;
};

interface ServiceLandingPageProps {
  line: ServiceLine;
  // Service page slug, used only as the non-PII `service` analytics dimension.
  serviceSlug: string;
  heroName: string;
  heroLead: string;
  heroImage: string;
  heroImageAlt: string;
  crumbs: Crumb[];
  situations: string[];
  proof: ProofCard[];
  proofAngles: string[];
  faqs: ServiceFaq[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-[600] uppercase text-coral tracking-[0.14em] mb-4 md:mb-5 block"
      style={{ fontSize: 'clamp(12px, 1.1vw, 14px)' }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ text }: { text: string }) {
  return (
    <RevealHeading
      text={text}
      className="font-[700] text-dark uppercase mb-8 md:mb-12 leading-[1.04]"
      style={{ fontSize: 'clamp(26px, 3.6vw, 52px)' }}
    />
  );
}

export default function ServiceLandingPage({
  line,
  serviceSlug,
  heroName,
  heroLead,
  heroImage,
  heroImageAlt,
  crumbs,
  situations,
  proof,
  proofAngles,
  faqs,
}: ServiceLandingPageProps) {
  const t = useTranslations('services');
  const tOferta = useTranslations('oferta');
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const scopeItems = tOferta.raw(`${line}.scopeItems`) as string[];
  const processSteps = tOferta.raw('process.steps') as string[];

  const fade = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reduceMotion ? 0 : 0.7, ease: EASE },
  };

  return (
    <>
      <ProjectHero src={heroImage} alt={heroImageAlt} />
      <Navbar />
      <main>
        {/* Content scrolls over the fixed hero image */}
        <div className="relative z-10 bg-beige">
          <div className="px-5 pt-10 md:px-10 md:pt-14 lg:px-12">
            <Breadcrumbs items={crumbs} />
          </div>

          {/* Hero text: service name + who it's for + outcome */}
          <section className="px-5 md:px-10 lg:px-[68px] pt-10 md:pt-14 pb-14 md:pb-20">
            <div className="max-w-[1400px] mx-auto">
              <RevealHeading
                as="h1"
                text={heroName}
                className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
                style={{ fontSize: 'clamp(34px, 5.4vw, 76px)' }}
              />
              <p
                className="text-dark/80 leading-[1.5] max-w-[1080px] font-[400]"
                style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
              >
                {heroLead}
              </p>
            </div>
          </section>

          {/* Recognition — situations grounded in the published scope */}
          <section id="kiedy-warto" className="px-5 md:px-10 lg:px-[68px] py-14 md:py-20 border-t border-coral/40">
            <div className="max-w-[1400px] mx-auto">
              <SectionLabel>{t('sections.recognition')}</SectionLabel>
              <SectionHeading text={t('sections.recognition')} />
              <ul className="border-t border-dark/15">
                {situations.map((situation, i) => (
                  <motion.li
                    key={i}
                    {...fade}
                    transition={{ ...fade.transition, delay: reduceMotion ? 0 : i * 0.04 }}
                    className="flex items-start gap-5 md:gap-8 border-b border-dark/15 py-6 md:py-7"
                  >
                    <span
                      className="text-coral font-[700] tabular-nums shrink-0 leading-[1.3]"
                      style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-dark font-[400] leading-[1.45] max-w-[1000px]"
                      style={{ fontSize: 'clamp(16px, 1.6vw, 22px)' }}
                    >
                      {situation}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>

          {/* Scope — the exact published scope list for this service line */}
          <section id="zakres" className="px-5 md:px-10 lg:px-[68px] py-14 md:py-20 border-t border-coral/40">
            <div className="max-w-[1400px] mx-auto">
              <SectionLabel>{t('sections.scope')}</SectionLabel>
              <SectionHeading text={t('sections.scope')} />
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-3.5 md:gap-y-[18px]">
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
          </section>

          {/* Process — the published 7 steps */}
          <section id="proces" className="px-5 md:px-10 lg:px-[68px] py-14 md:py-20 border-t border-coral/40">
            <div className="max-w-[1400px] mx-auto">
              <SectionLabel>{t('sections.process')}</SectionLabel>
              <SectionHeading text={t('sections.process')} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-stretch">
                <ColumnImage
                  src="/images/oferta/KOOL_oferta_finish_small.webp"
                  alt={tOferta('processImageAlt')}
                  width="w-[74%] md:w-[64%]"
                  className="md:pr-8 lg:pr-12"
                  sizes="(min-width: 768px) 32vw, 74vw"
                />
                <div className="flex flex-col justify-center md:pl-8 lg:pl-12">
                  <ol className="space-y-6 md:space-y-8">
                    {processSteps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 md:gap-4 leading-[1.4]"
                        style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
                      >
                        <span className="text-coral font-[700] tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-dark font-[400]">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Proof — relevant projects with published facts */}
          <section id="realizacje" className="px-5 md:px-10 lg:px-[68px] py-14 md:py-20 border-t border-coral/40">
            <div className="max-w-[1400px] mx-auto">
              <SectionLabel>{t('sections.proof')}</SectionLabel>
              <SectionHeading text={t('sections.proof')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16">
                {proof.map((p, i) => {
                  const thumbAlt =
                    locale === 'en'
                      ? `Interior of ${p.title}, ${p.location}`
                      : `Wnętrze projektu ${p.title}, ${p.location}`;
                  return (
                    <Link key={p.slug} href={`/projekty/${p.slug}`} className="group block">
                      <div className="overflow-hidden">
                        <div className="relative aspect-square">
                          <Image
                            src={p.thumbnail}
                            alt={thumbAlt}
                            fill
                            className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      </div>
                      <p className="mt-3 text-[14px] md:text-[15px] font-[600] text-dark uppercase">
                        {p.title} / {p.location}
                      </p>
                      <p className="mt-1 text-muted uppercase tracking-[0.1em] text-[12px] md:text-[13px]">
                        {p.area} · {p.year}
                      </p>
                      <p
                        className="mt-3 text-dark/80 leading-[1.45]"
                        style={{ fontSize: 'clamp(14px, 1.3vw, 17px)' }}
                      >
                        {proofAngles[i]}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-coral font-[600] uppercase tracking-[0.06em] text-[13px] group-hover:opacity-60 transition-opacity">
                        {t('viewProject')} <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* FAQ — accessible accordion, answers grounded in published facts */}
          <section id="faq" className="px-5 md:px-10 lg:px-[68px] py-14 md:py-20 border-t border-coral/40">
            <div className="max-w-[1400px] mx-auto">
              <SectionLabel>{t('sections.faq')}</SectionLabel>
              <SectionHeading text={t('sections.faq')} />
              <FaqAccordion items={faqs} />
            </div>
          </section>

          {/* CTA — one dominant call to action */}
          <section className="px-5 md:px-10 lg:px-[68px] pt-14 md:pt-20 pb-6 md:pb-10 border-t border-coral/40">
            <div className="max-w-[1400px] mx-auto">
              <motion.div {...fade}>
                <h2
                  className="font-[700] text-dark uppercase leading-[1.04] mb-8 md:mb-10 max-w-[1100px]"
                  style={{ fontSize: 'clamp(30px, 4.6vw, 64px)' }}
                >
                  {t('cta.heading')}
                </h2>
                <Link
                  href="/kontakt"
                  data-analytics="cta_click"
                  data-analytics-service={serviceSlug}
                  data-analytics-position="service-cta"
                  data-analytics-cta-text={t('cta.button')}
                  className="inline-flex items-center gap-2 text-coral font-[700] uppercase tracking-[0.06em] hover:opacity-60 transition-opacity"
                  style={{ fontSize: 'clamp(16px, 1.8vw, 24px)' }}
                >
                  {t('cta.button')} <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </div>
          </section>

          <FooterBanner showMarquee={false} />
        </div>
      </main>
    </>
  );
}
