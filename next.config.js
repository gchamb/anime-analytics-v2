/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [{ protocol: "https", hostname: "cdn.myanimelist.net" }, {protocol: 'https', hostname: "lh3.googleusercontent.com"}],
	},
};

module.exports = nextConfig;
