'use client';

import { motion } from 'framer-motion';
import ColumnImage from '@/components/ColumnImage';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-5 md:px-10 lg:px-[68px] py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.75, ease: EASE }}
        >
          <span
            className="font-[400] uppercase text-dark/60 mb-4 md:mb-6 block"
            style={{ fontSize: 'clamp(14px, 1.5vw, 20px)' }}
          >
            {label}
          </span>
          <h2
            className="font-[700] text-dark uppercase mb-12 md:mb-16 leading-[1.02]"
            style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
          >
            {heading}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: reduceMotion ? 0 : 0.75,
            ease: EASE,
            delay: reduceMotion ? 0 : 0.12,
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 mb-16 md:mb-24 items-stretch"
        >
          <ColumnImage
            src={imageSrc}
            alt={imageAlt}
            width="w-[74%] md:w-[64%]"
            className="md:pr-8 lg:pr-12"
            sizes="(min-width: 768px) 32vw, 74vw"
          />

          <div className="flex flex-col justify-center md:pl-8 lg:pl-12">
            <ol className="space-y-6 md:space-y-9">
              {steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 md:gap-4 leading-[1.4]"
                  style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
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
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.75, ease: EASE }}
        >
          <h2
            className="font-[700] text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
            style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
          >
            {bottomHeading}
          </h2>
          <p
            className="text-dark/80 font-[400] leading-[1.5] max-w-[1080px]"
            style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
          >
            {bottomText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
