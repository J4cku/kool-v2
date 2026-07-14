'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import AddressBlock from '@/components/AddressBlock';
import FooterBar from '@/components/FooterBar';

export default function KontaktPage() {
  const tContact = useTranslations('contact');

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[80px] flex flex-col relative">
        <div className="flex-1 max-w-[1400px] mx-auto px-5 md:px-10 lg:px-12 w-full flex flex-col justify-between pb-20">
          <motion.div
            className="pt-[20vh] md:pt-[25vh]"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="text-coral font-[700] uppercase leading-tight"
              style={{ fontSize: 'clamp(32px, 5vw, 54px)' }}
            >
              {tContact('cta')}
            </h1>
          </motion.div>

          <motion.div
            className="mt-auto flex flex-col items-start md:flex-row md:items-end justify-between gap-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <video
              src="/videos/reel.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Kool Studio showreel"
              className="w-[160px] h-[160px] md:w-[220px] md:h-[220px] object-cover"
            />
            <AddressBlock />
          </motion.div>
        </div>

        {/* Coral separator line (in page flow) */}
        <div className="w-full bg-coral" style={{ height: '0.5px' }} />

        {/* Fixed bottom bar: instagram + language toggle */}
        <FooterBar />
      </main>
    </>
  );
}
