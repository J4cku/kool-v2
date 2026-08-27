import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/i18n/request';
import {
  LIMITS,
  PROJECT_TYPES,
  SCOPE_ITEMS,
  STAGES,
  type DesiredScopeItem,
  type InquiryDraft,
  type InquiryRecommendedField,
  type ProjectType,
  type PropertyStage,
} from '@/lib/brief';
import { registerInquiryPreparationHandler } from '@/lib/webmcp/inquiry-preparation';
import {
  createPrepareProjectInquiryInputSchema,
  createPrepareProjectInquiryTool,
  type PrepareProjectInquiryToolCopy,
} from '@/lib/webmcp/tools/prepare-project-inquiry';

const fieldNames = [
  'name',
  'email',
  'phone',
  'projectType',
  'location',
  'propertyStage',
  'area',
  'desiredScope',
  'designStart',
  'constructionStart',
  'budget',
  'requirements',
  'plansUrl',
  'language',
] as const satisfies readonly (keyof InquiryDraft)[];

function labels<T extends string>(values: readonly T[], prefix: string): Record<T, string> {
  return Object.fromEntries(values.map((value) => [value, `${prefix} ${value}`])) as Record<T, string>;
}

function copy(locale: Locale): PrepareProjectInquiryToolCopy {
  return {
    title: locale === 'pl' ? 'Przygotuj zapytanie projektowe' : 'Prepare a project inquiry',
    description: locale === 'pl'
      ? 'Przygotuj formularz. Populate the visible project-enquiry form without submitting or contacting kool studio.'
      : 'Populate the visible project-enquiry form without submitting or contacting kool studio.',
    properties: Object.fromEntries(
      fieldNames.map((field) => [field, `${locale} ${field}`]),
    ) as Record<keyof InquiryDraft, string>,
    projectTypes: labels(PROJECT_TYPES, `${locale} project`),
    stages: labels(STAGES, `${locale} stage`),
    scopeItems: labels(SCOPE_ITEMS, `${locale} scope`),
    languages: { pl: `${locale} Polish`, en: `${locale} English` },
  };
}

afterEach(() => {
  const cleanup = registerInquiryPreparationHandler(() => ({
    status: 'form_busy',
    missingRecommendedFields: [],
    opened: false,
  }));
  cleanup();
});

describe.each(['pl', 'en'] as const)('kool_prepare_project_inquiry on %s pages', (locale) => {
  it('has exact localized write metadata and an optional closed input object', () => {
    const localizedCopy = copy(locale);
    const tool = createPrepareProjectInquiryTool(locale, localizedCopy);
    const schema = createPrepareProjectInquiryInputSchema(localizedCopy);

    expect(tool.name).toBe('kool_prepare_project_inquiry');
    expect(tool.title).toBe(localizedCopy.title);
    expect(tool.description).toBe(localizedCopy.description);
    expect(tool.description).toContain(
      'Populate the visible project-enquiry form without submitting or contacting kool studio.',
    );
    expect(tool.annotations).toEqual({ readOnlyHint: false });
    expect(tool).not.toHaveProperty('exposedTo');
    expect(tool.inputSchema).toEqual(schema);
    expect(schema.type).toBe('object');
    expect(schema.additionalProperties).toBe(false);
    expect(schema).not.toHaveProperty('required');
    expect(Object.keys(schema.properties)).toEqual(fieldNames);
  });

  it('uses every canonical string bound, option key, and localized option title', () => {
    const localizedCopy = copy(locale);
    const schema = createPrepareProjectInquiryInputSchema(localizedCopy);
    const boundedFields = Object.keys(LIMITS) as (keyof typeof LIMITS)[];

    for (const field of boundedFields) {
      expect(schema.properties[field]).toMatchObject({
        type: 'string',
        maxLength: LIMITS[field],
        description: localizedCopy.properties[field],
      });
    }
    expect(schema.properties.projectType).toMatchObject({
      type: 'string',
      enum: [...PROJECT_TYPES],
      oneOf: PROJECT_TYPES.map((value) => ({
        const: value,
        title: localizedCopy.projectTypes[value],
      })),
    });
    expect(schema.properties.propertyStage).toMatchObject({
      type: 'string',
      enum: [...STAGES],
      oneOf: STAGES.map((value) => ({
        const: value,
        title: localizedCopy.stages[value],
      })),
    });
    expect(schema.properties.desiredScope).toMatchObject({
      type: 'array',
      uniqueItems: true,
      maxItems: SCOPE_ITEMS.length,
      items: {
        type: 'string',
        enum: [...SCOPE_ITEMS],
        oneOf: SCOPE_ITEMS.map((value) => ({
          const: value,
          title: localizedCopy.scopeItems[value],
        })),
      },
    });
    expect(schema.properties.language).toMatchObject({
      type: 'string',
      enum: ['pl', 'en'],
      oneOf: [
        { const: 'pl', title: localizedCopy.languages.pl },
        { const: 'en', title: localizedCopy.languages.en },
      ],
    });
  });
});

