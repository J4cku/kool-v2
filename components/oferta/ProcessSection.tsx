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
          <span
            className="font-[400] uppercase text-dark/60 mb-4 md:mb-6 block"
            style={{ fontSize: 'clamp(14px, 1.9vw, 27px)' }}
          >
            {label}
          </span>
          <h2
            className="font-[700] text-dark uppercase mb-12 md:mb-16 leading-[1.02]"
            style={{ fontSize: 'clamp(30px, 5vw, 72px)' }}
          >
            {heading}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-[minmax(104px,34%)_1fr] md:grid-cols-[336px_minmax(0,1fr)] gap-5 md:gap-16 mb-16 md:mb-24 items-start"
        >
          <div className="relative w-full aspect-[2/3] overflow-hidden">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 336px, 34vw"
            />
          </div>

          <div className="flex flex-col justify-start">
            <ol className="space-y-2.5 md:space-y-3">
              {steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 md:gap-4 leading-[1.4]"
                  style={{ fontSize: 'clamp(15px, 1.9vw, 27px)' }}
                >
                  <span className="text-dark font-[700] tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-dark font-[400]">{step}</span>
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
            className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
            style={{ fontSize: 'clamp(30px, 5vw, 72px)' }}
          >
            {bottomHeading}
          </h2>
          <p
            className="text-dark/80 font-[400] leading-[1.5] max-w-[1080px]"
            style={{ fontSize: 'clamp(15px, 1.9vw, 27px)' }}
          >
            {bottomText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
