import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required by the PostHog proxy below: its API endpoints use trailing
  // slashes, which Next's automatic trailing-slash redirect would strip
  skipTrailingSlashRedirect: true,
  // First-party proxy for PostHog EU so ad blockers don't drop events.
  // /dot is also excluded from the next-intl matcher in proxy.ts — keep both
  // in sync if the prefix ever changes
  async rewrites() {
    return [
      {
        source: '/dot/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/dot/array/:path*',
        destination: 'https://eu-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/dot/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:locale(pl|en)/projekty/mieszkanie-widmo',
        destination: '/:locale/projekty/mieszkanie-midcentury',
        permanent: true,
      },
    ];
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'koolstudio.pl',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
