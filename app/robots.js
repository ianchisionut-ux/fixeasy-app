export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: "https://fixeasy-app-pmcustoms.vercel.app/sitemap.xml",
  };
}
