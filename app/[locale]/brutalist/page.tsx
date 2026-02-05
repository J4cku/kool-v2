'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function BrutalistPage() {
  const t = useTranslations('hero');
  const tNav = useTranslations('nav');
  const tProjects = useTranslations('projects');
  const tAbout = useTranslations('about');
  const tFooter = useTranslations('footer');

  const projects = [
    { id: 1, name: 'BELMONTE', type: 'HOTEL', year: '2024' },
    { id: 2, name: 'FANDOM', type: 'COMMERCIAL', year: '2024' },
    { id: 3, name: 'GRABISZYNEK', type: 'RESIDENTIAL', year: '2024' },
    { id: 4, name: 'UMAMI', type: 'GASTRO', year: '2023' },
    { id: 5, name: 'NADODRZE', type: 'LOFT', year: '2024' },
    { id: 6, name: 'MARINA', type: 'HOTEL', year: '2023' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b-4 border-white bg-black">
        <div className="flex justify-between items-center p-4">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:text-[#00FF00] transition-colors">
            KOOL_
          </Link>
          <div className="flex gap-8 text-sm">
            <a href="#work" className="hover:text-[#00FF00] transition-colors">[WORK]</a>
            <a href="#about" className="hover:text-[#00FF00] transition-colors">[ABOUT]</a>
            <a href="#contact" className="hover:text-[#00FF00] transition-colors">[CONTACT]</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center border-b-4 border-white pt-20">
        <div className="w-full p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            <h1 className="text-[12vw] font-black leading-[0.85] tracking-tighter uppercase">
              <span className="block">{t('title1')}</span>
              <span className="block text-[#FF0000]">{t('title2')}</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12 max-w-xl border-l-4 border-[#00FF00] pl-4"
          >
            <p className="text-lg text-gray-400">{t('subtitle')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <span className="inline-block border-2 border-white px-6 py-3 text-sm hover:bg-white hover:text-black transition-colors cursor-pointer">
              {t('scroll')} ↓
            </span>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="work" className="border-b-4 border-white">
        <div className="p-8 border-b-2 border-white/30">
          <h2 className="text-4xl font-black">[{tProjects('title').toUpperCase()}]</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="border-b-2 border-r-2 border-white/30 p-8 hover:bg-white hover:text-black transition-colors group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-gray-500 group-hover:text-gray-600">/{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xs border border-current px-2 py-1">{project.type}</span>
              </div>
              <h3 className="text-3xl font-black mb-2">{project.name}</h3>
              <p className="text-sm text-gray-500 group-hover:text-gray-600">{project.year}</p>
              <div className="mt-8 h-48 bg-gray-900 group-hover:bg-gray-200 transition-colors flex items-center justify-center">
                <span className="text-6xl font-black text-gray-800 group-hover:text-gray-300">{String(i + 1).padStart(2, '0')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-b-4 border-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 border-b-2 lg:border-b-0 lg:border-r-2 border-white/30">
            <h2 className="text-4xl font-black mb-8">[{tAbout('title').toUpperCase()}]</h2>
            <p className="text-xl leading-relaxed text-gray-400">
              {tAbout('description')}
            </p>
          </div>
          <div className="p-8 bg-[#FF0000] text-black">
            <div className="text-9xl font-black leading-none">
              WE<br/>
              BUILD<br/>
              SPACES
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b-4 border-white">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { num: '50+', label: 'PROJECTS' },
            { num: '12', label: 'YEARS' },
            { num: '∞', label: 'IDEAS' },
            { num: '01', label: 'STUDIO' },
          ].map((stat, i) => (
            <div key={i} className="p-8 border-r-2 border-white/30 last:border-r-0">
              <div className="text-5xl md:text-7xl font-black text-[#00FF00]">{stat.num}</div>
              <div className="text-sm text-gray-500 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-4xl font-black mb-4">[CONTACT]</h2>
            <a href="mailto:hello@koolstudio.pl" className="text-2xl text-[#00FF00] hover:underline">
              hello@koolstudio.pl
            </a>
          </div>
          <div className="text-right">
            <p className="text-gray-500">{tFooter('studio')}</p>
            <p className="text-gray-500">{tFooter('address')}</p>
            <p className="text-gray-500">{tFooter('city')}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t-2 border-white/30">
          <span className="text-xs text-gray-600">© 2024 KOOL STUDIO</span>
          <a
            href="https://instagram.com/koolstudio.pl"
            className="text-xs hover:text-[#00FF00] transition-colors"
          >
            [INSTAGRAM]
          </a>
        </div>
      </footer>

      {/* Floating style indicator */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-600 font-mono">
        BRUTALIST_MODE
      </div>
    </div>
  );
}
