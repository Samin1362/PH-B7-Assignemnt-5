import type { MetadataRoute } from "next";
import { serverFetchSafe } from "@/lib/api";
import { publicEnv } from "@/lib/env";
import type { GearItem } from "@/types/api";

/** Static pages plus one entry per listing, so gear pages are discoverable. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.appUrl;

  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/gear`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/register`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const gear = await serverFetchSafe<GearItem[]>("/gear", {
    query: { limit: 100 },
    auth: false,
  });

  for (const item of gear?.data ?? []) {
    entries.push({
      url: `${base}/gear/${item.id}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
