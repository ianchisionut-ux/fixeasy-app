"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import BookingModal from "../../../BookingModal";

export default function BookingSidebar({ provider, isLoggedIn, userRole, rating, reviewsCount, priceFrom, city, CategoryIcon }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="provider-sidebar">
      <div className="panel-card" style={{ textAlign: "center" }}>
        <div style={{ color: "var(--steel)", marginBottom: 8, display: "flex", justifyContent: "center" }}>
          {CategoryIcon && <CategoryIcon size={30} strokeWidth={1.8} />}
        </div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{provider.name}</div>
        <div style={{ fontSize: 13, color: "var(--slate)", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <MapPin size={13} strokeWidth={2.2} /> {city}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
          <div>
            <b style={{ display: "block", fontSize: 17, color: "var(--orange-dark)" }}>★ {rating}</b>
            <span style={{ fontSize: 11, color: "var(--slate)" }}>{reviewsCount} recenzii</span>
          </div>
          {priceFrom !== null && (
            <div>
              <b style={{ display: "block", fontSize: 17 }}>{priceFrom} lei</b>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>preț de la</span>
            </div>
          )}
        </div>
        <button className="btn btn-orange btn-lg" style={{ width: "100%" }} onClick={() => setOpen(true)}>
          Programează acum
        </button>
        <p style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 12 }}>Fără cont necesar — doar nume și telefon.</p>
      </div>

      {open && (
        <BookingModal provider={provider} isLoggedIn={isLoggedIn} userRole={userRole} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
