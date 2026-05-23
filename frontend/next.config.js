const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Avoid workspace root inference issues due to multiple lockfiles
    root: __dirname,
  },
};


module.exports = withPWA(nextConfig);
