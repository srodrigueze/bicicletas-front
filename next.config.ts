import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Docker: only copies the traced server + minimal node_modules, not the
  // whole project — see Dockerfile's "runner" stage.
  output: "standalone",
};

export default nextConfig;
