import type { NextConfig } from "next";
import path from 'path';


const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
        port: "3000",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
