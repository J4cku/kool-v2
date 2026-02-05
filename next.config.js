/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'koolstudio.pl',
      },
    ],
  },
}

module.exports = nextConfig
