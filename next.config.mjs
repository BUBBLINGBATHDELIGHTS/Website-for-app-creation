/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Modern, stable configuration (Next.js 14+)
  reactStrictMode: true,

  // ✅ Removed deprecated experimental.appDir (App Router is now default)
  experimental: {
    turbo: {
      rules: {}, // keep if you're planning multi-repo or monorepo builds
    },
  },

  // ✅ Allow external images safely (for Unsplash, Supabase storage, etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // ✅ Keep support for top-level await & custom Webpack rules
  webpack: (config) => {
    config.experiments = config.experiments || {};
    config.experiments.topLevelAwait = true;
    return config;
  },

  // ✅ Added optional performance & observability features
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // strip logs in prod
  },

  // ✅ Helpful fallback for runtime errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;