/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      // Hardcode the root to prevent Turbopack from getting confused by C:\Users\A\package-lock.json
      // root: __dirname is implicit in next 15+, but let's just ignore the warning if this doesn't fully suppress it.
    }
  }
};

module.exports = nextConfig;
