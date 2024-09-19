/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    crossOrigin: 'anonymous',
    env: {
        api: process.env.AWS_CLOUDFRONT_URL,
    }
};

export default nextConfig;
