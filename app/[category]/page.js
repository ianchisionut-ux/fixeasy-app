import { notFound } from "next/navigation";
import { query } from "../../lib/db";
import { getSession } from "../../lib/auth";
import { categoryBySlug, citySlug } from "../../lib/seo";
import { displayCity } from "../../lib/geo";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { category: categorySlug } = await params;
  const cat = categoryBySlug(categorySlug);
  if (!cat) return {};
  return {
    title: `${cat.label} verificați lângă tine | FixEasy`,
    description: `Găsește ${cat.label.toLowerCase()} verificați în orașul tău. Programează online, rapid și fără telefoane.`,
    alternates: { canonical: `/${cat.slug}` },
  };
}

export default async function CategoryHubPage({ params }) {
  const { category: categorySlug } = await params;
  const cat = categoryBySlug(categorySlug);
  if (!cat) notFound();

  const [citiesResult, session] = await Promise.all([
    query(
      `SELECT city, COUNT(*) AS count FROM provider_profiles WHERE category = $1 GROUP BY city ORDER BY count DESC`,
      [cat.category]
    ),
    getSession(),
  ]);

  return (
    <>
      <SiteHeader session={session} links={[{ href: "/", label: "Acasă" }]} />

      <div className="hero" style={{ padding: "56px 24px" }}>
        <span className="eyebrow">{cat.label}</span>
        <h1>{cat.label} verificați, în orașul tău</h1>
        <p>Alege orașul pentru a vedea {cat.label.toLowerCase()} disponibili și a programa direct online.</p>
      </div>

      <section>
        <div className="section-head">
          <h2>Orașe disponibile</h2>
          <p>Alege orașul tău pentru a vedea prestatorii din zonă.</p>
        </div>
        <div className="prov-grid">
          {citiesResult.rows.map((row) => (
            <a key={row.city} href={`/${cat.slug}/${citySlug(row.city)}`} className="prov-card" style={{ padding: 20, textDecoration: "none" }}>
              <h3 style={{ fontSize: 17, marginBottom: 6 }}>{cat.label} din {displayCity(row.city)}</h3>
              <p style={{ color: "var(--slate)", fontSize: 13.5 }}>{row.count} prestatori disponibili</p>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
