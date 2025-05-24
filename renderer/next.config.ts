import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	devIndicators: false,
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		unoptimized: true,
	},
	webpack: (config) => {
		return config;
	},
};

export default nextConfig;
