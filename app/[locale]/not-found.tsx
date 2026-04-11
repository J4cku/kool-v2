'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const letters = 'oops!'.split('');

export default function NotFound() {
  return (
    <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-5 text-center overflow-hidden relative">
      {/* Bouncing dot */}
      <motion.div
        className="absolute"
        initial={{ x: 0, y: -100, opacity: 0 }}
        animate={{
          x: [0, 120, -80, 60, -30, 0, 300],
          y: [-100, 200, 100, 250, 150, 0, -600],
          opacity: [0, 1, 1, 1, 1, 1, 0],
        }}
        transition={{
          duration: 2.4,
          ease: 'easeOut',
          times: [0, 0.25, 0.4, 0.55, 0.65, 0.75, 1],
        }}
        style={{ top: '35%' }}
      >
        <Image src="/dot.svg" alt="" width={36} height={35} />
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="mb-12"
      >
        <Image src="/logo.svg" alt="Kool Studio" width={120} height={40} />
      </motion.div>

      {/* "oops!" letter by letter */}
      <h1
        className="text-coral font-[700] uppercase leading-tight mb-6 flex"
        style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
      >
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 60, rotate: -15 + Math.random() * 30 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
              delay: 0.8 + i * 0.1,
              duration: 0.5,
              type: 'spring',
              stiffness: 200,
            }}
            className="inline-block"
          >
            {letter}
          </motion.span>
        ))}
      </h1>

      {/* Subtitle */}
      <motion.p
        className="text-dark font-[300] text-[18px] md:text-[22px] mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        nothing kool over here.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <Link
          href="/pl/projekty"
          className="text-coral font-[600] text-[14px] md:text-[16px] uppercase tracking-[0.15em] hover:opacity-70 transition-opacity border-b border-coral pb-1"
        >
          check out the projects
        </Link>
      </motion.div>
    </div>
  );
}
