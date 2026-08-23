import { redirect } from "next/navigation";
import { query } from "../../../lib/db";
import { getSession } from "../../../lib/auth";
import SiteHeader from "../../SiteHeader";
import SiteFooter from "../../SiteFooter";
import AdminProviderSearch from "./AdminProviderSearch";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestiune prestatori",
  robots: { index: false, follow: false },
};

export default async function AdminProvidersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  const result = await query(
    `SELECT pp.id, pp.business_name, pp.category, pp.city, pp.verified, pp.rating, pp.reviews_count, u.email, u.phone
     FROM provider_profiles pp JOIN users u ON u.id = pp.user_id
     ORDER BY pp.id DESC`
  );

  return (
    <>
      <SiteHeader session={session} links={[{ href: "/admin", label: "← Admin" }]} />

      <section>
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Super Admin</span>
          <h2>Prestatori ({result.rows.length})</h2>
          <p>Caută, editează sau șterge orice cont de prestator.</p>
        </div>

        <AdminProviderSearch initialProviders={result.rows} />
      </section>

      <SiteFooter />
    </>
  );
}
