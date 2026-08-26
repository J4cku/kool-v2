import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import BriefModal from '@/components/kontakt/BriefModal';
import type { BriefFormProps } from '@/components/kontakt/BriefForm';
import { validateBrief } from '@/lib/brief';

const trackMock = vi.hoisted(() => vi.fn());
type ProbeMode = 'form' | 'success' | 'error' | 'fallback';
const formProbe = vi.hoisted(() => ({
  props: null as BriefFormProps | null,
  mode: 'form' as ProbeMode,
  submittedTimestamp: null as number | null,
}));
const navigationMock = vi.hoisted(() => vi.fn());
const NOW = 1_800_000_000_000;

vi.mock('next-intl', () => ({
  useLocale: () => 'pl',
  useTranslations: () => (key: string) => key,
}));
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));
vi.mock('@/lib/analytics', () => ({ track: trackMock }));
vi.mock('@/components/kontakt/BriefForm', () => ({
  default: (props: BriefFormProps) => {
    formProbe.props = props;
    if (formProbe.mode !== 'form') {
      return (
        <section>
          <div tabIndex={-1} data-testid={`probe-${formProbe.mode}`}>
            {`probe-${formProbe.mode}`}
          </div>
          <a href={`#${formProbe.mode}`}>{`${formProbe.mode}-link`}</a>
        </section>
      );
    }
    return (
      <form
        id="brief-form"
        onSubmit={(event) => {
          event.preventDefault();
          formProbe.submittedTimestamp = props.renderedAt;
        }}
      >
        <input
          aria-label="probe-name"
          value={props.draft.name}
          onFocus={props.onStarted}
          onChange={(event) => props.onDraftPatch({ name: event.target.value })}
        />
        <input name="ts" type="hidden" value={props.renderedAt ?? ''} />
        <button type="button" onClick={props.onDelivered}>probe-success</button>
        <button type="submit">probe-submit</button>
      </form>
    );
  },
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
          return createElement(name, domProps, children);
        };
        motionTags.set(name, Motion);
      }
      return motionTags.get(name);
    },
  }),
}));

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW);
});
afterEach(() => {
  cleanup();
  formProbe.props = null;
  formProbe.mode = 'form';
  formProbe.submittedTimestamp = null;
  trackMock.mockReset();
  navigationMock.mockReset();
  vi.restoreAllMocks();
  vi.useRealTimers();
  window.history.replaceState(null, '', '/pl/kontakt');
  document.documentElement.style.overflow = '';
});

it('renders the always-on CTA and tracks an argument-free open', () => {
  render(<BriefModal navigateToMailto={navigationMock} />);
  const opener = screen.getByRole('button', { name: /openCta/ });
  expect(opener).toBeTruthy();
  expect(navigationMock).not.toHaveBeenCalled();
  fireEvent.click(opener);
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(trackMock).toHaveBeenCalledWith('contact_form_opened');
  expect(trackMock.mock.calls.every((call) => call.length === 1)).toBe(true);
  expect(navigationMock).not.toHaveBeenCalled();
});

it('opens from #brief after the effect schedules its timer', () => {
  vi.useFakeTimers();
  window.history.replaceState(null, '', '/pl/kontakt#brief');
  render(<BriefModal />);
  act(() => vi.runAllTimers());
  expect(screen.getByRole('dialog')).toBeTruthy();
});

it('preserves draft and timestamp across close/reopen, then resets only on success', () => {
  render(<BriefModal navigateToMailto={navigationMock} />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect(navigationMock).not.toHaveBeenCalled();
  const name = screen.getByLabelText('probe-name');
  fireEvent.focus(name);
  fireEvent.change(name, { target: { value: 'Ola' } });
  fireEvent.focus(name);
  expect(trackMock.mock.calls.filter(([event]) => event === 'contact_form_started')).toHaveLength(1);
  expect(navigationMock).not.toHaveBeenCalled();
  const timestamp = (document.querySelector('[name="ts"]') as HTMLInputElement).value;
  fireEvent.click(screen.getByRole('button', { name: /close/ }));
  expect(navigationMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect((screen.getByLabelText('probe-name') as HTMLInputElement).value).toBe('Ola');
  expect((document.querySelector('[name="ts"]') as HTMLInputElement).value).toBe(timestamp);
  fireEvent.focus(screen.getByLabelText('probe-name'));
  expect(trackMock.mock.calls.filter(([event]) => event === 'contact_form_started')).toHaveLength(1);
  expect(navigationMock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'probe-success' }));
  expect(formProbe.props?.draft.name).toBe('');
  expect(formProbe.props?.renderedAt).toBeNull();
  expect(navigationMock).not.toHaveBeenCalled();
});

it('starts with a blank draft after a hard component remount', () => {
  const first = render(<BriefModal navigateToMailto={navigationMock} />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  fireEvent.change(screen.getByLabelText('probe-name'), { target: { value: 'Ola' } });
  expect((screen.getByLabelText('probe-name') as HTMLInputElement).value).toBe('Ola');
  first.unmount();
  render(<BriefModal navigateToMailto={navigationMock} />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect((screen.getByLabelText('probe-name') as HTMLInputElement).value).toBe('');
  expect(navigationMock).not.toHaveBeenCalled();
});

it('uses the original timestamp for an immediate submit after close/reopen', () => {
  vi.mocked(Date.now).mockReturnValue(NOW - 10_000);
  render(<BriefModal navigateToMailto={navigationMock} />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  const originalTimestamp = Number(
    (document.querySelector('[name="ts"]') as HTMLInputElement).value,
  );
  fireEvent.click(screen.getByRole('button', { name: /close/ }));
  vi.mocked(Date.now).mockReturnValue(NOW);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  fireEvent.submit(document.getElementById('brief-form')!);
  expect(formProbe.submittedTimestamp).toBe(originalTimestamp);
  const result = validateBrief({
    name: 'A', email: 'a@b.co', projectType: 'inne', language: 'pl',
    company: '', ts: String(formProbe.submittedTimestamp),
  }, NOW);
  expect(result.spam).toBe(false);
  expect(navigationMock).not.toHaveBeenCalled();
});
