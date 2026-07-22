'use client';

import { useId, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { ServiceFaq } from '@/data/services';

interface FaqAccordionProps {
  items: ServiceFaq[];
}

// FAQ link: an on-page anchor ('#zakres') renders as a plain <a> so it isn't
// locale-prefixed; a route ('/kontakt', '/projekty/<slug>') uses the
// locale-aware Link.
function FaqLink({ link }: { link: ServiceFaq['link'] }) {
  const className =
    'inline-flex items-center gap-1 text-coral font-[600] uppercase tracking-[0.06em] hover:opacity-60 transition-opacity';
  if (link.href.startsWith('#')) {
    return (
      <a href={link.href} className={className}>
        {link.label} <span aria-hidden="true">→</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label} <span aria-hidden="true">→</span>
    </Link>
  );
}

// Accessible disclosure list: each question is a real <button> carrying
// aria-expanded + aria-controls, keyboard-operable natively. The answer panel
// is always rendered in the HTML (crawlable) and toggled with the `hidden`
// attribute — collapsed content stays in the server markup but leaves the
// accessibility tree. No conditional mounting.
export default function FaqAccordion({ items }: FaqAccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div className="border-t border-dark/15">
      {items.map((item, i) => {
        const isOpen = Boolean(open[i]);
        const buttonId = `${baseId}-faq-${i}-button`;
        const panelId = `${baseId}-faq-${i}-panel`;
        return (
          <div key={i} className="border-b border-dark/15">
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                className="flex w-full items-center justify-between gap-6 py-6 md:py-7 text-left group"
              >
                <span
                  className="font-[600] text-dark uppercase leading-[1.25]"
                  style={{ fontSize: 'clamp(16px, 1.8vw, 24px)' }}
                >
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-coral text-[26px] md:text-[30px] leading-none font-[300] transition-transform duration-300"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-7 md:pb-9 pr-8 md:pr-16"
            >
              <p
                className="text-dark/80 font-[400] leading-[1.55] max-w-[900px] mb-5"
                style={{ fontSize: 'clamp(15px, 1.4vw, 19px)' }}
              >
                {item.a}
              </p>
              <FaqLink link={item.link} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
