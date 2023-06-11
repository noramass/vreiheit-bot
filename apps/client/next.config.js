/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    if (!isServer) {
      Object.assign(config.resolve.fallback, {
        fs: false,
        path: false,
      });
    }

    return config;
  },
};

module.exports = nextConfig;
