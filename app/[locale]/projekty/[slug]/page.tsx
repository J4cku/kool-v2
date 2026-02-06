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
          />

          <FooterBanner showMarquee={false} />
        </div>
      </main>
    </>
  );
}
