'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ul>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-baseline justify-between gap-6 text-left py-3 md:py-3.5 group"
            >
              <span
                className="font-[600] text-dark uppercase leading-[1.35] group-hover:opacity-60 transition-opacity"
                style={{ fontSize: 'clamp(15px, 1.6vw, 22px)' }}
              >
                {item.q}
              </span>
              <span
                aria-hidden="true"
                className={`shrink-0 text-coral font-[400] leading-none transition-transform duration-300 ${
                  isOpen ? 'rotate-45' : ''
                }`}
                style={{ fontSize: 'clamp(20px, 1.8vw, 26px)' }}
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, transition: { duration: reduceMotion ? 0 : 0.4, ease: EASE } }}
                  exit={{ height: 0, opacity: 0, transition: { duration: reduceMotion ? 0 : 0.3, ease: EASE } }}
                  className="overflow-hidden"
                >
                  <p
                    className="text-dark/80 font-[400] leading-[1.5] max-w-[1080px] pb-6 pt-1"
                    style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
                  >
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
