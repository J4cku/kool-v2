'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations('nav');

  const navLinks = [
    { href: '#projekty', label: t('projekty') },
    { href: '#studio', label: t('studio') },
    { href: '#oferta', label: t('oferta') },
    { href: '#kontakt', label: t('kontakt') },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-coral flex flex-col"
        >
          <div className="w-full px-4 py-5 flex items-center justify-between">
            <span className="text-white font-black text-[42px] leading-none tracking-tight">
              kool
            </span>
            <button
              onClick={onClose}
              className="w-[30px] h-[30px] rounded-full bg-beige flex items-center justify-center text-dark text-base font-bold hover:bg-beige/90 transition-colors"
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={onClose}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-white font-black text-5xl md:text-6xl uppercase tracking-wide hover:opacity-80 transition-opacity"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
