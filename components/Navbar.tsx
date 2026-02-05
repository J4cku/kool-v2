'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="w-full px-4 py-5 flex items-center justify-between">
          <a href="#" className="text-coral font-black text-[42px] leading-none tracking-tight">
            kool
          </a>

          <button
            onClick={() => setMenuOpen(true)}
            className="w-11 h-11 rounded-full bg-coral hover:bg-coral/90 transition-colors flex items-center justify-center"
            aria-label="Open menu"
          >
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </motion.nav>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
