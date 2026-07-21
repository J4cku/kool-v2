import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localizeProject, projects } from '@/data/projects';
import Navbar from '@/components/Navbar';
import FooterBar from '@/components/FooterBar';
import ProjectStory from '@/components/project-detail/ProjectStory';
import { getProjectSuccessors } from '@/lib/portfolio-motion';
import { jsonLdScript, localeAlternates, ogLocale } from '@/lib/metadata';
import { BASE_URL } from '@/lib/site';

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
  const found = projects.find((project) => project.slug === slug);
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
  const found = projects.find((project) => project.slug === slug);

  if (!found) {
    notFound();
  }

  const localizedProjects = projects.map((project) =>
    localizeProject(project, locale),
  );
  const project = localizeProject(found, locale);
  const successors = getProjectSuccessors(localizedProjects, project.slug);
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
          ? {
              contributor: {
                '@type': 'Organization',
                name: project.meta.collaboration,
              },
            }
          : {}),
        inLanguage: locale,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'kool studio',
            item: `${BASE_URL}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale === 'en' ? 'projects' : 'projekty',
            item: `${BASE_URL}/${locale}/projekty`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: displayTitle,
            item: pageUrl,
          },
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
      <Navbar />
      <main>
        <ProjectStory project={project} successors={successors} />
      </main>
      <FooterBar />
    </>
  );
}
