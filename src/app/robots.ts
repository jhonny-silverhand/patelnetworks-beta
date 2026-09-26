import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://patelnetworks.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products', '/products/*', '/kit-builder'],
        disallow: [
          '/admin',
          '/admin/*',
          '/account',
          '/account/*',
          '/checkout',
          '/checkout/*',
          '/api/*',
          '/order-success/*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
