import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteConfig.url}/`,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${siteConfig.url}/convene`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/convene/import`,
      lastModified: new Date(),
      priority: 0.8,
    },
  ];
}
