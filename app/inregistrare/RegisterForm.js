"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "../GoogleAnalytics";

export default function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la înregistrare.");
      trackEvent("sign_up", { method: role });
      router.push(role === "provider" ? "/dashboard" : "/");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 440, margin: "60px auto" }}>
        <div className="section-head">
          <h2>Creează cont</h2>
          <p>Alege tipul de cont potrivit.</p>
        </div>
        <div className="cat-row" style={{ marginBottom: 20 }}>
          <button type="button" className={"cat-btn" + (role === "client" ? " active" : "")} onClick={() => setRole("client")}>Sunt client</button>
          <button type="button" className={"cat-btn" + (role === "provider" ? " active" : "")} onClick={() => setRole("provider")}>Sunt prestator</button>
        </div>
        <form onSubmit={submit} style={{ background: "var(--white)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 28, boxShadow: "var(--shadow-md)" }}>
          <span className="field-label">{role === "provider" ? "Nume business" : "Nume complet"}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder={role === "provider" ? "Ex: Ionescu Instalații" : "Ex: Andrei Popescu"} />
          <span className="field-label" style={{ marginTop: 14 }}>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nume@exemplu.ro" />
          <span className="field-label" style={{ marginTop: 14 }}>Telefon</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" />
          <span className="field-label" style={{ marginTop: 14 }}>Parolă</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minim 6 caractere" />
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-orange" style={{ width: "100%", marginTop: 18, padding: 13 }} disabled={loading}>
            {loading ? "Se creează…" : "Creează cont"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13.5, color: "var(--slate)" }}>
          Ai deja cont? <a href="/login" style={{ color: "var(--steel)", fontWeight: 600 }}>Autentifică-te</a>
        </p>
      </section>
  );
}
