'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProcessSectionProps {
  label: string;
  heading: string;
  steps: string[];
  imageSrc: string;
  imageAlt: string;
  bottomHeading: string;
  bottomText: string;
}

export default function ProcessSection({
  label,
  heading,
  steps,
  imageSrc,
  imageAlt,
  bottomHeading,
  bottomText,
}: ProcessSectionProps) {
  return (
    <section className="px-5 md:px-10 lg:px-[68px] py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[11px] font-[700] uppercase text-dark/50 mb-4 block">
            {label}
          </span>
          <h2
            className="font-[900] text-dark uppercase mb-12 md:mb-16 leading-[1.05]"
            style={{ fontSize: 'clamp(24px, 4.5vw, 48px)' }}
          >
            {heading}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-[minmax(104px,34%)_1fr] md:grid-cols-[2fr_3fr] gap-5 md:gap-20 mb-16 md:mb-24 items-start"
        >
          <div className="relative w-full aspect-[3/4] overflow-hidden">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 360px, 34vw"
            />
          </div>

          <div className="flex flex-col justify-start">
            <ol className="space-y-3 md:space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 md:gap-4">
                  <span className="text-dark font-[900] text-[14px] md:text-[15px] tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-dark text-[13px] md:text-[14px] font-[400]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-[900] text-dark uppercase mb-6 md:mb-8 leading-[1.05]"
            style={{ fontSize: 'clamp(24px, 4.5vw, 48px)' }}
          >
            {bottomHeading}
          </h2>
          <p className="text-dark/70 text-[13px] md:text-[14px] font-[400] leading-relaxed max-w-2xl">
            {bottomText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
