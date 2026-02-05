'use client';

import { motion, type Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -90,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.5,
      ease: easeOutExpo,
    },
  }),
};

const wordVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

function AnimatedWord({ word, className }: { word: string; className?: string }) {
  return (
    <motion.span
      className={`inline-block ${className || ''}`}
      variants={wordVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: '1000px' }}
    >
      {word.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={letterVariants}
          custom={i}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

function AnimatedLine({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const words = text.split(' ');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: delay + wordIndex * 0.15,
            duration: 0.6,
            ease: easeOutExpo,
          }}
        >
          <AnimatedWord word={word} />
        </motion.span>
      ))}
    </motion.div>
  );
}

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="min-h-screen flex flex-col justify-center relative px-6 pt-24 overflow-hidden">
      <div className="max-w-content mx-auto w-full">
        <h1 className="fluid-heading font-black text-dark">
          <AnimatedLine text={t('title1')} delay={0.2} />
          <AnimatedLine
            text={t('title2')}
            delay={0.6}
            className="italic text-coral"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 1.2, ease: easeOutExpo }}
          className="mt-8 text-muted text-lg md:text-xl max-w-xl"
        >
          {t('subtitle')}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-12 left-6 flex items-center gap-3"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-coral"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
        <span className="text-coral font-bold text-sm uppercase tracking-wider">{t('scroll')}</span>
      </motion.div>
    </section>
  );
}
