'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from '@/i18n/navigation';
import { shouldShowRouteCurtains } from '@/lib/portfolio-motion';
import { usePrefersReducedMotion } from '@/lib/reduced-motion';

type RouteTransitionState = {
  pathname: string | null;
  curtainPathname: string | null;
};

const CURTAIN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const [routeState, setRouteState] = useState<RouteTransitionState>({
    pathname: null,
    curtainPathname: null,
  });

  if (routeState.pathname !== pathname) {
    setRouteState({
      pathname,
      curtainPathname: shouldShowRouteCurtains(
        routeState.pathname,
        pathname,
        reducedMotion,
      )
        ? pathname
        : null,
    });
  } else if (reducedMotion && routeState.curtainPathname !== null) {
    setRouteState({ pathname, curtainPathname: null });
  }

  const curtainPathname = reducedMotion ? null : routeState.curtainPathname;
  const finishCurtain = () => {
    setRouteState((current) => current.curtainPathname === curtainPathname
      ? { ...current, curtainPathname: null }
      : current);
  };

  return (
    <>
      {children}

      <AnimatePresence initial={false}>
        {curtainPathname
          ? [
            <motion.div
              key={`${curtainPathname}:left`}
              aria-hidden="true"
              className="pointer-events-none fixed inset-y-0 left-0 z-[90] w-1/2 border-r border-coral bg-dark"
              initial={{ x: '0%' }}
              animate={{ x: '-100%' }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 1, ease: CURTAIN_EASE }}
            />,
            <motion.div
              key={`${curtainPathname}:right`}
              aria-hidden="true"
              className="pointer-events-none fixed inset-y-0 right-0 z-[90] w-1/2 bg-dark"
              initial={{ x: '0%' }}
              animate={{ x: '100%' }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 1, ease: CURTAIN_EASE }}
              onAnimationComplete={finishCurtain}
            />,
          ]
          : null}
      </AnimatePresence>
    </>
  );
}
