'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import BriefForm from './BriefForm';
import { track } from '@/lib/analytics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { submitBrief } from '@/app/[locale]/kontakt/actions';
import {
  initialBriefState,
  type BriefFormState,
} from '@/app/[locale]/kontakt/brief-state';
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

function navigateBrowserToMailto(href: string) {
  window.location.href = href;
}

const FOCUSABLE_SELECTOR = [
  'a[href]', 'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      const style = window.getComputedStyle(element);
      return !element.hidden
        && element.getAttribute('aria-hidden') !== 'true'
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    },
  );
}

interface SuppressedState {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
}

function suppressOutside(dialog: HTMLElement): () => void {
  const seen = new Set<HTMLElement>();
  const states: SuppressedState[] = [];
  let node: HTMLElement = dialog;
  while (node.parentElement) {
    const parent = node.parentElement;
    for (const sibling of Array.from(parent.children)) {
      if (!(sibling instanceof HTMLElement)) continue;
      if (sibling === node || sibling.contains(dialog) || seen.has(sibling)) continue;
      seen.add(sibling);
      states.push({
        element: sibling,
        inert: sibling.inert,
        ariaHidden: sibling.getAttribute('aria-hidden'),
      });
      sibling.inert = true;
      sibling.setAttribute('aria-hidden', 'true');
    }
    node = parent;
    if (parent === document.body) break;
  }
  return () => {
    for (const state of states.reverse()) {
      state.element.inert = state.inert;
      if (state.ariaHidden === null) state.element.removeAttribute('aria-hidden');
      else state.element.setAttribute('aria-hidden', state.ariaHidden);
    }
  };
}

export default function BriefModal({ navigateToMailto }: BriefModalProps = {}) {
  const t = useTranslations('brief');
  const reduceMotion = useReducedMotion();
  const locale = useLocale();
  const language: InquiryLanguage = locale === 'en' ? 'en' : 'pl';
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<InquiryDraft>(() => createInquiryDraft(language));
  const [renderedAt, setRenderedAt] = useState<number | null>(null);
  const [dismissedSuccessAt, setDismissedSuccessAt] = useState<number | null>(null);
  const [state, formAction, isPending] = useActionState<BriefFormState, FormData>(
    submitBrief,
    initialBriefState,
  );
  const startedRef = useRef(false);
  const handledResponseRef = useRef<number | null>(null);
  const actionStateRef = useRef(state);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pendingRestoreRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    actionStateRef.current = state;
    if (state.submittedAt === undefined || handledResponseRef.current === state.submittedAt) return;
    handledResponseRef.current = state.submittedAt;
    if (state.status === 'success') {
      track('contact_form_submitted');
      queueMicrotask(resetAfterDelivery);
    } else if (state.status === 'fallback' && state.fallback) {
      track('contact_form_mailto_fallback');
      const openMailClient = navigateToMailto ?? navigateBrowserToMailto;
      openMailClient(state.fallback.mailtoHref);
    }
  }, [state, resetAfterDelivery, navigateToMailto]);

  const close = useCallback(() => {
    const currentState = actionStateRef.current;
    if (currentState.status === 'success' && currentState.submittedAt !== undefined) {
      setDismissedSuccessAt(currentState.submittedAt);
    }
    pendingRestoreRef.current = triggerRef.current;
    setOpen(false);
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
    if (open || !pendingRestoreRef.current) return;
    const target = pendingRestoreRef.current;
    pendingRestoreRef.current = null;
    const timeout = window.setTimeout(() => target.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    closeRef.current?.focus();
    const restoreOutside = suppressOutside(dialog);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const available = focusables(dialog);
      if (!available.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = available[0];
      const last = available[available.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const activeIndex = active ? available.indexOf(active) : -1;
      if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeIndex === -1 || activeIndex === available.length - 1)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
      restoreOutside();
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

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('heading')}
              tabIndex={-1}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="ph-no-capture fixed inset-0 z-50 flex items-stretch justify-center bg-dark/40 backdrop-blur-sm md:items-center md:p-6"
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
                  state={
                    state.status === 'success'
                      && dismissedSuccessAt === state.submittedAt
                      ? initialBriefState
                      : state
                  }
                  formAction={formAction}
                  isPending={isPending}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
