'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
}

export default function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-coral flex flex-col items-center justify-center"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-6 w-11 h-11 rounded-full bg-beige flex items-center justify-center text-dark text-2xl font-bold hover:bg-beige/90 transition-colors"
            aria-label="Close menu"
          >
            &times;
          </button>

          <nav className="flex flex-col items-center gap-8">
            {links.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={onClose}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-white font-black text-5xl md:text-6xl uppercase tracking-wide hover:opacity-80 transition-opacity"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
