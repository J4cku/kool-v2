'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import LanguageToggle from '@/components/LanguageToggle';

export default function KontaktPage() {
  const tContact = useTranslations('contact');
  const tFooter = useTranslations('footer');

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
              className="text-coral font-[900] uppercase leading-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}
            >
              {tContact('cta')}
            </h1>
          </motion.div>

          <motion.div
            className="mt-auto flex items-end justify-between gap-8"
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
              className="w-[160px] h-[160px] md:w-[220px] md:h-[220px] object-cover"
            />
            <div className="text-right">
              <a
                href="https://maps.app.goo.gl/f3nJEyLJXxKStLvPA"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-coral font-bold uppercase hover:opacity-70 transition-opacity"
                style={{ fontSize: 'clamp(24px, 3.5vw, 40px)' }}
              >
                {tFooter('address')}
              </a>
              <a
                href="mailto:hello@koolstudio.pl"
                className="block text-coral font-[900] uppercase hover:opacity-70 transition-opacity"
                style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
              >
                {tFooter('email')}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Coral separator line (in page flow) */}
        <div className="w-full bg-coral" style={{ height: '0.5px' }} />

        {/* Fixed language toggle */}
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="px-3 md:px-5 py-2 flex justify-end">
            <LanguageToggle />
          </div>
        </div>
      </main>
    </>
  );
}
