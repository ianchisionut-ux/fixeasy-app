import { query } from "../lib/db";
import { getSession } from "../lib/auth";
import HomeClient from "./HomeClient";
import SiteHeader from "./SiteHeader";
import { CATEGORIES_SEO, citySlug } from "../lib/seo";
import { displayCity } from "../lib/geo";
import SiteFooter from "./SiteFooter";

export const dynamic = "force-dynamic";

async function getProviders() {
  const providersResult = await query(
    `SELECT id, business_name, category, city, tags, verified, rating, reviews_count, profile_photo
     FROM provider_profiles ORDER BY rating DESC`
  );
  const providerIds = providersResult.rows.map((p) => p.id);
  let servicesByProvider = {};
  if (providerIds.length > 0) {
    const servicesResult = await query(
      `SELECT id, provider_id, name, price, duration_minutes
       FROM services WHERE provider_id = ANY($1::int[]) ORDER BY id`,
      [providerIds]
    );
    servicesByProvider = servicesResult.rows.reduce((acc, s) => {
      (acc[s.provider_id] ||= []).push({
        id: String(s.id),
        name: s.name,
        price: Number(s.price),
        duration: s.duration_minutes,
      });
      return acc;
    }, {});
  }
  return providersResult.rows.map((p) => ({
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
}

async function getTopCategoryCityLinks() {
  const result = await query(
    `SELECT category, city, COUNT(*) AS count FROM provider_profiles GROUP BY category, city ORDER BY count DESC LIMIT 8`
  );
  return result.rows;
}

export default async function HomePage() {
  const [providers, session, topLinks] = await Promise.all([getProviders(), getSession(), getTopCategoryCityLinks()]);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FixEasy",
    url: "https://fixeasy-app-pmcustoms.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://fixeasy-app-pmcustoms.vercel.app/instalatii-sanitare/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FixEasy",
    url: "https://fixeasy-app-pmcustoms.vercel.app",
    logo: "https://fixeasy-app-pmcustoms.vercel.app/icons/icon-512.png",
    description: "Marketplace pentru profesioniști verificați — instalații sanitare, electrice, amenajări, reparații electrocasnice și mecanici auto.",
    areaServed: { "@type": "Country", name: "România" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <SiteHeader session={session} links={[{ href: "#marketplace", label: "Profesioniști" }]} />

      <HomeClient
        initialProviders={providers}
        isLoggedIn={!!session}
        userRole={session?.role}
      />


      {!session && (
        <div className="cta-band">
          <h2>Ești profesionist? Găsește clienți noi, aproape de tine.</h2>
          <p>Fără comisioane ascunse, fără telefoane pierdute. Clienții te găsesc după oraș și meserie, programează direct, tu confirmi dintr-un calendar simplu.</p>
          <div className="cta-band-stats">
            <div><span className="stat-num">412</span><span className="stat-label">Prestatori activi</span></div>
            <div><span className="stat-num">1.840+</span><span className="stat-label">Programări/lună</span></div>
            <div><span className="stat-num">4.8★</span><span className="stat-label">Rating mediu</span></div>
          </div>
          <a href="/inregistrare" className="btn btn-orange btn-lg">Creează profil de prestator</a>
        </div>
      )}

      <SiteFooter>
        {topLinks.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginBottom: 12, fontSize: 12.5 }}>
            {topLinks.map((l) => {
              const cat = CATEGORIES_SEO.find((c) => c.category === l.category);
              if (!cat) return null;
              return (
                <a key={`${l.category}-${l.city}`} href={`/${cat.slug}/${citySlug(l.city)}`} style={{ color: "rgba(243,248,251,.55)" }}>
                  {cat.label} {displayCity(l.city)}
                </a>
              );
            })}
          </div>
        )}
      </SiteFooter>
    </>
  );
}
