"use client";

import { useState } from "react";
import { CATEGORIES_SEO } from "../../../lib/seo";
import { displayCity } from "../../../lib/geo";

export default function AdminProviderSearch({ initialProviders }) {
  const [providers, setProviders] = useState(initialProviders);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(value) {
    setQ(value);
    setLoading(true);
    const res = await fetch(`/api/admin/providers?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setProviders(data.providers);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <input
        value={q}
        onChange={(e) => search(e.target.value)}
        placeholder="Caută după nume, email sau oraș…"
        style={{ marginBottom: 20 }}
      />

      <div className="panel-card" style={{ opacity: loading ? 0.6 : 1 }}>
        {providers.length === 0 && <p style={{ color: "var(--slate)", textAlign: "center", padding: 20 }}>Niciun prestator găsit.</p>}
        {providers.map((p) => {
          const catSeo = CATEGORIES_SEO.find((c) => c.category === p.category);
          return (
            <a
              key={p.id}
              href={`/admin/prestatori/${p.id}`}
              className="dash-row"
              style={{ background: "var(--paper)", color: "var(--graphite)", textDecoration: "none", display: "flex" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {catSeo?.icon && <catSeo.icon size={16} strokeWidth={2} style={{ color: "var(--steel)" }} />}
                <div>
                  <b>{p.business_name}</b> {p.verified && <span className="badge-verified" style={{ marginLeft: 4 }}>VERIFICAT</span>}
                  <br />
                  <span style={{ fontSize: 12, color: "var(--slate)" }}>{p.email} · {displayCity(p.city)} · ★ {p.rating} ({p.reviews_count})</span>
                </div>
              </div>
              <span style={{ color: "var(--steel)", fontWeight: 700, fontSize: 13 }}>Editează →</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
