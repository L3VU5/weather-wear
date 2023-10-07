/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    EXOAPI_KEY: process.env.EXOAPI_KEY,
    TOMORROW_KEY: process.env.TOMORROW_KEY,
    NINJA_KEY: process.env.NINJA_KEY,
  },
};

module.exports = nextConfig;
