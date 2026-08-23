import { notFound, permanentRedirect } from "next/navigation";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";
import { categoryBySlug, citySlug, providerSlug, parseProviderId } from "../../../../lib/seo";
import { displayCity } from "../../../../lib/geo";
import { MapPin } from "lucide-react";
import { formatDuration } from "../../../../lib/duration";
import SiteHeader from "../../../SiteHeader";
import SiteFooter from "../../../SiteFooter";
import Breadcrumbs from "../../../Breadcrumbs";
import BookNowButton from "./BookNowButton";
import MobileStickyBook from "./MobileStickyBook";
import BookingSidebar from "./BookingSidebar";

export const dynamic = "force-dynamic";

const SITE_URL = "https://fixeasy-app-pmcustoms.vercel.app";

async function getProvider(id) {
  const result = await query(
    `SELECT id, business_name, category, city, tags, verified, rating, reviews_count, profile_photo
     FROM provider_profiles WHERE id = $1`,
    [id]
  );
  const provider = result.rows[0];
  if (!provider) return null;
  const [servicesResult, galleryResult] = await Promise.all([
    query("SELECT id, name, price, duration_minutes FROM services WHERE provider_id = $1 ORDER BY id", [id]),
    query("SELECT id, image_data, caption FROM provider_gallery WHERE provider_id = $1 ORDER BY sort_order, id", [id]),
  ]);
  return { ...provider, services: servicesResult.rows, gallery: galleryResult.rows };
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
    title: `${provider.business_name} — ${provider.category} din ${cityName}`,
    description: `${provider.business_name}, ${provider.category.toLowerCase()} verificat din ${cityName}. Rating ${provider.rating}/5 din ${provider.reviews_count} recenzii. Programează online.`,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${provider.business_name} — ${provider.category} din ${cityName} | FixEasy`,
      description: `Rating ${provider.rating}/5 din ${provider.reviews_count} recenzii. Programează online, fără telefoane.`,
      url: canonicalPath,
      type: "profile",
    },
  };
}

export default async function ProviderPage({ params }) {
  const { category: categorySlug, city: citySlugParam, provider: providerSlugParam } = await params;
  const cat = categoryBySlug(categorySlug);
  const id = parseProviderId(providerSlugParam);
  if (!cat || !id) notFound();

  const [session, provider] = await Promise.all([getSession(), getProvider(id)]);
  if (!provider) notFound();

  const reviewsResult = await query(
    `SELECT r.rating, r.comment, r.created_at, u.name AS client_name
     FROM reviews r JOIN users u ON u.id = r.client_id
     WHERE r.provider_id = $1 ORDER BY r.created_at DESC LIMIT 20`,
    [id]
  );
  const reviews = reviewsResult.rows;

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
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 10).map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.client_name },
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.comment || undefined,
        datePublished: new Date(r.created_at).toISOString().split("T")[0],
      })),
    }),
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
      <Breadcrumbs
        items={[
          { href: "/", label: "Acasă" },
          { href: `/${canonicalCategorySlug}`, label: cat.label },
          { href: `/${canonicalCategorySlug}/${canonicalCitySlug}`, label: cityName },
          { href: canonicalUrl.replace(SITE_URL, ""), label: provider.business_name },
        ]}
      />

      <div className="hero" style={{ padding: "56px 24px" }}>
        {provider.profile_photo && (
          <img
            src={provider.profile_photo}
            alt={provider.business_name}
            style={{ width: 84, height: 84, borderRadius: 18, objectFit: "cover", margin: "0 auto 16px", border: "2px solid rgba(255,255,255,.2)", display: "block" }}
          />
        )}
        <span className="eyebrow"><cat.icon size={14} strokeWidth={2.2} style={{ verticalAlign: -2 }} /> {provider.category} · <MapPin size={14} strokeWidth={2.2} style={{ verticalAlign: -2 }} /> {cityName}</span>
        <h1>{provider.business_name}</h1>
        <p>
          ★ {provider.rating} din {provider.reviews_count} recenzii · {provider.tags?.join(" · ")}
        </p>
        <BookNowButton provider={providerForBooking} isLoggedIn={!!session} userRole={session?.role} />
      </div>

      <div className="provider-layout">
        <div className="provider-main">
          <section style={{ padding: 0 }}>
            <div className="section-head" style={{ textAlign: "left", margin: "0 0 24px" }}>
              <h2>Servicii oferite</h2>
            </div>
            <div className="panel-card">
              {provider.services.map((s) => (
                <div key={s.id} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)" }}>
                  <div>{s.name}</div>
                  <div className="mono" style={{ color: "var(--slate)", fontSize: 13 }}>
                    {s.price > 0 ? `${s.price} lei` : "Gratuit"} · {formatDuration(s.duration_minutes)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {provider.gallery.length > 0 && (
            <section style={{ padding: 0 }}>
              <div className="section-head" style={{ textAlign: "left", margin: "0 0 24px" }}>
                <h2>Lucrări realizate</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {provider.gallery.map((img) => (
                  <a key={img.id} href={img.image_data} target="_blank" rel="noreferrer" style={{ display: "block", borderRadius: 12, overflow: "hidden", aspectRatio: "1", border: "1px solid var(--line)" }}>
                    <img src={img.image_data} alt={img.caption || `Lucrare ${provider.business_name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section style={{ padding: 0 }}>
            <div className="section-head" style={{ textAlign: "left", margin: "0 0 24px" }}>
              <h2>Recenzii ({provider.reviews_count})</h2>
            </div>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--slate)", fontSize: 14 }}>Niciun client nu a lăsat încă o recenzie.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {reviews.map((r, i) => (
                  <div key={i} className="panel-card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <b style={{ fontSize: 14 }}>{r.client_name}</b>
                      <span style={{ color: "var(--orange-dark)", fontWeight: 700 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <p style={{ fontSize: 13.5, color: "var(--slate)" }}>{r.comment}</p>}
                    <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 8 }}>
                      {new Date(r.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <BookingSidebar
          provider={providerForBooking}
          isLoggedIn={!!session}
          userRole={session?.role}
          rating={provider.rating}
          reviewsCount={provider.reviews_count}
          priceFrom={prices.length > 0 ? Math.min(...prices) : null}
          city={cityName}
          CategoryIcon={cat.icon}
          photo={provider.profile_photo}
        />
      </div>

      <div className="mobile-cta-spacer" />
      <MobileStickyBook provider={providerForBooking} isLoggedIn={!!session} userRole={session?.role} priceFrom={prices.length > 0 ? Math.min(...prices) : null} />

      <SiteFooter />
    </>
  );
}
