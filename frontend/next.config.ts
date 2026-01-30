import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel + local both OK. (If you use `output: "standalone"`, start with: node .next/standalone/server.js)
  // output: "standalone",

  // Keep it simple: NO rewrites/proxy here, warna "todo-backend" wali ENOTFOUND aati hai.
};

export default nextConfig;
