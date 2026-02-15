import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-5 text-center">
      <Image src="/logo.svg" alt="Kool Studio" width={120} height={40} className="mb-12 invert" />
      <h1
        className="text-coral font-[700] uppercase leading-tight mb-6"
        style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
      >
        oops!
      </h1>
      <p className="text-dark font-[300] text-[18px] md:text-[22px] mb-10">
        nothing kool over here.
      </p>
      <Link
        href="/pl/projekty"
        className="text-coral font-[600] text-[14px] md:text-[16px] uppercase tracking-[0.15em] hover:opacity-70 transition-opacity border-b border-coral pb-1"
      >
        check out the projects
      </Link>
    </div>
  );
}
