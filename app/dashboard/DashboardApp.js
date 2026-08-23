"use client";

import { useState, useMemo } from "react";
import { nowInBucharest, isoOf } from "../../lib/date";
import { CATEGORIES_SEO, citySlug, providerSlug } from "../../lib/seo";
import { Phone, MapPin, Link as LinkIcon, Camera, X as XIcon, AlertTriangle } from "lucide-react";
import { formatDuration, toMinutes, splitMinutes } from "../../lib/duration";
import { resizeImage } from "../../lib/imageResize";
import { toast } from "../Toast";

const WEEKDAYS_SHORT = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const MONTHS_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];

function startOfWeek(d) {
  const day = (d.getDay() + 6) % 7; // Luni = 0
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DashboardApp({ providerName, initialBookings, initialProfile, initialServices, initialGallery, initialSchedule, initialTimeOff }) {
  const [tab, setTab] = useState("calendar");
  const [bookings, setBookings] = useState(initialBookings);

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;

  async function updateStatus(rawId, status) {
    const res = await fetch(`/api/bookings/${rawId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.rawId === rawId ? { ...b, status } : b)));
      const labels = { confirmed: "Programare acceptată", cancelled: "Programare respinsă", completed: "Programare marcată ca finalizată" };
      toast(labels[status] || "Status actualizat");
    } else {
      toast("Eroare la actualizarea programării", "error");
    }
  }

  return (
    <section>
      <div className="section-head">
        <span className="eyebrow" style={{ background: "rgba(44,74,94,.1)", color: "var(--steel)" }}>Dashboard prestator</span>
        <h2>Bun venit, {providerName}</h2>
        <p>Calendar, programări și profil de business — totul salvat real.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 20, maxWidth: 1000, margin: "0 auto 20px" }}>
        <Stat label="Total programări" value={bookings.length} />
        <Stat label="În așteptare" value={pending} />
        <Stat label="Confirmate" value={confirmed} />
      </div>

      <div className="cat-row" style={{ maxWidth: 1000, margin: "0 auto 20px" }}>
        <button className={"cat-btn" + (tab === "calendar" ? " active" : "")} onClick={() => setTab("calendar")}>Calendar</button>
        <button className={"cat-btn" + (tab === "program" ? " active" : "")} onClick={() => setTab("program")}>Program de lucru</button>
        <button className={"cat-btn" + (tab === "cont" ? " active" : "")} onClick={() => setTab("cont")}>Servicii &amp; Profil</button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {tab === "calendar" ? (
          <CalendarPanel bookings={bookings} onUpdateStatus={updateStatus} />
        ) : tab === "program" ? (
          <ScheduleManager initialSchedule={initialSchedule} initialTimeOff={initialTimeOff} />
        ) : (
          <AccountPanel initialProfile={initialProfile} initialServices={initialServices} initialGallery={initialGallery} />
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ background: "#0F3F60", borderRadius: 8, padding: 14, color: "var(--paper)" }}>
      <b style={{ fontSize: 22, display: "block", fontFamily: "var(--font)" }}>{value}</b>
      <span style={{ fontSize: 11, color: "rgba(243,248,251,.6)", textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "var(--font)" }}>{label}</span>
    </div>
  );
}

/* ---------------- CALENDAR ---------------- */

function CalendarPanel({ bookings, onUpdateStatus }) {
  const [view, setView] = useState("luna"); // luna | saptamana | zi
  const [cursor, setCursor] = useState(nowInBucharest());

  const byDate = useMemo(() => {
    const map = {};
    for (const b of bookings) {
      (map[b.date] ||= []).push(b);
    }
    return map;
  }, [bookings]);

  function shift(delta) {
    const d = new Date(cursor);
    if (view === "luna") d.setMonth(d.getMonth() + delta);
    else if (view === "saptamana") d.setDate(d.getDate() + delta * 7);
    else d.setDate(d.getDate() + delta);
    setCursor(d);
  }

  const title =
    view === "luna"
      ? `${MONTHS_RO[cursor.getMonth()]} ${cursor.getFullYear()}`
      : view === "saptamana"
      ? `Săptămâna ${isoOf(startOfWeek(cursor))}`
      : cursor.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="dash-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #1C4F73", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-steel" style={{ padding: "6px 12px" }} onClick={() => shift(-1)}>‹</button>
          <b style={{ color: "var(--paper)", fontFamily: "var(--font)", fontSize: 15 }}>{title}</b>
          <button className="btn btn-steel" style={{ padding: "6px 12px" }} onClick={() => shift(1)}>›</button>
          <button className="btn btn-outline-dark" style={{ padding: "6px 12px" }} onClick={() => setCursor(nowInBucharest())}>Azi</button>
        </div>
        <div className="cat-row" style={{ marginBottom: 0 }}>
          {["zi", "saptamana", "luna"].map((v) => (
            <button key={v} className={"cat-btn" + (view === v ? " active" : "")} onClick={() => setView(v)}>
              {v === "zi" ? "Zi" : v === "saptamana" ? "Săptămână" : "Lună"}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-body">
        {view === "luna" && <MonthView cursor={cursor} byDate={byDate} onPickDay={(d) => { setCursor(d); setView("zi"); }} />}
        {view === "saptamana" && <WeekView cursor={cursor} byDate={byDate} onPickDay={(d) => { setCursor(d); setView("zi"); }} />}
        {view === "zi" && <DayView cursor={cursor} bookings={byDate[isoOf(cursor)] || []} onUpdateStatus={onUpdateStatus} />}
      </div>
    </div>
  );
}

function MonthView({ cursor, byDate, onPickDay }) {
  const cells = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const todayIso = isoOf(nowInBucharest());
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
        {WEEKDAYS_SHORT.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 11, color: "rgba(243,248,251,.5)", fontFamily: "var(--font)" }}>{w}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = isoOf(d);
          const items = byDate[iso] || [];
          const isToday = iso === todayIso;
          return (
            <div
              key={i}
              onClick={() => onPickDay(d)}
              style={{
                minHeight: 68, borderRadius: 8, padding: 6, cursor: "pointer",
                background: isToday ? "rgba(79,168,216,.15)" : "#0B3552",
                border: isToday ? "1.5px solid var(--orange)" : "1px solid #1C4F73",
              }}
            >
              <div style={{ fontSize: 12, color: "var(--paper)", fontFamily: "var(--font)", marginBottom: 4 }}>{d.getDate()}</div>
              {items.slice(0, 2).map((b) => (
                <div key={b.id} className={"status " + b.status} style={{ fontSize: 9, marginBottom: 2, display: "block", textAlign: "left", padding: "2px 5px", borderLeft: b.priority === "urgent" ? "2px solid #C94C3C" : "none" }}>
                  {b.time}
                </div>
              ))}
              {items.length > 2 && (
                <div style={{ fontSize: 9.5, color: "rgba(243,248,251,.5)" }}>+{items.length - 2} mai multe</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ cursor, byDate, onPickDay }) {
  const monday = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
      {days.map((d) => {
        const iso = isoOf(d);
        const items = byDate[iso] || [];
        return (
          <div key={iso} onClick={() => onPickDay(d)} style={{ cursor: "pointer", background: "#0B3552", border: "1px solid #1C4F73", borderRadius: 8, padding: 8, minHeight: 140 }}>
            <div style={{ fontSize: 11, color: "rgba(243,248,251,.6)", marginBottom: 6, fontFamily: "var(--font)" }}>
              {WEEKDAYS_SHORT[(d.getDay() + 6) % 7]} {d.getDate()}
            </div>
            {items.map((b) => (
              <div key={b.id} className={"status " + b.status} style={{ display: "block", marginBottom: 4, fontSize: 10, padding: "3px 6px", borderLeft: b.priority === "urgent" ? "2px solid #C94C3C" : "none" }}>
                {b.time} · {b.clientName.split(" ")[0]}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function DayView({ cursor, bookings, onUpdateStatus }) {
  const sorted = [...bookings].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === "urgent" ? -1 : 1;
    return a.time.localeCompare(b.time);
  });
  if (sorted.length === 0) {
    return <p style={{ color: "rgba(243,248,251,.6)", textAlign: "center", padding: "24px 0" }}>Nicio programare în această zi.</p>;
  }
  return (
    <div>
      {sorted.map((b) => (
        <div className="dash-row" key={b.id} style={b.priority === "urgent" ? { borderLeft: "3px solid #C94C3C" } : undefined}>
          <div className="who">
            <div className="mini-avatar">{b.clientName.slice(0, 2).toUpperCase()}</div>
            <div>
              {b.clientName} — {b.serviceName}{" "}
              {b.priority === "urgent" && (
                <span className="priority-tag urgent" style={{ marginLeft: 4 }}>
                  <AlertTriangle size={10} strokeWidth={2.4} /> Urgentă
                </span>
              )}
              <br />
              <span style={{ opacity: 0.5, fontSize: 11.5 }}>
                {b.time} · #{b.id}{b.clientPhone && <> · <Phone size={11} strokeWidth={2.2} style={{ verticalAlign: -1 }} /> {b.clientPhone}</>}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className={"status " + b.status}>
              {b.status === "pending" ? "În așteptare" : b.status === "confirmed" ? "Confirmată" : b.status === "completed" ? "Finalizată" : b.status}
            </span>
            {b.status === "pending" && (
              <>
                <button className="btn btn-steel" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => onUpdateStatus(b.rawId, "confirmed")}>Acceptă</button>
                <button className="btn btn-outline-dark" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => onUpdateStatus(b.rawId, "cancelled")}>Respinge</button>
              </>
            )}
            {b.status === "confirmed" && (
              <button className="btn btn-steel" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => onUpdateStatus(b.rawId, "completed")}>Marchează finalizată</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- ACCOUNT (profile + services) ---------------- */

function AccountPanel({ initialProfile, initialServices, initialGallery }) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <ProfileForm initialProfile={initialProfile} />
      <ServicesManager initialServices={initialServices} category={initialProfile?.category} />
      <GalleryManager initialGallery={initialGallery} />
      <GoogleVisibilityCard initialProfile={initialProfile} />
    </div>
  );
}

function GoogleVisibilityCard({ initialProfile }) {
  const businessName = initialProfile?.business_name || "afacerea ta";
  const city = initialProfile?.city && initialProfile.city !== "Necompletat" ? initialProfile.city : "";
  const gbpUrl = "https://business.google.com/create";
  const searchQuery = encodeURIComponent(`${businessName} ${city}`.trim());

  return (
    <div className="panel-card">
      <h3 style={{ fontSize: 16, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><MapPin size={17} strokeWidth={2.2} /> Apari și pe Google</h3>
      <p style={{ fontSize: 13.5, color: "var(--slate)", marginBottom: 16 }}>
        Profilul tău FixEasy e deja pregătit pentru Google Search (pagină indexabilă cu recenzii și prețuri).
        Pentru și mai multă vizibilitate — inclusiv pe Google Maps — creează-ți gratuit un <b>Google Business Profile</b> și
        pune link-ul către profilul tău FixEasy ca website.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href={gbpUrl} target="_blank" rel="noreferrer" className="btn btn-orange">
          Creează Google Business Profile
        </a>
        <a href={`https://www.google.com/search?q=${searchQuery}`} target="_blank" rel="noreferrer" className="btn btn-outline">
          Vezi cum apari acum pe Google
        </a>
      </div>
    </div>
  );
}

function ProfileForm({ initialProfile }) {
  const [businessName, setBusinessName] = useState(initialProfile?.business_name || "");
  const [category, setCategory] = useState(initialProfile?.category || CATEGORIES_SEO[0].category);
  const [city, setCity] = useState(initialProfile?.city || "");
  const [tags, setTags] = useState((initialProfile?.tags || []).join(", "));
  const [photo, setPhoto] = useState(initialProfile?.profile_photo || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const resized = await resizeImage(file, 500, 0.8);
      const res = await fetch("/api/provider/photo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: resized }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la încărcarea pozei.");
      setPhoto(data.profilePhoto);
      toast("Poză de profil actualizată");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function removePhoto() {
    const res = await fetch("/api/provider/photo", { method: "DELETE" });
    if (res.ok) {
      setPhoto(null);
      toast("Poză de profil eliminată");
    }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, category, city, tags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare.");
      toast("Profil salvat");
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const isPublished = initialProfile?.category && initialProfile.category !== "Necompletat" && initialProfile?.city && initialProfile.city !== "Necompletat";
  const publicUrl = isPublished
    ? `/${CATEGORIES_SEO.find((c) => c.category === initialProfile.category)?.slug}/${citySlug(initialProfile.city)}/${providerSlug(initialProfile.business_name, initialProfile.id)}`
    : null;

  return (
    <form onSubmit={save} className="panel-card">
      <h3 style={{ fontSize: 16, marginBottom: 4 }}>Profil de business</h3>
      {publicUrl && (
        <a href={publicUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: "var(--steel)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
          <LinkIcon size={13} strokeWidth={2.2} /> Vezi profilul tău public →
        </a>
      )}
      {!publicUrl && <div style={{ fontSize: 12.5, color: "var(--slate)", marginBottom: 14 }}>Completează categoria și orașul ca profilul tău să apară public și în Google.</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 14, overflow: "hidden", flexShrink: 0,
          background: photo ? "transparent" : "linear-gradient(135deg, var(--steel), var(--steel-light))",
          display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--line)",
        }}>
          {photo ? (
            <img src={photo} alt="Poză de profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Camera size={24} color="white" strokeWidth={1.8} />
          )}
        </div>
        <div>
          <label className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 12.5, cursor: "pointer", display: "inline-flex" }}>
            {uploadingPhoto ? "Se încarcă…" : photo ? "Schimbă poza" : "Adaugă poză de profil"}
            <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploadingPhoto} style={{ display: "none" }} />
          </label>
          {photo && (
            <button type="button" onClick={removePhoto} style={{ background: "none", border: "none", color: "#B3261E", fontSize: 12, marginLeft: 10, cursor: "pointer" }}>
              Elimină
            </button>
          )}
          <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 4 }}>Opțional — apare pe profilul tău public.</div>
        </div>
      </div>

      <span className="field-label">Nume business</span>
      <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
      <span className="field-label" style={{ marginTop: 12 }}>Categorie</span>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES_SEO.map((c) => (
          <option key={c.category} value={c.category}>{c.category}</option>
        ))}
      </select>
      <span className="field-label" style={{ marginTop: 12 }}>Oraș</span>
      <input value={city} onChange={(e) => setCity(e.target.value)} required />
      <span className="field-label" style={{ marginTop: 12 }}>Etichete (separate prin virgulă)</span>
      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ex: Urgențe 24/7, Autorizat ANRE" />
      {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
      <button className="btn btn-orange" style={{ marginTop: 14, padding: "10px 20px" }} disabled={saving}>
        {saving ? "Se salvează…" : "Salvează profilul"}
      </button>
    </form>
  );
}

