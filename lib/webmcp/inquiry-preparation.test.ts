import { describe, expect, it, vi } from 'vitest';
import {
  prepareProjectInquiry,
  registerInquiryPreparationHandler,
} from '@/lib/webmcp/inquiry-preparation';
import type { InquiryRecommendedField } from '@/lib/brief';

describe('inquiry preparation bridge', () => {
  it('returns deterministic contact guidance without retaining an unavailable patch', () => {
    const first = prepareProjectInquiry({ email: 'private@example.com' }, 'en');
    const second = prepareProjectInquiry({}, 'en');

    expect(first).toEqual({
      status: 'navigate_to_contact',
      contactUrl: 'https://koolstudio.pl/en/kontakt#brief',
      missingRecommendedFields: [],
      submitted: false,
      opened: false,
    });
    expect(second).toEqual(first);
    expect(Object.keys(first).sort()).toEqual([
      'contactUrl',
      'missingRecommendedFields',
      'opened',
      'status',
      'submitted',
    ]);
    expect(JSON.stringify(first)).not.toContain('private@example.com');
  });

  it('forwards a patch to the current handler and returns only the public result fields', () => {
    const handler = vi.fn(() => ({
      status: 'prepared' as const,
      missingRecommendedFields: ['email', 'budget'] as InquiryRecommendedField[],
      opened: true,
    }));
    const cleanup = registerInquiryPreparationHandler(handler);

    const result = prepareProjectInquiry({ name: 'Ola' }, 'pl');

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ name: 'Ola' });
    expect(result).toEqual({
      status: 'prepared',
      contactUrl: 'https://koolstudio.pl/pl/kontakt#brief',
      missingRecommendedFields: ['email', 'budget'],
      submitted: false,
      opened: true,
    });
    expect(Object.keys(result).sort()).toEqual([
      'contactUrl',
      'missingRecommendedFields',
      'opened',
      'status',
      'submitted',
    ]);

    cleanup();
  });

  it('does not let stale cleanup remove a replacement registration', () => {
    const firstCleanup = registerInquiryPreparationHandler(() => ({
      status: 'prepared',
      missingRecommendedFields: ['name'],
      opened: true,
    }));
    const replacement = vi.fn(() => ({
      status: 'form_busy' as const,
      missingRecommendedFields: [] as InquiryRecommendedField[],
      opened: false,
    }));
    const replacementCleanup = registerInquiryPreparationHandler(replacement);

    firstCleanup();

    expect(prepareProjectInquiry({}, 'pl').status).toBe('form_busy');
    expect(replacement).toHaveBeenCalledOnce();

    replacementCleanup();
  });

  it('clears the current replacement when its own cleanup runs', () => {
    const obsoleteCleanup = registerInquiryPreparationHandler(() => ({
      status: 'prepared',
      missingRecommendedFields: [],
      opened: true,
    }));
    const currentCleanup = registerInquiryPreparationHandler(() => ({
      status: 'prepared',
      missingRecommendedFields: [],
      opened: true,
    }));

    currentCleanup();

    expect(prepareProjectInquiry({}, 'pl').status).toBe('navigate_to_contact');

    obsoleteCleanup();
  });
});
