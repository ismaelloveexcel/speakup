/** @type {import('next').NextConfig} */
const nextConfig = {
  // No external CDN dependencies — fully self-contained
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [{ key: 'Content-Type', value: 'application/manifest+json' }],
      },
    ]
  },
}

module.exports = nextConfig
