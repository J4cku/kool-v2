'use client';

import { useTranslations } from 'next-intl';
import AddressBlock from './AddressBlock';
import FooterBar from './FooterBar';
import LazyAutoplayVideo from './LazyAutoplayVideo';

interface FooterBannerProps {
  showAddress?: boolean;
  showMarquee?: boolean;
}

export default function FooterBanner({ showAddress = false, showMarquee = true }: FooterBannerProps) {
  const t = useTranslations('footer');
  const bannerText = t('banner');

  return (
    <footer className="pb-[calc(43px+env(safe-area-inset-bottom))]">
      {/* Marquee */}
      {showMarquee && (
        <div className="overflow-hidden whitespace-nowrap pt-8 md:pt-12 pb-2 bg-white">
          <div className="animate-marquee inline-block">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="font-[400] uppercase text-coral leading-tight mx-8 md:mx-16"
                style={{ fontSize: 'clamp(26px, 4.8vw, 64px)' }}
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
            <LazyAutoplayVideo
              src="/videos/reel.mp4"
              label="Kool Studio showreel"
              className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] object-cover"
            />
            <AddressBlock />
          </div>
        </div>
      )}

      {/* Fixed bottom bar: instagram + language toggle */}
      <FooterBar />
    </footer>
  );
}
