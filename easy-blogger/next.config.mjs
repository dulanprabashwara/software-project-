/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Enable path aliases for Turbopack
    resolveAlias: {
      '@': './',
    },
  },
};

export default nextConfig;
