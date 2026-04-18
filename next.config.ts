import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost", 
    "127.0.0.1", 
    "192.168.2.109",
    "192.168.2.43"
  ],
  images: {
    qualities: [85]
  }
};

export default nextConfig;
