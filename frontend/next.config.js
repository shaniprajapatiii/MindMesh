/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, net: false, tls: false };
    return config;
  },
  transpilePackages: ['@monaco-editor/react'],
};
module.exports = nextConfig;
