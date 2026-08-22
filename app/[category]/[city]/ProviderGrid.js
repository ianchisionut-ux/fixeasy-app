"use client";

import { useState } from "react";
import { providerSlug } from "../../../lib/seo";
import { displayCity } from "../../../lib/geo";
import BookingModal from "../../BookingModal";

export default function ProviderGrid({ providers, categorySlug, citySlug, isLoggedIn, userRole }) {
  const [bookingFor, setBookingFor] = useState(null);

  return (
    <>
      <div className="prov-grid">
        {providers.map((p) => (
          <div className="prov-card" key={p.id}>
            <div className="prov-top">
              <div className="prov-head">
                <div className="avatar">{p.init}</div>
                <div>
                  <div className="prov-name">
                    <a href={`/${categorySlug}/${citySlug}/${providerSlug(p.name, p.id)}`} style={{ color: "inherit" }}>{p.name}</a>{" "}
                    {p.tags?.length > 0 && <span className="badge-verified">VERIFICAT</span>}
                  </div>
                  <div className="prov-meta">{p.cat} · 📍 {displayCity(p.city)}</div>
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
        <BookingModal provider={bookingFor} isLoggedIn={isLoggedIn} userRole={userRole} onClose={() => setBookingFor(null)} />
      )}
    </>
  );
}
