'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=1067&fit=crop",
    key: "apartamentCentrum"
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=1067&fit=crop",
    key: "biuroSkyline"
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=1067&fit=crop",
    key: "rezydencjaPark"
  }
];

export default function GalleryStrip() {
  const t = useTranslations('gallery');

  return (
    <section className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
        {galleryImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative aspect-[3/4] overflow-hidden group cursor-pointer"
          >
            <Image
              src={image.src}
              alt={t(image.key)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white font-bold text-lg">{t(image.key)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
