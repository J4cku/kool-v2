'use client';

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import * as THREE from 'three';

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

function FloatingShape({
  position,
  color,
  scale = 1,
  speed = 1,
  rotationIntensity = 1,
  floatIntensity = 1,
  shape = 'box'
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  rotationIntensity?: number;
  floatIntensity?: number;
  shape?: 'box' | 'sphere' | 'torus' | 'octahedron';
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float
      speed={speed}
      rotationIntensity={rotationIntensity}
      floatIntensity={floatIntensity}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        {shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.6, 32, 32]} />}
        {shape === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
        {shape === 'octahedron' && <octahedronGeometry args={[0.7]} />}
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.2}
          radius={1}
        />
      </mesh>
    </Float>
  );
}

function MouseFollowCamera() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseRef.current.x * 0.5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseRef.current.y * 0.3 + 0.5, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return (
    <mesh
      onPointerMove={(e) => {
        mouseRef.current.x = (e.point.x / 5);
        mouseRef.current.y = (e.point.y / 5);
      }}
      position={[0, 0, 0]}
      visible={false}
    >
      <planeGeometry args={[100, 100]} />
    </mesh>
  );
}

function Scene() {
  const shapes = useMemo(() => [
    { position: [-3, 2, -2] as [number, number, number], color: '#FC3117', scale: 0.8, shape: 'box' as const, speed: 1.5 },
    { position: [3, -1, -3] as [number, number, number], color: '#1A1A1A', scale: 1.2, shape: 'sphere' as const, speed: 1 },
    { position: [-2, -2, -1] as [number, number, number], color: '#FC3117', scale: 0.6, shape: 'torus' as const, speed: 2 },
    { position: [2, 2, -4] as [number, number, number], color: '#E5DDD0', scale: 1.5, shape: 'octahedron' as const, speed: 0.8 },
    { position: [0, 3, -5] as [number, number, number], color: '#FC3117', scale: 0.5, shape: 'box' as const, speed: 1.2 },
    { position: [-4, 0, -3] as [number, number, number], color: '#1A1A1A', scale: 0.7, shape: 'sphere' as const, speed: 1.8 },
    { position: [4, 1, -2] as [number, number, number], color: '#E5DDD0', scale: 0.9, shape: 'torus' as const, speed: 1.3 },
  ], []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#FC3117" />

      {shapes.map((props, i) => (
        <FloatingShape key={i} {...props} />
      ))}

      <MouseFollowCamera />
      <Environment preset="city" />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ThreeDPage() {
  const t = useTranslations('hero');
  const tProjects = useTranslations('projects');
  const tAbout = useTranslations('about');
  const tFooter = useTranslations('footer');

  return (
    <div className="min-h-screen bg-beige text-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-coral font-black text-[42px] leading-none tracking-tight">
            kool
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted font-mono">3D_MODE</span>
            <div className="w-[30px] h-[30px] rounded-full bg-coral" />
          </div>
        </div>
      </nav>

      {/* Hero with 3D Background */}
      <section className="min-h-screen relative flex items-center overflow-hidden">
        {/* 3D Canvas Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 45 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <Scene />
            </Canvas>
          </Suspense>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full px-6 pt-24">
          <div className="max-w-content mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeOutExpo }}
              className="text-6xl md:text-8xl font-black leading-[0.95]"
            >
              <span className="block drop-shadow-lg">{t('title1')}</span>
              <span className="block text-coral italic drop-shadow-lg">{t('title2')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: easeOutExpo }}
              className="mt-8 text-lg md:text-xl text-muted max-w-xl backdrop-blur-sm bg-beige/30 p-4 rounded-2xl"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex items-center gap-4"
            >
              <span className="text-coral font-bold text-sm uppercase tracking-wider">
                Move your mouse to explore
              </span>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 left-6 flex items-center gap-3 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-coral"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
          <span className="text-coral font-bold text-sm uppercase tracking-wider">{t('scroll')}</span>
        </motion.div>
      </section>

      {/* Projects Section with 3D Cards */}
      <section className="py-24 px-6 bg-dark text-beige">
        <div className="max-w-content mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-16"
          >
            {tProjects('title')}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Belmonte', type: 'Hotel' },
              { name: 'Fandom', type: 'Commercial' },
              { name: 'Grabiszynek', type: 'Apartment' },
              { name: 'Umami', type: 'Restaurant' },
              { name: 'Nadodrze', type: 'Loft' },
              { name: 'Marina', type: 'Boutique Hotel' },
            ].map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  rotateY: 5,
                  rotateX: -5,
                }}
                style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-coral/20 to-coral/5 rounded-2xl p-6 flex flex-col justify-end relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-coral/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ transform: 'translateZ(20px)' }}
                  />
                  <span className="text-xs text-coral/60 mb-2">{project.type}</span>
                  <h3 className="text-2xl font-bold">{project.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About with Depth Effect */}
      <section className="py-24 px-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          className="absolute -right-32 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        >
          <Canvas camera={{ position: [0, 0, 5] }}>
            <Float speed={0.5} rotationIntensity={0.5}>
              <mesh scale={3}>
                <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                <meshStandardMaterial color="#FC3117" wireframe />
              </mesh>
            </Float>
            <ambientLight intensity={0.5} />
          </Canvas>
        </motion.div>

        <div className="max-w-content mx-auto relative z-10">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-coral text-sm font-bold uppercase tracking-wider"
            >
              {tAbout('label')}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black mt-4 mb-8"
            >
              {tAbout('title')}
              <span className="block text-coral italic">{tAbout('highlight')}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-lg text-muted leading-relaxed"
            >
              {tAbout('description')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-dark/10">
        <div className="max-w-content mx-auto">
          <div className="flex flex-col items-end text-right mb-16">
            <p className="text-coral font-light text-2xl md:text-4xl uppercase tracking-wide">
              {tFooter('studio')}
            </p>
            <a
              href="https://maps.app.goo.gl/f3nJEyLJXxKStLvPA"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <p className="text-coral font-light text-2xl md:text-4xl uppercase tracking-wide">
                {tFooter('address')}
              </p>
              <p className="text-coral font-light text-2xl md:text-4xl uppercase tracking-wide">
                {tFooter('city')}
              </p>
            </a>
            <a
              href="mailto:hello@koolstudio.pl"
              className="text-coral font-medium text-2xl md:text-4xl uppercase tracking-wide hover:opacity-70 transition-opacity mt-2"
            >
              hello@koolstudio.pl
            </a>
          </div>

          <div className="border-t border-coral/20 pt-6 flex justify-between items-center">
            <a
              href="https://instagram.com/koolstudio.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral font-bold text-sm uppercase tracking-wider hover:opacity-70 transition-opacity"
            >
              {tFooter('instagram')}
            </a>
            <span className="text-xs text-muted">3D Experience</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
