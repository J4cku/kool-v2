'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { INSTAGRAM_URL } from '@/lib/site';
import { track } from '@/lib/analytics';

const navLinks = [
  { href: '/projekty' as const, key: 'projekty' },
  { href: '/studio' as const, key: 'studio' },
  { href: '/oferta' as const, key: 'oferta' },
  { href: '/kontakt' as const, key: 'kontakt' },
];

const mobileQuery = '(max-width: 768px)';

function subscribeToMobileQuery(onStoreChange: () => void) {
  const mq = window.matchMedia(mobileQuery);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia(mobileQuery).matches;
}

function getServerMobileSnapshot() {
  return false;
}

function NavLinkLabel({ label, isRolloverActive }: { label: string; isRolloverActive: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const characters = Array.from(label);

  return (
    <span className="relative inline-block overflow-hidden leading-[1.2] align-bottom">
      <span aria-hidden="true" className="block whitespace-nowrap">
        {characters.map((character, index) => (
          <motion.span
            key={`current-${index}`}
            className="inline-block"
            animate={{ y: shouldReduceMotion || !isRolloverActive ? '0%' : '-100%' }}
            transition={{ delay: index * 0.015, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {character === ' ' ? '\u00A0' : character}
          </motion.span>
        ))}
      </span>
      <span aria-hidden="true" className="absolute top-0 left-0 block whitespace-nowrap">
        {characters.map((character, index) => (
          <motion.span
            key={`next-${index}`}
            className="inline-block"
            animate={{ y: shouldReduceMotion || !isRolloverActive ? '100%' : '0%' }}
            transition={{ delay: index * 0.015, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {character === ' ' ? '\u00A0' : character}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusedLabel, setFocusedLabel] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    getServerMobileSnapshot
  );
  const t = useTranslations('nav');
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    document.body.style.overflow = menuOpen && isMobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, isMobile]);

  // Scroll-linked shrink: browsers with CSS scroll timelines animate the
  // .nav-logo-shrink/.nav-dot-shrink classes on the compositor (globals.css),
  // which overrides these inline values and stays smooth in Mobile Safari.
  // Older browsers fall back to the spring-smoothed values below.
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 260, damping: 34, restDelta: 0.5 });
  const logoScale = useTransform(smoothScrollY, [0, 300], [1, 0.6]);
  const dotScale = useTransform(smoothScrollY, [0, 300], isMobile ? [1, 0.8] : [1, 1]);
  const dotY = useTransform(smoothScrollY, [0, 300], isMobile ? [0, -10] : [0, 0]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isRolloverActive = (label: string) => hoveredLabel === label || focusedLabel === label;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4 md:px-6 pt-[var(--nav-top-padding)] pb-6 flex items-center justify-between">
          <Link href="/">
            {/* Desktop: static logo */}
            {/* fetchPriority is explicit because Next 16's `priority` prop
                emits the preload without fetchpriority=high, leaving the logo
                (the mobile LCP element) queued behind script downloads */}
            <span className="hidden md:block">
              <Image src="/logo.svg" alt="Kool Studio" width={208} height={77} priority fetchPriority="high" />
            </span>
            {/* Mobile: scale tracks scroll position */}
            <motion.span
              className="block md:hidden origin-top-left will-change-transform nav-logo-shrink"
              style={{ scale: logoScale }}
            >
              <Image src="/logo.svg" alt="Kool Studio" width={208} height={77} priority fetchPriority="high" />
            </motion.span>
          </Link>

          <div className="flex items-center gap-10">
            {/* Desktop: menu items appear inline left of the dot. Always
                mounted (animated by state, not AnimatePresence) so the nav
                links exist in the server HTML for crawlers. `inert` removes
                hit-testing, focus and a11y exposure while closed; the
                delayed visibility flip hides the text from find-in-page
                after the staggered fade-out completes */}
            <div
              className={`hidden md:flex items-center transition-[visibility] duration-[600ms] ${
                menuOpen ? 'visible' : 'invisible'
              }`}
              inert={!menuOpen}
            >
              {navLinks.map((link, index) => (
                <motion.span
                  key={link.key}
                  className="inline-flex items-center"
                  initial={false}
                  animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    aria-label={t(link.key)}
                    onBlur={() => setFocusedLabel(null)}
                    onClick={() => setMenuOpen(false)}
                    onFocus={() => setFocusedLabel(link.key)}
                    onMouseEnter={() => setHoveredLabel(link.key)}
                    onMouseLeave={() => setHoveredLabel(null)}
                    className={`relative transition-colors duration-200 text-[15px] text-coral hover:opacity-60 ${
                      isActive(link.href) ? 'font-bold' : 'font-[600]'
                    }`}
                  >
                    <NavLinkLabel label={t(link.key)} isRolloverActive={isRolloverActive(link.key)} />
                  </Link>
                  <span className="text-coral text-[15px] mr-1">,</span>
                </motion.span>
              ))}
              <motion.span
                key="instagram"
                className="inline-flex items-center"
                initial={false}
                animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                transition={{ delay: navLinks.length * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="instagram"
                  onBlur={() => setFocusedLabel(null)}
                  onClick={() => track('instagram_click', { placement: 'navbar' })}
                  onFocus={() => setFocusedLabel('instagram')}
                  onMouseEnter={() => setHoveredLabel('instagram')}
                  onMouseLeave={() => setHoveredLabel(null)}
                  className="relative transition-colors duration-200 text-[15px] text-coral hover:opacity-60 font-[600]"
                >
                  <NavLinkLabel label="instagram" isRolloverActive={isRolloverActive('instagram')} />
                </a>
              </motion.span>
            </div>

            {/* The single dot — always visible, toggles menu */}
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-[44px] h-[44px] flex items-center justify-end cursor-pointer hover:opacity-80 shrink-0"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <motion.div
                className="w-[36px] h-[35px] shrink-0 origin-top-right will-change-transform nav-dot-shrink"
                style={{ scale: dotScale, y: dotY }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: reduceMotion ? 0 : [0, 0, -1.5, 1.5, -1, 1, 0, 0],
                  }}
                  transition={{
                    scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    x: { duration: 0.6, delay: 2, repeat: Infinity, repeatDelay: 3.4, ease: 'easeInOut' },
                  }}
                  className="origin-center"
                >
                  <Image
                    src="/dot.svg"
                    alt=""
                    width={36} height={35}
                    loading="eager"
                    fetchPriority="high"
                  />
                </motion.div>
              </motion.div>
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

      {/* Mobile: full-screen overlay. Conditionally mounted is fine for
          crawlers — the desktop link list above is always in the HTML
          (hidden on mobile only by CSS).
          h-dvh (not inset-0) so the menu centers within the VISIBLE
          viewport on iOS Safari, whose collapsing bars shift the
          layout-viewport center */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-0 h-dvh z-[100] bg-coral flex flex-col md:hidden"
          >
            <div className="w-full px-4 pt-[var(--nav-top-padding)] pb-6 flex items-center justify-between">
              <motion.span
                className="origin-top-left will-change-transform nav-logo-shrink"
                style={{ scale: logoScale }}
              >
                <div
                  className="w-[208px] h-[77px] bg-beige"
                  style={{ maskImage: 'url(/logo.svg)', maskSize: 'contain', maskRepeat: 'no-repeat' }}
                />
              </motion.span>
              <motion.button
                onClick={() => setMenuOpen(false)}
                className="w-[44px] h-[44px] flex items-center justify-end cursor-pointer hover:opacity-80 shrink-0"
                aria-label="Close menu"
              >
                <motion.div
                  className="w-[36px] h-[35px] shrink-0 origin-top-right will-change-transform nav-dot-shrink"
                  style={{ scale: dotScale, y: dotY }}
                >
                  <div
                    className="w-[36px] h-[35px] bg-beige rounded-full"
                    style={{ maskImage: 'url(/dot.svg)', maskSize: 'contain', maskRepeat: 'no-repeat' }}
                  />
                </motion.div>
              </motion.button>
            </div>

            {/* In-flow flex-1 (not absolute inset-0): centers the items in
                the space below the logo header — full-screen centering left
                far less air above the menu than below it */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-8 text-center pb-[8vh]">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
              <motion.div
                key="instagram"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: navLinks.length * 0.1,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pointer-events-auto"
              >
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('instagram_click', { placement: 'mobile_menu' })}
                  className="text-5xl uppercase tracking-wide transition-opacity hover:opacity-80 text-beige/80 font-[700]"
                >
                  instagram
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
