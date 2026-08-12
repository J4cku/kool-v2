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

/* Both layers are always in the server HTML, and CSS — not JavaScript —
   decides which one a visitor sees first.

   This resolves a genuine tension. Rendering only the grid on the server made
   capable visitors paint the fallback and start fetching its thumbnails
   before hydration swapped in the tunnel. Rendering only the tunnel left
   reduced-motion visitors, and anyone without JS, staring at a blank
   13,650px shell with the photographs nowhere in the document.

   Shipping both and gating with `display: none` gets both properties: the
   grid is present for reduced-motion and no-JS visitors at first paint with
   no script involved, and a display:none container never fetches its lazy
   images, so capable visitors pay nothing for it. The runtime WebGL2 failure
   path is the only case that still needs state. */
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

  return (
    <div className={failed ? 'przelot-root przelot-failed' : 'przelot-root'}>
      <div className="przelot-stage">
        {hiddenList}
        {reduceMotion || failed ? null : (
          <PrzelotCanvas items={items} onFail={handleFail} />
        )}
      </div>
      <div className="przelot-grid">{fallback}</div>
    </div>
  );
}
