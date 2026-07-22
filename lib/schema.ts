// Server-safe Schema.org entity-graph builders for the whole site.
//
// Iron rule (SEO playbook): markup states only facts the site already
// publishes — it never creates a new business fact. Every value here traces
// to docs/playbook/nap-source-of-truth.md. Facts still marked
// `[REQUIRES CONFIRMATION]` in docs/playbook/decision-log.md (phone, hours,
// legal name, team size, the "Aleksandra" name form, offers/pricing/ratings)
// must never appear below.
import { BASE_URL, INSTAGRAM_URL } from './site';

// Stable node identifiers — each entity is defined once per document and
// referenced by @id everywhere else, and stays identical across the pl and en
// documents (language variants describe the same entities, never duplicates).
export const ORG_ID = `${BASE_URL}/#organization`;
export const WEBSITE_ID = `${BASE_URL}/#website`;

export function personId(slug: string) {
  return `${BASE_URL}/#person-${slug}`;
}

// Founders exactly as the site itself names them (messages/*.json,
// llms.txt): the diminutive "Ola", not the LinkedIn legal-name form which is
// still unconfirmed (decision-log G1-5).
const founders = [
  { slug: 'ola-kilinska', name: 'Ola Kilińska' },
  { slug: 'ola-leszczynska', name: 'Ola Leszczyńska' },
] as const;

// Role published on the studio page and meta descriptions ("architektki" /
// "architects"); singular per-person form.
function jobTitle(locale: string) {
  return locale === 'en' ? 'architect' : 'architektka';
}

function founderNodes(locale: string) {
  return founders.map((founder) => ({
    '@type': 'Person',
    '@id': personId(founder.slug),
    name: founder.name,
    jobTitle: jobTitle(locale),
    worksFor: { '@id': ORG_ID },
  }));
}

// LocalBusiness, not the deprecated ProfessionalService: the site already
// publicly asserts a street address, geo and map link, so plain LocalBusiness
// preserves the existing published claim while dropping the deprecated type.
// Only already-published facts here — no phone, hours, priceRange,
// aggregateRating, review, offers or hasOfferCatalog (decision-log G1/G2).
function organizationNode(locale: string, description: string) {
  return {
    '@type': 'LocalBusiness',
    '@id': ORG_ID,
    name: 'Kool Studio',
    description,
    url: BASE_URL,
    email: 'hello@koolstudio.pl',
    logo: `${BASE_URL}/logo.svg`,
    image: `${BASE_URL}/images/studio/team.webp`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Zaporoska 83/15',
      postalCode: '53-415',
      addressLocality: 'Wrocław',
      addressRegion: 'Dolnośląskie',
      addressCountry: 'PL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.09168,
      longitude: 17.01557,
    },
    hasMap: 'https://maps.app.goo.gl/f3nJEyLJXxKStLvPA',
    // Published service-area claim: works from Wrocław on projects across
    // Poland. Individual project cities are not service-area claims.
    areaServed: [
      { '@type': 'City', name: 'Wrocław' },
      { '@type': 'Country', name: 'Poland' },
    ],
    serviceType: [
      'Interior Architecture',
      'Interior Design',
      'Custom Furniture Design',
      'Lighting Design',
      'Visual Identity Design',
    ],
    knowsLanguage: ['pl', 'en'],
    // Instagram (lib/site.ts) + the confirmed public LinkedIn company page.
    sameAs: [INSTAGRAM_URL, 'https://pl.linkedin.com/company/koolstudio'],
    founder: founders.map((founder) => ({ '@id': personId(founder.slug) })),
  };
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Kool Studio',
    url: BASE_URL,
    publisher: { '@id': ORG_ID },
    inLanguage: ['pl', 'en'],
  };
}

// Site-wide graph emitted once per document from the root layout: the
// organization, its founders and the website. Page-specific nodes (WebPage,
// CreativeWork, BreadcrumbList, ImageObject) are emitted by the pages
// themselves, so no @id is ever defined twice in one document.
export function siteGraph(locale: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(locale, description),
      ...founderNodes(locale),
      websiteNode(),
    ],
  };
}

type Ref = { '@id': string };

type WebPageInput = {
  url: string;
  name: string;
  locale: string;
  about?: Ref;
  mainEntity?: Ref;
  breadcrumb?: Ref;
  primaryImageOfPage?: Ref;
};

// Reusable per-page WebPage node. @id is always the page's canonical URL +
// #webpage, so it is unique per page and part of the shared #website.
export function webPageNode({
  url,
  name,
  locale,
  about,
  mainEntity,
  breadcrumb,
  primaryImageOfPage,
}: WebPageInput) {
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: locale,
    ...(about ? { about } : {}),
    ...(mainEntity ? { mainEntity } : {}),
    ...(breadcrumb ? { breadcrumb } : {}),
    ...(primaryImageOfPage ? { primaryImageOfPage } : {}),
  };
}

// BreadcrumbList whose items must mirror the visible <Breadcrumbs> trail
// exactly (playbook: same hierarchy in UI and markup). Pass the same ordered
// crumbs used to render the component, with absolute `url`s.
export function breadcrumbList(id: string, items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
