'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type LabMode = 'bento' | 'horizontal' | 'cursor' | 'reveal' | 'dark' | 'split' | 'marquee' | 'stacked' | 'magnetic' | 'stroke' | 'glass' | 'masked' | 'masonry' | 'retro' | 'editorial' | 'neon';

const modes: { id: LabMode; label: string }[] = [
  { id: 'bento', label: 'Bento' },
  { id: 'horizontal', label: 'H-Scroll' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'reveal', label: 'Reveal' },
  { id: 'dark', label: 'Dark+Grain' },
  { id: 'split', label: 'Split' },
  { id: 'marquee', label: 'Marquee' },
  { id: 'stacked', label: 'Stacked' },
  { id: 'magnetic', label: 'Magnetic' },
  { id: 'stroke', label: 'Stroke' },
  { id: 'glass', label: 'Glass' },
  { id: 'masked', label: 'Masked' },
  { id: 'masonry', label: 'Masonry' },
  { id: 'retro', label: 'Y2K' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'neon', label: 'Neon' },
];

const projects = [
  { name: 'Belmonte', type: 'Hotel', year: '2024', location: 'Ustronie Morskie' },
  { name: 'Fandom', type: 'Commercial', year: '2024', location: 'Wrocław' },
  { name: 'Grabiszynek', type: 'Apartment', year: '2024', location: 'Wrocław' },
  { name: 'Umami', type: 'Restaurant', year: '2023', location: 'Wrocław' },
  { name: 'Nadodrze', type: 'Loft', year: '2024', location: 'Wrocław' },
  { name: 'Marina', type: 'Boutique Hotel', year: '2023', location: 'Gdańsk' },
];

