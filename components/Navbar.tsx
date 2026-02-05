'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';

const navLinks = [
  { href: '#projekty', label: 'projekty' },
  { href: '#studio', label: 'studio' },
  { href: '#oferta', label: 'oferta' },
  { href: '#kontakt', label: 'kontakt' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
          scrolled ? 'shadow-md bg-beige/95 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-content mx-auto px-6 py-5 flex items-center justify-between">
          <a href="#" className="text-coral font-black text-[42px] leading-none tracking-tight">
            kool
          </a>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-coral font-bold text-sm uppercase tracking-wider hover:opacity-70 transition-opacity"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="w-11 h-11 rounded-full bg-coral hover:bg-coral/90 transition-colors flex items-center justify-center"
              aria-label="Open menu"
            >
              <span className="sr-only">Menu</span>
            </button>
          </div>
        </div>
      </motion.nav>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />
    </>
  );
}
