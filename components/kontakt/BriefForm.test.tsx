import { cleanup, fireEvent, render } from '@testing-library/react';
import { createElement, useState, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BriefForm from '@/components/kontakt/BriefForm';
import { applyInquiryDraftPatch, createInquiryDraft } from '@/lib/brief';
import plMessages from '@/messages/pl.json';

vi.mock('framer-motion', async () => ({
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

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

afterEach(cleanup);

function BriefFormHarness() {
  const [draft, setDraft] = useState(() => createInquiryDraft('pl'));
  return (
    <BriefForm
      draft={draft}
      renderedAt={1_800_000_000_000}
      onDraftPatch={(patch) => setDraft((current) => {
        const result = applyInquiryDraftPatch(current, patch);
        return result.ok ? result.draft : current;
      })}
      onStarted={() => undefined}
      onDelivered={() => undefined}
    />
  );
}

describe('BriefForm', () => {
  it('serializes canonical enquiry fields in order with language last', () => {
    const { container } = render(
      <NextIntlClientProvider locale="pl" messages={plMessages}>
        <BriefFormHarness />
      </NextIntlClientProvider>,
    );
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
});
