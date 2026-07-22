import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { localizeProject, projects, relatedServiceSlug } from '@/data/projects';
import { BASE_URL } from '@/lib/site';
import { jsonLdScript, localeAlternates, ogLocale } from '@/lib/metadata';
import { ORG_ID, breadcrumbList, webPageNode } from '@/lib/schema';
import Navbar from '@/components/Navbar';
import Breadcrumbs, { type Crumb } from '@/components/Breadcrumbs';
import FooterBanner from '@/components/FooterBanner';
import ProjectHero from '@/components/ProjectHero';
import ProjectMeta from '@/components/ProjectMeta';
import ProjectContent from '@/components/ProjectContent';
import CaseStudySection from '@/components/CaseStudySection';
import ProjectServiceCta from '@/components/ProjectServiceCta';

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const found = projects.find((p) => p.slug === slug);
  if (!found) return {};
  const project = localizeProject(found, locale);

  const title = `${project.title} / ${project.location}`;
  const description = project.description;
  const ogImages = project.images[0]
    ? [{ url: project.images[0], alt: `${project.title}, ${project.location} — kool studio` }]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | kool studio`,
      description,
      type: 'article',
      siteName: 'Kool Studio',
      locale: ogLocale(locale),
      alternateLocale: locale === 'en' ? 'pl_PL' : 'en_US',
      url: `${BASE_URL}/${locale}/projekty/${slug}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | kool studio`,
      description,
      images: project.images[0] ? [project.images[0]] : undefined,
    },
    alternates: localeAlternates(locale, `/projekty/${slug}`),
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const found = projects.find((p) => p.slug === slug);

  if (!found) {
    notFound();
  }

  const project = localizeProject(found, locale);
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const displayTitle = project.meta?.title ?? project.title;
  const displayLocation = project.meta?.location ?? project.location;
  const canonical = `${BASE_URL}/${locale}/projekty/${slug}`;
  const heroImage = project.images[0];
  const heroAlt =
    locale === 'en'
      ? `Interior of ${project.title}, ${project.location}`
      : `Wnętrze projektu ${project.title}, ${project.location}`;

  const creativeWorkId = `${canonical}#creativework`;
  const primaryImageId = `${canonical}#primaryimage`;
  const breadcrumbId = `${canonical}#breadcrumb`;

  // Case → service cross-link target (category heuristic + explicit overrides).
  const relatedService = relatedServiceSlug(found);
  const serviceHref = relatedService === 'oferta' ? '/oferta' : `/oferta/${relatedService}`;

  // Single source for the trail: the visible <Breadcrumbs> and the
  // BreadcrumbList markup below both derive from it, so they always mirror.
  const projektyLabel = tNav('projekty');
  const crumbs: Crumb[] = [
    { label: projektyLabel, href: '/projekty' },
    { label: displayTitle },
  ];

  const creativeWork = {
    '@type': 'CreativeWork',
    '@id': creativeWorkId,
    name: `${displayTitle} — ${displayLocation}`,
    description: project.description,
    url: canonical,
    creator: { '@id': ORG_ID },
    locationCreated: {
      '@type': 'Place',
      name: displayLocation,
      address: { '@type': 'PostalAddress', addressCountry: 'PL' },
    },
    dateCreated: String(project.year),
    genre: project.scope,
    inLanguage: locale,
    // The published problem statement, only when a case block restates it —
    // no invented facts (SEO playbook iron rule).
    ...(project.caseStudy ? { abstract: project.caseStudy.problem } : {}),
    ...(heroImage ? { image: { '@id': primaryImageId } } : {}),
    ...(project.meta?.collaboration
      ? { contributor: { '@type': 'Organization', name: project.meta.collaboration } }
      : {}),
  };

  const graph: object[] = [
    webPageNode({
      url: canonical,
      name: `${project.title} / ${project.location}`,
      locale,
      mainEntity: { '@id': creativeWorkId },
      breadcrumb: { '@id': breadcrumbId },
      ...(heroImage ? { primaryImageOfPage: { '@id': primaryImageId } } : {}),
    }),
    creativeWork,
    breadcrumbList(breadcrumbId, [
      { name: projektyLabel, url: `${BASE_URL}/${locale}/projekty` },
      { name: displayTitle, url: canonical },
    ]),
  ];

  // Primary image as an ImageObject; photographer credit only from the
  // project's own photoCredit field (never invented).
  if (heroImage) {
    graph.push({
      '@type': 'ImageObject',
      '@id': primaryImageId,
      contentUrl: `${BASE_URL}${heroImage}`,
      ...(project.photoCredit
        ? {
            creditText: project.photoCredit,
            creator: { '@type': 'Organization', name: project.photoCredit },
          }
        : {}),
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {project.images[0] && (
        <ProjectHero src={project.images[0]} alt={heroAlt} />
      )}
      <Navbar />
      <main>
        {/* Content scrolls over the hero */}
        <div className="relative z-10 bg-beige">
          <div className="px-5 pt-10 md:px-10 md:pt-14 lg:px-12">
            <Breadcrumbs items={crumbs} />
          </div>

          <ProjectMeta project={project} />

          {project.caseStudy && (
            <CaseStudySection
              caseStudy={project.caseStudy}
              caseId={slug}
              service={relatedService === 'oferta' ? undefined : relatedService}
            />
          )}

          <ProjectContent
            images={project.images.slice(1)}
            title={project.title}
            location={project.location}
            description={project.description}
            descriptionBlocks={project.descriptionBlocks}
            fullWidthIndices={project.fullWidthIndices?.map((i) => i - 1).filter((i) => i >= 0)}
            containedPairs={project.containedPairs?.map((p) => ({ ...p, indices: [p.indices[0] - 1, p.indices[1] - 1] as [number, number] }))}
            reverseLastRow={project.reverseLastRow}
            reel={project.reel ? { ...project.reel, index: project.reel.index - 1 } : undefined}
            slider={
              project.slider
                ? Array.isArray(project.slider)
                  ? project.slider.map((s) => ({ ...s, index: s.index - 1 }))
                  : { ...project.slider, index: project.slider.index - 1 }
                : undefined
            }
            textRows={project.textRows}
            flipRowParity={project.flipRowParity}
            portraitIndices={project.portraitIndices?.map((i) => i - 1).filter((i) => i >= 0)}
            smallIndices={project.smallIndices?.map((i) => i - 1).filter((i) => i >= 0)}
          />

          {project.caseStudy && (
            <ProjectServiceCta serviceKey={relatedService} serviceHref={serviceHref} />
          )}

          <FooterBanner showMarquee={false} />
        </div>
      </main>
    </>
  );
}
