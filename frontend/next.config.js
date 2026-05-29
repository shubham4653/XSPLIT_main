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
    // Read the URL from the .env file, fallback to localhost for dev if missing
    const backendUrl = process.env.BACKEND_URL || 
        (process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : 'http://localhost:5000'); 
            
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  },
};


module.exports = withPWA(nextConfig);
