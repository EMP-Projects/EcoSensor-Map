/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    crossOrigin: 'anonymous',
    env: {
        cloudFront: process.env.AWS_CLOUDFRONT_URL,
        api: process.env.API_URL,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
            };
        }
        return config;
    },
};

export default nextConfig;
