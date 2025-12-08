/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'Diabetes-Checker';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',

  // GitHub Pages configuration - use absolute URLs for assets
  basePath: '',
  assetPrefix: isProd ? `https://sridhanush-varma.github.io/${repoName}` : '',

  // Image optimization must be disabled for static export
  images: {
    unoptimized: true,
  },

  // Add trailing slashes for consistent routing
  trailingSlash: true,

  // Environment variables that will be available at build time
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : '',
    NEXT_PUBLIC_ASSET_PREFIX: isProd ? `https://sridhanush-varma.github.io/${repoName}` : '',
  },
}

module.exports = nextConfig
