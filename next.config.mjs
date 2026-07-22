import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
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
