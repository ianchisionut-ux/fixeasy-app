import { redirect } from "next/navigation";
import { query } from "../../lib/db";
import { getSession } from "../../lib/auth";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  const [providersCount, clientsCount, bookingsCount, reviewsCount, byCategory] = await Promise.all([
    query("SELECT COUNT(*) FROM provider_profiles"),
    query("SELECT COUNT(*) FROM users WHERE role = 'client'"),
    query("SELECT COUNT(*) FROM bookings"),
    query("SELECT COUNT(*) FROM reviews"),
    query("SELECT category, COUNT(*) AS count FROM provider_profiles GROUP BY category ORDER BY count DESC"),
  ]);

  return (
    <>
      <SiteHeader session={session} links={[{ href: "/admin/prestatori", label: "Prestatori" }]} />

      <section>
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Super Admin</span>
          <h2>Bun venit, {session.name}</h2>
          <p>Vedere de ansamblu asupra platformei FixEasy.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, maxWidth: 900, margin: "0 auto 32px" }}>
          <StatCard label="Prestatori" value={providersCount.rows[0].count} />
          <StatCard label="Clienți" value={clientsCount.rows[0].count} />
          <StatCard label="Programări" value={bookingsCount.rows[0].count} />
          <StatCard label="Recenzii" value={reviewsCount.rows[0].count} />
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="panel-card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Prestatori pe categorie</h3>
            {byCategory.rows.map((row) => (
              <div key={row.category} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)" }}>
                <div>{row.category}</div>
                <div className="mono" style={{ color: "var(--slate)" }}>{row.count}</div>
              </div>
            ))}
          </div>

          <a href="/admin/prestatori" className="btn btn-orange btn-lg">Gestionează prestatorii →</a>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="panel-card" style={{ textAlign: "center" }}>
      <b style={{ fontSize: 28, display: "block", color: "var(--steel)" }}>{value}</b>
      <span style={{ fontSize: 11.5, color: "var(--slate)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 700 }}>{label}</span>
    </div>
  );
}
