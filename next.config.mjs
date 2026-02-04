/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }
    return config
  },
  turbopack: {
    resolveAlias: {
      fs: false,
      path: false,
      os: false,
    },
  },
}

export default nextConfig
