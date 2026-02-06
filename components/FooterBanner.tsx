'use client';

import { useTranslations } from 'next-intl';
import LanguageToggle from './LanguageToggle';

interface FooterBannerProps {
  showAddress?: boolean;
  showMarquee?: boolean;
}

export default function FooterBanner({ showAddress = false, showMarquee = true }: FooterBannerProps) {
  const t = useTranslations('footer');
  const bannerText = t('banner');

  return (
    <footer className="pb-10">
      {/* Marquee */}
      {showMarquee && (
        <div className="overflow-hidden whitespace-nowrap pt-8 md:pt-12 pb-2">
          <div className="animate-marquee inline-block">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="font-[400] uppercase text-coral leading-tight mx-8 md:mx-16"
                style={{ fontSize: 'clamp(32px, 6vw, 80px)' }}
              >
                {bannerText}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Address / Email — only on main page */}
      {showAddress && (
        <div className="px-5 md:px-10 lg:px-12">
          <div className="max-w-content mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8 py-12">
            <video
              src="/videos/reel.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] object-cover"
            />
            <div className="inline-flex flex-col">
              <a
                href="https://maps.app.goo.gl/f3nJEyLJXxKStLvPA"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-[400] uppercase text-coral hover:opacity-70 transition-opacity w-full"
                style={{ fontSize: 'clamp(28px, 3.5vw, 45px)', textAlign: 'justify', textAlignLast: 'justify' } as React.CSSProperties}
              >
                {t('address')}
              </a>
              <a
                href="mailto:hello@koolstudio.pl"
                className="block font-[700] uppercase text-coral hover:opacity-70 transition-opacity w-full"
                style={{ fontSize: 'clamp(32px, 4.2vw, 55px)' }}
              >
                {t('email')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom bar: separator + language toggle — no background */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="w-full bg-coral" style={{ height: '0.5px' }} />
        <div className="px-3 md:px-5 py-2 flex justify-end">
          <LanguageToggle />
        </div>
      </div>
    </footer>
  );
}
