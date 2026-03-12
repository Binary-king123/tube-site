/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
    images: {
        // Allow external thumbnails from any source (xvideos, xhamster, etc.)
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push("fluent-ffmpeg", "@ffmpeg-installer/ffmpeg");
        }
        return config;
    },
};

export default nextConfig;
