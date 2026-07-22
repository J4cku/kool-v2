'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { localizeService, services } from '@/data/services';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Server-rendered, always-mounted links block on the services hub: each
// subpage is reachable with a descriptive anchor (the service name), so the
// three landing pages are crawlable from /oferta.
export default function ServicesHubLinks() {
  const t = useTranslations('services');
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  const items = services.map((service) => localizeService(service, locale));

  return (
    <section className="px-5 md:px-10 lg:px-[68px] py-16 md:py-24 border-t border-coral/40">
      <div className="max-w-[1400px] mx-auto">
        <span
          className="font-[600] uppercase text-coral tracking-[0.14em] mb-8 md:mb-12 block"
          style={{ fontSize: 'clamp(12px, 1.1vw, 14px)' }}
        >
          {t('hubHeading')}
        </span>
        <ul className="border-t border-dark/15">
          {items.map((service, i) => (
            <motion.li
              key={service.slug}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE, delay: reduceMotion ? 0 : i * 0.06 }}
              className="border-b border-dark/15"
            >
              <Link
                href={`/oferta/${service.slug}`}
                className="group flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-10 py-8 md:py-10"
              >
                <span className="md:flex-1">
                  <span
                    className="block font-[700] text-dark uppercase leading-[1.05] group-hover:text-coral transition-colors duration-200"
                    style={{ fontSize: 'clamp(26px, 3.4vw, 48px)' }}
                  >
                    {service.heroName}
                  </span>
                  <span
                    className="block mt-2 md:mt-3 text-dark/70 font-[400] leading-[1.45] max-w-[720px]"
                    style={{ fontSize: 'clamp(15px, 1.4vw, 19px)' }}
                  >
                    {service.hubTagline}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-coral font-[300] leading-none group-hover:translate-x-1 transition-transform duration-200"
                  style={{ fontSize: 'clamp(28px, 3vw, 44px)' }}
                >
                  →
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
