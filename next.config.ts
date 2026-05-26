import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.2.109",
    "192.168.2.43",
    "192.168.2.157"
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  images: {
    qualities: [85, 90],
    minimumCacheTTL: 86400
  }
};

export default nextConfig;
