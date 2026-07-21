import Navbar from '@/components/Navbar';
import ImageStrip from '@/components/ImageStrip';
import FooterBar from '@/components/FooterBar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <ImageStrip />
      </main>
      <FooterBar />
    </>
  );
}
