import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/tmc-info-centre",
  trailingSlash: true, // GitHub Pages: serve /path/ → /path/index.html
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;
