import type { Locale } from '@/i18n/request';
import {
  LIMITS,
  PROJECT_TYPES,
  SCOPE_ITEMS,
  STAGES,
  applyInquiryDraftPatch,
  createInquiryDraft,
  parseInquiryDraftPatch,
  type DesiredScopeItem,
  type InquiryDraft,
  type InquiryPatchErrorCode,
  type ProjectType,
  type PropertyStage,
} from '@/lib/brief';
import {
  prepareProjectInquiry,
  type InquiryPreparationResult,
} from '@/lib/webmcp/inquiry-preparation';
import type { WebMcpTool } from '@/lib/webmcp/model-context';

export type PrepareProjectInquiryToolCopy = {
  title: string;
  description: string;
  properties: Record<keyof InquiryDraft, string>;
  projectTypes: Record<ProjectType, string>;
  stages: Record<PropertyStage, string>;
  scopeItems: Record<DesiredScopeItem, string>;
  languages: Record<Locale, string>;
};

export type PrepareProjectInquiryWebMcpTool = Omit<WebMcpTool, 'execute'> & {
  execute: (
    ...args: Parameters<WebMcpTool['execute']>
  ) => Promise<InquiryPreparationResult>;
};

function choices<T extends string>(values: readonly T[], labels: Record<T, string>) {
  return values.map((value) => ({ const: value, title: labels[value] }));
}

export function createPrepareProjectInquiryInputSchema(
  copy: PrepareProjectInquiryToolCopy,
) {
  const boundedString = <T extends keyof typeof LIMITS>(field: T) => ({
    type: 'string' as const,
    maxLength: LIMITS[field],
    description: copy.properties[field],
  });

  return {
    type: 'object' as const,
    properties: {
      name: boundedString('name'),
      email: boundedString('email'),
      phone: boundedString('phone'),
      projectType: {
        type: 'string' as const,
        enum: [...PROJECT_TYPES],
        oneOf: choices(PROJECT_TYPES, copy.projectTypes),
        description: copy.properties.projectType,
      },
      location: boundedString('location'),
      propertyStage: {
        type: 'string' as const,
        enum: [...STAGES],
        oneOf: choices(STAGES, copy.stages),
        description: copy.properties.propertyStage,
      },
      area: boundedString('area'),
      desiredScope: {
        type: 'array' as const,
        uniqueItems: true,
        maxItems: SCOPE_ITEMS.length,
        items: {
          type: 'string' as const,
          enum: [...SCOPE_ITEMS],
          oneOf: choices(SCOPE_ITEMS, copy.scopeItems),
        },
        description: copy.properties.desiredScope,
      },
      designStart: boundedString('designStart'),
      constructionStart: boundedString('constructionStart'),
      budget: boundedString('budget'),
      requirements: boundedString('requirements'),
      plansUrl: boundedString('plansUrl'),
      language: {
        type: 'string' as const,
        enum: ['pl', 'en'],
        oneOf: choices(['pl', 'en'], copy.languages),
        description: copy.properties.language,
      },
    },
    additionalProperties: false,
  };
}

function invalidDraftError(
  errors: Partial<Record<keyof InquiryDraft, InquiryPatchErrorCode>>,
  options: { rootType?: boolean; unknownFields?: boolean } = {},
): Error {
  const details = Object.entries(errors).map(([field, code]) => `${field}:${code}`);
  if (options.rootType) details.unshift('root:type');
  if (options.unknownFields) details.push('unknown_field');
  return new Error(`Invalid inquiry draft (${details.join(', ')})`);
}

export function createPrepareProjectInquiryTool(
  locale: Locale,
  copy: PrepareProjectInquiryToolCopy,
): PrepareProjectInquiryWebMcpTool {
  return {
    name: 'kool_prepare_project_inquiry',
    title: copy.title,
    description: copy.description,
    inputSchema: createPrepareProjectInquiryInputSchema(copy),
    annotations: { readOnlyHint: false },
    async execute(rawInput, { signal }): Promise<InquiryPreparationResult> {
      signal.throwIfAborted();
      const parsed = parseInquiryDraftPatch(rawInput);
      if (!parsed.ok) {
        throw invalidDraftError(parsed.errors, {
          rootType: parsed.rootError === 'type',
          unknownFields: parsed.unknownKeys.length > 0,
        });
      }

      const validated = applyInquiryDraftPatch(createInquiryDraft(locale), parsed.patch);
      if (!validated.ok) throw invalidDraftError(validated.errors);

      const result = prepareProjectInquiry(parsed.patch, locale);
      signal.throwIfAborted();
      return result;
    },
  };
}
