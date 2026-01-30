/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  async rewrites() {
    // Browser will call SAME ORIGIN /api/...
    // Next server will forward to cluster service DNS (no CORS)
    const target = process.env.API_INTERNAL_BASE || "http://todo-backend:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
