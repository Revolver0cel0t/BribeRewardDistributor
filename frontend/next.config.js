/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "assets.sushi.com",
      "res.cloudinary.com",
      "raw.githubusercontent.com",
      "logos.covalenthq.com",
      "assets.coingecko.com",
      "assets.spookyswap.finance",
      "prod.solidly.exchange",
      "",
      "cryptologos.cc",
      "etherscan.io",
      "res.cloudinary.com",
      "cloudflare-ipfs.com",
    ],
  },
};

module.exports = nextConfig;
