import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? 'https://rxinfer.ml' : '',
  basePath: '',
  trailingSlash: true,
};

export default nextConfig;
