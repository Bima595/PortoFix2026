import type { MetadataRoute } from 'next';
import { getSideProjects } from '@/lib/sanity/api';

const SITE_URL = 'https://satriabmnyu.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/photobooth`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const projects = await getSideProjects();
    const projectRoutes: MetadataRoute.Sitemap = (projects ?? []).map((project) => ({
      url: `${SITE_URL}/projects/${project._id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));
    return [...staticRoutes, ...projectRoutes];
  } catch {
    return staticRoutes;
  }
}
