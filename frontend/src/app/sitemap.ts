import { MetadataRoute } from "next";
import { trackSlugs } from "@/src/data/tracks";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-production-domain.com";
  const baseUrlTrimmed = baseUrl.replace(/\/$/, "");

  const trackEntries = trackSlugs.map((slug) => ({
    url: `${baseUrlTrimmed}/tracks/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${baseUrlTrimmed}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrlTrimmed}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrlTrimmed}/diagnostic`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrlTrimmed}/chat`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...trackEntries,
  ];
}
