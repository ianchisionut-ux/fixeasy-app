import { redirect } from "next/navigation";
import { query } from "../../lib/db";
import { getSession } from "../../lib/auth";
import HeaderAuth from "../HeaderAuth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "provider") redirect("/");

  const result = await query(
    `SELECT b.id, b.scheduled_date, b.scheduled_time, b.status,
            u.name AS client_name
     FROM bookings b
     JOIN users u ON u.id = b.client_id
     JOIN provider_profiles pp ON pp.id = b.provider_id
     WHERE pp.user_id = $1
     ORDER BY b.created_at DESC`,
    [session.id]
  );
  const bookings = result.rows;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <>
      <header>
        <div className="nav">
          <a href="/" className="logo"><img src="/logo.png" alt="FixEasy.ro" /></a>
          <nav className="nav-links">
            <a href="/">← Înapoi la marketplace</a>
          </nav>
          <HeaderAuth session={session} />
        </div>
      </header>

      <section>
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Dashboard prestator</span>
          <h2>Bun venit, {session.name}</h2>
          <p>Programările tale, salvate real în baza de date.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 24, maxWidth: 1000, margin: "0 auto 24px" }}>
          <Stat label="Total programări" value={bookings.length} />
          <Stat label="În așteptare" value={pending} />
          <Stat label="Confirmate" value={confirmed} />
        </div>

        <div className="dash-panel" style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="dash-body">
            {bookings.length === 0 && (
              <p style={{ color: "rgba(241,239,233,.6)", textAlign: "center", padding: "20px 0" }}>
                Nicio programare încă.
              </p>
            )}
            {bookings.map((b) => (
              <div className="dash-row" key={b.id}>
                <div className="who">
                  <div className="mini-avatar">{b.client_name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    {b.client_name}
                    <br />
                    <span style={{ opacity: 0.5, fontSize: 11.5 }}>
                      {b.scheduled_date}, {b.scheduled_time} · #{b.id}
                    </span>
                  </div>
                </div>
                <span className={"status " + b.status}>
                  {b.status === "pending" ? "În așteptare" : b.status === "confirmed" ? "Confirmată" : b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <b>FixEasy</b> — dashboard conectat la PostgreSQL.
      </footer>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: "#0F3F60", borderRadius: 8, padding: 14, color: "var(--paper)" }}>
      <b style={{ fontSize: 22, display: "block", fontFamily: "'Space Grotesk',sans-serif" }}>{value}</b>
      <span style={{ fontSize: 11, color: "rgba(243,248,251,.6)", textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'IBM Plex Mono',monospace" }}>{label}</span>
    </div>
  );
}
