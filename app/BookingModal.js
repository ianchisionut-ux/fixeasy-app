"use client";

import { useState } from "react";
import { nowInBucharest } from "../lib/date";
import { trackEvent } from "./GoogleAnalytics";

const SLOTS = ["09:00", "10:30", "11:00", "13:00", "14:30", "16:00"];
const WEEKDAYS_RO = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];

export function nextDays(count) {
  const days = [];
  for (let i = 1; i <= count; i++) {
    const d = nowInBucharest();
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ iso, label: WEEKDAYS_RO[d.getDay()], dayNum: d.getDate() });
  }
  return days;
}

export default function BookingModal({ provider, isLoggedIn, userRole, onClose }) {
  const days = nextDays(7);
  const [serviceId, setServiceId] = useState(provider.services[0]?.id || "");
  const [date, setDate] = useState(days[0].iso);
  const [slot, setSlot] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const needsGuestInfo = !isLoggedIn;

  async function submit() {
    setError("");
    if (!slot) { setError("Alege un interval orar."); return; }
    if (needsGuestInfo && (!guestName.trim() || !guestPhone.trim())) {
      setError("Completează numele și telefonul.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          serviceId,
          date,
          time: slot,
          ...(needsGuestInfo && { guestName, guestPhone }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvarea programării");
      setConfirmed(data.booking);
      trackEvent("booking_confirmed", {
        provider_id: provider.id,
        provider_name: provider.name,
        value: data.booking?.price || 0,
        currency: "RON",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
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
            Ești autentificat ca prestator. Doar clienții pot face programări.
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
                {isLoggedIn
                  ? "Legată de contul tău — o vezi oricând în istoricul programărilor."
                  : "Notează numărul fișei — prestatorul te va contacta la numărul de telefon dat."}
              </p>
              <div className="stub">
                <div>FIȘĂ NR. <b>#{confirmed.id}</b></div>
                <div>Prestator: <b>{confirmed.providerName}</b></div>
                <div>Serviciu: <b>{confirmed.serviceName}</b></div>
                <div>Interval: <b>{formatDate(confirmed.date)}, {confirmed.time}</b></div>
                <div>Status: <b style={{ color: "var(--orange-dark)" }}>În așteptare confirmare</b></div>
              </div>
              {!isLoggedIn && (
                <p style={{ fontSize: 12, color: "var(--slate)", marginTop: 14 }}>
                  Vrei să urmărești programările tale și să lași recenzii? <a href="/inregistrare" style={{ color: "var(--steel)", fontWeight: 700 }}>Creează un cont</a> (opțional).
                </p>
              )}
            </div>
          ) : (
            <>
              {needsGuestInfo && (
                <div style={{ background: "var(--paper)", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 12.5, color: "var(--slate)" }}>
                  Programezi fără cont — completează doar numele și telefonul. Ai deja cont? <a href="/login" style={{ color: "var(--steel)", fontWeight: 700 }}>Autentifică-te</a>
                </div>
              )}

              <span className="field-label">Serviciu</span>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {provider.services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.price} lei ({s.duration} min)</option>
                ))}
              </select>

              <span className="field-label">Alege ziua</span>
              <div className="slot-grid" style={{ gridTemplateColumns: "repeat(7,1fr)", marginBottom: 14 }}>
                {days.map((d) => (
                  <div
                    key={d.iso}
                    className={"slot" + (date === d.iso ? " selected" : "")}
                    style={{ padding: "8px 4px", fontSize: 11 }}
                    onClick={() => setDate(d.iso)}
                  >
                    {d.label}<br />{d.dayNum}
                  </div>
                ))}
              </div>

              <span className="field-label">Interval liber, {formatDate(date)}</span>
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

              {needsGuestInfo && (
                <>
                  <span className="field-label">Numele tău</span>
                  <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ex: Andrei Popescu" />

                  <span className="field-label">Telefon</span>
                  <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="07xx xxx xxx" type="tel" />
                </>
              )}

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

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" });
}
