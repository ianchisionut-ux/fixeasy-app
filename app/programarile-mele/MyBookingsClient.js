"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Clock } from "lucide-react";

const STATUS_LABELS = { pending: "În așteptare", confirmed: "Confirmată", completed: "Finalizată", cancelled: "Anulată" };

export default function MyBookingsClient({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [reviewFor, setReviewFor] = useState(null);

  function onReviewSaved(bookingId, rating) {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, hasReview: true, reviewRating: rating } : b)));
    setReviewFor(null);
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <div className="big">📅</div>
        <p>Nu ai încă nicio programare.</p>
        <a href="/#marketplace" className="btn btn-orange" style={{ marginTop: 14 }}>Caută un profesionist</a>
      </div>
    );
  }

  return (
    <>
      <div className="panel-card" style={{ maxWidth: 720, margin: "0 auto" }}>
        {bookings.map((b) => (
          <div key={b.id} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)" }}>
            <div>
              <b>{b.providerName}</b> — {b.serviceName}
              <br />
              <span style={{ fontSize: 12, color: "var(--slate)" }}>{b.date}, {b.time}</span>
              {" "}
              <span className={"priority-tag " + b.priority}>
                {b.priority === "urgent" ? <AlertTriangle size={10} strokeWidth={2.4} /> : <Clock size={10} strokeWidth={2.4} />}
                {b.priority === "urgent" ? "Urgentă" : "Normală"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={"status " + b.status}>{STATUS_LABELS[b.status] || b.status}</span>
              {b.status === "completed" && !b.hasReview && (
                <button className="btn btn-orange" style={{ padding: "7px 14px", fontSize: 12.5 }} onClick={() => setReviewFor(b)}>
                  Lasă o recenzie
                </button>
              )}
              {b.hasReview && (
                <span style={{ fontSize: 12.5, color: "var(--orange-dark)", fontWeight: 700 }}>★ {b.reviewRating} — mulțumim!</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {reviewFor && (
        <ReviewModal booking={reviewFor} onClose={() => setReviewFor(null)} onSaved={onReviewSaved} />
      )}
    </>
  );
}

function ReviewModal({ booking, onClose, onSaved }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvarea recenziei.");
      onSaved(booking.id, rating);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>Recenzie — {booking.providerName}</h3>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <span className="field-label">Notă</span>
          <div style={{ display: "flex", gap: 6, fontSize: 30, marginBottom: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setRating(n)}
                style={{ cursor: "pointer", color: n <= rating ? "var(--orange-dark)" : "var(--line)" }}
              >
                ★
              </span>
            ))}
          </div>

          <span className="field-label">Comentariu (opțional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Cum a fost experiența ta?"
            style={{ width: "100%", padding: 12, border: "1.5px solid var(--line)", borderRadius: 10, fontFamily: "var(--font)", fontSize: 14, resize: "vertical" }}
          />

          {error && <div className="error-msg">{error}</div>}

          <button className="btn btn-orange" style={{ width: "100%", marginTop: 16, padding: 13 }} onClick={submit} disabled={submitting}>
            {submitting ? "Se salvează…" : "Trimite recenzia"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
