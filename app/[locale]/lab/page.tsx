'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type LabMode = 'bento' | 'horizontal' | 'cursor' | 'reveal' | 'dark' | 'split';

const modes: { id: LabMode; label: string; description: string }[] = [
  { id: 'bento', label: 'Bento Grid', description: 'Asymmetric dashboard-style layout' },
  { id: 'horizontal', label: 'Horizontal Scroll', description: 'Cinematic sideways scrolling' },
  { id: 'cursor', label: 'Cursor Reactive', description: 'Mouse-following effects' },
  { id: 'reveal', label: 'Scroll Reveal', description: 'Text reveals on scroll' },
  { id: 'dark', label: 'Dark + Grain', description: 'Premium dark theme with texture' },
  { id: 'split', label: 'Split Screen', description: 'Before/after comparison' },
];

// ============ BENTO GRID ============
function BentoGrid() {
  const projects = [
    { name: 'Belmonte', type: 'Hotel', size: 'large' },
    { name: 'Fandom', type: 'Commercial', size: 'small' },
    { name: 'Umami', type: 'Restaurant', size: 'small' },
    { name: 'Grabiszynek', type: 'Apartment', size: 'medium' },
    { name: 'Nadodrze', type: 'Loft', size: 'medium' },
    { name: 'Marina', type: 'Boutique', size: 'large' },
  ];

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
              ${project.size === 'large' ? 'col-span-2 row-span-2' : ''}
              ${project.size === 'medium' ? 'col-span-2' : ''}
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

  const projects = [
    { name: 'Belmonte', type: 'Hotel' },
    { name: 'Fandom', type: 'Commercial' },
    { name: 'Grabiszynek', type: 'Apartment' },
    { name: 'Umami', type: 'Restaurant' },
    { name: 'Nadodrze', type: 'Loft' },
    { name: 'Marina', type: 'Boutique' },
  ];

  return (
    <div ref={containerRef} className="h-[300vh] bg-beige pt-32">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 pl-8">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
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

  const cards = [
    { name: 'Belmonte', color: '#FC3117' },
    { name: 'Fandom', color: '#1A1A1A' },
    { name: 'Umami', color: '#FC3117' },
    { name: 'Grabiszynek', color: '#888888' },
  ];

  return (
    <div className="min-h-screen bg-beige p-8 pt-32 relative cursor-none">
      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-coral pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          scale: cursorVariant === 'hover' ? 2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-coral pointer-events-none z-50"
        animate={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
        }}
        transition={{ type: 'spring', stiffness: 1000, damping: 28 }}
      />

      {/* Spotlight Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(252,49,23,0.03), transparent 40%)`,
        }}
      />

      <h2 className="text-5xl font-black mb-12">Move your cursor</h2>

      <div className="grid grid-cols-2 gap-8 max-w-4xl">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
            initial={{ scale: 1, backgroundColor: '#f5f0eb' }}
            whileHover={{ scale: 1.02, backgroundColor: card.color + '20' }}
            style={{
              transform: `perspective(1000px) rotateY(${(mousePos.x - window.innerWidth / 2) * 0.01}deg) rotateX(${(mousePos.y - window.innerHeight / 2) * -0.01}deg)`,
            }}
            className="aspect-[4/3] rounded-3xl p-8 flex flex-col justify-end"
          >
            <h3 className="text-3xl font-bold">{card.name}</h3>
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
          {words.map((word, i) => (
            <Word key={i} word={word} index={i} />
          ))}
        </p>
      </div>

      <div className="mt-32 space-y-8">
        {['Design', 'Build', 'Transform'].map((text, i) => (
          <RevealLine key={i} text={text} index={i} />
        ))}
      </div>
    </div>
  );
}

function Word({ word, index }: { word: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20%' });

  return (
    <span ref={ref} className="inline-block mr-[0.25em]">
      <motion.span
        className="inline-block"
        initial={{ opacity: 0.2 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.05 }}
      >
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
      <motion.h3
        className="text-8xl md:text-9xl font-black text-coral"
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : {}}
        transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.h3>
    </div>
  );
}

// ============ DARK MODE + GRAIN ============
function DarkGrain() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 p-8 pt-32">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl md:text-9xl font-black leading-none mb-8"
        >
          <span className="block">KOOL</span>
          <span className="block text-[#FC3117]">STUDIO</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-white/60 max-w-lg mb-16"
        >
          Premium interior design for those who demand excellence.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
          {['50+', '12', '∞'].map((num, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-[#0a0a0a] p-8"
            >
              <div className="text-6xl font-black text-[#FC3117]">{num}</div>
              <div className="text-sm text-white/40 mt-2 uppercase tracking-wider">
                {['Projects', 'Years', 'Ideas'][i]}
              </div>
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

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative h-[70vh] rounded-3xl overflow-hidden cursor-ew-resize"
      >
        {/* Before (Dark) */}
        <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
          <span className="text-white/20 text-9xl font-black">BEFORE</span>
        </div>

        {/* After (Light) */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-coral/20 to-coral/40 flex items-center justify-center"
          style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
        >
          <span className="text-coral/40 text-9xl font-black">AFTER</span>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${splitPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
              <path d="M8 12H16M8 12L11 9M8 12L11 15M16 12L13 9M16 12L13 15" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function LabPage() {
  const [activeMode, setActiveMode] = useState<LabMode>('bento');
  const t = useTranslations('hero');

  const renderContent = () => {
    switch (activeMode) {
      case 'bento': return <BentoGrid />;
      case 'horizontal': return <HorizontalScroll />;
      case 'cursor': return <CursorReactive />;
      case 'reveal': return <ScrollReveal />;
      case 'dark': return <DarkGrain />;
      case 'split': return <SplitScreen />;
      default: return <BentoGrid />;
    }
  };

  return (
    <div className={activeMode === 'dark' ? 'bg-[#0a0a0a]' : 'bg-beige'}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-5 bg-gradient-to-b from-beige via-beige/80 to-transparent">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-coral font-black text-[42px] leading-none tracking-tight">
            kool
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted font-mono">LAB_MODE</span>
            <div className="w-[30px] h-[30px] rounded-full bg-coral" />
          </div>
        </div>
      </nav>

      {/* Mode Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/80 backdrop-blur-xl border border-dark/10 shadow-lg">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeMode === mode.id
                  ? 'bg-coral text-white'
                  : 'text-dark/70 hover:text-dark hover:bg-dark/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
