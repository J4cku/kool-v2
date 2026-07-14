'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /* Stagger offset in seconds (e.g. the right image of a pair) */
  delay?: number;
}

/* Editorial image reveal: the frame un-masks upward from its bottom edge
   while the content settles from a slight over-scale. The observed wrapper
   stays unclipped (a fully clip-pathed element reports zero intersection
   and would never trigger); the clip animates on a child via variants.
   Fires once per image when 20% of it is in view; renders statically under
   prefers-reduced-motion. */
export default function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        className="h-full w-full overflow-hidden"
        variants={{
          hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
          visible: {
            clipPath: 'inset(0% 0% 0% 0%)',
            transition: { duration: 0.9, ease: EASE, delay },
          },
        }}
      >
        <motion.div
          className="relative h-full w-full"
          variants={{
            hidden: { scale: 1.06 },
            visible: { scale: 1, transition: { duration: 1.1, ease: EASE, delay } },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