it('accepts an optional partial patch and forwards only prepared public fields', async () => {
  const suppliedPatch = {
    email: 'private@example.com',
    projectType: 'mieszkanie' as ProjectType,
    propertyStage: 'remont' as PropertyStage,
    desiredScope: ['projekt-koncepcyjny'] as DesiredScopeItem[],
  };
  const handler = vi.fn(() => ({
    status: 'prepared' as const,
    missingRecommendedFields: ['name', 'location'] as InquiryRecommendedField[],
    opened: true,
  }));
  const cleanup = registerInquiryPreparationHandler(handler);

  try {
    const result = await createPrepareProjectInquiryTool('en', copy('en')).execute(
      suppliedPatch,
      { signal: new AbortController().signal },
    );

    expect(handler).toHaveBeenCalledWith(suppliedPatch);
    expect(result).toEqual({
      status: 'prepared',
      contactUrl: 'https://koolstudio.pl/en/kontakt#brief',
      missingRecommendedFields: ['name', 'location'],
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
    expect(JSON.stringify(result)).not.toContain('private@example.com');
  } finally {
    cleanup();
  }
});

it('returns localized unavailable guidance without retaining or echoing the patch', async () => {
  const tool = createPrepareProjectInquiryTool('pl', copy('pl'));
  const result = await tool.execute({ requirements: 'Poufny opis projektu' }, {
    signal: new AbortController().signal,
  });

  expect(result).toEqual({
    status: 'navigate_to_contact',
    contactUrl: 'https://koolstudio.pl/pl/kontakt#brief',
    missingRecommendedFields: [],
    submitted: false,
    opened: false,
  });
  expect(JSON.stringify(result)).not.toContain('Poufny opis projektu');
});

it.each([
  null,
  [],
  { company: 'private-company', ts: 'private-timestamp' },
  { email: 123 },
])('rejects structurally invalid input without echoing supplied values: %j', async (input) => {
  const tool = createPrepareProjectInquiryTool('en', copy('en'));

  let error: unknown;
  try {
    await tool.execute(input as Record<string, unknown>, {
      signal: new AbortController().signal,
    });
  } catch (caught) {
    error = caught;
  }

  expect(error).toBeInstanceOf(Error);
  expect(String(error)).toMatch(/invalid inquiry draft/i);
  expect(String(error)).not.toMatch(/private-company|private-timestamp|123/);
});

it.each([
  { projectType: 'private-option' },
  { propertyStage: 'private-stage' },
  { desiredScope: ['private-scope'] },
  { language: 'private-language' },
  { email: 'p'.repeat(LIMITS.email + 1) },
])('rejects option and length violations without calling the bridge or echoing values', async (input) => {
  const handler = vi.fn(() => ({
    status: 'prepared' as const,
    missingRecommendedFields: [] as InquiryRecommendedField[],
    opened: true,
  }));
  const cleanup = registerInquiryPreparationHandler(handler);

  try {
    let error: unknown;
    try {
      await createPrepareProjectInquiryTool('en', copy('en')).execute(input, {
        signal: new AbortController().signal,
      });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);
    expect(String(error)).toMatch(/invalid inquiry draft/i);
    for (const value of Object.values(input).flat()) {
      expect(String(error)).not.toContain(String(value));
    }
    expect(handler).not.toHaveBeenCalled();
  } finally {
    cleanup();
  }
});

it('honors cancellation before validation or bridge application', async () => {
  const handler = vi.fn(() => ({
    status: 'prepared' as const,
    missingRecommendedFields: [] as InquiryRecommendedField[],
    opened: true,
  }));
  const cleanup = registerInquiryPreparationHandler(handler);
  const controller = new AbortController();
  controller.abort(new DOMException('Cancelled', 'AbortError'));

  try {
    await expect(createPrepareProjectInquiryTool('en', copy('en')).execute({}, {
      signal: controller.signal,
    })).rejects.toMatchObject({ name: 'AbortError' });
    expect(handler).not.toHaveBeenCalled();
  } finally {
    cleanup();
  }
});

it('honors cancellation raised while the bridge applies a valid patch', async () => {
  const controller = new AbortController();
  const handler = vi.fn(() => {
    controller.abort(new DOMException('Cancelled after apply', 'AbortError'));
    return {
      status: 'prepared' as const,
      missingRecommendedFields: [] as InquiryRecommendedField[],
      opened: true,
    };
  });
  const cleanup = registerInquiryPreparationHandler(handler);

  try {
    await expect(createPrepareProjectInquiryTool('en', copy('en')).execute(
      { name: 'Ola' },
      { signal: controller.signal },
    )).rejects.toMatchObject({ name: 'AbortError' });
    expect(handler).toHaveBeenCalledOnce();
  } finally {
    cleanup();
  }
});
