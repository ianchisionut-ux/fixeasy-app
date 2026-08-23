"use client";

import { useState } from "react";
import BookingModal from "../../../BookingModal";

export default function MobileStickyBook({ provider, isLoggedIn, userRole, priceFrom }) {
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
        <button className="btn btn-orange" onClick={() => setOpen(true)}>Programează</button>
      </div>
      {open && (
        <BookingModal provider={provider} isLoggedIn={isLoggedIn} userRole={userRole} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
