import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { PrzelotItem } from './PrzelotMount';

/* The layer that was always underneath: the same 15 photographs linking to
   the same destinations. Rendered as the visible grid when the canvas never
   mounts (reduced motion, no WebGL2), and as a visually-hidden list behind
   the live canvas so assistive tech gets the whole set, not only the
   current ring. */
export default async function StaticFallback({
  locale,
  items,
  srOnly = false,
}: {
  locale: string;
  items: PrzelotItem[];
  srOnly?: boolean;
}) {
  /* tabIndex -1: these links are for the screen-reader virtual cursor, not
     the Tab order — focusing a visually-hidden link parked at the top of the
     document would smooth-scroll the page to y=0 and rewind the tunnel. */
  if (srOnly) {
    return (
      <ol className="sr-only">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/projekty/${item.slug}`} tabIndex={-1}>
              {item.title}, {item.location}
            </Link>
          </li>
        ))}
      </ol>
    );
  }

  const t = await getTranslations({ locale, namespace: 'przelot' });

  return (
    <div className="mx-auto w-full max-w-content px-5 pb-24 pt-24 md:px-10 md:pt-32">
      <p className="text-[13px] font-[700] uppercase tracking-[0.16em] text-coral">
        {t('fallback.heading')}
      </p>
      <p className="mt-4 max-w-[640px] text-[15px] font-[300] leading-[1.6] text-dark md:text-[17px]">
        {t('fallback.intro')}
      </p>
      <ol className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/projekty/${item.slug}`} className="block">
              <span className="block aspect-square overflow-hidden">
                <Image
                  src={item.thumbnail}
                  alt=""
                  width={720}
                  height={720}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="mt-2 block text-[12px] uppercase tracking-[0.12em] text-dark">
                {item.title}
              </span>
              <span className="block text-[12px] text-muted">{item.location}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
