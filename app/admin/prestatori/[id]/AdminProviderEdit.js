"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES_SEO } from "../../../../lib/seo";
import { formatDuration } from "../../../../lib/duration";
import { toast } from "../../../Toast";

const STATUS_LABELS = { pending: "În așteptare", confirmed: "Confirmată", completed: "Finalizată", cancelled: "Anulată" };

export default function AdminProviderEdit({ provider, initialServices, bookings }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(provider.business_name);
  const [category, setCategory] = useState(provider.category);
  const [city, setCity] = useState(provider.city);
  const [tags, setTags] = useState((provider.tags || []).join(", "));
  const [verified, setVerified] = useState(provider.verified);
  const [services, setServices] = useState(initialServices);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/providers/${provider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, category, city, tags, verified }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la salvare.");
      toast("Profil actualizat");
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(serviceId) {
    const res = await fetch(`/api/admin/providers/${provider.id}/services/${serviceId}`, { method: "DELETE" });
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast("Serviciu șters");
    } else {
      toast("Eroare la ștergere", "error");
    }
  }

  async function deleteAccount() {
    if (!confirm(`Sigur ștergi contul lui ${provider.business_name}? Această acțiune e ireversibilă și șterge și toate programările/recenziile asociate.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/providers/${provider.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Cont prestator șters");
      router.push("/admin/prestatori");
    } else {
      toast("Eroare la ștergere", "error");
      setDeleting(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 20 }}>
      <form onSubmit={save} className="panel-card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Profil de business</h3>

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
        <input value={tags} onChange={(e) => setTags(e.target.value)} />

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} style={{ width: "auto" }} />
          Cont verificat (afișează badge „VERIFICAT")
        </label>

        {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <button className="btn btn-orange" disabled={saving}>{saving ? "Se salvează…" : "Salvează modificările"}</button>
          <button type="button" className="btn btn-outline" style={{ color: "#B3261E", borderColor: "#F3C6C2" }} onClick={deleteAccount} disabled={deleting}>
            {deleting ? "Se șterge…" : "Șterge cont prestator"}
          </button>
        </div>
      </form>

      <div className="panel-card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Servicii ({services.length})</h3>
        {services.length === 0 && <p style={{ color: "var(--slate)", fontSize: 13.5 }}>Niciun serviciu adăugat.</p>}
        {services.map((s) => (
          <div key={s.id} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)" }}>
            <div>{s.name} <span className="mono" style={{ color: "var(--slate)", fontSize: 12 }}>— {s.price} lei · {formatDuration(s.duration_minutes)}</span></div>
            <button className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12, color: "#B3261E", borderColor: "#F3C6C2" }} onClick={() => deleteService(s.id)}>
              Șterge
            </button>
          </div>
        ))}
      </div>

      <div className="panel-card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Programări recente</h3>
        {bookings.length === 0 && <p style={{ color: "var(--slate)", fontSize: 13.5 }}>Nicio programare încă.</p>}
        {bookings.map((b) => (
          <div key={b.id} className="dash-row" style={{ background: "var(--paper)", color: "var(--graphite)" }}>
            <div>
              {b.client_name} <span style={{ color: "var(--slate)", fontSize: 12 }}>— {b.scheduled_date}, {b.scheduled_time}</span>
              {b.priority === "urgent" && <span className="priority-tag urgent" style={{ marginLeft: 6 }}>Urgentă</span>}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase",
              background: b.status === "pending" ? "rgba(201,122,43,.15)" : b.status === "confirmed" ? "rgba(46,139,122,.15)" : b.status === "completed" ? "rgba(20,94,144,.15)" : "rgba(179,38,30,.12)",
              color: b.status === "pending" ? "var(--amber)" : b.status === "confirmed" ? "var(--green)" : b.status === "completed" ? "var(--steel)" : "#B3261E",
            }}>
              {STATUS_LABELS[b.status] || b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
