import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true,
	},
};

module.exports = {
	eslint: {},
};

export default nextConfig;
