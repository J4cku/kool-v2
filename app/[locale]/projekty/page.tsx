import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import { projectFilters, type ProjectFilter } from '@/data/projects';
import { makePageMetadata } from '@/lib/metadata';
import ProjectsListing from './ProjectsListing';

export const generateMetadata = makePageMetadata('projekty');

export default async function ProjektyPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const { filter } = await searchParams;
  const initialFilter =
    typeof filter === 'string' && projectFilters.includes(filter as ProjectFilter)
    ? (filter as ProjectFilter)
    : 'wszystkie';
  const hasNonDefaultFilterQuery = initialFilter !== 'wszystkie';

  return (
    <>
      <Navbar />
      <main>
        <ProjectsListing
          key={initialFilter}
          initialFilter={initialFilter}
          hasNonDefaultFilterQuery={hasNonDefaultFilterQuery}
        />
      </main>
      <FooterBanner />
    </>
  );
}
