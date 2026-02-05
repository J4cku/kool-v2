'use client';

import { motion } from 'framer-motion';

export default function ContactSection() {
  return (
    <section id="kontakt" className="py-24 md:py-32 px-6">
      <div className="max-w-content mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="fluid-heading-sm font-black italic text-dark mb-16">
            kontakt
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
        >
          <div>
            <p className="text-coral font-bold text-lg mb-2">KOOL STUDIO</p>
            <p className="text-dark font-bold">
              Zaporoska 83/15
              <br />
              Wrocław
            </p>
          </div>

          <div>
            <p className="text-muted text-sm uppercase tracking-wider mb-2">Email</p>
            <a
              href="mailto:hello@koolstudio.pl"
              className="text-coral font-bold text-lg hover:opacity-70 transition-opacity"
            >
              HELLO@KOOLSTUDIO.PL
            </a>
          </div>

          <div>
            <p className="text-muted text-sm uppercase tracking-wider mb-2">Social</p>
            <div className="flex justify-center gap-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral font-bold hover:opacity-70 transition-opacity"
              >
                INSTAGRAM
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral font-bold hover:opacity-70 transition-opacity"
              >
                LINKEDIN
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