function ServicesManager({ initialServices, category }) {
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", hours: "", minutes: "" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const suggestions = CATEGORIES_SEO.find((c) => c.category === category)?.subcategories || [];
  const existingNames = new Set(services.map((s) => s.name.toLowerCase()));
  const availableSuggestions = suggestions.filter((s) => !existingNames.has(s.toLowerCase()));

  function startEdit(s) {
    setEditingId(s.id);
    const { hours, minutes } = splitMinutes(s.duration_minutes);
    setForm({ name: s.name, price: s.price, hours, minutes });
  }

  async function saveEdit(id) {
    const duration = toMinutes(form.hours, form.minutes);
    const res = await fetch(`/api/provider/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, price: Number(form.price), duration }),
    });
    const data = await res.json();
    if (res.ok) {
      setServices((prev) => prev.map((s) => (s.id === id ? data.service : s)));
      setEditingId(null);
      toast("Serviciu actualizat");
    } else {
      setError(data.error);
      toast(data.error || "Eroare la actualizare", "error");
    }
  }

  async function deleteService(id) {
    const res = await fetch(`/api/provider/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast("Serviciu șters");
    } else {
      toast("Eroare la ștergere", "error");
    }
  }

  async function addService(e) {
    e.preventDefault();
    setError("");
    const duration = toMinutes(form.hours, form.minutes);
    if (duration <= 0) {
      setError("Adaugă durata serviciului.");
      return;
    }
    try {
      const res = await fetch("/api/provider/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, price: Number(form.price), duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setServices((prev) => [...prev, data.service]);
      setForm({ name: "", price: "", hours: "", minutes: "" });
      setAdding(false);
      toast("Serviciu adăugat");
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    }
  }

  return (
    <div className="panel-card">
      <h3 style={{ fontSize: 16, marginBottom: 14 }}>Servicii oferite</h3>

      {services.map((s) => (
        <div key={s.id} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)" }}>
          {editingId === s.id ? (
            <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
              <input style={{ flex: 2, minWidth: 140 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input style={{ width: 80 }} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Preț" />
              <input style={{ width: 60 }} type="number" min="0" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="Ore" />
              <input style={{ width: 70 }} type="number" min="0" max="59" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} placeholder="Minute" />
              <button className="btn btn-orange" style={{ padding: "8px 12px" }} onClick={() => saveEdit(s.id)}>Salvează</button>
              <button className="btn btn-outline" style={{ padding: "8px 12px", color: "var(--graphite)", borderColor: "var(--line)" }} onClick={() => setEditingId(null)}>Anulează</button>
            </div>
          ) : (
            <>
              <div>{s.name} <span className="mono" style={{ color: "var(--slate)", fontSize: 12 }}>— {s.price} lei · {formatDuration(s.duration_minutes)}</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12, color: "var(--graphite)", borderColor: "var(--line)" }} onClick={() => startEdit(s)}>Editează</button>
                <button className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12, color: "#B3261E", borderColor: "#F3C6C2" }} onClick={() => deleteService(s.id)}>Șterge</button>
              </div>
            </>
          )}
        </div>
      ))}

      {adding ? (
        <form onSubmit={addService} style={{ marginTop: 10 }}>
          {availableSuggestions.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {availableSuggestions.map((s) => (
                <span
                  key={s}
                  className="tag"
                  style={{ cursor: "pointer" }}
                  onClick={() => setForm({ ...form, name: s })}
                >
                  + {s}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input style={{ flex: 2, minWidth: 160 }} placeholder="Nume serviciu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input style={{ width: 90 }} type="number" placeholder="Preț (lei)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input style={{ width: 70 }} type="number" min="0" placeholder="Ore" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
            <input style={{ width: 80 }} type="number" min="0" max="59" placeholder="Minute" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} />
            <button className="btn btn-orange" style={{ padding: "8px 14px" }}>Adaugă</button>
            <button type="button" className="btn btn-outline" style={{ padding: "8px 14px", color: "var(--graphite)", borderColor: "var(--line)" }} onClick={() => setAdding(false)}>Anulează</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-steel" style={{ marginTop: 14, padding: "10px 18px" }} onClick={() => setAdding(true)}>+ Adaugă serviciu</button>
      )}

      {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  );
}

function GalleryManager({ initialGallery }) {
  const [images, setImages] = useState(initialGallery || []);
  const [uploading, setUploading] = useState(false);

  async function handleAdd(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 12) {
      toast("Poți adăuga maxim 12 poze în galerie.", "error");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const resized = await resizeImage(file, 900, 0.75);
      const res = await fetch("/api/provider/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: resized }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la adăugarea pozei.");
      setImages((prev) => [...prev, data.image]);
      toast("Poză adăugată în galerie");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/provider/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast("Poză ștearsă");
    } else {
      toast("Eroare la ștergere", "error");
    }
  }

  return (
    <div className="panel-card">
      <h3 style={{ fontSize: 16, marginBottom: 4 }}>Galerie lucrări</h3>
      <p style={{ fontSize: 12.5, color: "var(--slate)", marginBottom: 16 }}>
        Opțional — adaugă poze cu lucrări realizate. Apar pe profilul tău public, cresc încrederea clienților.
      </p>

      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10, marginBottom: 16 }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1px solid var(--line)" }}>
              <img src={img.image_data} alt={img.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => handleDelete(img.id)}
                style={{
                  position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 6,
                  background: "rgba(11,53,82,.75)", border: "none", color: "white", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                aria-label="Șterge poza"
              >
                <XIcon size={13} strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="btn btn-steel" style={{ padding: "10px 18px", cursor: "pointer", display: "inline-flex" }}>
        {uploading ? "Se încarcă…" : "+ Adaugă poză"}
        <input type="file" accept="image/*" onChange={handleAdd} disabled={uploading} style={{ display: "none" }} />
      </label>
      <span style={{ fontSize: 11.5, color: "var(--slate)", marginLeft: 10 }}>{images.length}/12 poze</span>
    </div>
  );
}

/* ---------------- PROGRAM DE LUCRU (schedule + blocari) ---------------- */

const WEEKDAY_NAMES = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

function ScheduleManager({ initialSchedule, initialTimeOff }) {
  const defaultDay = (weekday) => ({ weekday, isWorking: weekday !== 6, startTime: "09:00", endTime: "17:00" });
  const initial = Array.from({ length: 7 }, (_, w) => {
    const existing = initialSchedule?.find((d) => d.weekday === w);
    return existing
      ? { weekday: w, isWorking: existing.is_working, startTime: existing.start_time, endTime: existing.end_time }
      : defaultDay(w);
  });

  const [schedule, setSchedule] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState(initialTimeOff || []);
  const [adding, setAdding] = useState(false);
  const [blockForm, setBlockForm] = useState({ date: "", allDay: true, startTime: "09:00", endTime: "17:00", reason: "" });
  const [error, setError] = useState("");

  function updateDay(weekday, patch) {
    setSchedule((prev) => prev.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)));
  }

  async function saveSchedule() {
    setSaving(true);
    try {
      const res = await fetch("/api/provider/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare.");
      toast("Program salvat");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function addBlock(e) {
    e.preventDefault();
    setError("");
    if (!blockForm.date) {
      setError("Alege o dată.");
      return;
    }
    try {
      const res = await fetch("/api/provider/timeoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: blockForm.date,
          startTime: blockForm.allDay ? null : blockForm.startTime,
          endTime: blockForm.allDay ? null : blockForm.endTime,
          reason: blockForm.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la adăugare.");
      setBlocks((prev) => [...prev, data.block].sort((a, b) => a.date.localeCompare(b.date)));
      setBlockForm({ date: "", allDay: true, startTime: "09:00", endTime: "17:00", reason: "" });
      setAdding(false);
      toast("Blocare adăugată");
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    }
  }

  async function deleteBlock(id) {
    const res = await fetch(`/api/provider/timeoff/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      toast("Blocare ștearsă");
    } else {
      toast("Eroare la ștergere", "error");
    }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="panel-card">
        <h3 style={{ fontSize: 16, marginBottom: 4 }}>Program săptămânal</h3>
        <p style={{ fontSize: 12.5, color: "var(--slate)", marginBottom: 16 }}>
          Alege zilele în care lucrezi și intervalul orar — clienții vor putea programa doar în aceste intervale.
        </p>

        {schedule.map((day) => (
          <div key={day.weekday} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140, cursor: "pointer", fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={day.isWorking}
                onChange={(e) => updateDay(day.weekday, { isWorking: e.target.checked })}
                style={{ width: "auto" }}
              />
              {WEEKDAY_NAMES[day.weekday]}
            </label>
            {day.isWorking ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => updateDay(day.weekday, { startTime: e.target.value })}
                  style={{ width: 110 }}
                />
                <span style={{ color: "var(--slate)" }}>–</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => updateDay(day.weekday, { endTime: e.target.value })}
                  style={{ width: 110 }}
                />
              </div>
            ) : (
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>Liber</span>
            )}
          </div>
        ))}

        <button className="btn btn-orange" style={{ marginTop: 14, padding: "10px 20px" }} onClick={saveSchedule} disabled={saving}>
          {saving ? "Se salvează…" : "Salvează programul"}
        </button>
      </div>

      <div className="panel-card">
        <h3 style={{ fontSize: 16, marginBottom: 4 }}>Blocări punctuale</h3>
        <p style={{ fontSize: 12.5, color: "var(--slate)", marginBottom: 16 }}>
          Blochează o zi întreagă sau doar un interval orar — concediu, urgențe personale, programări private etc.
        </p>

        {blocks.length === 0 && <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 14 }}>Nicio blocare programată.</p>}

        {blocks.map((b) => (
          <div key={b.id} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)" }}>
            <div>
              <b>{formatBlockDate(b.date)}</b>{" "}
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                {b.startTime && b.endTime ? `${b.startTime} – ${b.endTime}` : "toată ziua"}
                {b.reason ? ` · ${b.reason}` : ""}
              </span>
            </div>
            <button className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12, color: "#B3261E", borderColor: "#F3C6C2" }} onClick={() => deleteBlock(b.id)}>
              Șterge
            </button>
          </div>
        ))}

        {adding ? (
          <form onSubmit={addBlock} style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="date"
                value={blockForm.date}
                onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                style={{ flex: 1, minWidth: 160 }}
                required
              />
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                <input
                  type="checkbox"
                  checked={blockForm.allDay}
                  onChange={(e) => setBlockForm({ ...blockForm, allDay: e.target.checked })}
                  style={{ width: "auto" }}
                />
                Toată ziua
              </label>
            </div>
            {!blockForm.allDay && (
              <div style={{ display: "flex", gap: 10 }}>
                <input type="time" value={blockForm.startTime} onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })} style={{ flex: 1 }} />
                <input type="time" value={blockForm.endTime} onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })} style={{ flex: 1 }} />
              </div>
            )}
            <input
              placeholder="Motiv (opțional) — ex: Concediu, programare privată"
              value={blockForm.reason}
              onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
            />
            {error && <div className="error-msg">{error}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-orange" style={{ padding: "8px 16px" }}>Adaugă blocarea</button>
              <button type="button" className="btn btn-outline" style={{ padding: "8px 16px", color: "var(--graphite)", borderColor: "var(--line)" }} onClick={() => setAdding(false)}>Anulează</button>
            </div>
          </form>
        ) : (
          <button className="btn btn-steel" style={{ marginTop: 14, padding: "10px 18px" }} onClick={() => setAdding(true)}>+ Adaugă blocare</button>
        )}
      </div>
    </div>
  );
}

function formatBlockDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "long" });
}
