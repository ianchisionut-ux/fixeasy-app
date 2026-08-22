import { redirect } from "next/navigation";
import { query } from "../../lib/db";
import { getSession } from "../../lib/auth";
import SiteHeader from "../SiteHeader";
import DashboardApp from "./DashboardApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard prestator | FixEasy",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "provider") redirect("/");

  const [bookingsResult, profileResult] = await Promise.all([
    query(
      `SELECT b.id, b.scheduled_date, b.scheduled_time, b.status,
              u.name AS client_name, s.name AS service_name
       FROM bookings b
       JOIN users u ON u.id = b.client_id
       JOIN services s ON s.id = b.service_id
       JOIN provider_profiles pp ON pp.id = b.provider_id
       WHERE pp.user_id = $1
       ORDER BY b.scheduled_date, b.scheduled_time`,
      [session.id]
    ),
    query(
      `SELECT id, business_name, category, city, tags FROM provider_profiles WHERE user_id = $1`,
      [session.id]
    ),
  ]);

  const providerId = profileResult.rows[0]?.id;
  const servicesResult = providerId
    ? await query(
        "SELECT id, name, price, duration_minutes FROM services WHERE provider_id = $1 ORDER BY id",
        [providerId]
      )
    : { rows: [] };

  const bookings = bookingsResult.rows.map((b) => ({
    id: "b" + b.id,
    rawId: b.id,
    clientName: b.client_name,
    serviceName: b.service_name,
    date: b.scheduled_date,
    time: b.scheduled_time,
    status: b.status,
  }));

  return (
    <>
      <SiteHeader session={session} links={[{ href: "/", label: "← Marketplace" }]} />

      <DashboardApp
        providerName={session.name}
        initialBookings={bookings}
        initialProfile={profileResult.rows[0] || null}
        initialServices={servicesResult.rows}
      />

      <footer>
        <b>FixEasy</b> — dashboard conectat la PostgreSQL.
      </footer>
    </>
  );
}