// ============ BENTO GRID ============
function BentoGrid() {
  return (
    <div className="min-h-screen bg-beige p-8 pt-32">
      <h2 className="text-5xl font-black mb-12">Projects</h2>
      <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[80vh]">
        {projects.map((project, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 0.98 }}
            className={`
              bg-gradient-to-br from-dark/5 to-dark/10 rounded-3xl p-6 flex flex-col justify-end cursor-pointer
              hover:from-coral/10 hover:to-coral/20 transition-colors
              ${i === 0 || i === 5 ? 'col-span-2 row-span-2' : ''}
              ${i === 3 || i === 4 ? 'col-span-2' : ''}
            `}
          >
            <span className="text-xs text-muted uppercase tracking-wider">{project.type}</span>
            <h3 className="text-2xl font-bold mt-1">{project.name}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ HORIZONTAL SCROLL ============
function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-60%']);

  return (
    <div ref={containerRef} className="h-[300vh] bg-beige pt-32">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 pl-8">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              className="w-[70vw] md:w-[50vw] h-[70vh] bg-gradient-to-br from-dark/5 to-dark/15 rounded-3xl p-12 flex flex-col justify-end shrink-0"
            >
              <span className="text-sm text-coral uppercase tracking-wider">{project.type}</span>
              <h3 className="text-6xl font-black mt-2">{project.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ============ CURSOR REACTIVE ============
function CursorReactive() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-beige p-8 pt-32 relative cursor-none">
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-coral pointer-events-none z-50 mix-blend-difference"
        animate={{ x: mousePos.x - 16, y: mousePos.y - 16, scale: cursorVariant === 'hover' ? 2 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-coral pointer-events-none z-50"
        animate={{ x: mousePos.x - 4, y: mousePos.y - 4 }}
        transition={{ type: 'spring', stiffness: 1000, damping: 28 }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(252,49,23,0.03), transparent 40%)` }}
      />
      <h2 className="text-5xl font-black mb-12">Move your cursor</h2>
      <div className="grid grid-cols-2 gap-8 max-w-4xl">
        {projects.slice(0, 4).map((project, i) => (
          <motion.div
            key={i}
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
            initial={{ scale: 1, backgroundColor: '#f5f0eb' }}
            whileHover={{ scale: 1.02, backgroundColor: '#FC311720' }}
            className="aspect-[4/3] rounded-3xl p-8 flex flex-col justify-end"
          >
            <h3 className="text-3xl font-bold">{project.name}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ SCROLL REVEAL ============
function ScrollReveal() {
  const words = "We create spaces that inspire, transform, and elevate everyday living into extraordinary experiences.".split(' ');

  return (
    <div className="min-h-[200vh] bg-beige pt-32 px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm text-coral uppercase tracking-wider mb-8">Our Philosophy</h2>
        <p className="text-5xl md:text-7xl font-black leading-tight">
          {words.map((word, i) => <Word key={i} word={word} index={i} />)}
        </p>
      </div>
      <div className="mt-32 space-y-8">
        {['Design', 'Build', 'Transform'].map((text, i) => <RevealLine key={i} text={text} index={i} />)}
      </div>
    </div>
  );
}

function Word({ word, index }: { word: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20%' });
  return (
    <span ref={ref} className="inline-block mr-[0.25em]">
      <motion.span className="inline-block" initial={{ opacity: 0.2 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: index * 0.05 }}>
        {word}
      </motion.span>
    </span>
  );
}

function RevealLine({ text, index }: { text: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.h3 className="text-8xl md:text-9xl font-black text-coral" initial={{ y: '100%' }} animate={isInView ? { y: 0 } : {}} transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}>
        {text}
      </motion.h3>
    </div>
  );
}

// ============ DARK MODE + GRAIN ============
function DarkGrain() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className="relative z-10 p-8 pt-32">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-9xl font-black leading-none mb-8">
          <span className="block">KOOL</span>
          <span className="block text-[#FC3117]">STUDIO</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl text-white/60 max-w-lg mb-16">
          Premium interior design for those who demand excellence.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
          {['50+', '12', '∞'].map((num, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className="bg-[#0a0a0a] p-8">
              <div className="text-6xl font-black text-[#FC3117]">{num}</div>
              <div className="text-sm text-white/40 mt-2 uppercase tracking-wider">{['Projects', 'Years', 'Ideas'][i]}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ SPLIT SCREEN ============
function SplitScreen() {
  const [splitPosition, setSplitPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPosition(Math.max(10, Math.min(90, x)));
  };

  return (
    <div className="min-h-screen bg-beige pt-32 px-8">
      <h2 className="text-5xl font-black mb-4">Before / After</h2>
      <p className="text-muted mb-8">Drag to compare</p>
      <div ref={containerRef} onMouseMove={handleMouseMove} className="relative h-[70vh] rounded-3xl overflow-hidden cursor-ew-resize">
        <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
          <span className="text-white/20 text-9xl font-black">BEFORE</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-coral/20 to-coral/40 flex items-center justify-center" style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}>
          <span className="text-coral/40 text-9xl font-black">AFTER</span>
        </div>
        <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: `${splitPosition}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M8 12H16M8 12L11 9M8 12L11 15M16 12L13 9M16 12L13 15" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MARQUEE ============
function Marquee() {
  const items = ['Interior Design', 'Architecture', 'Renovation', 'Consulting', 'Visualization', 'Styling'];

  return (
    <div className="min-h-screen bg-beige pt-32 overflow-hidden">
      <h2 className="text-5xl font-black mb-16 px-8">Services</h2>

      {/* Fast marquee */}
      <div className="relative py-8 bg-coral text-white overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: [0, -1920] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <span key={i} className="text-6xl font-black">{item} •</span>
          ))}
        </motion.div>
      </div>

      {/* Slow reverse marquee */}
      <div className="relative py-8 overflow-hidden border-y border-dark/10">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: [-1920, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...projects, ...projects, ...projects, ...projects].map((p, i) => (
            <span key={i} className="text-4xl font-light text-dark/30">{p.name} — {p.location} •</span>
          ))}
        </motion.div>
      </div>

      {/* Vertical marquee */}
      <div className="mt-16 px-8 grid grid-cols-3 gap-8 h-[50vh] overflow-hidden">
        {[0, 1, 2].map((col) => (
          <motion.div
            key={col}
            className="flex flex-col gap-4"
            animate={{ y: col % 2 === 0 ? [0, -500] : [-500, 0] }}
            transition={{ duration: 15 + col * 5, repeat: Infinity, ease: 'linear' }}
          >
            {[...projects, ...projects, ...projects].map((p, i) => (
              <div key={i} className="bg-dark/5 rounded-2xl p-6">
                <div className="text-xs text-coral uppercase">{p.type}</div>
                <div className="text-xl font-bold">{p.name}</div>
                <div className="text-sm text-muted">{p.year}</div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ STACKED CARDS ============
function StackedCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

  return (
    <div ref={containerRef} className="min-h-[400vh] bg-beige pt-32 px-8">
      <div className="sticky top-32 h-[70vh]">
        <h2 className="text-5xl font-black mb-8">Our Process</h2>
        <div className="relative h-[50vh]">
          {['Discovery', 'Concept', 'Design', 'Build', 'Deliver'].map((step, i) => {
            const start = i / 5;
            const end = (i + 1) / 5;
            return (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-3xl p-8 flex flex-col justify-between"
                style={{
                  backgroundColor: i % 2 === 0 ? '#FC3117' : '#1A1A1A',
                  color: 'white',
                  zIndex: i,
                }}
                initial={{ y: 100 * i, scale: 1 - i * 0.05, opacity: 0 }}
                whileInView={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-9xl font-black opacity-20">0{i + 1}</div>
                <div>
                  <div className="text-sm uppercase tracking-wider opacity-60">Step {i + 1}</div>
                  <div className="text-5xl font-black">{step}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ MAGNETIC BUTTONS ============
function MagneticButtons() {
  return (
    <div className="min-h-screen bg-beige pt-32 px-8">
      <h2 className="text-5xl font-black mb-4">Magnetic Elements</h2>
      <p className="text-muted mb-16">Hover over the buttons</p>

      <div className="flex flex-wrap gap-8 justify-center">
        {['View Projects', 'Contact Us', 'About Studio', 'Services', 'Portfolio'].map((text, i) => (
          <MagneticButton key={i} text={text} variant={i % 2 === 0 ? 'filled' : 'outline'} />
        ))}
      </div>

      <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8">
        {projects.map((p, i) => (
          <MagneticCard key={i} project={p} />
        ))}
      </div>
    </div>
  );
}

function MagneticButton({ text, variant }: { text: string; variant: 'filled' | 'outline' }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`px-8 py-4 rounded-full text-lg font-bold transition-colors ${
        variant === 'filled' ? 'bg-coral text-white hover:bg-dark' : 'border-2 border-dark hover:bg-dark hover:text-white'
      }`}
    >
      {text}
    </motion.button>
  );
}

function MagneticCard({ project }: { project: typeof projects[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [10, -10]);
  const rotateY = useTransform(x, [-50, 50], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="aspect-square bg-gradient-to-br from-dark/5 to-dark/10 rounded-3xl p-6 flex flex-col justify-end cursor-pointer hover:from-coral/10 hover:to-coral/20"
    >
      <div className="text-xs text-coral uppercase">{project.type}</div>
      <div className="text-xl font-bold">{project.name}</div>
    </motion.div>
  );
}

// ============ TEXT STROKE ============
function TextStroke() {
  return (
    <div className="min-h-screen bg-beige pt-32 px-8 overflow-hidden">
      <div className="space-y-[-2vw]">
        {['INTERIOR', 'DESIGN', 'STUDIO'].map((text, i) => (
          <motion.h1
            key={i}
            initial={{ x: i % 2 === 0 ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 0.8 }}
            className="text-[15vw] font-black leading-none"
            style={{
              WebkitTextStroke: i === 1 ? '2px #1A1A1A' : 'none',
              WebkitTextFillColor: i === 1 ? 'transparent' : i === 2 ? '#FC3117' : '#1A1A1A',
            }}
          >
            {text}
          </motion.h1>
        ))}
      </div>

      <div className="mt-32 grid grid-cols-2 gap-8">
        {projects.slice(0, 4).map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <h3
              className="text-6xl font-black transition-all duration-300"
              style={{
                WebkitTextStroke: '1px #1A1A1A',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <span className="group-hover:[-webkit-text-fill-color:#FC3117] transition-all">{p.name}</span>
            </h3>
            <p className="text-muted mt-2">{p.type} — {p.location}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ GLASSMORPHISM ============
function Glassmorphism() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral/30 via-purple-500/20 to-blue-500/30 pt-32 px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-coral/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />

      <div className="relative z-10">
        <h2 className="text-5xl font-black mb-16 text-white drop-shadow-lg">Glass Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-xl"
            >
              <div className="text-sm text-white/60 uppercase tracking-wider">{p.type}</div>
              <h3 className="text-3xl font-bold text-white mt-2">{p.name}</h3>
              <p className="text-white/50 mt-4">{p.location}, {p.year}</p>
              <button className="mt-6 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm hover:bg-white/30 transition-colors">
                View Project →
              </button>
            </motion.div>
          ))}
        </div>

        {/* Glass stats */}
        <div className="mt-16 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 grid grid-cols-3 gap-8">
          {[
            { num: '50+', label: 'Projects' },
            { num: '12', label: 'Years' },
            { num: '100%', label: 'Satisfaction' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-black text-white">{stat.num}</div>
              <div className="text-white/50 text-sm uppercase tracking-wider mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ MASKED TEXT ============
function MaskedText() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white pt-32 px-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute text-9xl font-black text-white/5" style={{ top: `${(i * 15) % 100}%`, left: `${(i * 23) % 100}%`, transform: 'rotate(-15deg)' }}>
            KOOL
          </div>
        ))}
      </div>

      {/* Masked reveal circle */}
      <div
        className="fixed inset-0 pointer-events-none z-20"
        style={{
          background: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, transparent, #1A1A1A 100%)`,
        }}
      />

      {/* Reveal content (coral version behind) */}
      <div className="absolute inset-0 pt-32 px-8" style={{ clipPath: `circle(150px at ${mousePos.x}px ${mousePos.y}px)` }}>
        <div className="text-coral">
          <h1 className="text-8xl font-black">REVEAL</h1>
          <h1 className="text-8xl font-black">THE</h1>
          <h1 className="text-8xl font-black">MAGIC</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <h1 className="text-8xl font-black">REVEAL</h1>
        <h1 className="text-8xl font-black">THE</h1>
        <h1 className="text-8xl font-black">MAGIC</h1>
        <p className="mt-8 text-white/50 max-w-md">Move your cursor to reveal hidden content. This technique creates curiosity and engagement.</p>
      </div>
    </div>
  );
}

// ============ MASONRY GALLERY ============
function MasonryGallery() {
  const heights = [300, 400, 250, 350, 280, 320, 380, 260, 340, 290, 360, 310];

  return (
    <div className="min-h-screen bg-beige pt-32 px-8">
      <h2 className="text-5xl font-black mb-16">Gallery</h2>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {heights.map((height, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 4) * 0.1 }}
            whileHover={{ scale: 0.98 }}
            className="mb-4 rounded-2xl overflow-hidden cursor-pointer group"
            style={{ height }}
          >
            <div className={`w-full h-full ${i % 3 === 0 ? 'bg-coral' : i % 3 === 1 ? 'bg-dark' : 'bg-dark/20'} flex items-center justify-center relative`}>
              <span className={`text-4xl font-black ${i % 3 === 2 ? 'text-dark/30' : 'text-white/30'}`}>{String(i + 1).padStart(2, '0')}</span>
              <div className="absolute inset-0 bg-coral/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold">View</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============ Y2K / RETRO ============
function RetroY2K() {
  return (
    <div className="min-h-screen bg-[#FF00FF] pt-32 px-8 relative overflow-hidden font-mono">
      {/* Retro grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(#00FFFF33 1px, transparent 1px), linear-gradient(90deg, #00FFFF33 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Floating elements */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-20 right-20 w-32 h-32 border-4 border-[#00FFFF]" />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute bottom-40 left-20 w-24 h-24 border-4 border-[#FFFF00] rounded-full" />

      <div className="relative z-10">
        <motion.h1
          animate={{ textShadow: ['4px 4px 0px #00FFFF', '4px 4px 0px #FFFF00', '4px 4px 0px #00FFFF'] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-7xl md:text-9xl font-black text-white leading-none"
        >
          KOOL<br />STUDIO
        </motion.h1>

        <div className="mt-16 flex gap-4 flex-wrap">
          {['✦ DESIGN', '✦ BUILD', '✦ VIBE'].map((text, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
              className="px-6 py-3 bg-[#00FFFF] text-[#FF00FF] font-bold text-xl"
            >
              {text}
            </motion.span>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div key={i} className="bg-white p-4 border-4 border-black shadow-[8px_8px_0px_#000]">
              <div className="text-xs text-[#FF00FF]">{p.type}</div>
              <div className="text-xl font-bold">{p.name}</div>
              <div className="text-sm text-gray-500">{p.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ EDITORIAL ============
function Editorial() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] pt-32 px-8 font-serif">
      {/* Masthead */}
      <header className="border-b-2 border-black pb-4 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.3em]">The Interior Design Journal</div>
            <h1 className="text-6xl font-bold italic">Kool Studio</h1>
          </div>
          <div className="text-right text-sm">
            <div>Vol. XII — No. 4</div>
            <div>Winter 2024</div>
          </div>
        </div>
      </header>

      {/* Main article */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 border-r border-black/20 pr-8">
          <h2 className="text-5xl font-bold leading-tight mb-6">
            The Art of Transforming Spaces Into Living Poetry
          </h2>
          <div className="flex gap-4 text-sm text-gray-600 mb-8">
            <span>By Maria Kowalska</span>
            <span>•</span>
            <span>Photography by Jan Nowak</span>
          </div>
          <div className="columns-2 gap-8 text-justify leading-relaxed">
            <p className="first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-2">
              In the realm of interior design, few studios have managed to capture the essence of contemporary Polish aesthetics quite like Kool Studio. Founded in Wrocław, this innovative practice has redefined what it means to create spaces that breathe, inspire, and endure.
            </p>
            <p className="mt-4">
              Their approach combines meticulous attention to detail with a bold vision that challenges conventional boundaries. Each project tells a story—a narrative woven through carefully selected materials, thoughtful spatial arrangements, and an unwavering commitment to sustainability.
            </p>
            <p className="mt-4">
              "We don't just design rooms," explains the studio's founder. "We orchestrate experiences. Every corner, every shadow, every beam of light has a purpose."
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-8">
          <div className="border-2 border-black p-6">
            <div className="text-xs uppercase tracking-wider mb-2">Featured Projects</div>
            {projects.slice(0, 3).map((p, i) => (
              <div key={i} className="py-3 border-b border-black/20 last:border-0">
                <div className="font-bold">{p.name}</div>
                <div className="text-sm text-gray-600">{p.type} — {p.location}</div>
              </div>
            ))}
          </div>

          <blockquote className="border-l-4 border-black pl-4 italic text-2xl">
            "Design is not just what it looks like. Design is how it works."
          </blockquote>

          <div className="bg-black text-white p-6">
            <div className="text-xs uppercase tracking-wider mb-4">By Numbers</div>
            <div className="text-5xl font-bold">50+</div>
            <div className="text-sm opacity-60">Projects Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ NEON ============
function Neon() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-32 px-8 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF00FF]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00FFFF]/20 rounded-full blur-[100px]" />

      <div className="relative z-10">
        <motion.h1
          className="text-8xl md:text-[12rem] font-black text-transparent leading-none"
          style={{
            WebkitTextStroke: '2px #FF00FF',
            textShadow: '0 0 20px #FF00FF, 0 0 40px #FF00FF, 0 0 80px #FF00FF',
          }}
          animate={{ textShadow: ['0 0 20px #FF00FF, 0 0 40px #FF00FF', '0 0 40px #00FFFF, 0 0 80px #00FFFF', '0 0 20px #FF00FF, 0 0 40px #FF00FF'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          KOOL
        </motion.h1>

        <div className="mt-16 flex flex-wrap gap-4">
          {['DESIGN', 'BUILD', 'DREAM'].map((text, i) => (
            <motion.div
              key={i}
              className="px-8 py-4 border-2 rounded-full"
              style={{
                borderColor: i === 0 ? '#FF00FF' : i === 1 ? '#00FFFF' : '#FFFF00',
                color: i === 0 ? '#FF00FF' : i === 1 ? '#00FFFF' : '#FFFF00',
                boxShadow: `0 0 20px ${i === 0 ? '#FF00FF' : i === 1 ? '#00FFFF' : '#FFFF00'}40`,
              }}
              whileHover={{
                boxShadow: `0 0 40px ${i === 0 ? '#FF00FF' : i === 1 ? '#00FFFF' : '#FFFF00'}`,
                scale: 1.05,
              }}
            >
              <span className="font-bold text-xl">{text}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 grid grid-cols-2 md:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <motion.div
              key={i}
              className="p-6 border border-white/10 rounded-2xl backdrop-blur-sm"
              whileHover={{ borderColor: '#FF00FF', boxShadow: '0 0 30px #FF00FF40' }}
            >
              <div className="text-[#00FFFF] text-xs uppercase tracking-wider">{p.type}</div>
              <div className="text-white text-2xl font-bold mt-2">{p.name}</div>
              <div className="text-white/40 text-sm mt-1">{p.location}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function LabPage() {
  const [activeMode, setActiveMode] = useState<LabMode>('bento');

  const renderContent = () => {
    switch (activeMode) {
      case 'bento': return <BentoGrid />;
      case 'horizontal': return <HorizontalScroll />;
      case 'cursor': return <CursorReactive />;
      case 'reveal': return <ScrollReveal />;
      case 'dark': return <DarkGrain />;
      case 'split': return <SplitScreen />;
      case 'marquee': return <Marquee />;
      case 'stacked': return <StackedCards />;
      case 'magnetic': return <MagneticButtons />;
      case 'stroke': return <TextStroke />;
      case 'glass': return <Glassmorphism />;
      case 'masked': return <MaskedText />;
      case 'masonry': return <MasonryGallery />;
      case 'retro': return <RetroY2K />;
      case 'editorial': return <Editorial />;
      case 'neon': return <Neon />;
      default: return <BentoGrid />;
    }
  };

  const isDark = ['dark', 'masked', 'neon'].includes(activeMode);
  const isColorful = ['glass', 'retro'].includes(activeMode);

  return (
    <div className={isDark ? 'bg-[#0a0a0a]' : isColorful ? '' : 'bg-beige'}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-5 ${isDark ? 'bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent' : 'bg-gradient-to-b from-beige via-beige/80 to-transparent'}`}>
        <div className="flex justify-between items-center">
          <Link href="/" className={`font-black text-[42px] leading-none tracking-tight ${isDark ? 'text-white' : 'text-coral'}`}>
            kool
          </Link>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-mono ${isDark ? 'text-white/50' : 'text-muted'}`}>LAB_MODE</span>
            <div className="w-[30px] h-[30px] rounded-full bg-coral" />
          </div>
        </div>
      </nav>

      {/* Mode Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/90 backdrop-blur-xl border border-dark/10 shadow-lg overflow-x-auto">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeMode === mode.id ? 'bg-coral text-white' : 'text-dark/70 hover:text-dark hover:bg-dark/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
