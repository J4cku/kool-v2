import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getService, localizeService, services } from '@/data/services';
import { localizeProject, projects } from '@/data/projects';
import { BASE_URL } from '@/lib/site';
import { jsonLdScript, localeAlternates, ogLocale } from '@/lib/metadata';
import { ORG_ID, breadcrumbList, webPageNode } from '@/lib/schema';
import type { Crumb } from '@/components/Breadcrumbs';
import ServiceLandingPage, { type ProofCard } from '@/components/oferta/ServiceLandingPage';

export function generateStaticParams() {
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; locale: string }>;
}): Promise<Metadata> {
  const { service: slug, locale } = await params;
  const found = getService(slug);
  if (!found) return {};

  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t(`services.${slug}.title`);
  const description = t(`services.${slug}.description`);
  const path = `/oferta/${slug}`;
  const socialImage = {
    url: found.heroImage,
    alt: t(`services.${slug}.ogImageAlt`),
  };

  return {
    title,
    description,
    openGraph: {
      title: `${title} | kool studio`,
      description,
      type: 'website',
      siteName: 'Kool Studio',
      locale: ogLocale(locale),
      alternateLocale: locale === 'en' ? 'pl_PL' : 'en_US',
      url: `${BASE_URL}/${locale}${path}`,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | kool studio`,
      description,
      images: [socialImage.url],
    },
    alternates: localeAlternates(locale, path),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ service: string; locale: string }>;
}) {
  const { service: slug, locale } = await params;
  const found = getService(slug);

  if (!found) {
    notFound();
  }

  const service = localizeService(found, locale);
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tOferta = await getTranslations({ locale, namespace: 'oferta' });

  const canonical = `${BASE_URL}/${locale}/oferta/${slug}`;
  const serviceId = `${canonical}#service`;
  const breadcrumbId = `${canonical}#breadcrumb`;

  // Single source for the trail: the visible <Breadcrumbs> and the
  // BreadcrumbList markup below both derive from it, so they always mirror.
  const ofertaLabel = tNav('oferta');
  const crumbs: Crumb[] = [
    { label: ofertaLabel, href: '/oferta' },
    { label: service.heroName },
  ];

  // Proof projects resolved to card facts from data/projects.ts (localized).
  const proof: ProofCard[] = service.proofSlugs.map((proofSlug) => {
    const foundProject = projects.find((p) => p.slug === proofSlug);
    if (!foundProject) throw new Error(`Missing proof project: ${proofSlug}`);
    const project = localizeProject(foundProject, locale);
    return {
      slug: project.slug,
      title: project.title,
      location: project.location,
      area: project.area,
      year: project.year,
      thumbnail: project.thumbnail,
    };
  });

  // JSON-LD: a Service node (provider → the org) + the page's WebPage and
  // BreadcrumbList. Description is the exact published service-line copy. No
  // Offer, price, aggregateRating or FAQPage markup (playbook iron rule).
  const serviceNode = {
    '@type': 'Service',
    '@id': serviceId,
    name: service.heroName,
    description: tOferta(`${service.line}.description`),
    provider: { '@id': ORG_ID },
    areaServed: [
      { '@type': 'City', name: 'Wrocław' },
      { '@type': 'Country', name: 'Poland' },
    ],
    serviceType: service.serviceType,
    url: canonical,
    inLanguage: locale,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      webPageNode({
        url: canonical,
        name: service.heroName,
        locale,
        about: { '@id': serviceId },
        breadcrumb: { '@id': breadcrumbId },
      }),
      serviceNode,
      breadcrumbList(breadcrumbId, [
        { name: ofertaLabel, url: `${BASE_URL}/${locale}/oferta` },
        { name: service.heroName, url: canonical },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <ServiceLandingPage
        line={service.line}
        serviceSlug={service.slug}
        heroName={service.heroName}
        heroLead={service.heroLead}
        heroImage={service.heroImage}
        heroImageAlt={service.heroImageAlt}
        crumbs={crumbs}
        situations={service.situations}
        proof={proof}
        proofAngles={service.proofAngles}
        faqs={service.faqs}
      />
    </>
  );
}
