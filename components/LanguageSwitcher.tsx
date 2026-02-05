'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const getLocalePath = (newLocale: string) => {
    // Remove current locale prefix if present
    const pathWithoutLocale = pathname.replace(/^\/(pl|en)/, '') || '/';
    return `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-black/5">
        <a
          href={getLocalePath('pl')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            locale === 'pl'
              ? 'bg-coral text-white'
              : 'text-dark/70 hover:text-dark hover:bg-white/30'
          }`}
        >
          PL
        </a>
        <a
          href={getLocalePath('en')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
            locale === 'en'
              ? 'bg-coral text-white'
              : 'text-dark/70 hover:text-dark hover:bg-white/30'
          }`}
        >
          EN
        </a>
      </div>
    </motion.div>
  );
}
