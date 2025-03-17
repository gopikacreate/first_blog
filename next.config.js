// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;


const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: true,
});

// const withPWA = require("next-pwa");

// module.exports = withPWA({
//   pwa: {
//     dest: "public",  // Stores service worker in the public folder
//     register: true,
//     skipWaiting: true,
//   },
// });
