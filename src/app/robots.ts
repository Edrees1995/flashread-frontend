import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/editor"],
      },
    ],
    sitemap: "https://flashread.app/sitemap.xml",
  };
}
