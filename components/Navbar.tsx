'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';

const navLinks = [
  { href: '/projekty' as const, key: 'projekty' },
  { href: '/studio' as const, key: 'studio' },
  { href: '/oferta' as const, key: 'oferta' },
  { href: '/kontakt' as const, key: 'kontakt' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const { scrollY } = useScroll();
  const logoScale = useTransform(scrollY, [0, 200], [1, 0.45]);
  const dotScale = useTransform(scrollY, [0, 200], isMobile ? [1, 0.7] : [1, 1]);
  const dotY = useTransform(scrollY, [0, 200], isMobile ? [0, -16] : [0, 0]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4 md:px-6 pt-4 pb-6 flex items-center justify-between">
          <Link href="/">
            {/* Desktop: static logo */}
            <span className="hidden md:block">
              <Image src="/logo.svg" alt="Kool Studio" width={208} height={77} priority />
            </span>
            {/* Mobile: shrink on scroll + burn blend */}
            <motion.span
              className="block md:hidden origin-top-left"
              style={{
                scale: logoScale,
              }}
            >
              <Image src="/logo.svg" alt="Kool Studio" width={208} height={77} priority />
            </motion.span>
          </Link>

          <div className="flex items-center gap-10">
            {/* Desktop: menu items appear inline left of the dot */}
            <AnimatePresence>
              {menuOpen && (
                <div className="hidden md:flex items-center">
                  {navLinks.map((link, index) => (
                    <motion.span
                      key={link.key}
                      className="inline-flex items-center"
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`relative transition-colors duration-200 text-[15px] text-coral hover:opacity-60 ${
                          isActive(link.href) ? 'font-bold' : 'font-normal'
                        }`}
                      >
                        <span className="relative">
                          {t(link.key)}
                          <motion.span
                            className="absolute left-0 right-0 bottom-[-2px] bg-coral origin-left"
                            style={{ height: '0.5px' }}
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </span>
                      </Link>
                      {index < navLinks.length - 1 && (
                        <span className="text-coral text-[15px] mr-1">,</span>
                      )}
                    </motion.span>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* The single dot — always visible, toggles menu */}
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-[36px] h-[35px] hover:opacity-80 transition-opacity shrink-0 origin-top-right"
              style={{ scale: dotScale, y: dotY }}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <Image src="/dot.svg" alt="" width={36} height={35} />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Desktop: invisible backdrop to close menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[40] hidden md:block"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile: full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-coral flex flex-col md:hidden"
          >
            <div className="w-full px-4 pt-4 pb-6 flex items-center justify-between">
              <motion.span className="origin-top-left" style={{ scale: logoScale }}>
                <div
                  className="w-[208px] h-[77px] bg-beige"
                  style={{ maskImage: 'url(/logo.svg)', maskSize: 'contain', maskRepeat: 'no-repeat' }}
                />
              </motion.span>
              <motion.button
                onClick={() => setMenuOpen(false)}
                className="w-[36px] h-[35px] hover:opacity-80 transition-opacity shrink-0 origin-top-right"
                style={{ scale: dotScale, y: dotY }}
                aria-label="Close menu"
              >
                <div
                  className="w-[36px] h-[35px] bg-beige rounded-full"
                  style={{ maskImage: 'url(/dot.svg)', maskSize: 'contain', maskRepeat: 'no-repeat' }}
                />
              </motion.button>
            </div>

            <nav className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-center pointer-events-none">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="pointer-events-auto"
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`text-5xl uppercase tracking-wide transition-opacity hover:opacity-80 ${
                      isActive(link.href) ? 'text-beige font-[900]' : 'text-beige/80 font-[700]'
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
