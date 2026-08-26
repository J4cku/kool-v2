'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import BriefForm from './BriefForm';
import { track } from '@/lib/analytics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  applyInquiryDraftPatch,
  createInquiryDraft,
  type InquiryDraft,
  type InquiryDraftPatch,
  type InquiryLanguage,
} from '@/lib/brief';

/* Trigger button + modal shell for the project-brief form on the kontakt
   page. This page-scoped owner preserves the controlled draft across dialog
   close/reopen. The dialog stays closable via the × button, Escape, or a
   backdrop click, and #brief keeps the form deep-linkable. */
export interface BriefModalProps {
  navigateToMailto?: (href: string) => void;
}

export default function BriefModal({ navigateToMailto }: BriefModalProps = {}) {
  const t = useTranslations('brief');
  const reduceMotion = useReducedMotion();
  const locale = useLocale();
  const language: InquiryLanguage = locale === 'en' ? 'en' : 'pl';
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<InquiryDraft>(() => createInquiryDraft(language));
  const [renderedAt, setRenderedAt] = useState<number | null>(null);
  const startedRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const patchDraft = useCallback((patch: InquiryDraftPatch) => {
    setDraft((current) => {
      const result = applyInquiryDraftPatch(current, patch);
      return result.ok ? result.draft : current;
    });
  }, []);
  const markStarted = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    track('contact_form_started');
  }, []);
  const resetAfterDelivery = useCallback(() => {
    setDraft(createInquiryDraft(language));
    setRenderedAt(null);
    startedRef.current = false;
  }, [language]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const show = useCallback(() => {
    setRenderedAt((current) => current ?? Date.now());
    setOpen(true);
    track('contact_form_opened');
  }, []);

  /* Deep link: /kontakt#brief opens the dialog (used from campaign links).
     Deferred to a task so the open state is set from a callback, not
     synchronously inside the effect body. */
  useEffect(() => {
    const id = setTimeout(() => {
      if (window.location.hash === '#brief') {
        show();
      }
    }, 0);
    return () => clearTimeout(id);
  }, [show]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    /* Scroll lock while the dialog is up. */
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={show}
        className="mt-6 flex min-h-11 items-center gap-2 text-[16px] md:text-[18px] font-[600] lowercase text-coral hover:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      >
        {t('openCta')}
        <span aria-hidden="true">→</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('heading')}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-stretch justify-center bg-dark/40 backdrop-blur-sm md:items-center md:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full overflow-y-auto bg-beige px-5 pb-14 pt-14 md:max-w-[860px] md:max-h-[88dvh] md:px-12 md:pb-16"
            >
              <button
                ref={closeRef}
                onClick={close}
                aria-label={t('close')}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-dark hover:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              </button>
              <BriefForm
                draft={draft}
                renderedAt={renderedAt}
                onDraftPatch={patchDraft}
                onStarted={markStarted}
                onDelivered={resetAfterDelivery}
                navigateToMailto={navigateToMailto}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
