import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import BriefModal from '@/components/kontakt/BriefModal';
import type { BriefFormState } from '@/app/[locale]/kontakt/brief-state';
import { prepareProjectInquiry } from '@/lib/webmcp/inquiry-preparation';

const submitBriefMock = vi.hoisted(() => vi.fn());
const trackMock = vi.hoisted(() => vi.fn());
const navigationMock = vi.hoisted(() => vi.fn());

vi.mock('@/app/[locale]/kontakt/actions', () => ({ submitBrief: submitBriefMock }));
vi.mock('@/lib/analytics', () => ({ track: trackMock }));
vi.mock('next-intl', () => ({
  useLocale: () => 'pl',
  useTranslations: () => (key: string) => key,
}));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));

const motionTags = vi.hoisted(() => new Map<string, ComponentType<Record<string, unknown>>>());
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: new Proxy({}, {
    get: (_target, tag) => {
      const name = String(tag);
      if (!motionTags.has(name)) {
        const Motion = ({ children, ...props }:
          ComponentProps<'div'> & Record<string, unknown>) => {
          const domProps = { ...props };
          delete domProps.initial;
          delete domProps.animate;
          delete domProps.exit;
          delete domProps.transition;
          delete domProps.whileInView;
          delete domProps.viewport;
          return createElement(name, domProps, children);
        };
        motionTags.set(name, Motion);
      }
      return motionTags.get(name);
    },
  }),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

function openAndSubmit() {
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  fireEvent.change(document.getElementById('brief-name')!, { target: { value: 'Ola' } });
  fireEvent.submit(document.getElementById('brief-form')!);
}

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000);
});

afterEach(() => {
  cleanup();
  submitBriefMock.mockReset();
  trackMock.mockReset();
  navigationMock.mockReset();
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/pl/kontakt');
  document.documentElement.style.overflow = '';
});

it('handles a successful action once after close and reopens its terminal result', async () => {
  const response = deferred<BriefFormState>();
  submitBriefMock.mockReturnValue(response.promise);
  render(<BriefModal navigateToMailto={navigationMock} />);

  openAndSubmit();
  await waitFor(() => expect(
    (document.getElementById('brief-submit') as HTMLButtonElement).disabled,
  ).toBe(true));
  expect(submitBriefMock).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: /close/ }));

  await act(async () => {
    response.resolve({ status: 'success', submittedAt: 101 });
    await response.promise;
  });
  await waitFor(() => {
    expect(trackMock.mock.calls.filter(([event]) => event === 'contact_form_submitted'))
      .toHaveLength(1);
  });

  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect(screen.getByText('status.successTitle')).toBeTruthy();
  expect(document.getElementById('brief-form')).toBeNull();
  expect(submitBriefMock).toHaveBeenCalledTimes(1);
  expect(navigationMock).not.toHaveBeenCalled();
});

it('reopens a blank form after closing a confirmed success', async () => {
  submitBriefMock.mockResolvedValue({ status: 'success', submittedAt: 103 });
  render(<BriefModal navigateToMailto={navigationMock} />);

  openAndSubmit();
  await screen.findByText('status.successTitle');
  fireEvent.click(screen.getByRole('button', { name: /close/ }));
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));

  expect(document.getElementById('brief-form')).toBeTruthy();
  expect((document.getElementById('brief-name') as HTMLInputElement).value).toBe('');
  expect(trackMock.mock.calls.filter(([event]) => event === 'contact_form_submitted'))
    .toEqual([['contact_form_submitted']]);
  expect(navigationMock).not.toHaveBeenCalled();
});

it('prepares the blank draft after its successful result has been dismissed', async () => {
  submitBriefMock.mockResolvedValue({ status: 'success', submittedAt: 104 });
  render(<BriefModal navigateToMailto={navigationMock} />);

  openAndSubmit();
  await screen.findByText('status.successTitle');
  fireEvent.click(screen.getByRole('button', { name: /close/ }));
  trackMock.mockClear();

  let result: ReturnType<typeof prepareProjectInquiry> | undefined;
  act(() => {
    result = prepareProjectInquiry({ name: 'Nowa Ola' }, 'pl');
  });

  expect(result).toMatchObject({
    status: 'prepared',
    missingRecommendedFields: [
      'email',
      'projectType',
      'location',
      'propertyStage',
      'area',
      'desiredScope',
      'designStart',
      'constructionStart',
      'budget',
      'requirements',
    ],
    submitted: false,
    opened: true,
  });
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(document.getElementById('brief-form')).toBeTruthy();
  expect((document.getElementById('brief-name') as HTMLInputElement).value).toBe('Nowa Ola');
  expect(submitBriefMock).toHaveBeenCalledTimes(1);
  expect(navigationMock).not.toHaveBeenCalled();
  expect(trackMock.mock.calls).toEqual([['contact_form_opened']]);
  expect(trackMock.mock.calls.some(([event]) => event === 'contact_form_started')).toBe(false);
});

it('navigates a deferred fallback once and preserves its manual link on reopen', async () => {
  const response = deferred<BriefFormState>();
  const mailtoHref = 'mailto:hello@koolstudio.pl?subject=Brief';
  submitBriefMock.mockReturnValue(response.promise);
  render(<BriefModal navigateToMailto={navigationMock} />);

  openAndSubmit();
  await waitFor(() => expect(
    (document.getElementById('brief-submit') as HTMLButtonElement).disabled,
  ).toBe(true));
  fireEvent.click(screen.getByRole('button', { name: /close/ }));

  await act(async () => {
    response.resolve({
      status: 'fallback',
      fallback: { reason: 'unconfigured', mailtoHref },
      submittedAt: 102,
    });
    await response.promise;
  });
  await waitFor(() => expect(navigationMock).toHaveBeenCalledWith(mailtoHref));
  expect(navigationMock).toHaveBeenCalledTimes(1);
  expect(trackMock.mock.calls.filter(([event]) => event === 'contact_form_mailto_fallback'))
    .toHaveLength(1);

  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect(screen.getByRole('link', { name: /status.fallbackButton/ }).getAttribute('href'))
    .toBe(mailtoHref);
  expect(document.getElementById('brief-form')).toBeNull();
  expect(navigationMock).toHaveBeenCalledTimes(1);
});
