'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { acquireDocumentScrollLock } from '@/lib/document-scroll-lock';
import { STORY_DESKTOP_QUERY } from '@/lib/portfolio-motion';
import { usePrefersReducedMotion } from '@/lib/reduced-motion';
import { INSTAGRAM_URL } from '@/lib/site';

const navLinks = [
  { href: '/projekty' as const, key: 'projekty' },
  { href: '/studio' as const, key: 'studio' },
  { href: '/oferta' as const, key: 'oferta' },
  { href: '/kontakt' as const, key: 'kontakt' },
];

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function NavLinkLabel({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const characters = Array.from(label);

  return (
    <span className="relative inline-block overflow-hidden align-bottom leading-[1.2]">
      <span aria-hidden="true" className="block whitespace-nowrap">
        {characters.map((character, index) => (
          <motion.span
            key={`current-${index}`}
            className="inline-block"
            animate={{ y: reducedMotion || !active ? '0%' : '-100%' }}
            transition={{
              delay: index * 0.015,
              duration: reducedMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {character === ' ' ? '\u00A0' : character}
          </motion.span>
        ))}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 block whitespace-nowrap"
      >
        {characters.map((character, index) => (
          <motion.span
            key={`next-${index}`}
            className="inline-block"
            animate={{ y: reducedMotion || !active ? '100%' : '0%' }}
            transition={{
              delay: index * 0.015,
              duration: reducedMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
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
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const isProjectDetail = pathname.startsWith('/projekty/');
  const [storyTheme, setStoryTheme] = useState({
    pathname,
    light: isProjectDetail,
  });
  const storyHeroLight =
    storyTheme.pathname === pathname ? storyTheme.light : isProjectDetail;
  const usesHeroTreatment = pathname === '/' || storyHeroLight;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const isRolloverActive = (label: string) =>
    hoveredLabel === label || focusedLabel === label;

  useEffect(() => {
    const desktopQuery = window.matchMedia(STORY_DESKTOP_QUERY);
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    desktopQuery.addEventListener('change', closeOnDesktop);
    return () => desktopQuery.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    const handleStoryTheme = (event: Event) => {
      const themeEvent = event as CustomEvent<{ light?: boolean }>;
      if (typeof themeEvent.detail?.light === 'boolean') {
        setStoryTheme({ pathname, light: themeEvent.detail.light });
      }
    };

    window.addEventListener('kool:nav-theme', handleStoryTheme);
    return () => window.removeEventListener('kool:nav-theme', handleStoryTheme);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const releaseScrollLock = acquireDocumentScrollLock();
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        menu.querySelectorAll<HTMLElement>(focusableSelector)
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === firstElement || !menu.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !menu.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      releaseScrollLock();
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        aria-label={t('menu')}
        className={`fixed inset-x-0 top-0 z-50 h-16 border-b transition-[background-color,border-color] duration-300 motion-reduce:transition-none ${
          usesHeroTreatment
            ? 'border-beige/50 bg-transparent'
            : 'border-coral/30 bg-beige'
        }`}
      >
        <div className="flex h-full items-center justify-between px-5">
          <Link
            href="/"
            aria-label="Kool Studio"
            className="inline-flex shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral"
          >
            <span
              aria-hidden="true"
              className={`block h-10 w-[108px] transition-colors duration-300 motion-reduce:transition-none ${
                usesHeroTreatment ? 'bg-beige' : 'bg-coral'
              }`}
              style={{
                maskImage: 'url(/logo.svg)',
                WebkitMaskImage: 'url(/logo.svg)',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
              }}
            />
          </Link>

          <ul className="hidden items-center gap-5 min-[992px]:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    aria-label={t(link.key)}
                    aria-current={active ? 'page' : undefined}
                    onBlur={() => setFocusedLabel(null)}
                    onFocus={() => setFocusedLabel(link.key)}
                    onMouseEnter={() => setHoveredLabel(link.key)}
                    onMouseLeave={() => setHoveredLabel(null)}
                    className={`inline-flex border-b-2 py-1 text-[11px] uppercase tracking-[0.14em] transition-[border-color,color,opacity] duration-300 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral motion-reduce:transition-none ${
                      usesHeroTreatment ? 'text-beige' : 'text-dark'
                    } ${
                      active
                        ? `${usesHeroTreatment ? 'border-beige' : 'border-coral'} font-[700]`
                        : 'border-transparent font-[500]'
                    }`}
                  >
                    <NavLinkLabel
                      label={t(link.key)}
                      active={isRolloverActive(link.key)}
                    />
                  </Link>
                </li>
              );
            })}
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="instagram"
                onBlur={() => setFocusedLabel(null)}
                onFocus={() => setFocusedLabel('instagram')}
                onMouseEnter={() => setHoveredLabel('instagram')}
                onMouseLeave={() => setHoveredLabel(null)}
                className={`inline-flex border-b-2 border-transparent py-1 text-[11px] font-[500] uppercase tracking-[0.14em] transition-[border-color,color,opacity] duration-300 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral motion-reduce:transition-none ${
                  usesHeroTreatment
                    ? 'text-beige hover:border-beige/60'
                    : 'text-dark hover:border-dark/40'
                }`}
              >
                <NavLinkLabel
                  label="instagram"
                  active={isRolloverActive('instagram')}
                />
              </a>
            </li>
          </ul>

          <button
            ref={openerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
            onClick={() => setMenuOpen(true)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-sm px-1 text-[12px] font-[700] uppercase tracking-[0.14em] transition-[color,opacity] duration-300 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral motion-reduce:transition-none min-[992px]:hidden ${
              usesHeroTreatment ? 'text-beige' : 'text-dark'
            }`}
          >
            {t('menu')}
            <span
              aria-hidden="true"
              className={`h-3 w-3 transition-colors duration-300 motion-reduce:transition-none ${
                usesHeroTreatment ? 'bg-beige' : 'bg-coral'
              }`}
              style={{
                maskImage: 'url(/dot.svg)',
                WebkitMaskImage: 'url(/dot.svg)',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
              }}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence
        initial={false}
        onExitComplete={() => openerRef.current?.focus({ preventScroll: true })}
      >
        {menuOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={t('menu')}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-x-0 top-0 z-[60] flex h-dvh flex-col bg-beige min-[992px]:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-coral/30 px-5">
              <Link
                href="/"
                aria-label="Kool Studio"
                onClick={() => setMenuOpen(false)}
                className="inline-flex shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral"
              >
                <Image src="/logo.svg" alt="" width={108} height={40} priority />
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 items-center rounded-sm px-1 text-[12px] font-[700] uppercase tracking-[0.14em] text-dark transition-opacity duration-200 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral motion-reduce:transition-none"
              >
                {t('close')}
              </button>
            </div>

            <nav
              aria-label={t('menu')}
              className="flex min-h-0 flex-1 items-center overflow-y-auto px-5 py-8"
            >
              <ul className="w-full border-y border-coral/30">
                {navLinks.map((link, index) => {
                  const active = isActive(link.href);

                  return (
                    <motion.li
                      key={link.key}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.28,
                        delay: shouldReduceMotion ? 0 : index * 0.04,
                      }}
                      className="border-b border-coral/30 last:border-b-0"
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`flex w-full items-center justify-between border-l-4 py-3 pl-4 pr-1 text-[clamp(2rem,10vw,3rem)] uppercase leading-none tracking-[-0.035em] text-dark transition-[border-color,opacity] duration-200 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-coral motion-reduce:transition-none ${
                          active ? 'border-coral font-[800]' : 'border-transparent font-[600]'
                        }`}
                      >
                        {t(link.key)}
                      </Link>
                    </motion.li>
                  );
                })}
                <motion.li
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.28,
                    delay: shouldReduceMotion ? 0 : navLinks.length * 0.04,
                  }}
                >
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full border-l-4 border-transparent py-3 pl-4 pr-1 text-[clamp(2rem,10vw,3rem)] font-[600] uppercase leading-none tracking-[-0.035em] text-dark transition-opacity duration-200 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-coral motion-reduce:transition-none"
                  >
                    instagram
                  </a>
                </motion.li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
