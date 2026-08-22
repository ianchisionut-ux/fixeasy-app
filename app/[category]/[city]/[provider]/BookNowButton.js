"use client";

import { useState } from "react";
import BookingModal from "../../../BookingModal";

export default function BookNowButton({ provider, isLoggedIn, userRole, label = "Programează" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-orange btn-lg" onClick={() => setOpen(true)}>{label}</button>
      {open && <BookingModal provider={provider} isLoggedIn={isLoggedIn} userRole={userRole} onClose={() => setOpen(false)} />}
    </>
  );
}
