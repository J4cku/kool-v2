import Navbar from '@/components/Navbar';
import ImageStrip from '@/components/ImageStrip';
import ManifestoSection from '@/components/ManifestoSection';
import FooterBanner from '@/components/FooterBanner';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-[200px]">
        <ImageStrip />
        <ManifestoSection />
      </main>
      <FooterBanner showAddress />
    </>
  );
}
