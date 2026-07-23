'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import AddressBlock from '@/components/AddressBlock';
import FooterBar from '@/components/FooterBar';
import BriefModal from '@/components/kontakt/BriefModal';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import LazyAutoplayVideo from '@/components/LazyAutoplayVideo';

export default function KontaktPage() {
  const tContact = useTranslations('contact');
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Navbar />
      <main className="min-h-dvh pt-[80px] flex flex-col relative">
        <div className="flex-1 max-w-[1400px] mx-auto px-5 md:px-10 lg:px-12 w-full flex flex-col justify-between pb-[calc(5rem+env(safe-area-inset-bottom))]">
          <motion.div
            className="pt-[20vh] md:pt-[25vh]"
            initial={{ opacity: 0, x: reduceMotion ? 0 : -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="text-dark font-[700] uppercase leading-tight"
              style={{ fontSize: 'clamp(32px, 5vw, 54px)' }}
            >
              {tContact('cta')}
            </h1>
            <BriefModal />
          </motion.div>

          <motion.div
            className="mt-auto flex flex-col items-start md:flex-row md:items-end justify-between gap-8"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          >
            <LazyAutoplayVideo
              src="/videos/reel.mp4"
              label="Kool Studio showreel"
              className="w-[160px] h-[160px] md:w-[220px] md:h-[220px] object-cover"
            />
            <AddressBlock />
          </motion.div>
        </div>

        {/* Fixed bottom bar: instagram + language toggle */}
        <FooterBar />
      </main>
    </>
  );
}
