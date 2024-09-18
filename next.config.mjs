/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    // Target must be serverless
    async rewrites() {
        return [
            {
                source: '/data/:slug',
                destination: 'https://d17kn6fj50jzfv.cloudfront.net/:slug',
            }
        ]
    }
};

export default nextConfig;
