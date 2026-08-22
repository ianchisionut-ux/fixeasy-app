import { query } from "../lib/db";
import { CATEGORIES_SEO, citySlug, providerSlug } from "../lib/seo";

export const dynamic = "force-dynamic";

const SITE_URL = "https://fixeasy-app-pmcustoms.vercel.app";

export default async function sitemap() {
  const providersResult = await query(
    "SELECT id, business_name, category, city FROM provider_profiles"
  );

  const entries = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
  ];

  for (const cat of CATEGORIES_SEO) {
    entries.push({ url: `${SITE_URL}/${cat.slug}`, changeFrequency: "weekly", priority: 0.8 });
  }

  const cityByCategory = {};
  for (const p of providersResult.rows) {
    const catSeo = CATEGORIES_SEO.find((c) => c.category === p.category);
    if (!catSeo) continue;
    const key = `${catSeo.slug}/${citySlug(p.city)}`;
    cityByCategory[key] = true;

    entries.push({
      url: `${SITE_URL}/${catSeo.slug}/${citySlug(p.city)}/${providerSlug(p.business_name, p.id)}`,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const key of Object.keys(cityByCategory)) {
    entries.push({ url: `${SITE_URL}/${key}`, changeFrequency: "weekly", priority: 0.9 });
  }

  return entries;
}
