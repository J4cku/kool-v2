'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const studioImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=400&fit=crop',
];

export default function AboutSection() {
  const t = useTranslations('about');

  return (
    <section id="studio" className="py-24 md:py-32 px-6">
      <div className="max-w-content mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-coral font-bold text-sm uppercase tracking-[0.2em] mb-6 block">
              {t('label')}
            </span>
            <h2 className="fluid-heading-sm font-black text-dark mb-6">
              {t('title1')}
              <br />
              <span className="italic">{t('title2')}</span>
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              {t('description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-2"
          >
            {studioImages.map((src, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden group"
              >
                <Image
                  src={src}
                  alt={`Studio ${index + 1}`}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
