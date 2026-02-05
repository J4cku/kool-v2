import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import GalleryStrip from '@/components/GalleryStrip';
import ProjectsGrid from '@/components/ProjectsGrid';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <GalleryStrip />
        <ProjectsGrid />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
