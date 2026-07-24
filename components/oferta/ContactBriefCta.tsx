'use client';

import { useSyncExternalStore } from 'react';
import { Link } from '@/i18n/navigation';
import { featureFlagEnabled, subscribeFeatureFlags } from '@/lib/analytics';
import ScrollWeightHeading from './ScrollWeightHeading';

/* Closing brief CTA on the commercial subpage. Fail-closed on the same
   'brief-form' flag as the kontakt modal: the whole block stays hidden until
   the flag is on, then the link deep-links to /kontakt#brief, which opens the
   brief modal there. */
export default function ContactBriefCta({
  heading,
  cta,
}: {
  heading: string;
  cta: string;
}) {
  const enabled = useSyncExternalStore(
    subscribeFeatureFlags,
    () => featureFlagEnabled('brief-form'),
    () => false,
  );

  if (!enabled) return null;

  return (
    <div className="mt-24 md:mt-32">
      <ScrollWeightHeading
        id="contact"
        as="h2"
        text={heading}
        className="text-dark uppercase mb-6 md:mb-8 leading-[1.02]"
        style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
      />
      <Link
        href={{ pathname: '/kontakt', hash: 'brief' }}
        className="inline-flex items-center gap-3 md:gap-4 text-coral font-[600] uppercase hover:opacity-60 transition-opacity"
        style={{ fontSize: 'clamp(15px, 1.6vw, 22px)' }}
      >
        {cta} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
