import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const PUBLIC_PAGES = ["", "/signup", "/login", "/safety", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((path) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
