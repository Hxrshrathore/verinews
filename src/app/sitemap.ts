import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://verinews.ai',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Add other static routes here if needed
  ];
}
