import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement, useState, type ComponentProps, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BriefForm from '@/components/kontakt/BriefForm';
import { initialBriefState, type BriefFormState } from '@/app/[locale]/kontakt/brief-state';
import {
  applyInquiryDraftPatch,
  createInquiryDraft,
  type InquiryDraft,
  type InquiryLanguage,
  type NormalizedBrief,
} from '@/lib/brief';
import enMessages from '@/messages/en.json';
import plMessages from '@/messages/pl.json';

const localeState = vi.hoisted(() => ({ locale: 'pl' as InquiryLanguage }));
const actionHarness = vi.hoisted(() => ({
  state: { status: 'idle' } as BriefFormState,
  formAction: vi.fn(),
  pending: false,
}));
const onStarted = vi.fn();

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const domProps = { ...props };
      delete domProps.initial;
      delete domProps.whileInView;
      delete domProps.viewport;
      delete domProps.transition;
      return createElement('div', domProps, children as ReactNode);
    },
  },
}));

vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => false }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: ComponentProps<'a'>) => (
    <a href={`/${localeState.locale}${String(href)}`} {...props}>{children}</a>
  ),
}));

const completeDraft: InquiryDraft = {
  name: 'Ola Testowa',
  email: 'ola@example.com',
  phone: '+48 600 700 800',
  projectType: 'mieszkanie',
  location: 'Wrocław',
  propertyStage: 'po-odbiorze',
  area: 'ok. 85 m²',
  desiredScope: ['uklad-funkcjonalny', 'nadzor-autorski'],
  designStart: 'Q4 2026',
  constructionStart: 'Q2 2027',
  budget: '180–220 tys. zł',
  requirements: 'Ciche miejsce do pracy.',
  plansUrl: 'https://drive.example.com/folder',
  language: 'pl',
};
const normalizedComplete: NormalizedBrief = { ...completeDraft };

function Harness({ initial = createInquiryDraft(localeState.locale) }: { initial?: InquiryDraft }) {
  const [draft, setDraft] = useState(initial);
  return (
    <NextIntlClientProvider
      locale={localeState.locale}
      messages={localeState.locale === 'en' ? enMessages : plMessages}
    >
      <BriefForm
        draft={draft}
        renderedAt={1_799_999_990_000}
        onDraftPatch={(patch) => setDraft((current) => {
          const result = applyInquiryDraftPatch(current, patch);
          return result.ok ? result.draft : current;
        })}
        onStarted={onStarted}
        state={actionHarness.state}
        formAction={actionHarness.formAction}
        isPending={actionHarness.pending}
      />
    </NextIntlClientProvider>
  );
}

afterEach(() => {
  cleanup();
  actionHarness.state = initialBriefState;
  actionHarness.pending = false;
  actionHarness.formAction.mockReset();
  onStarted.mockReset();
  localeState.locale = 'pl';
});

