import { redirect } from "next/navigation";
import { query } from "../../lib/db";
import { getSession } from "../../lib/auth";
import SiteHeader from "../SiteHeader";
import MyBookingsClient from "./MyBookingsClient";
import SiteFooter from "../SiteFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Programările mele",
  robots: { index: false, follow: false },
};

export default async function MyBookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "client") redirect("/");

  const result = await query(
    `SELECT b.id, b.scheduled_date, b.scheduled_time, b.status,
            s.name AS service_name, pp.business_name AS provider_name,
            r.id AS review_id, r.rating AS review_rating
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     JOIN provider_profiles pp ON pp.id = b.provider_id
     LEFT JOIN reviews r ON r.booking_id = b.id
     WHERE b.client_id = $1
     ORDER BY b.created_at DESC`,
    [session.id]
  );

  const bookings = result.rows.map((b) => ({
    id: b.id,
    date: b.scheduled_date,
    time: b.scheduled_time,
    status: b.status,
    serviceName: b.service_name,
    providerName: b.provider_name,
    hasReview: !!b.review_id,
    reviewRating: b.review_rating,
  }));

  return (
    <>
      <SiteHeader session={session} links={[{ href: "/", label: "Acasă" }]} />

      <section>
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Contul tău</span>
          <h2>Programările mele</h2>
          <p>Istoricul programărilor tale — lasă o recenzie după ce lucrarea e finalizată.</p>
        </div>

        <MyBookingsClient initialBookings={bookings} />
      </section>

      <SiteFooter />
    </>
  );
}
