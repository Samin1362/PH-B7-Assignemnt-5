import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

/** Only the public pages are indexable — everything behind auth is not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/payment/", "/api/"],
    },
    sitemap: `${publicEnv.appUrl}/sitemap.xml`,
  };
}
