import { redirect, notFound } from "next/navigation";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";
import SiteHeader from "../../../SiteHeader";
import SiteFooter from "../../../SiteFooter";
import AdminProviderEdit from "./AdminProviderEdit";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editare prestator",
  robots: { index: false, follow: false },
};

export default async function AdminProviderDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  const providerResult = await query(
    `SELECT pp.id, pp.business_name, pp.category, pp.city, pp.tags, pp.verified, pp.rating, pp.reviews_count,
            u.id AS user_id, u.email, u.phone, u.name AS owner_name, u.created_at AS joined_at
     FROM provider_profiles pp JOIN users u ON u.id = pp.user_id
     WHERE pp.id = $1`,
    [id]
  );
  const provider = providerResult.rows[0];
  if (!provider) notFound();

  const [servicesResult, bookingsResult] = await Promise.all([
    query("SELECT id, name, price, duration_minutes FROM services WHERE provider_id = $1 ORDER BY id", [id]),
    query(
      `SELECT b.id, b.scheduled_date, b.scheduled_time, b.status, b.priority,
              COALESCE(u.name, b.guest_name) AS client_name
       FROM bookings b LEFT JOIN users u ON u.id = b.client_id
       WHERE b.provider_id = $1 ORDER BY b.created_at DESC LIMIT 20`,
      [id]
    ),
  ]);

  return (
    <>
      <SiteHeader session={session} links={[{ href: "/admin", label: "Admin" }, { href: "/admin/prestatori", label: "Prestatori" }]} />

      <section>
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Super Admin</span>
          <h2>{provider.business_name}</h2>
          <p>Cont: {provider.email} · Membru din {new Date(provider.joined_at).toLocaleDateString("ro-RO")}</p>
        </div>

        <AdminProviderEdit
          provider={provider}
          initialServices={servicesResult.rows}
          bookings={bookingsResult.rows}
        />
      </section>

      <SiteFooter />
    </>
  );
}
