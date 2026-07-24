'use client';

import { Link } from '@/i18n/navigation';
import ScrollWeightHeading from './ScrollWeightHeading';

/* Closing call-to-action — the final section of the commercial subpage.
   Deep-links to /kontakt#brief, which opens the brief modal on the kontakt
   page when the 'brief-form' flag is on (otherwise it just lands on kontakt). */
export default function ContactBriefCta({
  heading,
  cta,
}: {
  heading: string;
  cta: string;
}) {
  return (
    <div className="mt-20 md:mt-28">
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
