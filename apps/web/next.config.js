/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permettre les fichiers .well-known sans extension
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public bucket
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
    ],
  },
};

module.exports = nextConfig;
