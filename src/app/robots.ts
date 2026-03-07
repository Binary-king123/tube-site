import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tubex.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/alagappan/', '/api/', '/search?q='], // Prevent indexing of infinite search params or admin pages
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
