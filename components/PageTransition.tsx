'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';

/* Route-change choreography:
   - arriving on the kontakt page plays the coral wipe — it lands under a
     coral sheet that recedes into the nav dot (top right);
   - switching locale (same path) soft-fades the content instead.
   AnimatePresence initial={false} keeps first paint (and direct loads of
   /kontakt) animation-free, and prefers-reduced-motion drops the wipe. */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Keyed fade (no AnimatePresence: its initial={false} would propagate
          into the page subtree and disable every whileInView initial state) */}
      <motion.div
        key={locale}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
      >
        {children}
      </motion.div>

      {!reduceMotion && (
        <AnimatePresence initial={false}>
          {pathname === '/kontakt' && (
            <motion.div
              key={pathname}
              className="pointer-events-none fixed inset-0 z-[90] bg-coral"
              initial={{ clipPath: 'circle(150% at 97% 4%)' }}
              animate={{
                clipPath: 'circle(0% at 97% 4%)',
                transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
