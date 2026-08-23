import { redirect } from "next/navigation";
import { query } from "../../lib/db";
import { getSession } from "../../lib/auth";
import SiteHeader from "../SiteHeader";
import DashboardApp from "./DashboardApp";
import SiteFooter from "../SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard prestator",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "provider") redirect("/");

  const [bookingsResult, profileResult] = await Promise.all([
    query(
      `SELECT b.id, b.scheduled_date, b.scheduled_time, b.status, b.priority,
              COALESCE(u.name, b.guest_name) AS client_name,
              COALESCE(u.phone, b.guest_phone) AS client_phone,
              s.name AS service_name
       FROM bookings b
       LEFT JOIN users u ON u.id = b.client_id
       JOIN services s ON s.id = b.service_id
       JOIN provider_profiles pp ON pp.id = b.provider_id
       WHERE pp.user_id = $1
       ORDER BY b.scheduled_date, b.scheduled_time`,
      [session.id]
    ),
    query(
      `SELECT id, business_name, category, city, tags, profile_photo FROM provider_profiles WHERE user_id = $1`,
      [session.id]
    ),
  ]);

  const providerId = profileResult.rows[0]?.id;
  const [servicesResult, galleryResult] = providerId
    ? await Promise.all([
        query("SELECT id, name, price, duration_minutes FROM services WHERE provider_id = $1 ORDER BY id", [providerId]),
        query("SELECT id, image_data, caption FROM provider_gallery WHERE provider_id = $1 ORDER BY sort_order, id", [providerId]),
      ])
    : [{ rows: [] }, { rows: [] }];

  const bookings = bookingsResult.rows.map((b) => ({
    id: "b" + b.id,
    rawId: b.id,
    clientName: b.client_name,
    clientPhone: b.client_phone,
    serviceName: b.service_name,
    date: b.scheduled_date,
    time: b.scheduled_time,
    status: b.status,
    priority: b.priority,
  }));

  return (
    <>
      <SiteHeader session={session} links={[{ href: "/", label: "← Marketplace" }]} />

      <DashboardApp
        providerName={session.name}
        initialBookings={bookings}
        initialProfile={profileResult.rows[0] || null}
        initialServices={servicesResult.rows}
        initialGallery={galleryResult.rows}
      />

      <SiteFooter />
    </>
  );
}
