import { listBookings } from "../../lib/store";

export const dynamic = "force-dynamic"; // mereu citește ultimele date, nu cache static

export default function DashboardPage() {
  const bookings = listBookings();
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
        </div>
      </header>

      <section>
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Dashboard prestator</span>
          <h2>Programările tale, în timp real</h2>
          <p>Orice programare făcută din marketplace apare aici instant.</p>
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
                Nicio programare încă — fă una din pagina principală ca să o vezi apărând aici.
              </p>
            )}
            {bookings.map((b) => (
              <div className="dash-row" key={b.id}>
                <div className="who">
                  <div className="mini-avatar">{b.clientName.slice(0, 2).toUpperCase()}</div>
                  <div>
                    {b.clientName} — {b.serviceName}
                    <br />
                    <span style={{ opacity: 0.5, fontSize: 11.5 }}>
                      {b.providerName} · {b.date}, {b.time} · #{b.id}
                    </span>
                  </div>
                </div>
                <span className={"status " + b.status}>
                  {b.status === "pending" ? "În așteptare" : "Confirmată"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <b>FixEasy</b> — dashboard demonstrativ, date în memorie (per instanță server).
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
