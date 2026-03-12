import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ilovedesi.fun';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/', '/search', '/login'],
            },
            {
                // Allow Googlebot to crawl thumbnails
                userAgent: 'Googlebot-Image',
                allow: ['/uploads/', '/thumbs/', '/'],
            },
        ],
        sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/rss.xml`],
    };
}
