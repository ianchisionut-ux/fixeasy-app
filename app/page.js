import { query } from "../lib/db";
import { getSession } from "../lib/auth";
import Marketplace from "./Marketplace";
import HeaderAuth from "./HeaderAuth";

export const dynamic = "force-dynamic";

async function getProviders() {
  const providersResult = await query(
    `SELECT id, business_name, category, city, tags, verified, rating, reviews_count
     FROM provider_profiles ORDER BY rating DESC`
  );
  const providerIds = providersResult.rows.map((p) => p.id);
  let servicesByProvider = {};
  if (providerIds.length > 0) {
    const servicesResult = await query(
      `SELECT id, provider_id, name, price, duration_minutes
       FROM services WHERE provider_id = ANY($1::int[]) ORDER BY id`,
      [providerIds]
    );
    servicesByProvider = servicesResult.rows.reduce((acc, s) => {
      (acc[s.provider_id] ||= []).push({
        id: String(s.id),
        name: s.name,
        price: Number(s.price),
        duration: s.duration_minutes,
      });
      return acc;
    }, {});
  }
  return providersResult.rows.map((p) => ({
    id: String(p.id),
    name: p.business_name,
    cat: p.category,
    city: p.city,
    rating: Number(p.rating),
    reviews: p.reviews_count,
    priceFrom: Math.min(...(servicesByProvider[p.id]?.map((s) => s.price).filter((x) => x > 0) || [0])) || 0,
    tags: p.tags || [],
    init: p.business_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    services: servicesByProvider[p.id] || [],
  }));
}

export default async function HomePage() {
  const [providers, session] = await Promise.all([getProviders(), getSession()]);

  return (
    <>
      <header>
        <div className="nav">
          <a href="/" className="logo"><img src="/logo.png" alt="FixEasy.ro" /></a>
          <nav className="nav-links">
            <a href="#marketplace">Meseriași</a>
            {session?.role === "provider" && <a href="/dashboard">Dashboard prestator</a>}
          </nav>
          <HeaderAuth session={session} />
        </div>
      </header>

      <div className="hero">
        <span className="eyebrow">● {providers.length} meseriași verificați activi azi</span>
        <h1>Găsești meseriașul potrivit. Programezi în 60 de secunde.</h1>
        <p>Instalatori, electricieni și mecanici auto verificați — programarea se salvează live, cu status urmărit în dashboard.</p>
      </div>

      <section id="marketplace">
        <div className="section-head">
          <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Prestatori</span>
          <h2>Alege și programează</h2>
          <p>Fiecare programare e salvată real prin API — vezi rezultatul în dashboard.</p>
        </div>
        <Marketplace initialProviders={providers} isLoggedIn={!!session} userRole={session?.role} />
      </section>

      <footer>
        <b>FixEasy</b> — date reale, salvate în PostgreSQL.
      </footer>
    </>
  );
}
