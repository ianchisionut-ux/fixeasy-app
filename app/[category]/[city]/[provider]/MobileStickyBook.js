"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import BookingModal from "../../../BookingModal";

export default function MobileStickyBook({ provider, isLoggedIn, userRole, priceFrom, phone }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mobile-sticky-cta">
        <div>
          {priceFrom !== null && (
            <>
              <div style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", letterSpacing: ".03em" }}>de la</div>
              <b style={{ fontSize: 16 }}>{priceFrom} lei</b>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {phone && (
            <a href={`tel:${phone}`} className="btn btn-outline" aria-label="Sună acum" style={{ padding: "0 14px" }}>
              <Phone size={17} strokeWidth={2.2} />
            </a>
          )}
          <button className="btn btn-orange" onClick={() => setOpen(true)}>Programează</button>
        </div>
      </div>
      {open && (
        <BookingModal provider={provider} isLoggedIn={isLoggedIn} userRole={userRole} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
