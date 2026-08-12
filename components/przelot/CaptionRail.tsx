'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type CaptionItem = { slug: string; title: string; location: string };

/* The chrome over the tunnel: a coral progress hairline standing in for the
   hidden scrollbar, a scroll hint that retires after the first movement, and
   the portal pill — a real link, so Tab reaches it and screen readers
   announce it; the canvas behind is pure decoration. */
export default function CaptionRail({
  item,
  groundBeige,
  onCommit,
}: {
  item: CaptionItem;
  groundBeige: boolean;
  onCommit: (slug: string) => void;
}) {
  const t = useTranslations('przelot');
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => {
    if (y > 40) setScrolled(true);
  });

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-coral"
        style={{ scaleX: scrollYProgress }}
      />
      <p
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+84px)] text-center text-[11px] uppercase tracking-[0.2em] transition-opacity duration-700 ${
          groundBeige ? 'text-dark' : 'text-beige'
        } ${scrolled ? 'opacity-0' : 'opacity-60'}`}
      >
        {t('scrollHint')}
      </p>
      <div className="absolute inset-x-0 bottom-[max(24px,env(safe-area-inset-bottom))] flex justify-center">
        <Link
          href={`/projekty/${item.slug}`}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onCommit(item.slug);
          }}
          className="rounded-full bg-coral px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-dark"
        >
          {item.title}, {item.location}
          <span className="sr-only"> — {t('enter')}</span>
        </Link>
      </div>
    </>
  );
}
