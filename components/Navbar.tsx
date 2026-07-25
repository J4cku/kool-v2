'use client';

import { useCallback, useState, useEffect, useRef, useSyncExternalStore } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useIdle } from '@/hooks/useIdle';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { INSTAGRAM_URL } from '@/lib/site';
import { featureFlagEnabled, subscribeFeatureFlags, track } from '@/lib/analytics';
import { emitDotImpact, planDotFlight } from '@/lib/dot-drop';

const navLinks = [
  { href: '/projekty' as const, key: 'projekty' },
  { href: '/studio' as const, key: 'studio' },
  { href: '/oferta' as const, key: 'oferta' },
  { href: '/kontakt' as const, key: 'kontakt' },
];

/* Idle dot drop — docs/superpowers/specs/2026-07-24-idle-dot-drop-design.md.
   The flight itself (fall, bounces, squash) is one tween off the physics in
   lib/dot-drop.ts; these cover the way back. */
const SETTLE_EASE = [0.22, 1, 0.36, 1] as const;
/* Still on the line before it heads back: returning the instant it settles
   reads as a rewind, the pause reads as the dot deciding to go home. */
const HOLD_DURATION = 0.18;
const RETURN_DURATION = 0.62;
const RETURN_OVERSHOOT = 4;
const ABORT_DURATION = 0.25;

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

  const dotRef = useRef<HTMLDivElement>(null);
  const dropWrapRef = useRef<HTMLDivElement>(null);
  const dropControls = useAnimationControls();
  const [dropping, setDropping] = useState(false);
  // One drop per page view; client-side navigation re-arms it
  const droppedRef = useRef(false);
  // Generation token, bumped on every start and every abort, so a sequence
  // that is no longer current stops at its next await instead of animating
  // the dot back into a position the user has moved on from
  const flightRef = useRef(0);
  const flyingRef = useRef(false);
  const impactTimersRef = useRef<number[]>([]);
  /* Launch gate, the same idiom BriefModal uses for 'brief-form': fail-closed
     on the 'dot-drop' PostHog flag, so no flag means no drop.
     The one deliberate exception is local development, where posthog is never
     initialised (instrumentation-client.ts no-ops without
     NEXT_PUBLIC_POSTHOG_KEY) and a purely fail-closed gate would make the
     easter egg impossible to see at all. NODE_ENV is inlined at build time
     into both the server and the client bundle, so the two snapshots below
     agree in every environment and hydration never sees a flip. */
  const dropEnabled = useSyncExternalStore(
    subscribeFeatureFlags,
    () => featureFlagEnabled('dot-drop') || process.env.NODE_ENV === 'development',
    () => process.env.NODE_ENV === 'development'
  );
  /* Gates the hook itself, not just the animation: with the flag off useIdle
     registers no input listeners and starts no timer. */
  const idle = useIdle(dropEnabled && !menuOpen && !reduceMotion);

  useEffect(() => {
    droppedRef.current = false;
  }, [pathname]);

  const clearImpactTimers = useCallback(() => {
    impactTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    impactTimersRef.current = [];
  }, []);

  useEffect(() => () => {
    // Nothing may resume (or emit an impact) after unmount
    flightRef.current += 1;
    clearImpactTimers();
  }, [clearImpactTimers]);

  const fly = useCallback(
    async (distance: number, impactX: number) => {
      const generation = flightRef.current + 1;
      flightRef.current = generation;
      flyingRef.current = true;
      const alive = () => flightRef.current === generation;

      const flight = planDotFlight(distance);

      // Cancelled rather than guarded on arrival: an abort, an unmount or a
      // fresh flight all clear them, and those are the only ways a contact
      // that is no longer going to happen can still be pending
      clearImpactTimers();
      impactTimersRef.current = flight.impacts.map((impact) =>
        window.setTimeout(
          () => emitDotImpact({ x: impactX, strength: impact.strength }),
          impact.time * 1000
        )
      );

      // One animation for the whole flight, with the bounce carried by the
      // easing function. Awaiting a leg per bounce resolves on one frame and
      // starts the next on a later one, so every seam dropped a frame — which
      // is what read as jank, not the curves themselves.
      await dropControls.start({
        y: [0, distance],
        scaleX: flight.scaleX,
        scaleY: flight.scaleY,
        transition: {
          y: { duration: flight.duration, ease: flight.ease },
          // Linear between samples is exact, not an approximation: the
          // deformation tracks speed, and speed is linear in time under
          // constant gravity
          scaleX: { duration: flight.duration, times: flight.times, ease: 'linear' },
          scaleY: { duration: flight.duration, times: flight.times, ease: 'linear' },
        },
      });
      if (!alive()) return;

      // The one remaining seam, and it sits in the hold — nothing is moving
      // across it, so it cannot show a hitch
      await dropControls.start({
        y: [distance, -RETURN_OVERSHOOT, 0],
        scaleX: 1,
        scaleY: 1,
        transition: {
          // Per property, because framer reads a value's transition instead
          // of merging it with the one it sits in — a shared delay here would
          // be silently dropped
          y: {
            delay: HOLD_DURATION,
            duration: RETURN_DURATION,
            times: [0, 0.82, 1],
            ease: SETTLE_EASE,
          },
          scaleX: { delay: HOLD_DURATION, duration: 0.2, ease: SETTLE_EASE },
          scaleY: { delay: HOLD_DURATION, duration: 0.2, ease: SETTLE_EASE },
        },
      });
      if (!alive()) return;

      flyingRef.current = false;
      setDropping(false);
    },
    [clearImpactTimers, dropControls]
  );

  useEffect(() => {
    if (idle && !menuOpen && !reduceMotion) {
      if (droppedRef.current) return;
      const dot = dotRef.current;
      const wrap = dropWrapRef.current;
      // Absent on 404 and design-system, where the gag silently no-ops
      const line = document.querySelector('[data-footer-line]');
      // Everything outside an open dialog is inert, so a gag sweeping past the
      // brief modal's translucent backdrop is unsolicited motion while the user
      // is mid-form. Deliberately left unarmed, so a later idle period on the
      // same page view can still fire it once the dialog is closed.
      const modal = document.querySelector('[aria-modal="true"]');
      if (!dot || !wrap || !line || modal) return;
      // Measured at fire time, never cached: both ends are position:fixed and
      // iOS Safari's collapsing bars move them without a scroll or resize we
      // could have listened for
      const dotRect = dot.getBoundingClientRect();
      const distance = line.getBoundingClientRect().top - dotRect.bottom;
      if (distance <= 0) return;

      // The squash has to pivot on the dot's own bottom edge, and the dot's
      // visual bottom is not the wrapper's: the mobile shrink inside it
      // (translateY(-10px) scale(0.8) about the top right, globals.css) lifts
      // the dot ~17px clear of the wrapper's own bottom and pulls it right.
      // Scaling about the wrapper's bottom-centre would move the dot by that
      // offset on every squash — punching it through the hairline and sliding
      // it sideways — so the pivot is measured in wrapper-local px instead.
      // Re-measured per fire because the shrink depends on scroll position.
      const wrapRect = wrap.getBoundingClientRect();
      const impactX = dotRect.left + dotRect.width / 2;
      wrap.style.transformOrigin =
        `${impactX - wrapRect.left}px ${dotRect.bottom - wrapRect.top}px`;

      droppedRef.current = true;
      setDropping(true);
      void fly(distance, impactX);
      return;
    }

    // Input arrived (or the menu opened) mid-flight: float the dot home
    if (!flyingRef.current) return;
    flyingRef.current = false;
    flightRef.current += 1;
    clearImpactTimers();
    void dropControls
      .start({
        y: 0,
        scaleX: 1,
        scaleY: 1,
        transition: { duration: ABORT_DURATION, ease: SETTLE_EASE },
      })
      .then(() => setDropping(false));
  }, [clearImpactTimers, dropControls, fly, idle, menuOpen, reduceMotion]);

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
              <Image src="/logo.svg" alt="kool studio" width={208} height={77} priority fetchPriority="high" />
            </span>
            {/* Mobile: scale tracks scroll position */}
            <motion.span
              className="block md:hidden origin-top-left will-change-transform nav-logo-shrink"
              style={{ scale: logoScale }}
            >
              <Image src="/logo.svg" alt="kool studio" width={208} height={77} priority fetchPriority="high" />
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

            {/* The single dot — always visible, toggles menu. The button
                itself never moves: the idle drop displaces only what is
                inside it, so the hit target, the focus ring and the a11y
                node all stay where the user last saw them and a tap on the
                dot's home position opens the menu even mid-flight. */}
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-[44px] h-[44px] flex items-center justify-end cursor-pointer hover:opacity-80 shrink-0"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {/* Idle drop layer. A wrapper of its own on purpose: the shrink
                  wrapper below belongs to the .nav-dot-shrink scroll timeline,
                  whose explicit from-keyframes exist to replace any inline
                  transform Framer writes there (globals.css). The squash pivot
                  is measured onto the dot's own bottom-centre when the drop
                  fires; the class is only the resting default. */}
              <motion.div
                ref={dropWrapRef}
                animate={dropControls}
                className={`shrink-0 origin-bottom ${dropping ? 'will-change-transform' : ''}`}
              >
                <motion.div
                  ref={dotRef}
                  className="w-[36px] h-[35px] shrink-0 origin-top-right will-change-transform nav-dot-shrink"
                  style={{ scale: dotScale, y: dotY }}
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      // Held still mid-flight — a falling dot must not jitter
                      x: reduceMotion || dropping ? 0 : [0, 0, -1.5, 1.5, -1, 1, 0, 0],
                    }}
                    transition={{
                      scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                      // Suppression needs a transition of its own: Framer
                      // reads delay/repeat off the per-value transition, so
                      // reusing the jitter's would hold x wherever the
                      // sequence caught it for the whole flight instead of
                      // returning it to the dot's resting column
                      x:
                        reduceMotion || dropping
                          ? { duration: 0.2, ease: SETTLE_EASE }
                          : {
                              duration: 0.6,
                              delay: 2,
                              repeat: Infinity,
                              repeatDelay: 3.4,
                              ease: 'easeInOut',
                            },
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
