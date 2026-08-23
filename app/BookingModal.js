"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { formatDuration } from "../lib/duration";
import { trackEvent } from "./GoogleAnalytics";

const WEEKDAYS_RO = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];

export default function BookingModal({ provider, isLoggedIn, userRole, onClose }) {
  const [serviceId, setServiceId] = useState(provider.services[0]?.id || "");
  const [availability, setAvailability] = useState(null); // [{date, weekday, slots}]
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [priority, setPriority] = useState("normal");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const needsGuestInfo = !isLoggedIn;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/providers/${provider.id}/availability?days=7`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const days = data.availability || [];
        setAvailability(days);
        const firstOpen = days.find((d) => d.slots.length > 0);
        if (firstOpen) setDate(firstOpen.date);
        setLoadingAvailability(false);
      })
      .catch(() => setLoadingAvailability(false));
    return () => { cancelled = true; };
  }, [provider.id]);

  const selectedDay = availability?.find((d) => d.date === date);

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
          priority,
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
    return createPortal(
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
      </div>,
      document.body
    );
  }

  return createPortal(
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
                <div>Prioritate: <b style={{ color: confirmed.priority === "urgent" ? "#C94C3C" : "var(--graphite)" }}>{confirmed.priority === "urgent" ? "Urgentă" : "Normală"}</b></div>
                <div>Status: <b style={{ color: "var(--orange-dark)" }}>În așteptare confirmare</b></div>
              </div>
              {!isLoggedIn && (
                <p style={{ fontSize: 12, color: "var(--slate)", marginTop: 14 }}>
                  Vrei să urmărești programările tale și să lași recenzii? <a href="/inregistrare" style={{ color: "var(--steel)", fontWeight: 700 }}>Creează un cont</a> (opțional).
                </p>
              )}
            </div>
          ) : loadingAvailability ? (
            <p style={{ textAlign: "center", color: "var(--slate)", padding: "20px 0" }}>Se încarcă disponibilitatea…</p>
          ) : !availability?.some((d) => d.slots.length > 0) ? (
            <p style={{ textAlign: "center", color: "var(--slate)", padding: "20px 0" }}>
              Niciun interval disponibil în următoarele 7 zile. Încearcă să suni direct prestatorul.
            </p>
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
                  <option key={s.id} value={s.id}>{s.name} — {s.price} lei ({formatDuration(s.duration)})</option>
                ))}
              </select>

              <span className="field-label">Alege ziua</span>
              <div className="slot-grid" style={{ gridTemplateColumns: "repeat(7,1fr)", marginBottom: 14 }}>
                {availability.map((d) => {
                  const dObj = new Date(d.date + "T00:00:00");
                  const disabled = d.slots.length === 0;
                  return (
                    <div
                      key={d.date}
                      className={"slot" + (date === d.date ? " selected" : "")}
                      style={{ padding: "8px 4px", fontSize: 11, opacity: disabled ? 0.35 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                      onClick={() => { if (!disabled) { setDate(d.date); setSlot(null); } }}
                    >
                      {WEEKDAYS_RO[dObj.getDay()]}<br />{dObj.getDate()}
                    </div>
                  );
                })}
              </div>

              <span className="field-label">Interval liber, {formatDate(date)}</span>
              {selectedDay?.slots.length > 0 ? (
                <div className="slot-grid">
                  {selectedDay.slots.map((t) => (
                    <div
                      key={t}
                      className={"slot" + (slot === t ? " selected" : "")}
                      onClick={() => setSlot(t)}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--slate)" }}>Prestatorul nu lucrează în această zi.</p>
              )}

              <span className="field-label">Prioritate</span>
              <div className="priority-picker">
                <button type="button" className={"priority-btn normal" + (priority === "normal" ? " selected" : "")} onClick={() => setPriority("normal")}>
                  <Clock size={14} strokeWidth={2.2} /> Normală
                </button>
                <button type="button" className={"priority-btn urgent" + (priority === "urgent" ? " selected" : "")} onClick={() => setPriority("urgent")}>
                  <AlertTriangle size={14} strokeWidth={2.2} /> Urgentă
                </button>
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
    </div>,
    document.body
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" });
}
