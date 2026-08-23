import { notFound } from "next/navigation";
import { query } from "../../../lib/db";
import { getSession } from "../../../lib/auth";
import { categoryBySlug, cityFromSlug, providerSlug } from "../../../lib/seo";
import { displayCity } from "../../../lib/geo";
import { Search } from "lucide-react";
import SiteHeader from "../../SiteHeader";
import SiteFooter from "../../SiteFooter";
import Breadcrumbs from "../../Breadcrumbs";
import ProviderGrid from "./ProviderGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { category: categorySlug, city: citySlugParam } = await params;
  const cat = categoryBySlug(categorySlug);
  if (!cat) return {};
  const cityCode = cityFromSlug(citySlugParam);
  const cityName = displayCity(cityCode);
  return {
    title: `${cat.label} din ${cityName} — Programează online`,
    description: `${cat.label} verificați din ${cityName}. Vezi prețuri, recenzii și programează direct online, fără telefoane.`,
    alternates: { canonical: `/${cat.slug}/${citySlugParam}` },
    openGraph: {
      title: `${cat.label} din ${cityName} — Programează online | FixEasy`,
      description: `${cat.label} verificați din ${cityName}. Vezi prețuri, recenzii și programează direct online, fără telefoane.`,
      url: `/${cat.slug}/${citySlugParam}`,
    },
  };
}

export default async function CategoryCityPage({ params }) {
  const { category: categorySlug, city: citySlugParam } = await params;
  const cat = categoryBySlug(categorySlug);
  if (!cat) notFound();
  const cityCode = cityFromSlug(citySlugParam);
  const cityName = displayCity(cityCode);

  const [session, providersResult] = await Promise.all([
    getSession(),
    query(
      `SELECT id, business_name, category, city, tags, verified, rating, reviews_count, profile_photo
       FROM provider_profiles WHERE category = $1 AND city = $2 ORDER BY rating DESC`,
      [cat.category, cityCode]
    ),
  ]);

  const providerIds = providersResult.rows.map((p) => p.id);
  let servicesByProvider = {};
  if (providerIds.length > 0) {
    const servicesResult = await query(
      `SELECT id, provider_id, name, price, duration_minutes FROM services WHERE provider_id = ANY($1::int[]) ORDER BY id`,
      [providerIds]
    );
    servicesByProvider = servicesResult.rows.reduce((acc, s) => {
      (acc[s.provider_id] ||= []).push({ id: String(s.id), name: s.name, price: Number(s.price), duration: s.duration_minutes });
      return acc;
    }, {});
  }

  const providers = providersResult.rows.map((p) => ({
    id: String(p.id),
    name: p.business_name,
    cat: p.category,
    city: p.city,
    rating: Number(p.rating),
    reviews: p.reviews_count,
    priceFrom: Math.min(...(servicesByProvider[p.id]?.map((s) => s.price).filter((x) => x > 0) || [0])) || 0,
    tags: p.tags || [],
    init: p.business_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    photo: p.profile_photo,
    services: servicesByProvider[p.id] || [],
  }));

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: providers.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://fixeasy-app-pmcustoms.vercel.app/${cat.slug}/${citySlugParam}/${providerSlug(p.name, p.id)}`,
      name: p.name,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <SiteHeader session={session} links={[{ href: "/", label: "Acasă" }, { href: `/${cat.slug}`, label: cat.label }]} />
      <Breadcrumbs items={[{ href: "/", label: "Acasă" }, { href: `/${cat.slug}`, label: cat.label }, { href: `/${cat.slug}/${citySlugParam}`, label: cityName }]} />

      <div className="hero" style={{ padding: "56px 24px" }}>
        <span className="eyebrow"><cat.icon size={14} strokeWidth={2.2} style={{ verticalAlign: -2 }} /> {cityName}</span>
        <h1>{cat.label} din {cityName}</h1>
        <p>{providers.length} {cat.label.toLowerCase()} verificați, disponibili pentru programare online în {cityName}.</p>
      </div>

      <section>
        {providers.length === 0 ? (
          <div className="empty-state">
            <div className="big"><Search size={34} strokeWidth={1.8} /></div>
            <p>Momentan nu avem {cat.label.toLowerCase()} listați în {cityName}.</p>
            <a href={`/${cat.slug}`} className="btn btn-outline" style={{ marginTop: 14 }}>Vezi alte orașe</a>
          </div>
        ) : (
          <ProviderGrid providers={providers} categorySlug={cat.slug} citySlug={citySlugParam} isLoggedIn={!!session} userRole={session?.role} />
        )}
      </section>

      <SiteFooter />
    </>
  );
}
