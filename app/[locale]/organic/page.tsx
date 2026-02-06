'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

function BlobShape({ className, color = '#FC3117' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <path
        fill={color}
        d="M45.3,-58.2C57.9,-49.3,66.8,-34.2,71.2,-17.6C75.6,-1,75.6,17.1,68.8,32.1C62,47.1,48.4,59,33.1,65.7C17.8,72.4,0.8,73.9,-15.9,70.5C-32.6,67.1,-49,58.8,-60.1,45.8C-71.2,32.8,-77,15.1,-75.4,-1.6C-73.8,-18.3,-64.8,-34,-52.3,-43.3C-39.8,-52.6,-23.8,-55.5,-8.1,-55.8C7.6,-56.1,32.7,-67.1,45.3,-58.2Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

function WaveShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 320" className={className} preserveAspectRatio="none">
      <path
        fill="currentColor"
        d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </svg>
  );
}

export default function OrganicPage() {
  const t = useTranslations('hero');
  const tProjects = useTranslations('projects');
  const tAbout = useTranslations('about');
  const tFooter = useTranslations('footer');

  const projects = [
    { id: 1, name: 'Belmonte', type: 'Hotel', color: '#FFE4E1' },
    { id: 2, name: 'Fandom', type: 'Commercial', color: '#E8F5E9' },
    { id: 3, name: 'Grabiszynek', type: 'Apartment', color: '#FFF3E0' },
    { id: 4, name: 'Umami', type: 'Restaurant', color: '#F3E5F5' },
    { id: 5, name: 'Nadodrze', type: 'Loft', color: '#E3F2FD' },
    { id: 6, name: 'Marina', type: 'Boutique Hotel', color: '#FFECB3' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] to-[#F5F0EB] text-[#2D2D2D] overflow-hidden">
      {/* Floating Blobs Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -right-32 w-96 h-96 opacity-20"
        >
          <BlobShape color="#FC3117" />
        </motion.div>
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 -left-48 w-80 h-80 opacity-10"
        >
          <BlobShape color="#2D2D2D" />
        </motion.div>
        <motion.div
          animate={{
            x: [0, 15, 0],
            y: [0, 25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 opacity-15"
        >
          <BlobShape color="#FC3117" />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#FC3117]"
            style={{ fontFamily: 'system-ui' }}
          >
            kool
          </Link>
          <div className="flex gap-8 text-sm">
            <a href="#projects" className="hover:text-[#FC3117] transition-colors">Projects</a>
            <a href="#about" className="hover:text-[#FC3117] transition-colors">About</a>
            <a href="#contact" className="hover:text-[#FC3117] transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center relative px-8 pt-24">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: easeOutExpo }}
          >
            <h1 className="text-5xl md:text-7xl font-light leading-tight">
              <span className="block">{t('title1')}</span>
              <span className="block text-[#FC3117] font-medium italic">{t('title2')}</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 text-lg text-gray-500 max-w-md leading-relaxed"
            >
              {t('subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12"
            >
              <a
                href="#projects"
                className="inline-flex items-center gap-3 bg-[#FC3117] text-white px-8 py-4 rounded-full hover:bg-[#E02A10] transition-colors shadow-lg shadow-[#FC3117]/20"
              >
                <span>Explore Work</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: easeOutExpo }}
            className="relative"
          >
            <div className="aspect-square rounded-[60px] bg-gradient-to-br from-[#FC3117]/10 to-[#FC3117]/5 flex items-center justify-center relative overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <BlobShape className="w-full h-full opacity-30" color="#FC3117" />
              </motion.div>
              <span className="text-8xl font-light text-[#FC3117]/40">K</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-[#FC3117] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Wave Divider */}
      <div className="text-[#FFF8F5] -mb-1">
        <WaveShape />
      </div>

      {/* Projects */}
      <section id="projects" className="bg-white py-24 px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-sm text-[#FC3117] tracking-wider uppercase">Portfolio</span>
            <h2 className="text-4xl md:text-5xl font-light mt-4">{tProjects('title')}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div
                  className="aspect-[4/5] rounded-[40px] overflow-hidden mb-6 relative"
                  style={{ backgroundColor: project.color }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.4 }}
                      className="w-32 h-32 opacity-30"
                    >
                      <BlobShape color="#2D2D2D" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      {project.type}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-medium group-hover:text-[#FC3117] transition-colors">
                  {project.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-8 relative">
        <div className="absolute top-0 left-0 right-0 text-white -mt-1 rotate-180">
          <WaveShape />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-[80px] bg-gradient-to-br from-[#FC3117]/20 to-[#FC3117]/5 relative overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute inset-8"
                >
                  <BlobShape className="w-full h-full" color="#FC3117" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-sm text-[#FC3117] tracking-wider uppercase">About Us</span>
              <h2 className="text-4xl md:text-5xl font-light mt-4 mb-8">
                {tAbout('title')}
                <span className="block text-[#FC3117] italic">{tAbout('highlight')}</span>
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                {tAbout('description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="bg-[#2D2D2D] text-white py-24 px-8 relative">
        <div className="absolute top-0 left-0 right-0 text-[#F5F0EB] -mt-1 rotate-180">
          <WaveShape />
        </div>

        <div className="max-w-6xl mx-auto pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-light mb-8"
              >
                Let's create<br />
                <span className="text-[#FC3117] italic">together</span>
              </motion.h2>
              <a
                href="mailto:hello@koolstudio.pl"
                className="text-xl hover:text-[#FC3117] transition-colors"
              >
                hello@koolstudio.pl
              </a>
            </div>
            <div className="text-right text-gray-400">
              <p>{tFooter('studio')}</p>
              <p>{tFooter('address')}</p>
              <p>{tFooter('city')}</p>
              <a
                href="https://instagram.com/koolstudio.pl"
                className="inline-block mt-6 text-white hover:text-[#FC3117] transition-colors"
              >
                Instagram →
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex justify-between items-center text-sm text-gray-500">
            <span>© 2024 Kool Studio</span>
            <span className="text-[#FC3117]/50">organic mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
