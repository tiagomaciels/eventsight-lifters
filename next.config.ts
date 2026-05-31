import type { NextConfig } from "next";

// Em produção (GitHub Pages), NEXT_PUBLIC_BASE_PATH=/eventsight-lifters.
// Localmente a variável não é definida e o app serve em /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
