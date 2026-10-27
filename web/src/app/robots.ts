import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/lobby", "/room/", "/profile", "/moments"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
