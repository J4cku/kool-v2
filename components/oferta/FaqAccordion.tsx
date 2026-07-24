'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ul className="border-b border-dark/15">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <li key={i} className="border-t border-dark/15">
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => {
                if (!isOpen) {
                  track('faq_opened', { question: item.q, position: i + 1 });
                }
                setOpen(isOpen ? null : i);
              }}
              className="w-full flex items-baseline gap-4 md:gap-6 text-left py-4 md:py-5 group"
            >
              <span
                aria-hidden="true"
                className={`shrink-0 text-coral font-[400] leading-none transition-transform duration-300 ${
                  isOpen ? 'rotate-45' : ''
                }`}
                style={{ fontSize: 'clamp(20px, 1.8vw, 26px)' }}
              >
                +
              </span>
              <span
                className="font-[700] text-dark uppercase leading-[1.35] group-hover:opacity-60 transition-opacity"
                style={{ fontSize: 'clamp(15px, 1.6vw, 22px)' }}
              >
                {item.q}
              </span>
            </button>
            {/* The answer stays in the DOM at all times so it's in the server
                HTML (crawlable for search + LLMs); it collapses via a grid-rows
                0fr→1fr transition instead of mount/unmount. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p
                  className="text-dark/80 font-[400] leading-[1.5] max-w-[1080px] pb-6 pt-1 pl-8 md:pl-11"
                  style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
