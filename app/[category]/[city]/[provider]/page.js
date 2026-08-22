import { notFound, permanentRedirect } from "next/navigation";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";
import { categoryBySlug, citySlug, providerSlug, parseProviderId } from "../../../../lib/seo";
import { displayCity } from "../../../../lib/geo";
import SiteHeader from "../../../SiteHeader";
import BookNowButton from "./BookNowButton";

export const dynamic = "force-dynamic";

const SITE_URL = "https://fixeasy-app-pmcustoms.vercel.app";

async function getProvider(id) {
  const result = await query(
    `SELECT id, business_name, category, city, tags, verified, rating, reviews_count
     FROM provider_profiles WHERE id = $1`,
    [id]
  );
  const provider = result.rows[0];
  if (!provider) return null;
  const servicesResult = await query(
    "SELECT id, name, price, duration_minutes FROM services WHERE provider_id = $1 ORDER BY id",
    [id]
  );
  return { ...provider, services: servicesResult.rows };
}

export async function generateMetadata({ params }) {
  const { category: categorySlug, city: citySlugParam, provider: providerSlugParam } = await params;
  const cat = categoryBySlug(categorySlug);
  const id = parseProviderId(providerSlugParam);
  if (!cat || !id) return {};
  const provider = await getProvider(id);
  if (!provider) return {};
  const cityName = displayCity(provider.city);
  const canonicalPath = `/${cat.slug}/${citySlug(provider.city)}/${providerSlug(provider.business_name, provider.id)}`;
  return {
    title: `${provider.business_name} — ${provider.category} din ${cityName} | FixEasy`,
    description: `${provider.business_name}, ${provider.category.toLowerCase()} verificat din ${cityName}. Rating ${provider.rating}/5 din ${provider.reviews_count} recenzii. Programează online.`,
    alternates: { canonical: canonicalPath },
  };
}

export default async function ProviderPage({ params }) {
  const { category: categorySlug, city: citySlugParam, provider: providerSlugParam } = await params;
  const cat = categoryBySlug(categorySlug);
  const id = parseProviderId(providerSlugParam);
  if (!cat || !id) notFound();

  const [session, provider] = await Promise.all([getSession(), getProvider(id)]);
  if (!provider) notFound();

  // Canonicalizeaza URL-ul: daca slug-ul din adresa nu (mai) corespunde
  // datelor reale (nume/categorie/oras schimbate), redirectioneaza permanent
  // catre URL-ul corect — pastreaza SEO "link juice" chiar daca link-uri vechi ramase.
  const canonicalCategorySlug = cat.slug;
  const canonicalCitySlug = citySlug(provider.city);
  const canonicalProviderSlug = providerSlug(provider.business_name, provider.id);
  if (
    provider.category !== cat.category ||
    citySlugParam !== canonicalCitySlug ||
    providerSlugParam !== canonicalProviderSlug
  ) {
    permanentRedirect(`/${canonicalCategorySlug}/${canonicalCitySlug}/${canonicalProviderSlug}`);
  }

  const cityName = displayCity(provider.city);
  const canonicalUrl = `${SITE_URL}/${canonicalCategorySlug}/${canonicalCitySlug}/${canonicalProviderSlug}`;

  const schemaType = provider.category === "Mecanic auto" ? "AutoRepair" : "HomeAndConstructionBusiness";
  const prices = provider.services.map((s) => Number(s.price)).filter((p) => p > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: provider.business_name,
    url: canonicalUrl,
    address: { "@type": "PostalAddress", addressLocality: cityName, addressCountry: "RO" },
    ...(provider.reviews_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: provider.rating,
        reviewCount: provider.reviews_count,
      },
    }),
    ...(prices.length > 0 && { priceRange: `${Math.min(...prices)}-${Math.max(...prices)} RON` }),
    makesOffer: provider.services.map((s) => ({
      "@type": "Offer",
      name: s.name,
      price: Number(s.price),
      priceCurrency: "RON",
    })),
  };

  const providerForBooking = {
    id: String(provider.id),
    name: provider.business_name,
    services: provider.services.map((s) => ({ id: String(s.id), name: s.name, price: Number(s.price), duration: s.duration_minutes })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteHeader
        session={session}
        links={[
          { href: "/", label: "Acasă" },
          { href: `/${canonicalCategorySlug}`, label: cat.label },
          { href: `/${canonicalCategorySlug}/${canonicalCitySlug}`, label: cityName },
        ]}
      />

      <div className="hero" style={{ padding: "56px 24px" }}>
        <span className="eyebrow">{provider.category} · 📍 {cityName}</span>
        <h1>{provider.business_name}</h1>
        <p>
          ★ {provider.rating} din {provider.reviews_count} recenzii · {provider.tags?.join(" · ")}
        </p>
        <BookNowButton provider={providerForBooking} isLoggedIn={!!session} userRole={session?.role} />
      </div>

      <section style={{ maxWidth: 720 }}>
        <div className="section-head" style={{ textAlign: "left", margin: "0 0 24px" }}>
          <h2>Servicii oferite</h2>
        </div>
        <div className="panel-card">
          {provider.services.map((s) => (
            <div key={s.id} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)" }}>
              <div>{s.name}</div>
              <div className="mono" style={{ color: "var(--slate)", fontSize: 13 }}>
                {s.price > 0 ? `${s.price} lei` : "Gratuit"} · {s.duration_minutes} min
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <b>FixEasy</b> — marketplace pentru meseriași verificați.
      </footer>
    </>
  );
}
