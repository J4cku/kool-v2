'use client';

import { useTranslations } from 'next-intl';
import AddressBlock from './AddressBlock';
import FooterBar from './FooterBar';

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
            <video
              src="/videos/reel.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Kool Studio showreel"
              className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] object-cover"
            />
            <AddressBlock />
          </div>
        </div>
      )}

      {/* Coral separator line (in page flow) */}
      <div className="w-full bg-coral h-px origin-top [transform:scaleY(0.5)]" />

      {/* Fixed bottom bar: instagram + language toggle */}
      <FooterBar />
    </footer>
  );
}
