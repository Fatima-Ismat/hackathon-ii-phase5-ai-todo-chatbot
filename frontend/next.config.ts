/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://20.203.113.87/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
