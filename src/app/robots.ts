import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable is not defined");
  }

  const siteUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
