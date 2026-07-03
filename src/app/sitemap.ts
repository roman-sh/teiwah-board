import type { MetadataRoute } from "next";

const publicRoutes = [
  "",
  "/about",
  "/pricing",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/refund",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable is not defined");
  }

  const siteUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);

  return publicRoutes.map((route) => ({
    url: new URL(route || "/", siteUrl).toString(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
