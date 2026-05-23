const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Route directly to the backend depending on environment
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://xsplit-main.onrender.com/api/:path*' 
          : 'http://localhost:5000/api/:path*'
      }
    ];
  },
};


module.exports = withPWA(nextConfig);
