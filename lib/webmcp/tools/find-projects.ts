import { createTranslator } from 'next-intl';
import type { Locale } from '@/i18n/request';
import {
  portfolioProjectTypes,
  projectObjectiveFeatures,
  type PortfolioProjectType,
  type ProjectIndexEntry,
  type ProjectMatchReason,
  type ProjectObjectiveFeature,
  type ProjectSearchCategory,
} from '@/lib/projects/project-search-types';
import { searchProjects, validateProjectSearchInput } from '@/lib/projects/search-projects';
import type { WebMcpTool } from '@/lib/webmcp/model-context';

export type FindProjectsToolCopy = {
  title: string;
  description: string;
  properties: Record<'category' | 'projectType' | 'location' | 'targetAreaM2' | 'features' | 'limit', string>;
  categories: Record<ProjectSearchCategory, string>;
  projectTypes: Record<PortfolioProjectType, string>;
  features: Record<ProjectObjectiveFeature, string>;
  reasons: {
    category: string;
    projectType: string;
    location: string;
    areaSame: string;
    areaDifference: string;
    feature: string;
  };
};

export type FindProjectsToolResult = {
  locale: Locale;
  totalMatches: number;
  returnedMatches: number;
  results: Array<{
    slug: string;
    title: string;
    location: string;
    areaM2: number;
    url: string;
    matchReasons: string[];
  }>;
};

export type FindProjectsWebMcpTool = Omit<WebMcpTool, 'execute'> & {
  execute: (
    ...args: Parameters<WebMcpTool['execute']>
  ) => Promise<FindProjectsToolResult>;
};

function choices<T extends string>(values: readonly T[], labels: Record<T, string>) {
  return values.map((value) => ({ const: value, title: labels[value] }));
}

export function createFindProjectsInputSchema(copy: FindProjectsToolCopy) {
  return {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string' as const,
        enum: ['residential', 'commercial'],
        oneOf: choices(['residential', 'commercial'], copy.categories),
        description: copy.properties.category,
      },
      projectType: {
        type: 'string' as const,
        enum: [...portfolioProjectTypes],
        oneOf: choices(portfolioProjectTypes, copy.projectTypes),
        description: copy.properties.projectType,
      },
      location: {
        type: 'string' as const,
        minLength: 1,
        maxLength: 80,
        pattern: '^\\s*\\S[\\s\\S]*$',
        description: copy.properties.location,
      },
      targetAreaM2: {
        type: 'number' as const,
        minimum: 1,
        maximum: 100000,
        description: copy.properties.targetAreaM2,
      },
      features: {
        type: 'array' as const,
        uniqueItems: true,
        maxItems: 9,
        items: {
          type: 'string' as const,
          enum: [...projectObjectiveFeatures],
          oneOf: choices(projectObjectiveFeatures, copy.features),
        },
        description: copy.properties.features,
      },
      limit: {
        type: 'integer' as const,
        minimum: 1,
        maximum: 5,
        default: 5,
        description: copy.properties.limit,
      },
    },
    additionalProperties: false,
  };
}

export function createFindProjectsTool(
  locale: Locale,
  index: readonly ProjectIndexEntry[],
  copy: FindProjectsToolCopy,
): FindProjectsWebMcpTool {
  const t = createTranslator({ locale, messages: { projectSearch: copy }, namespace: 'projectSearch' });
  const reasonText = (reason: ProjectMatchReason): string => {
    switch (reason.code) {
      case 'category':
        return t('reasons.category', { label: copy.categories[reason.value] });
      case 'project_type':
        return t('reasons.projectType', { label: copy.projectTypes[reason.value] });
      case 'location':
        return t('reasons.location', { location: reason.value });
      case 'area':
        return reason.differenceM2 === 0
          ? t('reasons.areaSame', { areaM2: reason.targetAreaM2 })
          : t('reasons.areaDifference', { differenceM2: reason.differenceM2 });
      case 'feature':
        return t('reasons.feature', { label: copy.features[reason.value] });
    }
  };

  return {
    name: 'kool_find_projects',
    title: copy.title,
    description: copy.description,
    inputSchema: createFindProjectsInputSchema(copy),
    annotations: { readOnlyHint: true },
    async execute(rawInput, { signal }): Promise<FindProjectsToolResult> {
      signal.throwIfAborted();
      const input = validateProjectSearchInput(rawInput);
      signal.throwIfAborted();
      const result = searchProjects(index, input);
      const output: FindProjectsToolResult = {
        locale,
        totalMatches: result.totalMatches,
        returnedMatches: result.matches.length,
        results: result.matches.map(({ project, matchReasons }) => ({
          slug: project.slug,
          title: project.title,
          location: project.location,
          areaM2: project.areaM2,
          url: project.url,
          matchReasons: matchReasons.map(reasonText),
        })),
      };
      signal.throwIfAborted();
      return output;
    },
  };
}
