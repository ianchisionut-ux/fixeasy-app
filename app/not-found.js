import { query } from "../lib/db";
import { CATEGORIES_SEO } from "../lib/seo";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  let topCategories = [];
  try {
    const result = await query(
      `SELECT category, COUNT(*) AS count FROM provider_profiles GROUP BY category ORDER BY count DESC LIMIT 4`
    );
    topCategories = result.rows
      .map((r) => CATEGORIES_SEO.find((c) => c.category === r.category))
      .filter(Boolean);
  } catch {
    topCategories = CATEGORIES_SEO.slice(0, 4);
  }

  return (
    <>
      <SiteHeader session={null} />

      <div className="hero" style={{ padding: "64px 24px" }}>
        <span className="eyebrow">Eroare 404</span>
        <h1>Pagina nu a fost găsită</h1>
        <p>Linkul pe care l-ai accesat nu mai există sau a fost mutat. Hai să te ajutăm să găsești ce cauți.</p>
        <a href="/" className="btn btn-orange btn-lg">Înapoi la pagina principală</a>
      </div>

      {topCategories.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Poate cauți unul dintre acestea</h2>
          </div>
          <div className="prov-grid">
            {topCategories.map((cat) => (
              <a key={cat.slug} href={`/${cat.slug}`} className="prov-card" style={{ padding: 20, textDecoration: "none" }}>
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>{cat.label}</h3>
                <p style={{ color: "var(--slate)", fontSize: 13 }}>Vezi profesioniști disponibili</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
