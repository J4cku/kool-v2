import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { submitBrief } from '@/app/[locale]/kontakt/actions';
import { initialBriefState } from '@/app/[locale]/kontakt/brief-state';
import type { NormalizedBrief } from '@/lib/brief';

const NOW = 1_800_000_000_000;
const EXPECTED_SUBMITTED = {
  name: 'Ola Testowa', email: 'ola@example.com', phone: '+48 600 700 800',
  projectType: 'mieszkanie', location: 'Wrocław', propertyStage: 'po-odbiorze',
  area: 'ok. 85 m²', desiredScope: ['uklad-funkcjonalny', 'nadzor-autorski'],
  designStart: 'Q4 2026', constructionStart: 'Q2 2027',
  budget: '180–220 tys. zł', requirements: 'Ciche miejsce do pracy.',
  plansUrl: 'https://drive.example.com/folder', language: 'en',
} satisfies NormalizedBrief;
const EXPECTED_STUDIO_TEXT = [
  'Brief projektowy — mieszkanie', '',
  'Imię: Ola Testowa', 'E-mail: ola@example.com', 'Telefon: +48 600 700 800',
  'Typ projektu: mieszkanie', 'Lokalizacja: Wrocław',
  'Etap nieruchomości: po odbiorze kluczy',
  'Przybliżona powierzchnia (m²): ok. 85 m²',
  'Oczekiwany zakres: układ funkcjonalny, nadzór autorski',
  'Pożądany start projektu: Q4 2026',
  'Planowany start realizacji: Q2 2027',
  'Przybliżony budżet realizacji: 180–220 tys. zł',
  'Wymagania i priorytety: Ciche miejsce do pracy.',
  'Link do rzutów / zdjęć: https://drive.example.com/folder',
  'Język korespondencji: angielski', '',
].join('\n');

function form(overrides: Record<string, string | string[]> = {}): FormData {
  const values: Record<string, string | string[]> = {
    name: 'Ola Testowa', email: 'ola@example.com', phone: '+48 600 700 800',
    projectType: 'mieszkanie', location: 'Wrocław', propertyStage: 'po-odbiorze',
    area: 'ok. 85 m²', desiredScope: ['uklad-funkcjonalny', 'nadzor-autorski'],
    designStart: 'Q4 2026', constructionStart: 'Q2 2027',
    budget: '180–220 tys. zł', requirements: 'Ciche miejsce do pracy.',
    plansUrl: 'https://drive.example.com/folder', language: 'pl',
    company: '', ts: String(NOW - 10_000), ...overrides,
  };
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
  }
  return data;
}

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW);
  vi.stubEnv('RESEND_API_KEY', '');
  vi.stubEnv('BRIEF_FROM_EMAIL', 'briefs@example.test');
  vi.stubEnv('BRIEF_TO_EMAIL', 'studio@example.test');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('submitBrief', () => {
  it('never fetches for invalid, honeypot, or too-fast input', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await submitBrief(initialBriefState, form({ email: 'invalid' }))).status)
      .toBe('invalid');
    expect(await submitBrief(initialBriefState, form({ company: 'bot' })))
      .toMatchObject({ status: 'error', formError: 'generic' });
    expect(await submitBrief(initialBriefState, form({ ts: String(NOW - 100) })))
      .toMatchObject({ status: 'error', formError: 'generic' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns complete encoded mailto without fetch when unconfigured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const result = await submitBrief(initialBriefState, form());
    expect(result).toMatchObject({
      status: 'fallback', fallback: { reason: 'unconfigured' },
    });
    expect(result.fallback?.mailtoHref).toMatch(/^mailto:hello@koolstudio\.pl\?/);
    expect(result.fallback?.mailtoHref).toContain('Planowany%20start%20realizacji%3A%20Q2%202027');
    expect(result.fallback?.mailtoHref).not.toMatch(/\s/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends exact studio subject/body and English receipt', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await submitBrief(initialBriefState, form({ language: 'en' }));
    expect(result).toEqual({
      status: 'success', submitted: EXPECTED_SUBMITTED, submittedAt: NOW,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const studio = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(studio).toEqual({
      from: 'briefs@example.test', to: ['studio@example.test'],
      reply_to: 'ola@example.com', subject: 'Brief projektowy — mieszkanie',
      text: EXPECTED_STUDIO_TEXT,
    });
    const receipt = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(receipt.to).toEqual(['ola@example.com']);
    expect(receipt.reply_to).toBe('studio@example.test');
    expect(receipt.subject).toBe('Kool Studio — we received your brief');
  });

  it.each([
    ['non-OK', () => Promise.resolve(new Response(null, { status: 503 }))],
    ['rejection', () => Promise.reject(new Error('synthetic receipt rejection'))],
  ])('keeps studio success after receipt %s', async (_label, receiptResult) => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockImplementationOnce(receiptResult);
    vi.stubGlobal('fetch', fetchMock);
    await expect(submitBrief(initialBriefState, form()))
      .resolves.toMatchObject({ status: 'success' });
  });

  it.each([
    ['non-OK', () => Promise.resolve(new Response(null, { status: 503 }))],
    ['throw', () => Promise.reject(new Error('synthetic studio failure'))],
  ])('returns delivery-failed without receipt after studio %s', async (_label, studioResult) => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const fetchMock = vi.fn().mockImplementationOnce(studioResult);
    vi.stubGlobal('fetch', fetchMock);
    const result = await submitBrief(initialBriefState, form());
    expect(result).toMatchObject({
      status: 'fallback', fallback: { reason: 'delivery-failed' },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
