import {
  portfolioProjectTypes,
  projectObjectiveFeatures,
  type PortfolioProjectType,
  type ProjectIndexEntry,
  type ProjectObjectiveFeature,
  type ProjectSearchCategory,
  type ProjectSearchInput,
  type ProjectSearchResult,
} from './project-search-types.ts';

const allowedKeys = new Set([
  'category',
  'projectType',
  'location',
  'targetAreaM2',
  'features',
  'limit',
]);
const categories = new Set<ProjectSearchCategory>(['residential', 'commercial']);
const projectTypes = new Set<string>(portfolioProjectTypes);
const objectiveFeatures = new Set<string>(projectObjectiveFeatures);

function invalid(field: string, constraint: string): never {
  throw new TypeError(`${field}: ${constraint}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

function normalizeRawLocation(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ');
}

export function normalizeProjectLocation(value: string): string {
  return normalizeRawLocation(value)
    .normalize('NFKD')
    .toLocaleLowerCase('pl-PL')
    .replace(/[łŁ]/g, 'l')
    .replace(new RegExp('\\p{M}', 'gu'), '')
    .replace(/\s+/g, ' ');
}

export function validateProjectSearchInput(input: unknown): ProjectSearchInput {
  if (!isPlainObject(input)) invalid('input', 'must be a plain object');

  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) invalid(key, 'unknown property');
  }

  const output: ProjectSearchInput = { features: [], limit: 5 };

  if (input.category !== undefined) {
    if (typeof input.category !== 'string' || !categories.has(input.category as ProjectSearchCategory)) {
      invalid('category', 'must be residential or commercial');
    }
    output.category = input.category as ProjectSearchCategory;
  }

  if (input.projectType !== undefined) {
    if (typeof input.projectType !== 'string' || !projectTypes.has(input.projectType)) {
      invalid('projectType', 'must be an allowed project type');
    }
    output.projectType = input.projectType as PortfolioProjectType;
  }

  if (input.location !== undefined) {
    if (typeof input.location !== 'string' ||
      Array.from(input.location).length < 1 ||
      Array.from(input.location).length > 80 ||
      !/\S/.test(input.location)) {
      invalid('location', 'must contain 1–80 Unicode code points and non-whitespace text');
    }
    output.location = normalizeRawLocation(input.location);
  }

  if (input.targetAreaM2 !== undefined) {
    if (typeof input.targetAreaM2 !== 'number' ||
      !Number.isFinite(input.targetAreaM2) ||
      input.targetAreaM2 < 1 ||
      input.targetAreaM2 > 100000) {
      invalid('targetAreaM2', 'must be a finite number from 1 through 100000');
    }
    output.targetAreaM2 = input.targetAreaM2;
  }

  if (input.features !== undefined) {
    if (!Array.isArray(input.features) || input.features.length > 9 ||
      input.features.some((feature) => typeof feature !== 'string' || !objectiveFeatures.has(feature))) {
      invalid('features', 'must contain at most nine allowed feature codes');
    }
    if (new Set(input.features).size !== input.features.length) {
      invalid('features', 'must not contain duplicates');
    }
    output.features = [...input.features] as ProjectObjectiveFeature[];
  }

  if (input.limit !== undefined) {
    if (typeof input.limit !== 'number' || !Number.isInteger(input.limit) || input.limit < 1 || input.limit > 5) {
      invalid('limit', 'must be an integer from 1 through 5');
    }
    output.limit = input.limit;
  }

  return output;
}

export function searchProjects(
  index: readonly ProjectIndexEntry[],
  input: ProjectSearchInput,
): ProjectSearchResult {
  const features = input.features ?? [];
  const normalizedLocation = input.location === undefined
    ? undefined
    : normalizeProjectLocation(input.location);

  const filtered = index.filter((project) =>
    (input.category === undefined || project.category === input.category) &&
    (input.projectType === undefined || project.projectType === input.projectType) &&
    (normalizedLocation === undefined || normalizeProjectLocation(project.location) === normalizedLocation) &&
    features.every((feature) => project.objectiveFeatures.includes(feature)));

  const ordered = [...filtered].sort((left, right) => {
    if (input.targetAreaM2 !== undefined) {
      const difference = Math.abs(left.areaM2 - input.targetAreaM2) -
        Math.abs(right.areaM2 - input.targetAreaM2);
      if (difference !== 0) return difference;
    }
    return left.catalogOrder - right.catalogOrder;
  });

  const matches = ordered.slice(0, input.limit ?? 5).map((project) => {
    const matchReasons: ProjectSearchResult['matches'][number]['matchReasons'] = [];
    if (input.category !== undefined) {
      matchReasons.push({ code: 'category', value: input.category });
    }
    if (input.projectType !== undefined) {
      matchReasons.push({ code: 'project_type', value: input.projectType });
    }
    if (input.location !== undefined) {
      matchReasons.push({ code: 'location', value: project.location });
    }
    if (input.targetAreaM2 !== undefined) {
      matchReasons.push({
        code: 'area',
        targetAreaM2: input.targetAreaM2,
        differenceM2: Math.abs(project.areaM2 - input.targetAreaM2),
      });
    }
    for (const feature of features) {
      matchReasons.push({ code: 'feature', value: feature });
    }
    return { project, matchReasons };
  });

  return { totalMatches: filtered.length, matches };
}
