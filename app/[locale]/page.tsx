import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import GalleryStrip from '@/components/GalleryStrip';
import ProjectsGrid from '@/components/ProjectsGrid';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <GalleryStrip />
        <ProjectsGrid />
        <AboutSection />
      </main>
      <Footer />
      <LanguageSwitcher />
    </>
  );
}
