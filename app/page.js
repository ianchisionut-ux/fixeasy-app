import { query } from "../lib/db";
import { getSession } from "../lib/auth";
import HomeClient from "./HomeClient";
import SiteHeader from "./SiteHeader";
import { CATEGORIES_SEO, citySlug } from "../lib/seo";
import { displayCity } from "../lib/geo";

export const dynamic = "force-dynamic";

async function getProviders() {
  const providersResult = await query(
    `SELECT id, business_name, category, city, tags, verified, rating, reviews_count
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

  return (
    <>
      <SiteHeader session={session} links={[{ href: "#marketplace", label: "Meseriași" }]} />

      <HomeClient
        initialProviders={providers}
        isLoggedIn={!!session}
        userRole={session?.role}
      />

      <section>
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Proces</span>
          <h2>Cum funcționează</h2>
          <p>Pași simpli, indiferent dacă cauți un meseriaș sau vrei mai mulți clienți.</p>
        </div>
        <div className="how-split">
          <div className="how-col client">
            <h3>Pentru clienți</h3>
            <div className="how-sub">De la căutare la lucrare finalizată</div>
            <div className="how-step">
              <div className="how-num">1</div>
              <div>
                <div className="how-step-title">Cauți în zona ta</div>
                <div className="how-step-text">Filtrezi după meserie și oraș — vezi doar prestatori relevanți pentru tine.</div>
              </div>
            </div>
            <div className="how-step">
              <div className="how-num">2</div>
              <div>
                <div className="how-step-title">Alegi un slot liber</div>
                <div className="how-step-text">Programezi direct în calendarul prestatorului, fără telefoane.</div>
              </div>
            </div>
            <div className="how-step">
              <div className="how-num">3</div>
              <div>
                <div className="how-step-title">Primești confirmare</div>
                <div className="how-step-text">Notificare instant, plus status urmărit live în cont.</div>
              </div>
            </div>
          </div>

          <div className="how-col provider">
            <h3>Pentru prestatori</h3>
            <div className="how-sub">De la înscriere la primul client nou</div>
            <div className="how-step">
              <div className="how-num">1</div>
              <div>
                <div className="how-step-title">Îți creezi profilul</div>
                <div className="how-step-text">Adaugi serviciile, prețurile și orașul în care lucrezi.</div>
              </div>
            </div>
            <div className="how-step">
              <div className="how-num">2</div>
              <div>
                <div className="how-step-title">Apari clienților din zonă</div>
                <div className="how-step-text">Ești vizibil automat clienților care caută în orașul tău.</div>
              </div>
            </div>
            <div className="how-step">
              <div className="how-num">3</div>
              <div>
                <div className="how-step-title">Accepți programări</div>
                <div className="how-step-text">Gestionezi totul dintr-un calendar simplu — acceptă sau respinge într-un click.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!session && (
        <div className="cta-band">
          <h2>Ești meseriaș? Găsește clienți noi, aproape de tine.</h2>
          <p>Fără comisioane ascunse, fără telefoane pierdute. Clienții te găsesc după oraș și meserie, programează direct, tu confirmi dintr-un calendar simplu.</p>
          <div className="cta-band-stats">
            <div><span className="stat-num">412</span><span className="stat-label">Prestatori activi</span></div>
            <div><span className="stat-num">1.840+</span><span className="stat-label">Programări/lună</span></div>
            <div><span className="stat-num">4.8★</span><span className="stat-label">Rating mediu</span></div>
          </div>
          <a href="/inregistrare" className="btn btn-orange btn-lg">Creează profil de prestator</a>
        </div>
      )}

      <footer>
        {topLinks.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginBottom: 20, fontSize: 12.5 }}>
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
        <b>FixEasy</b> — date reale, salvate în PostgreSQL.
      </footer>
    </>
  );
}
