import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-956cede54b444e1c8c8ded564f2dd959.r2.dev",
      },
    ],
  },
};

export default nextConfig;
