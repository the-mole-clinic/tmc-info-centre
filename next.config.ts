import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/tmc-info-centre",
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;
