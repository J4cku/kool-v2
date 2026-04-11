import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import ProjectsListing from './ProjectsListing';

export default function ProjektyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[200px]">
        <div className="px-5 md:px-10 lg:px-12 pb-32 md:pb-48">
          <ProjectsListing />
        </div>
      </main>
      <FooterBanner />
    </>
  );
}