describe('BriefForm', () => {
  it('serializes canonical enquiry fields in order with language last', () => {
    const { container } = render(<Harness />);
    const form = container.querySelector('form');
    const scope = form?.querySelector<HTMLInputElement>('input[name="desiredScope"]');
    if (!form || !scope) throw new Error('Brief form controls were not rendered');

    fireEvent.click(scope);

    const canonicalKeys = Array.from(new FormData(form).keys()).filter(
      (key) => key !== 'company' && key !== 'ts',
    );
    expect(canonicalKeys).toEqual([
      'name', 'email', 'phone', 'projectType', 'location', 'propertyStage', 'area',
      'desiredScope', 'designStart', 'constructionStart', 'budget', 'requirements',
      'plansUrl', 'language',
    ]);
  });

  it('renders only three required controls and canonical Polish attributes', () => {
    render(<Harness />);
    expect(Array.from(document.querySelectorAll('[aria-required="true"]')).map(
      (element) => element.getAttribute('name'),
    )).toEqual(['name', 'email', 'projectType']);
    const phone = screen.getByLabelText('Telefon (opcjonalnie)') as HTMLInputElement;
    expect(phone.type).toBe('tel');
    expect(phone.autocomplete).toBe('tel');
    expect((screen.getByLabelText('Przybliżona powierzchnia (m²)') as HTMLInputElement).inputMode)
      .toBe('decimal');
  });

  it('edits without submission and submits only from the visible form', async () => {
    const view = render(<Harness initial={completeDraft} />);
    fireEvent.change(screen.getByLabelText('Lokalizacja'), { target: { value: 'Poznań' } });
    fireEvent.change(screen.getByLabelText('Etap nieruchomości'), { target: { value: 'remont' } });
    expect(actionHarness.formAction).not.toHaveBeenCalled();
    expect(view.container.querySelectorAll('form')).toHaveLength(1);
    fireEvent.submit(view.container.querySelector('form')!);
    await waitFor(() => expect(actionHarness.formAction).toHaveBeenCalledOnce());
  });

  it('controls desiredScope checkbox toggles and clears the complete array', () => {
    render(<Harness />);
    const layout = screen.getByLabelText('układ funkcjonalny') as HTMLInputElement;
    const supervision = screen.getByLabelText('nadzór autorski') as HTMLInputElement;
    fireEvent.click(supervision);
    fireEvent.click(layout);
    expect(layout.checked).toBe(true);
    expect(supervision.checked).toBe(true);
    fireEvent.click(layout);
    expect(layout.checked).toBe(false);
    expect(supervision.checked).toBe(true);
    fireEvent.click(supervision);
    expect(layout.checked).toBe(false);
    expect(supervision.checked).toBe(false);
    expect(actionHarness.formAction).not.toHaveBeenCalled();
  });

  it.each([
    ['pl', 'Telefon (opcjonalnie)', 'Pożądany start projektu', 'Planowany start realizacji', '/pl/polityka-prywatnosci'],
    ['en', 'Phone (optional)', 'Desired design start', 'Planned construction start', '/en/polityka-prywatnosci'],
  ] as const)('renders exact %s labels and localized privacy link', (
    locale, phone, design, construction, href,
  ) => {
    localeState.locale = locale;
    render(<Harness initial={{ ...completeDraft, language: locale }} />);
    expect(screen.getByLabelText(phone)).toBeTruthy();
    expect(screen.getByLabelText(design)).toBeTruthy();
    expect(screen.getByLabelText(construction)).toBeTruthy();
    const linkName = locale === 'pl' ? 'polityce prywatności' : 'privacy policy';
    expect(screen.getByRole('link', { name: linkName }).getAttribute('href')).toBe(href);
  });

  it('makes desiredScope focusable only while its tampered error is active', async () => {
    const view = render(<Harness />);
    const group = document.getElementById('brief-desiredScope')!;
    expect(group.hasAttribute('tabindex')).toBe(false);

    actionHarness.state = {
      status: 'invalid', errors: { desiredScope: 'option' }, submittedAt: 1,
    };
    view.rerender(<Harness />);
    await waitFor(() => expect(document.activeElement).toBe(group));
    expect(group.getAttribute('tabindex')).toBe('-1');
    expect(group.getAttribute('aria-describedby')).toContain('brief-desiredScope-error');

    actionHarness.state = initialBriefState;
    view.rerender(<Harness />);
    expect(group.hasAttribute('tabindex')).toBe(false);
  });

  it('focuses the invalid summary when hidden language is the first error', async () => {
    actionHarness.state = {
      status: 'invalid', errors: { language: 'option' }, submittedAt: 2,
    };
    render(<Harness />);
    const summary = screen.getByText('Popraw zaznaczone pola i wyślij ponownie.');
    await waitFor(() => expect(document.activeElement).toBe(summary));
  });

  it('uses actual localized pending and generic messages', async () => {
    actionHarness.pending = true;
    const pending = render(<Harness />);
    expect(screen.getByText('Wysyłanie briefu…')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Wysyłanie…' }) as HTMLButtonElement).disabled)
      .toBe(true);
    pending.unmount();

    actionHarness.pending = false;
    actionHarness.state = { status: 'error', formError: 'generic', submittedAt: 3 };
    render(<Harness />);
    const generic = screen.getByText(
      'Nie udało się wysłać formularza. Spróbuj ponownie za chwilę lub napisz bezpośrednio na hello@koolstudio.pl.',
    );
    await waitFor(() => expect(document.activeElement).toBe(generic));
  });

  it('shows localized language label and value in the success summary', async () => {
    actionHarness.state = {
      status: 'success', submitted: normalizedComplete, submittedAt: 4,
    };
    render(<Harness initial={completeDraft} />);
    expect(Array.from(document.querySelectorAll('dt')).map((term) => term.textContent)).toEqual([
      'Imię', 'E-mail', 'Telefon (opcjonalnie)', 'Typ projektu', 'Lokalizacja',
      'Etap nieruchomości', 'Przybliżona powierzchnia (m²)', 'Oczekiwany zakres',
      'Pożądany start projektu', 'Planowany start realizacji',
      'Przybliżony budżet realizacji (opcjonalnie)', 'Wymagania i priorytety',
      'Link do rzutów lub zdjęć', 'Język korespondencji',
    ]);
    expect(await screen.findByText('Język korespondencji')).toBeTruthy();
    expect(screen.getByText('polski')).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('status')));
  });

  it('shows actual fallback copy and its manual mailto link', async () => {
    const href = 'mailto:hello@koolstudio.pl?subject=Brief%20projektowy';
    actionHarness.state = {
      status: 'fallback',
      submitted: normalizedComplete,
      fallback: { reason: 'unconfigured', mailtoHref: href },
      submittedAt: 5,
    };
    render(<Harness initial={completeDraft} />);
    expect(screen.getByText(
      'Otworzy się Twój program pocztowy z gotowym briefem — wyślij wiadomość, aby dokończyć zgłoszenie.',
    )).toBeTruthy();
    expect((await screen.findByRole('link', { name: 'Otwórz program pocztowy' }))
      .getAttribute('href')).toBe(href);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('status')));
  });
});
