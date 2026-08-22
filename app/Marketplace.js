"use client";

import { useState } from "react";

const CATEGORIES = ["Toți", "Instalator", "Electrician", "Mecanic auto"];
const SLOTS = ["09:00", "10:30", "11:00", "13:00", "14:30", "16:00"];

export default function Marketplace({ initialProviders, isLoggedIn, userRole }) {
  const [category, setCategory] = useState("Toți");
  const [providers, setProviders] = useState(initialProviders);
  const [loading, setLoading] = useState(false);
  const [bookingFor, setBookingFor] = useState(null);

  async function selectCategory(cat) {
    setCategory(cat);
    setLoading(true);
    const res = await fetch(`/api/providers?category=${encodeURIComponent(cat)}`);
    const data = await res.json();
    setProviders(data.providers);
    setLoading(false);
  }

  return (
    <>
      <div className="cat-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={"cat-btn" + (category === cat ? " active" : "")}
            onClick={() => selectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="prov-grid" style={{ opacity: loading ? 0.5 : 1 }}>
        {providers.map((p) => (
          <div className="prov-card" key={p.id}>
            <div className="prov-top">
              <div className="prov-head">
                <div className="avatar">{p.init}</div>
                <div>
                  <div className="prov-name">
                    {p.name} {p.tags?.length > 0 && <span className="badge-verified">VERIFICAT</span>}
                  </div>
                  <div className="prov-meta">{p.cat} · {p.city}</div>
                </div>
              </div>
              <div className="prov-rating">
                ★ {p.rating} <span style={{ color: "var(--slate)", fontWeight: 400 }}>({p.reviews} recenzii)</span>
              </div>
              <div className="prov-tags">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div className="prov-bottom">
              <div className="prov-price">de la <b>{p.priceFrom} lei</b></div>
              <button className="btn btn-orange" onClick={() => setBookingFor(p)}>Programează</button>
            </div>
          </div>
        ))}
      </div>

      {bookingFor && (
        <BookingModal
          provider={bookingFor}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          onClose={() => setBookingFor(null)}
        />
      )}
    </>
  );
}

function BookingModal({ provider, isLoggedIn, userRole, onClose }) {
  const [serviceId, setServiceId] = useState(provider.services[0]?.id || "");
  const [slot, setSlot] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  async function submit() {
    setError("");
    if (!slot) { setError("Alege un interval orar."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          serviceId,
          date: "mâine",
          time: slot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvarea programării");
      setConfirmed(data.booking);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Neautentificat -> cere login/cont de client, in loc de formular.
  if (!isLoggedIn) {
    return (
      <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-head">
            <h3>Programează — {provider.name}</h3>
            <button className="close-x" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body" style={{ textAlign: "center" }}>
            <p style={{ color: "var(--slate)", marginBottom: 16 }}>
              Trebuie să fii autentificat cu un cont de client ca să faci o programare.
            </p>
            <a href="/login" className="btn btn-orange" style={{ marginRight: 10 }}>Autentificare</a>
            <a href="/inregistrare" className="btn btn-steel">Creează cont</a>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === "provider") {
    return (
      <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-head">
            <h3>Programează — {provider.name}</h3>
            <button className="close-x" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body" style={{ textAlign: "center", color: "var(--slate)" }}>
            Ești autentificat ca prestator. Doar conturile de client pot face programări.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{confirmed ? "Confirmare" : `Programează — ${provider.name}`}</h3>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {confirmed ? (
            <div className="confirm-view">
              <div className="ok">✓</div>
              <h3 style={{ fontSize: 17, marginBottom: 6 }}>Programare salvată!</h3>
              <p style={{ color: "var(--slate)", fontSize: 13.5 }}>
                Legată de contul tău — o vezi oricând în istoricul programărilor.
              </p>
              <div className="stub">
                <div>FIȘĂ NR. <b>#{confirmed.id}</b></div>
                <div>Prestator: <b>{confirmed.providerName}</b></div>
                <div>Serviciu: <b>{confirmed.serviceName}</b></div>
                <div>Interval: <b>{confirmed.date}, {confirmed.time}</b></div>
                <div>Status: <b style={{ color: "var(--orange-dark)" }}>În așteptare confirmare</b></div>
              </div>
            </div>
          ) : (
            <>
              <span className="field-label">Serviciu</span>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {provider.services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.price} lei ({s.duration} min)</option>
                ))}
              </select>

              <span className="field-label">Interval liber, mâine</span>
              <div className="slot-grid">
                {SLOTS.map((t) => (
                  <div
                    key={t}
                    className={"slot" + (slot === t ? " selected" : "")}
                    onClick={() => setSlot(t)}
                  >
                    {t}
                  </div>
                ))}
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button className="btn btn-orange" style={{ width: "100%", marginTop: 16, padding: 13 }} onClick={submit} disabled={submitting}>
                {submitting ? "Se salvează…" : "Confirmă programarea"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
