import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localizeProject, projects } from '@/data/projects';
import { BASE_URL } from '@/lib/site';
import { jsonLdScript, localeAlternates, ogLocale } from '@/lib/metadata';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import ProjectHero from '@/components/ProjectHero';
import ProjectMeta from '@/components/ProjectMeta';
import ProjectContent from '@/components/ProjectContent';

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

  return {
    title,
    description,
    openGraph: {
      title: `${title} | kool studio`,
      description,
      type: 'article',
      locale: ogLocale(locale),
      images: project.images[0] ? [{ url: project.images[0] }] : undefined,
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

  const displayTitle = project.meta?.title ?? project.title;
  const displayLocation = project.meta?.location ?? project.location;
  const pageUrl = `${BASE_URL}/${locale}/projekty/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${pageUrl}#project`,
        name: `${displayTitle} — ${displayLocation}`,
        description: project.description,
        url: pageUrl,
        image: project.images.map((image) => `${BASE_URL}${image}`),
        dateCreated: String(project.year),
        locationCreated: {
          '@type': 'Place',
          name: displayLocation,
          address: { '@type': 'PostalAddress', addressCountry: 'PL' },
        },
        creator: {
          '@type': 'ProfessionalService',
          '@id': `${BASE_URL}/#studio`,
          name: 'Kool Studio',
          url: BASE_URL,
        },
        ...(project.meta?.collaboration
          ? { contributor: { '@type': 'Organization', name: project.meta.collaboration } }
          : {}),
        inLanguage: locale,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'kool studio', item: `${BASE_URL}/${locale}` },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale === 'en' ? 'projects' : 'projekty',
            item: `${BASE_URL}/${locale}/projekty`,
          },
          { '@type': 'ListItem', position: 3, name: displayTitle, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {project.images[0] && (
        <ProjectHero src={project.images[0]} alt={project.title} mobileKeepAspect />
      )}
      <Navbar />
      <main>
        {/* Spacer: lets the fixed hero image show through (native 16:9 on
            mobile, full screen from md up — mirrors ProjectHero) */}
        <div className="aspect-video md:aspect-auto md:h-screen" />

        {/* Content scrolls over the hero */}
        <div className="relative z-10 bg-beige">
          <ProjectMeta project={project} />

          <ProjectContent
            images={project.images.slice(1)}
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

          <FooterBanner showMarquee={false} />
        </div>
      </main>
    </>
  );
}
