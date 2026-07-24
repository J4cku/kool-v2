import { projectFilters, type ProjectFilter } from '@/data/projects';
import { makePageMetadata } from '@/lib/metadata';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import ProjectsListing from './ProjectsListing';

export const generateMetadata = makePageMetadata('projekty');

export default async function ProjektyPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  // Read the filter server-side so the (filtered) grid is present in the
  // initial HTML — the listing must stay crawlable without JS. This makes
  // the route dynamic; filter-tab clicks stay client-only (history API)
  const { filter } = await searchParams;
  const initialFilter =
    typeof filter === 'string' && projectFilters.includes(filter as ProjectFilter)
      ? (filter as ProjectFilter)
      : 'wszystkie';

  return (
    <>
      <Navbar />
      <main className="pt-[200px]">
        {/* px matches the navbar's px-4 md:px-6, so the grid edges align
            with the kool logo's left edge and the dot's right edge */}
        <div className="px-4 md:px-6 pb-32 md:pb-48">
          {/* key: real navigations that change the filter (nav link, deep
              link) remount the listing so state matches the URL */}
          <ProjectsListing key={initialFilter} initialFilter={initialFilter} />
        </div>
      </main>
      <FooterBanner />
    </>
  );
}
