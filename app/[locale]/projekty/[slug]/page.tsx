import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';
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
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};

  const title = `${project.title} / ${project.location}`;
  const description = project.description;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Kool Studio`,
      description,
      type: 'article',
      locale: locale === 'en' ? 'en_US' : 'pl_PL',
      images: project.images[0] ? [{ url: project.images[0] }] : undefined,
    },
    alternates: {
      canonical: `https://koolstudio.pl/${locale}/projekty/${slug}`,
      languages: {
        'pl': `https://koolstudio.pl/pl/projekty/${slug}`,
        'en': `https://koolstudio.pl/en/projekty/${slug}`,
      },
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      {project.images[0] && (
        <ProjectHero src={project.images[0]} alt={project.title} />
      )}
      <Navbar />
      <main>
        {/* Spacer: lets the fixed hero image show through */}
        <div className="h-screen" />

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
          />

          <FooterBanner showMarquee={false} />
        </div>
      </main>
    </>
  );
}
