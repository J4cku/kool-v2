export const portfolioProjectTypes = [
  'house',
  'apartment',
  'bathroom',
  'retail',
  'food_and_beverage',
  'hospitality',
  'office',
  'public_cultural',
  'service_pavilion',
] as const;

export type PortfolioProjectType = (typeof portfolioProjectTypes)[number];

export const projectObjectiveFeatures = [
  'existing_space_rework',
  'pre_war_building',
  'modernist_building',
  'post_industrial_building',
  'neurodiversity_support',
  'competition_entry',
  'furniture_design',
  'lighting_design',
  'visual_identity',
] as const;

export type ProjectObjectiveFeature = (typeof projectObjectiveFeatures)[number];

export type ProjectSearchCategory = 'residential' | 'commercial';

export type ProjectIndexEntry = {
  catalogOrder: number;
  slug: string;
  title: string;
  location: string;
  category: ProjectSearchCategory;
  projectType: PortfolioProjectType;
  areaM2: number;
  objectiveFeatures: ProjectObjectiveFeature[];
  url: string;
};

export type ProjectSearchInput = {
  category?: ProjectSearchCategory;
  projectType?: PortfolioProjectType;
  location?: string;
  targetAreaM2?: number;
  features?: ProjectObjectiveFeature[];
  limit?: number;
};

export type ProjectMatchReason =
  | { code: 'category'; value: ProjectSearchCategory }
  | { code: 'project_type'; value: PortfolioProjectType }
  | { code: 'location'; value: string }
  | { code: 'area'; targetAreaM2: number; differenceM2: number }
  | { code: 'feature'; value: ProjectObjectiveFeature };

export type ProjectSearchMatch = {
  project: ProjectIndexEntry;
  matchReasons: ProjectMatchReason[];
};

export type ProjectSearchResult = {
  totalMatches: number;
  matches: ProjectSearchMatch[];
};
