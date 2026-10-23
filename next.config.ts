import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Docker: only copies the traced server + minimal node_modules, not the
  // whole project — see Dockerfile's "runner" stage.
  output: "standalone",
  // Dev only: lets the dev server (HMR, client JS) be opened from another
  // device on the LAN instead of just localhost.
  allowedDevOrigins: ["192.168.0.231"],
};

export default nextConfig;
