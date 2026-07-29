'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import PrzelotCanvas from './PrzelotCanvas';

export type PrzelotItem = {
  slug: string;
  title: string;
  location: string;
  thumbnail: string;
};

/* Capability gate, inverted: the server renders the tunnel shell (dark
   ground, canvas, pill, sr-only list — no images), so capable visitors never
   flash the fallback grid or fetch its thumbnails. PrzelotCanvas re-checks
   matchMedia and getContext('webgl2') itself before paying for anything and
   calls onFail, which is what swaps the grid in for reduced-motion and
   no-WebGL2 visitors — an unmounted-context canvas costs nothing. The trade,
   accepted: a no-JS visitor keeps the dark shell instead of the grid. */
export default function PrzelotMount({
  items,
  fallback,
  hiddenList,
}: {
  items: PrzelotItem[];
  fallback: ReactNode;
  hiddenList: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const handleFail = useCallback(() => setFailed(true), []);

  if (reduceMotion || failed) return <>{fallback}</>;

  return (
    <>
      {hiddenList}
      <PrzelotCanvas items={items} onFail={handleFail} />
    </>
  );
}
