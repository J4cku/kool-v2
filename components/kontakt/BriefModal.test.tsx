import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

it('preserves draft, timestamp, and started identity across close/reopen', () => {
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

it('focuses the close button initially', async () => {
  render(<BriefModal />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  await waitFor(() => expect(document.activeElement)
    .toBe(screen.getByRole('button', { name: /close/ })));
});

it('wraps Tab from the last form control to close', () => {
  render(<BriefModal />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  const last = screen.getByRole('button', { name: 'probe-submit' });
  last.focus();
  fireEvent.keyDown(window, { key: 'Tab' });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/ }));
});

it('wraps Shift-Tab from close to the last form control', () => {
  render(<BriefModal />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  const closeButton = screen.getByRole('button', { name: /close/ });
  closeButton.focus();
  fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'probe-submit' }));
});

it('moves Tab from every programmatic result panel to the first sequential control', () => {
  for (const mode of ['success', 'error', 'fallback'] as const) {
    const view = render(<BriefModal />);
    fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
    formProbe.mode = mode;
    view.rerender(<BriefModal />);
    const panel = screen.getByTestId(`probe-${mode}`);
    panel.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/ }));
    view.unmount();
  }
});

it('moves Shift-Tab from every programmatic result panel to its last sequential control', () => {
  for (const mode of ['success', 'error', 'fallback'] as const) {
    const view = render(<BriefModal />);
    fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
    formProbe.mode = mode;
    view.rerender(<BriefModal />);
    const panel = screen.getByTestId(`probe-${mode}`);
    panel.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('link', { name: `${mode}-link` }));
    view.unmount();
  }
});

it('closes by Escape and by the backdrop itself', async () => {
  render(<BriefModal />);
  const opener = screen.getByRole('button', { name: /openCta/ });
  fireEvent.click(opener);
  fireEvent.keyDown(window, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(opener);
  const dialog = screen.getByRole('dialog');
  fireEvent.mouseDown(dialog);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('restores exact background state before restoring opener focus', async () => {
  const background = document.createElement('main');
  background.inert = false;
  background.setAttribute('aria-hidden', 'false');
  document.body.appendChild(background);
  render(<BriefModal />);
  const opener = screen.getByRole('button', { name: /openCta/ });
  fireEvent.click(opener);
  expect(background.inert).toBe(true);
  expect(background.getAttribute('aria-hidden')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: /close/ }));
  await waitFor(() => expect(document.activeElement).toBe(opener));
  expect(background.inert).toBe(false);
  expect(background.getAttribute('aria-hidden')).toBe('false');
  background.remove();
});

it('restores pre-existing inert, absent aria-hidden, and overflow on unmount', () => {
  const background = document.createElement('aside');
  background.inert = true;
  document.body.appendChild(background);
  document.documentElement.style.overflow = 'clip';
  const view = render(<BriefModal />);
  fireEvent.click(screen.getByRole('button', { name: /openCta/ }));
  expect(document.documentElement.style.overflow).toBe('hidden');
  expect(background.getAttribute('aria-hidden')).toBe('true');
  view.unmount();
  expect(background.inert).toBe(true);
  expect(background.hasAttribute('aria-hidden')).toBe(false);
  expect(document.documentElement.style.overflow).toBe('clip');
  background.remove();
});
